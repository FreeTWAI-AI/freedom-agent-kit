"""Strict JSON-subset YAML + canonical schema; optional read-only GitHub identity check."""
import json,pathlib,subprocess,sys,os,re
from jsonschema import Draft202012Validator,FormatChecker
root=pathlib.Path.cwd()
def unique(pairs):
 result={}
 for key,value in pairs:
  if key in result:raise ValueError('Duplicate manifest key: '+key)
  result[key]=value
 return result
def read(path):return json.loads(path.read_text(encoding='utf-8'),object_pairs_hook=unique,parse_constant=lambda x:(_ for _ in ()).throw(ValueError('Non JSON constant')))
schema=read(root/'vendor/freedom-platform/schemas/project-manifest.schema.json')
manifest=read(root/'freedom.project.yaml')
errors=list(Draft202012Validator(schema,format_checker=FormatChecker()).iter_errors(manifest))
if errors:raise SystemExit('\n'.join(str(list(e.path))+': '+e.message for e in errors))
for key in ['runtime_version_file','lockfile']:
 p=manifest['toolchain'][key]
 if p and (pathlib.PurePosixPath(p).is_absolute() or '..' in pathlib.PurePosixPath(p).parts or not (root/p).is_file()):raise SystemExit('Missing or unsafe toolchain file '+str(p))
if '--github' in sys.argv:
 full=manifest['repository']['full_name']
 checkout=os.environ.get('GITHUB_REPOSITORY')
 if not checkout:
  remote=subprocess.check_output(['git','remote','get-url','origin'],text=True).strip()
  match=re.fullmatch(r'(?:https://github\.com/|git@github\.com:)([^/]+/[^/]+?)(?:\.git)?',remote)
  if not match:raise SystemExit('Cannot establish checkout GitHub identity')
  checkout=match.group(1)
 if full.lower()!=checkout.lower():raise SystemExit('Manifest belongs to a different repository; initialize template identity first')
 actual=json.loads(subprocess.check_output(['gh','api','repos/'+full],text=True))
 expected=manifest['repository']
 for field,observed in [('repository_id',str(actual['id'])),('full_name',actual['full_name']),('default_branch',actual['default_branch']),('visibility',actual['visibility']),('is_fork',actual['fork'])]:
  if expected[field]!=observed:raise SystemExit('GitHub identity mismatch: '+field)
 owner=manifest['ownership']['external_owner']
 if owner and (owner['account_id']!=str(actual['owner']['id']) or owner['login']!=actual['owner']['login']):raise SystemExit('GitHub owner mismatch')
 print('GitHub identity matches live repository.')
print('Project manifest schema and local paths: PASS. Deployment/trust claims are not granted by this check.')
