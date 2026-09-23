import {test} from 'node:test';import assert from 'node:assert/strict';import {loadMemberWorkspace} from '../src/index.mjs';
test('adapter reads canonical member state and omits session credentials from agent output',async()=>{
 const seen=[];const data={getSession:{user:{user_id:'user-1'},csrf_token:'must-not-leak'},getDashboard:{now:[]},listWorks:{items:[{title:'Work'}]},getPositioning:{profile:null},listGuilds:{items:[]}};
 const result=await loadMemberWorkspace({call:async id=>{seen.push(id);return data[id];}});
 assert.equal(seen.length,5);assert.equal(result.work[0].title,'Work');assert(!JSON.stringify(result).includes('must-not-leak'));assert.equal(result.agent_execution_grant,false);
});
test('read failure propagates without creating fake empty work or hiding expired login',async()=>{
 await assert.rejects(loadMemberWorkspace({call:async()=>{throw new Error('session expired');}}),/session expired/);
 await assert.rejects(loadMemberWorkspace({call:async()=>({})}),/Incompatible/);
});
