// Copied verifier, no writes. Contract authoring stays in freedom-platform.
import {readFile,readdir,lstat} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {resolve} from 'node:path';
const root=process.cwd(),vendor=resolve(root,'vendor/freedom-platform');
const lock=JSON.parse(await readFile(resolve(root,'contracts.lock.json'),'utf8'));
const hash=data=>createHash('sha256').update(data).digest('hex');
if(lock.source_repository!=='FreeTWAI-AI/freedom-platform'||!/^[a-f0-9]{40}$/.test(lock.source_commit)||lock.bundle_path!=='contracts/preview/v1')throw Error('Invalid canonical contract source');
const manifestBytes=await readFile(resolve(vendor,'bundle.json'));
if(hash(manifestBytes)!==lock.bundle_sha256)throw Error('Contract bundle digest differs from lock');
const bundle=JSON.parse(manifestBytes);if(bundle.protocol!==lock.protocol||bundle.protocol_sha256!==lock.protocol_sha256)throw Error('Protocol identity differs from lock');
const expected=new Set(['bundle.json',...Object.keys(bundle.files)]);
async function walk(dir,prefix=''){for(const item of await readdir(dir,{withFileTypes:true})){const rel=prefix+item.name;if(item.isSymbolicLink())throw Error('Symlink not allowed in bundle');if(item.isDirectory())await walk(resolve(dir,item.name),rel+'/');else if(!expected.has(rel))throw Error(`Unexpected bundle file ${rel}`);}}
await walk(vendor);
const remote=process.argv.includes('--remote');
for(const file of expected){
 if(file.split('/').some(p=>!p||p==='.'||p==='..')||!/^[-a-zA-Z0-9_./]+$/.test(file))throw Error('Invalid artifact path');
 const path=resolve(vendor,file);if(!(await lstat(path)).isFile())throw Error('Artifact must be a regular file');
 const local=await readFile(path);const declared=file==='bundle.json'?{sha256:lock.bundle_sha256}:bundle.files[file];
 if(hash(local)!==declared.sha256||(declared.bytes!==undefined&&local.byteLength!==declared.bytes))throw Error(`Modified canonical artifact ${file}`);
 if(remote){const url=`https://raw.githubusercontent.com/${lock.source_repository}/${lock.source_commit}/${lock.bundle_path}/${file}`;const response=await fetch(url,{redirect:'error',signal:AbortSignal.timeout(20000)});if(!response.ok)throw Error(`Cannot verify pinned artifact ${file}: ${response.status}`);const bytes=new Uint8Array(await response.arrayBuffer());if(bytes.byteLength>2_000_000||hash(bytes)!==declared.sha256)throw Error(`Pinned upstream differs: ${file}`);}
}
console.log(`Contract ${lock.protocol} at ${lock.source_commit.slice(0,12)}: ${expected.size} artifacts verified${remote?' against pinned GitHub source':''}.`);
