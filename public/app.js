const $ = (id) => document.getElementById(id);

const T = {
  en: {
    tagline: 'Smart bus companion for Himachal Pradesh', chooseDistrict: 'Choose your district',
    download: 'Download district data', buses: 'Buses', busNumber: 'Bus number', scanQR: 'Scan bus QR',
    yourStop: 'Your stop', check: 'Check', busPh: 'e.g. HP01A1001', stopPh: 'e.g. Chhota Shimla',
    alertsNote: 'First check a bus on the Scan tab (answer must be YES), then come here.',
    wake: 'Wake me up before my stop', test: 'Test alarm (10 seconds)', stopAlarm: 'Stop alarm',
    tabHome: 'Home', tabScan: 'Scan', tabAlerts: 'Alerts', langBtn: 'हिंदी',
    yes: 'YES', no: 'NO', onTime: 'On time', delayed: 'Delayed', min: 'min', scheduled: 'Scheduled',
    expected: 'Expected', thisBus: 'This bus', nextBuses: 'Next buses to', noOther: 'No other bus found.',
    enterBoth: 'Enter the bus number and your stop.',
    offlineNoData: 'Offline and no saved data for this bus. Download the district first.',
    downloading: 'Downloading', saved: 'data saved on this phone. It works offline now.',
    dlFail: 'Download failed. Check your connection.', offlineShowing: 'Offline: showing saved data for',
    offlineNone: 'Offline and no saved data. Download this district first.', noBuses: 'No buses found.',
    scannerMissing: 'Scanner not loaded. Type the bus number instead.',
    noCamera: 'Camera not available. Type the bus number instead.',
    checkFirst: 'Check a bus that goes to your stop first (Scan tab).',
    alarmSet: 'Alarm set. It will ring in about', alarmBefore: 'min, before', wakeUp: 'WAKE UP!', isComing: 'is coming.',
    keepOpen: 'Keep this screen open.', demoCount: 'The bus time has already passed, so this demo counts from now.',
    testRing: 'WAKE UP! Test alarm ringing.', testIn: 'Test alarm will ring in 10 seconds.', stopped: 'Alarm stopped.',
    goesTo: 'goes to', stopWord: 'Stop', of: 'of', notGo: 'does not go to'
  },
  hi: {
    tagline: 'हिमाचल प्रदेश का स्मार्ट बस साथी', chooseDistrict: 'अपना ज़िला चुनें',
    download: 'ज़िले का डेटा डाउनलोड करें', buses: 'बसें', busNumber: 'बस नंबर', scanQR: 'बस का QR स्कैन करें',
    yourStop: 'आपका स्टॉप', check: 'जाँचें', busPh: 'जैसे HP01A1001', stopPh: 'जैसे Chhota Shimla',
    alertsNote: 'पहले Scan टैब में बस जाँचें (जवाब हाँ होना चाहिए), फिर यहाँ आएँ।',
    wake: 'मेरे स्टॉप से पहले जगाएँ', test: 'अलार्म टेस्ट (10 सेकंड)', stopAlarm: 'अलार्म बंद करें',
    tabHome: 'होम', tabScan: 'स्कैन', tabAlerts: 'अलर्ट', langBtn: 'English',
    yes: 'हाँ', no: 'नहीं', onTime: 'समय पर', delayed: 'देरी', min: 'मिनट', scheduled: 'निर्धारित',
    expected: 'अनुमानित', thisBus: 'यह बस', nextBuses: 'अगली बसें:', noOther: 'कोई और बस नहीं मिली।',
    enterBoth: 'बस नंबर और अपना स्टॉप लिखें।',
    offlineNoData: 'ऑफ़लाइन है और इस बस का डेटा सेव नहीं है। पहले ज़िला डाउनलोड करें।',
    downloading: 'डाउनलोड हो रहा है', saved: 'का डेटा फ़ोन में सेव हो गया। अब यह ऑफ़लाइन चलेगा।',
    dlFail: 'डाउनलोड नहीं हुआ। कनेक्शन जाँचें।', offlineShowing: 'ऑफ़लाइन: सेव किया हुआ डेटा दिख रहा है:',
    offlineNone: 'ऑफ़लाइन है और डेटा सेव नहीं है। पहले यह ज़िला डाउनलोड करें।', noBuses: 'कोई बस नहीं मिली।',
    scannerMissing: 'स्कैनर लोड नहीं हुआ। बस नंबर खुद लिखें।',
    noCamera: 'कैमरा उपलब्ध नहीं है। बस नंबर खुद लिखें।',
    checkFirst: 'पहले Scan टैब में ऐसी बस जाँचें जो आपके स्टॉप जाती हो।',
    alarmSet: 'अलार्म सेट हो गया। यह लगभग', alarmBefore: 'मिनट में बजेगा, इससे पहले:', wakeUp: 'जागिए!', isComing: 'आने वाला है।',
    keepOpen: 'इस स्क्रीन को खुला रखें।', demoCount: 'बस का समय निकल चुका है, इसलिए यह डेमो अभी से गिनता है।',
    testRing: 'जागिए! टेस्ट अलार्म बज रहा है।', testIn: 'टेस्ट अलार्म 10 सेकंड में बजेगा।', stopped: 'अलार्म बंद हो गया।',
    goesTo: 'जाती है:', stopWord: 'स्टॉप', of: '/', notGo: 'नहीं जाती:'
  }
};
let lang = localStorage.getItem('lang') || 'en';
const t = (k) => T[lang][k];
const stopLabel = (s) => (lang === 'hi' && s.name_hi) ? s.name_hi : s.name;

