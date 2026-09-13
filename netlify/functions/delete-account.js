const { json, loadUsers, saveUsers, getSuperAdminId, normalizeRoles } = require('./_store');
exports.handler = async (event) => {
  if(event.httpMethod!=='POST') return json(405,{error:'Method not allowed'});
  try{
    const b=JSON.parse(event.body||'{}');
    if(!b.id || !b.username) return json(400,{error:'Missing account information'});
    const users=await loadUsers(), superId=await getSuperAdminId(users); normalizeRoles(users,superId);
    const id=String(b.id), username=String(b.username).trim().toLowerCase();
    if(id===String(superId)) return json(403,{error:'The Super Admin account cannot be deleted'});
    const target=users.find(u=>String(u.id)===id && String(u.username||'').toLowerCase()===username);
    if(!target) return json(404,{error:'Account not found'});
    await saveUsers(users.filter(u=>String(u.id)!==id));
    return json(200,{success:true,deleted:id});
  }catch(e){console.error(e);return json(500,{error:'Server error'});}
};
