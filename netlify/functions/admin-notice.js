const { store, json } = require('./_store');

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') return json(405, { error: 'Method not allowed' });
  try {
    const b = JSON.parse(event.body || '{}');
    if (!b.senderId || !b.title || !b.message) return json(400, { error: 'Missing notice information' });
    const s = store();
    const users = (await s.get('users', { type: 'json' })) || [];
    const sender = users.find(u => u.id === String(b.senderId));
    if (!sender || (sender.role !== 'admin' && sender.role !== 'superadmin')) return json(403, { error: 'Admin access required' });
    const notice = { id: `admin_${Date.now()}_${Math.random().toString(36).slice(2)}`, type: 'admin', title: String(b.title).slice(0,160), message: String(b.message).slice(0,5000), date: new Date().toISOString(), read: false, sender: sender.username };
    for (const u of users) {
      const key = `notifications:${u.id}`;
      const list = (await s.get(key, { type: 'json' })) || [];
      list.push({ ...notice, read: u.id === sender.id });
      await s.setJSON(key, list.slice(-200));
    }
    return json(200, { success: true, deliveredTo: users.length, noticeId: notice.id });
  } catch (e) { return json(500, { error: 'Server error' }); }
};
