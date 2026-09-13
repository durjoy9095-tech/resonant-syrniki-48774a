const { store, json } = require('./_store');
exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') return json(405, { error: 'Method not allowed' });
  try {
    const b = JSON.parse(event.body || '{}');
    if (!b.userId) return json(400, { error: 'Missing userId' });
    const s = store();
    const key = `notifications:${b.userId}`;
    const list = (await s.get(key, { type: 'json' })) || [];
    if (b.all) list.forEach(n => n.read = true);
    else if (b.notificationId) list.forEach(n => { if (n.id === b.notificationId) n.read = true; });
    await s.setJSON(key, list.slice(-200));
    return json(200, { success: true });
  } catch (e) { return json(500, { error: 'Server error' }); }
};
