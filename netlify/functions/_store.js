const { getStore } = require('@netlify/blobs');

// Global role store. The first account created in this server store becomes
// the ONLY Super Admin. No fixed account ID is used.
function store(){
  return getStore({name:'lhr-backend-first-account-superadmin-v1', consistency:'strong'});
}
function json(statusCode, body){
  return {statusCode,headers:{'Content-Type':'application/json','Cache-Control':'no-store'},body:JSON.stringify(body)};
}
async function loadUsers(){ return (await store().get('users',{type:'json'})) || []; }
async function saveUsers(users){ await store().setJSON('users',users); }
function earliestUser(users){
  return users.slice().sort((a,b)=>{
    const ca=String(a.createdAt||''), cb=String(b.createdAt||'');
    if(ca!==cb) return ca.localeCompare(cb);
    return String(a.id||'').localeCompare(String(b.id||''));
  })[0] || null;
}
async function getSuperAdminId(users){
  const s=store();
  let id=await s.get('superadminId');
  if(id && users.some(u=>String(u.id)===String(id))) return String(id);
  const first=earliestUser(users);
  if(first){
    id=String(first.id);
    await s.set('superadminId',id);
    return id;
  }
  return '';
}
function normalizeRoles(users, superadminId){
  for(const u of users){
    if(String(u.id)===String(superadminId)) u.role='superadmin';
    else if(u.role==='superadmin') u.role='user';
  }
}
module.exports={store,json,loadUsers,saveUsers,earliestUser,getSuperAdminId,normalizeRoles};
