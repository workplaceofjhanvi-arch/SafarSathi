const express = require('express');
const cors = require('cors');
const path = require('path');
const Database = require('better-sqlite3');

const db = new Database(path.join(__dirname, 'db', 'safarsathi.db'), { readonly: true });
const app = express();
app.use(cors());
app.use(express.static(path.join(__dirname, 'public')));

function routeStops(routeId) {
  return db.prepare(`
    SELECT s.name, s.name_hi, rs.seq, rs.offset_min
    FROM route_stops rs JOIN stops s ON s.id = rs.stop_id
    WHERE rs.route_id = ? ORDER BY rs.seq`).all(routeId);
}

function busInfo(id) {
  return db.prepare(`
    SELECT b.id, b.operator, b.type, b.route_id, b.depart_time, b.delay_min,
           r.name AS route_name, r.code AS route_code, d.name AS district
    FROM buses b
    JOIN routes r ON r.id = b.route_id
    JOIN districts d ON d.id = r.district_id
    WHERE b.id = ?`).get(id);
}

app.get('/api/districts', (req, res) => {
  res.json(db.prepare('SELECT id, name FROM districts ORDER BY name').all());
});

app.get('/api/buses', (req, res) => {
  const district = req.query.district;
  const rows = db.prepare(`
    SELECT b.id, b.operator, b.type, b.depart_time, b.delay_min,
           r.name AS route_name, d.name AS district
    FROM buses b
    JOIN routes r ON r.id = b.route_id
    JOIN districts d ON d.id = r.district_id
    WHERE (? IS NULL OR d.name = ? COLLATE NOCASE)
    ORDER BY b.depart_time`).all(district || null, district || null);
  res.json(rows);
});

app.get('/api/bus/:id', (req, res) => {
  const bus = busInfo(req.params.id);
  if (!bus) return res.status(404).json({ error: 'Bus not found' });
  bus.stops = routeStops(bus.route_id);
  res.json(bus);
});

app.get('/api/check', (req, res) => {
  const { bus: busId, stop, from, time } = req.query;
  if (!busId || !stop) return res.status(400).json({ error: 'bus and stop are required' });

  const bus = busInfo(busId);
  if (!bus) return res.status(404).json({ error: 'Bus not found' });

  const stops = routeStops(bus.route_id);
  const find = (n) => stops.find((s) => s.name.toLowerCase() === String(n).toLowerCase());
  const fromStop = (from && find(from)) || stops[0];
  const toStop = find(stop);
  const goes = !!(toStop && toStop.seq > fromStop.seq);

  const result = {
    goes,
    bus: { id: bus.id, operator: bus.operator, type: bus.type, depart_time: bus.depart_time, delay_min: bus.delay_min, route_name: bus.route_name },
    from: fromStop.name,
    to: stop,
    stops,
    stop_number: goes ? toStop.seq : null,
    total_stops: stops.length,
    next_buses: []
  };

  if (!goes) {
    let rows = db.prepare(`
      SELECT b.id, b.operator, b.type, b.depart_time, b.delay_min, r.name AS route_name
      FROM buses b
      JOIN routes r ON r.id = b.route_id
      JOIN route_stops a ON a.route_id = r.id
      JOIN stops sa ON sa.id = a.stop_id
      JOIN route_stops z ON z.route_id = r.id
      JOIN stops sz ON sz.id = z.stop_id
      WHERE sa.name = ? COLLATE NOCASE AND sz.name = ? COLLATE NOCASE
        AND a.seq < z.seq AND b.id != ?
      ORDER BY b.depart_time`).all(fromStop.name, stop, bus.id);
    if (time) rows = rows.filter((r) => r.depart_time >= time);
    result.next_buses = rows;
  }

  res.json(result);
});

app.get('/api/download/:district', (req, res) => {
  const d = db.prepare('SELECT id, name FROM districts WHERE name = ? COLLATE NOCASE').get(req.params.district);
  if (!d) return res.status(404).json({ error: 'District not found' });
  const buses = db.prepare(`
    SELECT b.id, b.operator, b.type, b.route_id, b.depart_time, b.delay_min, r.name AS route_name
    FROM buses b JOIN routes r ON r.id = b.route_id
    WHERE r.district_id = ? ORDER BY b.depart_time`).all(d.id);
  const routes = db.prepare('SELECT id, code, name FROM routes WHERE district_id = ?').all(d.id)
    .map((r) => ({ ...r, stops: routeStops(r.id) }));
  res.json({ district: d.name, downloaded_at: new Date().toISOString(), buses, routes });
});

// Scanning a QR opens the app for that bus
app.get('/b/:id', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`SafarSathi running at http://localhost:${PORT}`));