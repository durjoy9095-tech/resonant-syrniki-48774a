const crypto=require('crypto');
const {json,loadUsers,getSuperAdminId,normalizeRoles,saveUsers}=require('./_store');
function hashPassword(p){return crypto.createHash('sha256').update(String(p||''),'utf8').digest('hex');}
exports.handler=async(event)=>{
 if(event.httpMethod!=='POST') return json(405,{error:'POST required'});
 try{
  const b=JSON.parse(event.body||'{}'), key=String(b.key||'').trim(), pass=String(b.password||'');
  if(!key||!pass)return json(400,{error:'Username/ID and password required'});
  const users=await loadUsers(), k=key.toLowerCase();
  const u=users.find(x=>String(x.id||'').toLowerCase()===k || String(x.username||'').toLowerCase()===k || (x.email&&String(x.email).toLowerCase()===k) || (x.phone&&String(x.phone)===key));
  if(!u)return json(401,{success:false,error:'Invalid Username/ID/Gmail/Phone or password'});
  if(!u.passwordHash)return json(401,{success:false,error:'Account password is not synced yet'});
  if(hashPassword(pass)!==u.passwordHash)return json(401,{success:false,error:'Invalid Username/ID/Gmail/Phone or password'});

  // Server is authoritative: the globally recorded first account is the ONLY Super Admin.
  const superadminId=await getSuperAdminId(users);
  normalizeRoles(users,superadminId);
  await saveUsers(users);
  const fresh=users.find(x=>String(x.id)===String(u.id)) || u;
  const role=fresh.role==='admin'?'admin':(String(fresh.id)===String(superadminId)?'superadmin':'user');
  return json(200,{success:true,user:{id:fresh.id,username:fresh.username,name:fresh.name||'',phone:fresh.phone||'',email:fresh.email||'',role},superadminId});
 }catch(e){console.error(e);return json(500,{error:'Server error'});}
};
