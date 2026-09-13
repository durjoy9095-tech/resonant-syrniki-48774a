const { json, loadUsers, saveUsers, getSuperAdminId, normalizeRoles } = require('./_store');
exports.handler = async (event) => {
  if(event.httpMethod!=='POST') return json(405,{error:'POST required'});
  try{
    const b=JSON.parse(event.body||'{}'), users=await loadUsers();
    const superId=await getSuperAdminId(users); normalizeRoles(users,superId);
    const requester=users.find(u=>String(u.id)===String(b.requesterId));
    if(!requester || String(requester.id)!==String(superId) || requester.role!=='superadmin') return json(403,{error:'Only the Super Admin can add admins'});
    const targetId=String(b.targetId||'').trim();
    if(!targetId) return json(400,{error:'Account ID required'});
    if(targetId===String(superId)) return json(400,{error:'Super Admin cannot be changed'});
    const target=users.find(u=>String(u.id)===targetId);
    if(!target) return json(404,{error:'এই Account ID-এর account পাওয়া যায়নি'});
    target.role='admin'; await saveUsers(users);
    return json(200,{success:true,user:{id:target.id,username:target.username,name:target.name,role:'admin'}});
  }catch(e){console.error(e);return json(500,{error:'Server error'});}
};
