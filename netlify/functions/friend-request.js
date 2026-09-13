const { store, loadUsers } = require('./_store');
exports.handler = async (event) => {
  if(event.httpMethod !== 'POST') return {statusCode:405,body:JSON.stringify({error:'POST required'})};
  try{
    const body=JSON.parse(event.body||'{}');
    const {fromId,fromUsername,fromName,toId}=body;
    if(!fromId||!toId||fromId===toId) return {statusCode:400,body:JSON.stringify({error:'invalid request'})};
    const users=await loadUsers();
    const target=users.find(u=>u.id===toId);
    const sender=users.find(u=>u.id===fromId);
    if(!target||!sender) return {statusCode:404,body:JSON.stringify({error:'user not found'})};
    const s=store();
    const key='friend-data:'+toId;
    const data=await s.get(key,{type:'json'}) || {friends:[],friendRequests:[],notifications:[]};
    data.friendRequests=Array.isArray(data.friendRequests)?data.friendRequests:[];
    data.notifications=Array.isArray(data.notifications)?data.notifications:[];
    if(!data.friendRequests.includes(fromId)) data.friendRequests.push(fromId);
    data.notifications.push({id:'friend_'+Date.now()+'_'+Math.random().toString(36).slice(2),type:'friend',title:'New Friend Request',message:(fromName||sender.name||'Someone')+' (@'+(fromUsername||sender.username||'')+') আপনাকে friend request পাঠিয়েছে।',fromId,date:new Date().toISOString(),read:false});
    data.notifications=data.notifications.slice(-200);
    await s.setJSON(key,data);
    return {statusCode:200,body:JSON.stringify({success:true})};
  }catch(e){ return {statusCode:500,body:JSON.stringify({error:e.message})}; }
};