function applyLang() {
  document.documentElement.lang = lang;
  document.querySelectorAll('[data-i18n]').forEach((el) => { el.textContent = t(el.dataset.i18n); });
  document.querySelectorAll('[data-i18n-ph]').forEach((el) => { el.placeholder = t(el.dataset.i18nPh); });
  $('langBtn').textContent = t('langBtn');
}

function addMinutes(hhmm, mins) {
  const [h, m] = hhmm.split(':').map(Number);
  const tt = h * 60 + m + mins;
  const hh = String(Math.floor(tt / 60) % 24).padStart(2, '0');
  const mm = String(tt % 60).padStart(2, '0');
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
  $('status').textContent = t('downloading') + ' ' + name + '...';
  try {
    const r = await fetch('/api/download/' + encodeURIComponent(name));
    const data = await r.json();
    localStorage.setItem('data:' + name, JSON.stringify(data));
    $('status').textContent = name + ' ' + t('saved');
  } catch (e) {
    $('status').textContent = t('dlFail');
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
    $('status').textContent = saved ? t('offlineShowing') + ' ' + name : t('offlineNone');
  }
  if (!buses.length) { $('busList').innerHTML = '<p class="note">' + t('noBuses') + '</p>'; return; }

  $('busList').innerHTML = buses.map((b) => {
    let tag;
    if (!live) tag = `<span class="tag grey">${t('scheduled')}</span>`;
    else if (b.delay_min > 0) tag = `<span class="tag late">${t('delayed')} ${b.delay_min} ${t('min')}</span>`;
    else tag = `<span class="tag ok">${t('onTime')}</span>`;
    const expected = live ? addMinutes(b.depart_time, b.delay_min) : b.depart_time;
    return `
      <div class="bus ${b.type === 'Private' ? 'private' : ''}">
        <div class="top"><span class="id">${b.id}</span>${tag}</div>
        <div class="route">${b.route_name}</div>
        <div class="meta">${b.operator} (${b.type}) | ${t('scheduled')} ${b.depart_time} | ${t('expected')} ${expected}</div>
      </div>`;
  }).join('');
}

document.querySelectorAll('.tab').forEach((tb) => {
  tb.addEventListener('click', () => {
    document.querySelectorAll('.tab').forEach((x) => x.classList.remove('active'));
    document.querySelectorAll('.view').forEach((v) => v.classList.remove('active'));
    tb.classList.add('active');
    $(tb.dataset.view).classList.add('active');
  });
});

$('district').addEventListener('change', showBuses);
$('downloadBtn').addEventListener('click', downloadDistrict);

$('langBtn').addEventListener('click', () => {
  lang = lang === 'en' ? 'hi' : 'en';
  localStorage.setItem('lang', lang);
  applyLang();
  showBuses();
  if (window.lastCheck) renderResult(window.lastCheck);
});

applyLang();
loadDistricts().then(showBuses);

function parseBusId(text) {
  return text.trim().split('/').pop().toUpperCase();
}

let scanner;
$('scanBtn').addEventListener('click', () => {
  if (typeof Html5Qrcode === 'undefined') { alert(t('scannerMissing')); return; }
  scanner = new Html5Qrcode('reader');
  scanner.start({ facingMode: 'environment' }, { fps: 10, qrbox: 220 }, (text) => {
    $('busId').value = parseBusId(text);
    scanner.stop().then(() => scanner.clear());
  }).catch(() => alert(t('noCamera')));
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
    `<div class="${mine(s) ? 'mine' : ''}">${s.seq}. ${stopLabel(s)} +${s.offset_min} ${t('min')}</div>`).join('');
  const hit = d.stops.find(mine);
  const toLabel = hit ? stopLabel(hit) : d.to;
  let html;
  if (d.goes) {
    html = `<div class="answer yes"><div class="big">${t('yes')}</div>
      <div class="sub">${d.bus.id} ${t('goesTo')} ${toLabel}. ${t('stopWord')} ${d.stop_number} ${t('of')} ${d.total_stops}.</div></div>
      <div class="stoplist"><b>${d.bus.route_name}</b>${stopsHtml}</div>`;
  } else {
    const nb = d.next_buses.map((b) =>
      `<div>${b.id} | ${b.operator} (${b.type}) | ${b.depart_time}${b.delay_min ? ' | ' + t('delayed') + ' ' + b.delay_min + ' ' + t('min') : ''}</div>`).join('');
    html = `<div class="answer no"><div class="big">${t('no')}</div>
      <div class="sub">${d.bus.id} ${t('notGo')} ${toLabel}.</div></div>
      <div class="stoplist"><b>${t('thisBus')}: ${d.bus.route_name}</b>${stopsHtml}</div>
      <div class="stoplist"><b>${t('nextBuses')} ${toLabel}</b>${nb || '<div>' + t('noOther') + '</div>'}</div>`;
  }
  $('result').innerHTML = html;
  window.lastCheck = d;
}

