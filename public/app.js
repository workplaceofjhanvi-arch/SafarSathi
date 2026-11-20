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