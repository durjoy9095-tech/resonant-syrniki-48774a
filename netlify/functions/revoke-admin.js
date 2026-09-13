const { json, loadUsers, saveUsers, getSuperAdminId, normalizeRoles } = require('./_store');
exports.handler = async (event) => {
  if(event.httpMethod!=='POST') return json(405,{error:'POST required'});
  try{
    const b=JSON.parse(event.body||'{}'), users=await loadUsers();
    const superId=await getSuperAdminId(users); normalizeRoles(users,superId);
    const requester=users.find(u=>String(u.id)===String(b.requesterId));
    if(!requester || String(requester.id)!==String(superId) || requester.role!=='superadmin') return json(403,{error:'Only the Super Admin can remove admins'});
    const target=users.find(u=>String(u.id)===String(b.targetId));
    if(!target || target.role!=='admin') return json(404,{error:'Admin not found'});
    target.role='user'; await saveUsers(users);
    return json(200,{success:true});
  }catch(e){console.error(e);return json(500,{error:'Server error'});}
};
