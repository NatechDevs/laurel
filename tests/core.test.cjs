const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const path=require('node:path');
const ctx={};vm.createContext(ctx);
vm.runInContext(fs.readFileSync(path.join(__dirname,'../assets/core.js'),'utf8')+';this.api={calculate,calculateSemesterEstimates,targetAverage,parseDelimited,exportCSV,validUnits,validGrade}',ctx);
const {calculate,calculateSemesterEstimates,targetAverage,parseDelimited,exportCSV,validUnits,validGrade}=ctx.api;
const yes={load:'yes',curriculum:'yes',residency:'yes',history:'yes',complete:true};
const c=(grade,units='3',include=true)=>({grade,units,include});
test('honors thresholds include their exact upper endpoints',()=>{
  assert.equal(calculate([c('1.0'),c('1.5')],yes).tier,'summa');
  assert.equal(calculate([c('1.4'),c('1.5')],yes).tier,'magna');
  assert.equal(calculate([c('1.7'),c('1.8')],yes).tier,'cum');
  assert.equal(calculate([c('1.8')],yes).tier,null);
});
test('four-decimal policy is applied before classification',()=>{
  const lower=calculate([c('1.2','4.996'),c('1.3','5.004')],yes);
  const higher=calculate([c('1.2','4.995'),c('1.3','5.005')],yes);
  assert.equal(lower.gwa,1.25);assert.equal(lower.tier,'summa');
  assert.equal(higher.gwa,1.2501);assert.equal(higher.tier,'magna');
});
test('GWA weights all course units rather than semester averages',()=>{
  assert.equal(calculate([c('1.0','1'),c('2.0','3')],yes).gwa,1.75);
  assert.equal(calculate([c('1.2','.25'),c('1.5','.75')],yes).gwa,1.425);
});
test('INC, DRP and PENDING never become zero grades',()=>{
  for(const grade of ['INC','DRP','PENDING']){
    const result=calculate([c('1.2'),c(grade)],yes);
    assert.equal(result.gwa,1.2);assert.equal(result.units,3);assert.equal(result.status,'Incomplete record');
    assert.equal(calculate([c(grade)],yes).gwa,null);
  }
});
test('excluded low grades still fail the grade-history requirement',()=>{
  assert.equal(calculate([c('1.2'),c('5.0','3',false)],yes).status,'Grade requirement not met');
  assert.equal(calculate([c('1.2'),c('3.1','3',false)],yes).status,'Grade requirement not met');
  assert.equal(calculate([c('1.2'),c('3.0','3',false)],yes).status,'Potentially eligible · self-assessed');
});
test('self-reported unmet history overrides a high entered GWA',()=>assert.equal(calculate([c('1.0')],{...yes,history:'no'}).status,'Grade requirement not met'));
test('unmet non-grade requirements do not automatically award distinction',()=>{
  for(const key of ['load','curriculum','residency'])assert.equal(calculate([c('1.2')],{...yes,[key]:'no'}).status,'Other requirements not met');
});
test('unknown checks and partial records never confirm honors',()=>{
  assert.equal(calculate([c('1.2')],{...yes,complete:false}).status,'GWA range only');
  assert.equal(calculate([c('1.2')],{...yes,residency:'unknown'}).status,'GWA range only');
  assert.equal(calculate([c('1.2'),c('')],yes).status,'Incomplete record');
});
test('a semester is never assessed as a graduation result',()=>assert.equal(calculate([c('1.2')],yes,false).status,'Semester GWA range only'));
test('all required self-reports allow only a potential eligibility estimate',()=>assert.equal(calculate([c('1.2')],yes).status,'Potentially eligible · self-assessed'));
test('empty, invalid, zero and over-limit units do not affect numeric totals',()=>{
  for(const units of ['',0,-3,31,'NaN','Infinity','.00001']){
    assert.equal(validUnits(units),false);
    assert.equal(calculate([c('1.2',units)],yes).gwa,null);
  }
});
test('only BU scale grades or explicit non-numeric statuses are accepted',()=>{
  for(const grade of ['1.0','1.1','3.0','3.1','4.0','5.0','INC','DRP','PENDING'])assert.equal(validGrade(grade),true);
  for(const grade of ['0.0','4.1','4.5','1.25','95',''])assert.equal(validGrade(grade),false);
});
test('target planning uses unrounded weighted points',()=>{
  const r=targetAverage([c('1.5','18')],12,1.45);
  assert.equal(r.required,1.375);assert.equal(r.possible,true);
  assert.equal(targetAverage([c('2.0','100')],3,1.25),null); // invalid course units
});
test('unreachable and empty scenarios are handled',()=>{
  assert.equal(targetAverage([c('2.0','30')],3,1.25).possible,false);
  for(const remaining of ['',0,-1,501,'bad'])assert.equal(targetAverage([c('1.2')],remaining,1.75),null);
  assert.equal(targetAverage([],20,1.75),null);
});
test('CSV supports optional header, BOM, quoted commas and escaped quotes',()=>{
  const rows=parseDelimited('\uFEFFCourse,Units,Grade,Semester\r\n"Science, Technology",3,1.2,Year 1\r\n"The ""Self""",2,INC,Year 1');
  assert.equal(rows.length,2);assert.equal(rows[0].name,'Science, Technology');assert.equal(rows[1].name,'The "Self"');assert.equal(rows[1].grade,'INC');
});
test('spreadsheet tab input and numeric normalization work',()=>{
  const rows=parseDelimited('Course\tUnits\tGrade\nMathematics\t3\t1\nEnglish\t2\t1.50');
  assert.equal(rows[0].grade,'1.0');assert.equal(rows[1].grade,'1.5');
});
test('CSV parsing validates every row before allowing an import',()=>{
  for(const text of ['','Only a name','Math,0,1.2','Math,3,1.25','Math,3,95','"Unclosed,3,1.2','Math,3,1.2,Term,Extra'])assert.throws(()=>parseDelimited(text));
  assert.throws(()=>parseDelimited('Math,3,1.2\nScience,31,1.0'),/Row 2/);
  assert.throws(()=>parseDelimited(Array(501).fill('Math,3,1.2').join('\n')));
});
test('CSV export quotes fields and neutralizes spreadsheet formula prefixes',()=>{
  const csv=exportCSV([{name:'=HYPERLINK("x")',units:'3',grade:'1.2',term:'t1'}],[{id:'t1',name:'Term 1'}]);
  assert.ok(csv.includes('"\'=HYPERLINK(""x"")"'));
  assert.equal(parseDelimited(csv)[0].semester,'Term 1');
});
test('scripts parse and source HTML references existing local assets',()=>{
  const root=path.join(__dirname,'..');
  for(const name of ['core','app','workspace','quick','planning'])new vm.Script(fs.readFileSync(path.join(root,`assets/${name}.js`),'utf8'));
  const html=fs.readFileSync(path.join(root,'planner.html'),'utf8');
  assert.equal(/file:\/\//.test(html),false);
  for(const name of ['core','app','workspace','quick','planning'])assert.ok(new RegExp(`src="assets/${name}\\.js(?:\\?[^"<>]*)?"`).test(html));
  const ids=[...html.matchAll(/\bid="([^"]+)"/g)].map(m=>m[1]);assert.equal(new Set(ids).size,ids.length);
  const js=['app','workspace','quick','planning'].map(n=>fs.readFileSync(path.join(root,`assets/${n}.js`),'utf8')).join('\n');
  for(const match of js.matchAll(/\$\('([^']+)'\)/g))assert.ok(ids.includes(match[1]),`Missing DOM target ${match[1]}`);
});
test('backup validation preserves unfinished unit fields while rejecting broken references',()=>{
  const app=fs.readFileSync(path.join(__dirname,'../assets/app.js'),'utf8');
  const source=app.slice(app.indexOf('function validateState('),app.indexOf('\ntry{'));
  vm.runInContext(source+';this.validateBackup=validateState',ctx);
  const draft={version:1,name:'',program:'',terms:[{id:'t1',name:'Term 1'}],courses:[{id:'c1',name:'Math',units:'0',grade:'1.2',include:true,term:'t1'}],checks:{...yes}};
  assert.equal(ctx.validateBackup(draft).courses[0].units,'0');
  assert.equal(ctx.validateBackup(draft).degreeUnits,'');
  assert.equal(ctx.validateBackup({...draft,degreeUnits:'120',earnedUnits:'60'}).earnedUnits,'60');
  assert.throws(()=>ctx.validateBackup({...draft,degreeUnits:120}));
  assert.equal(calculate(draft.courses,draft.checks).gwa,null);
  assert.throws(()=>ctx.validateBackup({...draft,courses:[{...draft.courses[0],term:'missing'}]}));
  assert.throws(()=>ctx.validateBackup({...draft,courses:[draft.courses[0],draft.courses[0]]}));
  assert.throws(()=>ctx.validateBackup({...draft,checks:{...yes,history:'invalid'}}));
});
test('semester estimates weight unequal units rather than averaging equally',()=>{
  const r=calculateSemesterEstimates([{gwa:'1.0',units:'3'},{gwa:'2.0',units:'9'}]);
  assert.equal(r.valid,true);assert.equal(r.gwa,1.75);assert.equal(r.units,12);assert.equal(r.tier,'cum');
});
test('semester estimates accept four-decimal averages and decimal units',()=>{
  const r=calculateSemesterEstimates([{gwa:'1.2501',units:'3.5'},{gwa:'1.45',units:'3.5'}]);
  assert.equal(r.valid,true);assert.equal(r.gwa,1.3501);assert.equal(r.tier,'magna');
});
test('semester estimates reject invalid and blank rows instead of dropping them',()=>{
  for(const gwa of ['','0','-1','6','NaN','1.23456'])assert.equal(calculateSemesterEstimates([{gwa,units:'3'},{gwa:'1.0',units:'3'}]).valid,false);
  for(const units of ['','0','-1','61','NaN','.00001'])assert.equal(calculateSemesterEstimates([{gwa:'1.0',units}]).valid,false);
});
test('semester estimate ranges have exact endpoints',()=>{
  for(const [gwa,tier] of [['1.25','summa'],['1.2501','magna'],['1.45','magna'],['1.4501','cum'],['1.75','cum'],['1.7501',null]])assert.equal(calculateSemesterEstimates([{gwa,units:'3'}]).tier,tier);
});
test('semester summaries never return eligibility or full-record status',()=>{
  const r=calculateSemesterEstimates([{gwa:'1.0',units:'24'}]);
  assert.equal(r.valid,true);assert.equal(r.status,undefined);assert.equal(r.eligible,undefined);assert.equal(r.complete,undefined);
});
test('semester estimates enforce reasonable list limits',()=>{
  assert.equal(calculateSemesterEstimates([]).valid,false);
  assert.equal(calculateSemesterEstimates(Array(51).fill({gwa:'1',units:'3'})).valid,false);
});
