const {test}=require('node:test');const assert=require('node:assert/strict');const fs=require('node:fs');const os=require('node:os');const path=require('node:path');
const {run,parseArgs}=require('./validate-project-records.cjs');
const source='.pipes/project/04-plans/plan-001-source.md';const artifact='.pipes/project/07-artifacts/nested/artifact-001-report.html';
function html(related,sequence=1){const fields={'schema-version':'1',sequence,starred:'true',title:'Report',description:'Evidence',version:'2.3',related:JSON.stringify(related)};return '<head>'+Object.entries(fields).map(([k,v])=>'<meta name="pipes:'+k+'" content="'+String(v).replace(/&/g,'&amp;').replace(/"/g,'&quot;')+'">').join('')+'</head><body>Keep</body>';}
function fixture(){const root=fs.mkdtempSync(path.join(os.tmpdir(),'pipes-artifact-contract-'));for(const area of ['00-notes','01-intents','02-specs','03-missions','04-plans','05-decisions','06-outcomes','07-artifacts']) {fs.mkdirSync(path.join(root,'project',area),{recursive:true});fs.copyFileSync(path.resolve(__dirname,'../..','project',area,'config.md'),path.join(root,'project',area,'config.md'));}fs.mkdirSync(path.dirname(path.join(root,artifact.slice(7))),{recursive:true});return root;}
function writeSource(root,related){fs.writeFileSync(path.join(root,source.slice(7)),'---\ntitle: Source\ndescription: Source\nversion: 1.0\ncreated: 2026-11-07\nstatus: draft\nrelated: '+JSON.stringify(related)+'\n---\nKeep source\n');}
test('closed-app creation requires both persisted directions and is read-only',()=>{const root=fixture();try{
 writeSource(root,[]);fs.writeFileSync(path.join(root,artifact.slice(7)),html([source]));
 let result=run({root,strict:true,newRecords:[artifact],sourceRecords:[source]});assert(result.failed);assert(result.findings.some(f=>f.code==='creation-source-reciprocity'));
 // Resume the same artifact, number and path after an interrupted source write.
 writeSource(root,[artifact]);const before=fs.readFileSync(path.join(root,artifact.slice(7)));result=run({root,strict:true,newRecords:[artifact],sourceRecords:[source]});assert.equal(result.failed,false,result.output);assert.deepEqual(fs.readFileSync(path.join(root,artifact.slice(7))),before);assert.equal(fs.readdirSync(path.dirname(path.join(root,artifact.slice(7)))).length,1);
 }finally{fs.rmSync(root,{recursive:true,force:true});}});
test('new-record checks reject mismatches, collisions, metadata loss and one-way declarations',()=>{const root=fixture();try{
 writeSource(root,[artifact]);fs.writeFileSync(path.join(root,artifact.slice(7)),html([source],9));let r=run({root,strict:true,newRecords:[artifact],sourceRecords:[source]});assert(r.findings.some(f=>f.code==='sequence-name-mismatch'));
 fs.writeFileSync(path.join(root,artifact.slice(7)),html([source]).replace(/<meta name="pipes:related"[^>]*>/,''));r=run({root,strict:true,newRecords:[artifact],sourceRecords:[source]});assert(r.findings.some(f=>f.code==='html-metadata-partial'));
 }finally{fs.rmSync(root,{recursive:true,force:true});}});
test('creation CLI rejects ambiguous source arguments',()=>{assert.throws(()=>parseArgs(['node','script','--source-record',source]),/exactly one/);assert.throws(()=>parseArgs(['node','script','--new-record',artifact,'--new-record','other.html','--source-record',source]),/exactly one/);});
