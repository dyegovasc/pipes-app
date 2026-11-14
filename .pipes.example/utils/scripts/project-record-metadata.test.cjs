const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { readHtmlMetadata } = require('./project-record-metadata.cjs');
for (const c of JSON.parse(fs.readFileSync(path.join(__dirname,'fixtures/project-record-metadata/cases.json'),'utf8'))) {
  test('shared native/static metadata: '+c.name,()=>{
    const result=readHtmlMetadata(c.html); assert.equal(result.state,c.state);
    if(c.state!=='invalid') { assert.equal(result.relatedPresent,c.relatedPresent); assert.deepEqual(result.related,c.related); }
  });
}
test('unsupported entities and malformed input fail conservatively',()=>{
  for(const html of ['<head><meta name="pipes:title" content="&unknown;">','<head><meta name="pipes:related" content="[]" content="[]">','<script>unclosed']) assert.equal(readHtmlMetadata(html).state,'invalid');
});
