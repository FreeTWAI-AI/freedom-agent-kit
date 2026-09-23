// Validator for the deliberately bounded schema subset in the preview protocol.
// Full project/skill JSON Schemas use the separate Draft202012 validator.
export function assertShape(value,schema,schemas,path='$') {
 const fail=message=>{throw new TypeError(`Contract ${path}: ${message}`);};
 if(schema.$ref){const name=schema.$ref.split('/').at(-1);if(!Object.hasOwn(schemas,name))fail('unknown schema');return assertShape(value,schemas[name],schemas,path);}
 if(schema.anyOf){if(!schema.anyOf.some(s=>{try{assertShape(value,s,schemas,path);return true;}catch{return false;}}))fail('no compatible type');return;}
 if('const'in schema&&JSON.stringify(value)!==JSON.stringify(schema.const))fail('unexpected constant');
 if(schema.enum&&!schema.enum.includes(value))fail('unexpected value');
 if(schema.type){const t=schema.type;const valid=t==='null'?value===null:t==='array'?Array.isArray(value):t==='object'?value!==null&&typeof value==='object'&&!Array.isArray(value):t==='integer'?Number.isSafeInteger(value):t==='number'?typeof value==='number'&&Number.isFinite(value):typeof value===t;if(!valid)fail(`expected ${t}`);}
 if(typeof value==='string'){
  if(schema.minLength!==undefined&&value.length<schema.minLength)fail('too short');if(schema.maxLength!==undefined&&value.length>schema.maxLength)fail('too long');
  if(schema.pattern&&!new RegExp(schema.pattern).test(value))fail('invalid format');
  if(schema.format==='uuid'&&!/^[a-f0-9]{8}-[a-f0-9]{4}-[1-8][a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$/i.test(value))fail('invalid UUID');
 }
 if(typeof value==='number'){if(schema.minimum!==undefined&&value<schema.minimum)fail('below minimum');if(schema.maximum!==undefined&&value>schema.maximum)fail('above maximum');}
 if(Array.isArray(value)){if(schema.maxItems!==undefined&&value.length>schema.maxItems)fail('too many items');if(schema.items)value.forEach((v,i)=>assertShape(v,schema.items,schemas,`${path}[${i}]`));}
 if(value!==null&&typeof value==='object'&&!Array.isArray(value)){
  for(const key of schema.required??[])if(!Object.hasOwn(value,key))fail(`missing ${key}`);
  for(const [key,v]of Object.entries(value)){if(Object.hasOwn(schema.properties??{},key))assertShape(v,schema.properties[key],schemas,`${path}.${key}`);else if(schema.additionalProperties===false)fail(`unknown field ${key}`);}
 }
}
