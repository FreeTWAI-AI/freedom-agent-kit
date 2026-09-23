import { protocol, protocolSha256 } from './protocol.mjs';
import { assertShape } from './schema.mjs';
export { protocol } from './protocol.mjs';
export class PlatformError extends Error {
 constructor(problem){super(problem.detail);this.name='PlatformError';this.status=problem.status;this.code=problem.code;}
}
export class PlatformClient {
 #base;#origin;#fetch;#cookie;#csrf;#timeout;#compatible=false;
 constructor({baseUrl,appOrigin,fetcher=globalThis.fetch,cookie,csrfToken,timeoutMs=15000}){
  const u=new URL(baseUrl);if(u.username||u.password||u.search||u.hash||u.pathname!=='/api/v1')throw new TypeError('baseUrl must be an origin plus /api/v1, without credentials or query');
  if(u.protocol!=='https:'&&!(u.protocol==='http:'&&['127.0.0.1','localhost','[::1]'].includes(u.hostname)))throw new TypeError('HTTPS required except loopback development');
  const origin=new URL(appOrigin??u.origin);if(origin.origin!==u.origin||origin.href!==origin.origin+'/')throw new TypeError('appOrigin must match the target API origin; use a trusted server adapter for future external stores');
  if(!Number.isSafeInteger(timeoutMs)||timeoutMs<1||timeoutMs>60000)throw new TypeError('Invalid timeout');
  this.#base=u.href;this.#origin=origin.origin;this.#fetch=fetcher;this.#cookie=cookie;this.#csrf=csrfToken;this.#timeout=timeoutMs;
 }
 async assertCompatible(){
  const info=await this.call('getProtocol');if(info.protocol_sha256!==protocolSha256)throw new TypeError('Platform protocol differs from the pinned contract; update deliberately');this.#compatible=true;return info;
 }
 async call(operationId,{params={},body,idempotencyKey,version}={}){
  const op=Object.hasOwn(protocol.operations,operationId)?protocol.operations[operationId]:null;if(!op)throw new TypeError('Unknown operation');
  if(operationId==='login')throw new TypeError('Use loginDemo for loopback fixtures; browser auth stays in Platform');
  if(op.body)assertShape(body??{},protocol.schemas[op.body],protocol.schemas);else if(body!==undefined)throw new TypeError('GET operation cannot have a body');
  const expected=[...op.path.matchAll(/\{([^}]+)\}/g)].map(m=>m[1]);
  if(Object.keys(params).some(k=>!expected.includes(k)))throw new TypeError('Unknown path parameter');
  let path=op.path;for(const key of expected){const value=params[key];const pattern=key==='id'?/^[a-f0-9]{8}-[a-f0-9]{4}-[1-8][a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$/i:/^[a-z][a-z0-9_]{1,100}$/;if(typeof value!=='string'||!pattern.test(value))throw new TypeError('Invalid path identifier');path=path.replace(`{${key}}`,encodeURIComponent(value));}
  if(op.idempotent&&!/^[A-Za-z0-9_-]{8,128}$/.test(idempotencyKey??''))throw new TypeError('Explicit Idempotency-Key required; reuse it only with the same request');
  if(op.concurrency==='required'&&version===undefined)throw new TypeError('Expected version required');
  if(version!==undefined&&(!Number.isSafeInteger(version)||version<1))throw new TypeError('Expected version must be a positive safe integer');
  if(!this.#compatible&&!['getProtocol','getHealth'].includes(operationId))await this.assertCompatible();
  const headers={Accept:'application/json'};if(this.#cookie)headers.Cookie=this.#cookie;
  if(op.method!=='GET'){
   if(!this.#csrf)throw new TypeError('CSRF session token required');
   Object.assign(headers,{'Content-Type':'application/json','Origin':this.#origin,'X-CSRF-Token':this.#csrf});
   if(op.idempotent)headers['Idempotency-Key']=idempotencyKey;
   if(version!==undefined)headers['If-Match']=`"${version}"`;
  }
  // Never forward credentials across a redirect; never retry a write automatically.
  const response=await this.#fetch(this.#base+path,{method:op.method,headers,credentials:'same-origin',redirect:'error',signal:AbortSignal.timeout(this.#timeout),...(op.body?{body:JSON.stringify(body??{})}:{})});
  const result=await readJson(response);
  if(!response.ok){assertShape(result,protocol.schemas.Problem,protocol.schemas);throw new PlatformError(result);}
  if(response.status!==op.status)throw new TypeError('Unexpected success status');
  assertShape(result,protocol.schemas[op.response],protocol.schemas);
  if(operationId==='logout'){this.#cookie=undefined;this.#csrf=undefined;}return result;
 }
 static async loginDemo({baseUrl,email,password,fetcher=globalThis.fetch,...options}){
  const u=new URL(baseUrl);if(!['127.0.0.1','localhost','[::1]'].includes(u.hostname)||u.protocol!=='http:')throw new TypeError('Demo login is restricted to HTTP loopback; it is not production/device-flow authentication');
  if(!['maker@local.test','client@local.test','reviewer@local.test'].includes(email)||password!=='freedom-local-demo')throw new TypeError('Only explicitly seeded demo identities are supported');
  const client=new PlatformClient({baseUrl,fetcher,...options});
  await client.assertCompatible();
  const r=await fetcher(client.#base+'/auth/login',{method:'POST',headers:{'Content-Type':'application/json',Origin:client.#origin},body:JSON.stringify({email,password}),redirect:'error',signal:AbortSignal.timeout(client.#timeout)});
  const payload=await readJson(r);if(!r.ok){assertShape(payload,protocol.schemas.Problem,protocol.schemas);throw new PlatformError(payload);}assertShape(payload,protocol.schemas.Session,protocol.schemas);
  const cookie=r.headers.get('set-cookie')?.split(';')[0];if(!cookie?.startsWith('freedom_local_session='))throw new TypeError('No session cookie received');
  client.#cookie=cookie;client.#csrf=payload.csrf_token;return client;
 }
}
async function readJson(response){
 if(!response.headers.get('content-type')?.includes('application/json'))throw new TypeError('Expected JSON, possibly an Access challenge');
 const reader=response.body?.getReader();if(!reader)throw new TypeError('Missing response body');let bytes=0;const chunks=[];
 while(true){const {done,value}=await reader.read();if(done)break;bytes+=value.byteLength;if(bytes>2_000_000){await reader.cancel();throw new TypeError('Response too large');}chunks.push(value);}
 const bytesValue=new Uint8Array(bytes);let offset=0;for(const c of chunks){bytesValue.set(c,offset);offset+=c.byteLength;}return JSON.parse(new TextDecoder().decode(bytesValue));
}
