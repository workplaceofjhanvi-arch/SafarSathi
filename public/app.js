const $ = (id) => document.getElementById(id);

function addMinutes(hhmm, mins) {
  const [h, m] = hhmm.split(':').map(Number);
  const t = h * 60 + m + mins;
  const hh = String(Math.floor(t / 60) % 24).padStart(2, '0');
  const mm = String(t % 60).padStart(2, '0');
  return hh + ':' + mm;
}

async function loadDistricts() {
  let list;
  try {
    const r = await fetch('/api/districts');
    list = await r.json();
    localStorage.setItem('districts', JSON.stringify(list));
  } catch (e) {
    list = JSON.parse(localStorage.getItem('districts') || '[]');
  }
  $('district').innerHTML = list.map((d) => `<option value="${d.name}">${d.name}</option>`).join('');
  const saved = localStorage.getItem('district');
  if (saved) $('district').value = saved;
}

async function downloadDistrict() {
  const name = $('district').value;
  $('status').textContent = 'Downloading ' + name + '...';
  try {
    const r = await fetch('/api/download/' + encodeURIComponent(name));
    const data = await r.json();
    localStorage.setItem('data:' + name, JSON.stringify(data));
    $('status').textContent = name + ' data saved on this phone. It works offline now.';
  } catch (e) {
    $('status').textContent = 'Download failed. Check your connection.';
  }
}

async function showBuses() {
  const name = $('district').value;
  localStorage.setItem('district', name);
  let buses, live = true;
  try {
    const r = await fetch('/api/buses?district=' + encodeURIComponent(name));
    buses = await r.json();
  } catch (e) {
    const saved = JSON.parse(localStorage.getItem('data:' + name) || 'null');
    buses = saved ? saved.buses : [];
    live = false;
    $('status').textContent = saved
      ? 'Offline: showing saved data for ' + name
      : 'Offline and no saved data. Download this district first.';
  }
  if (!buses.length) { $('busList').innerHTML = '<p class="note">No buses found.</p>'; return; }

  $('busList').innerHTML = buses.map((b) => {
    let tag;
    if (!live) tag = '<span class="tag grey">Scheduled</span>';
    else if (b.delay_min > 0) tag = `<span class="tag late">Delayed ${b.delay_min} min</span>`;
    else tag = '<span class="tag ok">On time</span>';
    const expected = live ? addMinutes(b.depart_time, b.delay_min) : b.depart_time;
    return `
      <div class="bus ${b.type === 'Private' ? 'private' : ''}">
        <div class="top"><span class="id">${b.id}</span>${tag}</div>
        <div class="route">${b.route_name}</div>
        <div class="meta">${b.operator} (${b.type}) | Scheduled ${b.depart_time} | Expected ${expected}</div>
      </div>`;
  }).join('');
}

document.querySelectorAll('.tab').forEach((t) => {
  t.addEventListener('click', () => {
    document.querySelectorAll('.tab').forEach((x) => x.classList.remove('active'));
    document.querySelectorAll('.view').forEach((v) => v.classList.remove('active'));
    t.classList.add('active');
    $(t.dataset.view).classList.add('active');
  });
});

$('district').addEventListener('change', showBuses);
$('downloadBtn').addEventListener('click', downloadDistrict);

loadDistricts().then(showBuses);

function parseBusId(text) {
  return text.trim().split('/').pop().toUpperCase();
}

let scanner;
$('scanBtn').addEventListener('click', () => {
  if (typeof Html5Qrcode === 'undefined') { alert('Scanner not loaded. Type the bus number instead.'); return; }
  scanner = new Html5Qrcode('reader');
  scanner.start({ facingMode: 'environment' }, { fps: 10, qrbox: 220 }, (text) => {
    $('busId').value = parseBusId(text);
    scanner.stop().then(() => scanner.clear());
  }).catch(() => alert('Camera not available. Type the bus number instead.'));
});

function checkOffline(busId, stop) {
  for (const key of Object.keys(localStorage)) {
    if (!key.startsWith('data:')) continue;
    const data = JSON.parse(localStorage.getItem(key));
    const bus = data.buses.find((b) => b.id === busId);
    if (!bus) continue;
    const stops = data.routes.find((r) => r.id === bus.route_id).stops;
    const idx = (n, list) => list.findIndex((s) => s.name.toLowerCase() === n.toLowerCase());
    const i = idx(stop, stops);
    const goes = i > 0;
    const next = [];
    if (!goes) {
      data.buses.forEach((b) => {
        if (b.id === busId) return;
        const st = data.routes.find((r) => r.id === b.route_id).stops;
        const a = idx(stops[0].name, st), z = idx(stop, st);
        if (a >= 0 && z > a) next.push(b);
      });
    }
    return {
      goes, bus, from: stops[0].name, to: stop, stops,
      stop_number: goes ? stops[i].seq : null, total_stops: stops.length, next_buses: next
    };
  }
  return null;
}

function renderResult(d) {
  const mine = (s) => s.name.toLowerCase() === d.to.toLowerCase();
  const stopsHtml = d.stops.map((s) =>
    `<div class="${mine(s) ? 'mine' : ''}">${s.seq}. ${s.name} (${s.name_hi || ''}) +${s.offset_min} min</div>`).join('');
  let html;
  if (d.goes) {
    html = `<div class="answer yes"><div class="big">YES</div>
      <div class="sub">${d.bus.id} goes to ${d.to}. Stop ${d.stop_number} of ${d.total_stops}.</div></div>
      <div class="stoplist"><b>${d.bus.route_name}</b>${stopsHtml}</div>`;
  } else {
    const nb = d.next_buses.map((b) =>
      `<div>${b.id} | ${b.operator} (${b.type}) | ${b.depart_time}${b.delay_min ? ' | Delayed ' + b.delay_min + ' min' : ''}</div>`).join('');
    html = `<div class="answer no"><div class="big">NO</div>
      <div class="sub">${d.bus.id} does not go to ${d.to}.</div></div>
      <div class="stoplist"><b>This bus: ${d.bus.route_name}</b>${stopsHtml}</div>
      <div class="stoplist"><b>Next buses to ${d.to}</b>${nb || '<div>No other bus found.</div>'}</div>`;
  }
  $('result').innerHTML = html;
  window.lastCheck = d;
}

async function checkBus() {
  const bus = parseBusId($('busId').value);
  const stop = $('stopName').value.trim();
  if (!bus || !stop) { $('result').innerHTML = '<p class="note">Enter the bus number and your stop.</p>'; return; }
  let data;
  try {
    const r = await fetch('/api/check?bus=' + encodeURIComponent(bus) + '&stop=' + encodeURIComponent(stop));
    data = await r.json();
    if (data.error) { $('result').innerHTML = '<p class="note">' + data.error + '</p>'; return; }
  } catch (e) {
    data = checkOffline(bus, stop);
    if (!data) { $('result').innerHTML = '<p class="note">Offline and no saved data for this bus. Download the district first.</p>'; return; }
  }
  renderResult(data);
}
$('checkBtn').addEventListener('click', checkBus);