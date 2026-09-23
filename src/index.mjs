export async function loadMemberWorkspace(client){
 if(!client||typeof client.call!=='function')throw new TypeError('Pinned Platform client required');
 const [session,dashboard,work,positioning,guilds]=await Promise.all(['getSession','getDashboard','listWorks','getPositioning','listGuilds'].map(id=>client.call(id)));
 if(!Array.isArray(work?.items)||!Array.isArray(guilds?.items))throw new TypeError('Incompatible Platform list response');
 // Never return CSRF/session data to model context or command-line output.
 return {member:session.user,dashboard,work:work.items,positioning,guilds:guilds.items,mode:'internal_preview',agent_execution_grant:false};
}
