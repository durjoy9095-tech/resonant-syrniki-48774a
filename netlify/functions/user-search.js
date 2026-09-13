const { loadUsers } = require('./_store');
exports.handler = async (event) => {
  const username=String((event.queryStringParameters||{}).username||'').trim().toLowerCase();
  if(!username) return {statusCode:400,body:JSON.stringify({error:'username required'})};
  const users=await loadUsers();
  const user=users.find(u=>String(u.username||'').toLowerCase()===username);
  return {statusCode:200,body:JSON.stringify({user:user||null})};
};
