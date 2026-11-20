const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

const dbPath = path.join(__dirname, 'safarsathi.db');
if (fs.existsSync(dbPath)) fs.unlinkSync(dbPath);
const db = new Database(dbPath);
db.pragma('foreign_keys = ON');

db.exec(`
CREATE TABLE districts (id INTEGER PRIMARY KEY, name TEXT UNIQUE NOT NULL);
CREATE TABLE stops (id INTEGER PRIMARY KEY, name TEXT UNIQUE NOT NULL, name_hi TEXT);
CREATE TABLE routes (
  id INTEGER PRIMARY KEY,
  code TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  district_id INTEGER NOT NULL REFERENCES districts(id)
);
CREATE TABLE route_stops (
  route_id INTEGER NOT NULL REFERENCES routes(id),
  stop_id INTEGER NOT NULL REFERENCES stops(id),
  seq INTEGER NOT NULL,
  offset_min INTEGER NOT NULL,
  PRIMARY KEY (route_id, seq)
);
CREATE TABLE buses (
  id TEXT PRIMARY KEY,
  operator TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('Government','Private')),
  route_id INTEGER NOT NULL REFERENCES routes(id),
  depart_time TEXT NOT NULL,
  delay_min INTEGER NOT NULL DEFAULT 0
);
`);

const HI = {
  'IGMC': 'आईजीएमसी', 'Chhota Shimla': 'छोटा शिमला', 'Lakkar Bazaar': 'लक्कड़ बाज़ार',
  'Victory Tunnel': 'विक्ट्री टनल', 'Bus Stand': 'बस स्टैंड', 'ISBT': 'आईएसबीटी',
  'Shoghi': 'शोघी', 'Bilaspur': 'बिलासपुर', 'Ghumarwin': 'घुमारवीं', 'Una': 'ऊना',
  'Solan': 'सोलन', 'Nalagarh': 'नालागढ़', 'Una Bus Stand': 'ऊना बस स्टैंड',
  'Gagret': 'गगरेट', 'Amb': 'अंब'
};

const insDistrict = db.prepare('INSERT INTO districts (name) VALUES (?)');
const insStop = db.prepare('INSERT INTO stops (name, name_hi) VALUES (?, ?)');
const findStop = db.prepare('SELECT id FROM stops WHERE name = ?');
const insRoute = db.prepare('INSERT INTO routes (code, name, district_id) VALUES (?, ?, ?)');
const insRouteStop = db.prepare('INSERT INTO route_stops (route_id, stop_id, seq, offset_min) VALUES (?, ?, ?, ?)');
const insBus = db.prepare('INSERT INTO buses (id, operator, type, route_id, depart_time, delay_min) VALUES (?, ?, ?, ?, ?, ?)');

function stopId(name) {
  const row = findStop.get(name);
  if (row) return row.id;
  return insStop.run(name, HI[name] || null).lastInsertRowid;
}

function addRoute(code, name, districtId, stops) {
  const routeId = insRoute.run(code, name, districtId).lastInsertRowid;
  stops.forEach(([stopName, offset], i) => insRouteStop.run(routeId, stopId(stopName), i + 1, offset));
  return routeId;
}

const seed = db.transaction(() => {
  const shimla = insDistrict.run('Shimla').lastInsertRowid;
  const una = insDistrict.run('Una').lastInsertRowid;

  // Shimla: same board "IGMC to ISBT", two different roads
  const r1 = addRoute('SHM-01', 'IGMC to ISBT via Chhota Shimla', shimla,
    [['IGMC', 0], ['Chhota Shimla', 8], ['Victory Tunnel', 20], ['ISBT', 35]]);
  const r2 = addRoute('SHM-02', 'IGMC to ISBT via Lakkar Bazaar', shimla,
    [['IGMC', 0], ['Lakkar Bazaar', 10], ['Bus Stand', 18], ['ISBT', 30]]);

  // Shimla to Una: many roads, stops in between (sample data)
  const r3 = addRoute('SHM-03', 'Shimla ISBT to Una via Bilaspur', shimla,
    [['ISBT', 0], ['Shoghi', 25], ['Bilaspur', 150], ['Ghumarwin', 175], ['Una', 240]]);
  const r4 = addRoute('SHM-04', 'Shimla ISBT to Una via Solan', shimla,
    [['ISBT', 0], ['Solan', 70], ['Nalagarh', 130], ['Una', 230]]);

  // Una district local routes
  const r5 = addRoute('UNA-01', 'Una to Amb via Gagret', una,
    [['Una Bus Stand', 0], ['Gagret', 25], ['Amb', 45]]);
  const r6 = addRoute('UNA-02', 'Una to Gagret direct', una,
    [['Una Bus Stand', 0], ['Gagret', 30]]);

  // Fictional bus numbers. Replace with real ones later.
  insBus.run('HP01A1001', 'HRTC', 'Government', r1, '10:30', 0);
  insBus.run('HP01A1002', 'Sharma Travels', 'Private', r2, '10:35', 0);
  insBus.run('HP01A1003', 'HRTC', 'Government', r1, '10:50', 12);
  insBus.run('HP01A1004', 'HRTC', 'Government', r2, '11:05', 0);
  insBus.run('HP01A1005', 'Himalayan Express', 'Private', r1, '11:20', 0);
  insBus.run('HP01A2001', 'HRTC', 'Government', r3, '08:00', 0);
  insBus.run('HP01A2002', 'Pahadi Travels', 'Private', r3, '09:30', 15);
  insBus.run('HP01A2003', 'HRTC', 'Government', r4, '07:30', 0);
  insBus.run('HP20A3001', 'HRTC', 'Government', r5, '10:00', 5);
  insBus.run('HP20A3002', 'Una Motors', 'Private', r6, '10:40', 0);
});
seed();

const count = (t) => db.prepare(`SELECT COUNT(*) AS n FROM ${t}`).get().n;
console.log(`Districts: ${count('districts')}, Stops: ${count('stops')}, Routes: ${count('routes')}, Buses: ${count('buses')}`);

const via = db.prepare(`
  SELECT b.id, b.operator, r.name AS route
  FROM buses b
  JOIN routes r ON r.id = b.route_id
  JOIN route_stops rs ON rs.route_id = r.id
  JOIN stops s ON s.id = rs.stop_id
  WHERE s.name = ?
`);
console.log('\nBuses that pass through Chhota Shimla:');
via.all('Chhota Shimla').forEach((b) => console.log(` ${b.id}  ${b.operator}  (${b.route})`));