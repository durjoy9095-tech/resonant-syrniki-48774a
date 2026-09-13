const crypto=require('crypto');
const {store,json,loadUsers,saveUsers,earliestUser,getSuperAdminId,normalizeRoles}=require('./_store');
function hashPassword(p){return crypto.createHash('sha256').update(String(p||''),'utf8').digest('hex');}
exports.handler=async(event)=>{
 if(event.httpMethod!=='POST') return json(405,{error:'Method not allowed'});
 try{
  const b=JSON.parse(event.body||'{}');
  if(!b.id||!b.username) return json(400,{error:'Missing user information'});
  const s=store(), users=await loadUsers();
  const id=String(b.id).trim(), username=String(b.username).trim().toLowerCase(), now=new Date().toISOString();
  const existingByUsername=users.find(x=>String(x.username||'').toLowerCase()===username && String(x.id)!==id);
  if(existingByUsername) return json(409,{error:'Username already exists'});

  let u=users.find(x=>String(x.id)===id);
  if(!u){
    // The first account ever written to the global store is the Super Admin.
    const isFirst=users.length===0;
    u={id,username,name:String(b.name||''),phone:String(b.phone||''),email:String(b.email||''),passwordHash:b.password?hashPassword(b.password):'',role:isFirst?'superadmin':'user',createdAt:now,updatedAt:now};
    users.push(u);
    if(isFirst) await s.set('superadminId',id);
  }else{
    u.username=username;
    u.name=String(b.name||u.name||'');
    if(b.phone!==undefined)u.phone=String(b.phone||'');
    if(b.email!==undefined)u.email=String(b.email||'');
    if(b.password)u.passwordHash=hashPassword(b.password);
    u.updatedAt=now;
  }

  let superadminId=await getSuperAdminId(users);
  normalizeRoles(users,superadminId);
  // If no owner existed before, earliest account is the only owner.
  if(!superadminId){
    const first=earliestUser(users);
    if(first){ superadminId=String(first.id); await s.set('superadminId',superadminId); normalizeRoles(users,superadminId); }
  }
  await saveUsers(users);
  u=users.find(x=>String(x.id)===id);
  return json(200,{success:true,role:u.role||'user',superadminId});
 }catch(e){console.error(e);return json(500,{error:'Server error'});}
};
