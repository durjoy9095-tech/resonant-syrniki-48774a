const { store } = require('./_store');
exports.handler = async (event) => {
  const userId=String((event.queryStringParameters||{}).userId||'');
  if(!userId) return {statusCode:400,body:JSON.stringify({error:'userId required'})};
  const s=store();
  const notices=await s.get('notifications:'+userId,{type:'json'}) || [];
  const fd=await s.get('friend-data:'+userId,{type:'json'}) || {};
  return {statusCode:200,body:JSON.stringify({notifications:[...notices,...(fd.notifications||[])],friendRequests:fd.friendRequests||[]})};
};
