import {PlatformClient} from '../packages/client/index.mjs';
import {loadMemberWorkspace} from './index.mjs';
const args=process.argv.slice(2);
if(args.length!==2||!['maker','reviewer','client'].includes(args[1])){
 console.log('Usage: node src/cli.mjs http://127.0.0.1:4310/api/v1 maker|reviewer|client');
 console.log('Explicit local demo only. Real agent device-flow / grant authentication is not enabled.');
 process.exit(args.length?1:0);
}
let client;
try{
 client=await PlatformClient.loginDemo({baseUrl:args[0],email:args[1]+'@local.test',password:'freedom-local-demo'});
 console.log(JSON.stringify(await loadMemberWorkspace(client),null,2));
} catch(error){console.error(error.message);process.exitCode=1;}
finally{if(client)await client.call('logout',{body:{}});}
