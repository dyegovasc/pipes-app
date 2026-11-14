'use strict';
const fs=require('node:fs'); const path=require('node:path');
const { readHtmlMetadata }=require('./project-record-metadata.cjs');
function inspectArtifactRecords(root,frontmatter,options={}) {
  const findings=[];const records=new Map();const seenSequences=new Map();const newRecords=new Set(options.newRecords||[]);
  const report=(level,p,code,message)=>findings.push({level,path:p,code,message});
  const safe=p=>typeof p==='string' && p.startsWith('.pipes/') && !/[\\:\u0000]/.test(p) && p.split('/').every(s=>s && s!=='.' && s!=='..');
  function absolute(p) {
    if(!safe(p))return null;
    let at=root;for(const part of p.slice(7).split('/')) {at=path.join(at,part);try{if(fs.lstatSync(at).isSymbolicLink())return null;}catch{return null;}}
    return at;
  }
  function read(p) {
    if(records.has(p))return records.get(p);
    const file=absolute(p);if(!file || !fs.statSync(file).isFile())return null;
    const content=fs.readFileSync(file);let record;
    if(/\.html$/i.test(p)){const metadata=readHtmlMetadata(content);record={format:'html',related:metadata.related,metadata,content};}
    else if(/\.md$/i.test(p)){const md=frontmatter(content.toString('utf8'));record={format:'markdown',related:md.related,md,content};}
    else return null;
    records.set(p,record);return record;
  }
  const project=path.join(root,'project');
  for(const area of fs.existsSync(project)?fs.readdirSync(project,{withFileTypes:true}):[]) {
    if(!area.isDirectory())continue;
    const config=path.join(project,area.name,'config.md');if(!fs.existsSync(config))continue;
    const text=fs.readFileSync(config,'utf8');const fm=frontmatter(text);const type=fm.values.record_type||area.name.replace(/^\d+-/,'').replace(/s$/,'');
    const recursive=/^recursive:\s*true\s*$/m.test(fm.block);let formats=['md'];
    const declared=fm.block.match(/^supported_extensions:\s*\[([^\]\r\n]*)\]\s*$/m);
    if(declared){const values=declared[1].split(',').map(v=>v.trim().replace(/^['"]|['"]$/g,''));if(values.length&&values.every(v=>['md','html'].includes(v)))formats=[...new Set(values)];else report('error','.pipes/project/'+area.name+'/config.md','extensions-invalid','Invalid supported_extensions; only Markdown is eligible.');}
    else if(!/^supported_extensions:/m.test(fm.block) && area.name.replace(/^\d+-/,'')==='artifacts')formats=['md','html'];
    else if(/^supported_extensions:/m.test(fm.block))report('error','.pipes/project/'+area.name+'/config.md','extensions-invalid','Unsupported extension policy syntax.');
    const queue=[path.dirname(config)];
    while(queue.length){const directory=queue.pop();for(const entry of fs.readdirSync(directory,{withFileTypes:true})){
      const file=path.join(directory,entry.name);if(entry.isDirectory()){if(recursive)queue.push(file);continue;}
      if(!entry.isFile() || /^(README|config)\.md$/i.test(entry.name))continue;
      const extension=entry.name.split('.').at(-1).toLowerCase();if(!formats.includes(extension))continue;
      const p='.pipes/'+path.relative(root,file).split(path.sep).join('/');const record=read(p);if(!record)continue;
      record.area=area.name;record.type=type;
      const canonical=entry.name.match(/^([a-z][a-z-]*)-(\d{3,})-([a-z0-9]+(?:-[a-z0-9]+)*)\.(md|html)$/);
      const fresh=newRecords.has(p);
      if((!canonical || canonical[1]!==type || canonical[3].length>80) && (fresh || extension==='html'))report(fresh?'error':'warning',p,'record-name','Expected '+type+'-{NNN}-{lowercase-slug}.'+extension+'. Existing names are not changed.');
      let sequence;
      if(record.format==='html'){
        const m=record.metadata;for(const problem of m.diagnostics)report('error',p,'html-metadata-invalid',problem);
        if(m.state!=='complete')report('error',p,'html-metadata-'+m.state,'HTML metadata must be complete; related field presence is '+m.relatedPresent+'.');
        if(m.fields.sequence)sequence=Number(m.fields.sequence);
        if(canonical && sequence!==undefined && Number(canonical[2])!==sequence)report(fresh?'error':'warning',p,'sequence-name-mismatch','Filename number differs from embedded sequence.');
      }else if(canonical)sequence=Number(canonical[2]);
      if(sequence!==undefined){const k=area.name+'\0'+sequence;const prior=seenSequences.get(k);if(prior)report('error',p,'sequence-collision','Sequence also belongs to '+prior);else seenSequences.set(k,p);}
      if(fresh && record.format==='markdown' && !record.md.block)report('error',p,'frontmatter-missing','New Markdown records require frontmatter.');
    }}
  }
  const selected=[...records.entries()];
  for(const [p,record] of selected){
    if(!Array.isArray(record.related)){if(record.format==='html'||newRecords.has(p))report('error',p,'related-format','Related must be an explicit list.');continue;}
    const seen=new Set();
    for(const peer of record.related){
      if(!safe(peer)||peer===p||seen.has(peer)){report('error',p,'related-invalid','Unsafe, duplicate, or self relationship: '+peer);continue;}seen.add(peer);
      const target=read(peer);if(!target){report('error',p,'related-missing','Related target is unavailable: '+peer);continue;}
      if(!Array.isArray(target.related)||!target.related.includes(p))report('error',p,'related-not-reciprocal','Target does not link back: '+peer);
    }
  }
  for(const p of newRecords)if(!records.has(p)||!records.get(p).area)report('error',p,'new-record-ineligible','New record is missing or excluded by area policy.');
  const sources=options.sourceRecords||[];
  if(sources.length && newRecords.size!==1)throw new Error('--source-record requires exactly one --new-record target.');
  for(const source of sources){const target=[...newRecords][0];const a=read(source),b=read(target);if(!a||!b||!a.related?.includes(target)||!b.related?.includes(source))report('error',target,'creation-source-reciprocity','Creation is incomplete for source '+source);}
  return findings;
}
module.exports={inspectArtifactRecords};
