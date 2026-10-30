const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const context={};vm.createContext(context);
vm.runInContext(fs.readFileSync(path.join(__dirname,'../assets/core.js'),'utf8')+';this.api={degreeProgress,projectGrades}',context);
const {degreeProgress,projectGrades}=context.api;
const course=(grade,units='3',include=true,name='')=>({grade,units,include,name});
test('progress counts passed rows independently of GWA inclusion',()=>{
 const r=degreeProgress([course('1.5'),course('3.0','3',false),course('3.1'),course('5.0'),course('INC'),course('PENDING'),course('DRP')],'120');
 assert.equal(r.valid,true);assert.equal(r.earned,6);assert.equal(r.remaining,114);assert.equal(r.percent,5);
});
test('confirmed earned units handle repeats and preserve a zero override',()=>{
 const rows=[course('1.0','3',true,'Math'),course('1.5','3',true,' Math ')];
 assert.equal(degreeProgress(rows,'120').repeated,true);
 assert.equal(degreeProgress(rows,'120','3').earned,3);
 assert.equal(degreeProgress(rows,'120','0').earned,0);
});
test('progress validates totals and never silently caps excess earned units',()=>{
 for(const value of ['',0,-1,'501','Infinity','12.12345'])assert.equal(degreeProgress([],value).valid,false);
 assert.equal(degreeProgress([course('1.0')],'2').valid,false);
 assert.equal(degreeProgress([],'120','121').valid,false);
 assert.equal(degreeProgress([],'120','-1').valid,false);
 assert.equal(degreeProgress([],'120','0').valid,true);
 assert.equal(degreeProgress([course('1.0','2.5')],'120').remaining,117.5);
});
test('what-if combines unrounded weighted grades across included units',()=>{
 const r=projectGrades([course('1.0','3')],[course('2.0','9')]);
 assert.equal(r.valid,true);assert.equal(r.current,1);assert.equal(r.gwa,1.75);assert.equal(r.units,12);assert.equal(r.tier,'cum');
 const improved=projectGrades([course('1.5')],[course('1.0')]);
 assert.equal(improved.gwa,1.25);assert.equal(improved.change,-.25);
});
test('what-if rejects every incomplete future row rather than omitting it',()=>{
 for(const grade of ['','INC','DRP','PENDING','1.25','6.0'])assert.equal(projectGrades([],[course(grade)]).valid,false);
 for(const units of ['','0','31','-1'])assert.equal(projectGrades([],[course('1.0',units)]).valid,false);
 assert.equal(projectGrades([],[]).valid,false);
 assert.equal(projectGrades([],Array(51).fill(course('1.0'))).valid,false);
});
test('what-if has no mutation, saved eligibility, or full-record claim',()=>{
 const rows=[course('1.5'),course('INC'),course('5.0','3',false)];
 const future=[course('1.0')],before=JSON.stringify([rows,future]);
 const r=projectGrades(rows,future);
 assert.equal(JSON.stringify([rows,future]),before);assert.equal(r.gwa,1.25);assert.equal(r.review,1);
 assert.equal(r.eligible,undefined);assert.equal(r.status,undefined);assert.equal(r.complete,undefined);
});
test('what-if accepts a numeric failure and an empty current record',()=>{
 assert.equal(projectGrades([],[course('5.0')]).gwa,5);
 assert.equal(projectGrades([],[course('1.0')]).current,null);
});