async function checkBus() {
  const bus = parseBusId($('busId').value);
  const stop = $('stopName').value.trim();
  if (!bus || !stop) { $('result').innerHTML = '<p class="note">' + t('enterBoth') + '</p>'; return; }
  let data;
  try {
    const r = await fetch('/api/check?bus=' + encodeURIComponent(bus) + '&stop=' + encodeURIComponent(stop));
    data = await r.json();
    if (data.error) { $('result').innerHTML = '<p class="note">' + data.error + '</p>'; return; }
  } catch (e) {
    data = checkOffline(bus, stop);
    if (!data) { $('result').innerHTML = '<p class="note">' + t('offlineNoData') + '</p>'; return; }
  }
  renderResult(data);
}
$('checkBtn').addEventListener('click', checkBus);

// ---------- Alarm: clock-based, checked every second, screen kept awake ----------
let alarmTimer, beepTimer, audioCtx, alarmAt = null, alarmMsg = '', wakeLock = null;

async function keepAwake() {
  try { wakeLock = await navigator.wakeLock.request('screen'); } catch (e) {}
}

function ringNow(msg) {
  $('alarmStatus').textContent = msg;
  clearInterval(alarmTimer);
  clearInterval(beepTimer);
  beepTimer = setInterval(() => {
    const o = audioCtx.createOscillator();
    o.connect(audioCtx.destination);
    o.frequency.value = 880;
    o.start();
    o.stop(audioCtx.currentTime + 0.4);
    if (navigator.vibrate) navigator.vibrate(300);
  }, 700);
}

function setAlarmAt(timestamp, msg) {
  audioCtx = audioCtx || new (window.AudioContext || window.webkitAudioContext)();
  audioCtx.resume();
  keepAwake();
  clearInterval(alarmTimer);
  clearInterval(beepTimer);
  alarmAt = timestamp;
  alarmMsg = msg;
  alarmTimer = setInterval(() => {
    if (alarmAt && Date.now() >= alarmAt) { alarmAt = null; ringNow(alarmMsg); }
  }, 1000);
}

document.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'visible' && alarmAt) keepAwake();
});

$('alarmBtn').addEventListener('click', () => {
  const d = window.lastCheck;
  if (!d || !d.goes) { $('alarmStatus').textContent = t('checkFirst'); return; }
  const stop = d.stops.find((s) => s.seq === d.stop_number);
  const label = stopLabel(stop);

  // Real schedule: departure + delay + minutes to this stop - 5 min warning
  const [h, m] = d.bus.depart_time.split(':').map(Number);
  const dep = new Date(); dep.setHours(h, m, 0, 0);
  let target = dep.getTime() + ((d.bus.delay_min || 0) + stop.offset_min - 5) * 60000;
  let note = '';
  if (target < Date.now() + 5000) {
    // Demo fallback: the sample bus time has already passed, so count from now
    target = Date.now() + Math.max(stop.offset_min - 5, 0) * 60000 + 5000;
    note = ' ' + t('demoCount');
  }
  setAlarmAt(target, t('wakeUp') + ' ' + label + ' ' + t('isComing'));
  const mins = Math.round((target - Date.now()) / 60000);
  $('alarmStatus').textContent = t('alarmSet') + ' ' + mins + ' ' + t('alarmBefore') + ' ' + label + '. ' + t('keepOpen') + note;
});

$('testAlarmBtn').addEventListener('click', () => {
  setAlarmAt(Date.now() + 10000, t('testRing'));
  $('alarmStatus').textContent = t('testIn');
});

$('stopAlarmBtn').addEventListener('click', () => {
  clearInterval(alarmTimer);
  clearInterval(beepTimer);
  alarmAt = null;
  if (wakeLock) wakeLock.release().catch(() => {});
  $('alarmStatus').textContent = t('stopped');
});

// ---------- Opened from a bus QR (e.g. /b/HP01A1002) ----------
const qrMatch = location.pathname.match(/^\/b\/([^/]+)/);
if (qrMatch) {
  $('busId').value = decodeURIComponent(qrMatch[1]).toUpperCase();
  document.querySelector('[data-view="view-scan"]').click();
}

if ('serviceWorker' in navigator) navigator.serviceWorker.register('/sw.js');