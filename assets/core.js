/* Calculation and import rules. No browser or network dependencies. */
'use strict';
const POLICY = Object.freeze({ edition: 'BU Student Handbook · Revised 2019', precision: 4,
  tiers: [{id:'summa',name:'Summa Cum Laude',max:1.25},{id:'magna',name:'Magna Cum Laude',max:1.45},{id:'cum',name:'Cum Laude',max:1.75}] });
const validGrade = value => ['INC','DRP','PENDING'].includes(String(value)) || /^(?:[12]\.\d|3\.[0-9]|4\.0|5\.0)$/.test(String(value));
const validUnits = value => String(value).trim()!=='' && Number.isFinite(Number(value)) && Number(value)>0 && Number(value)<=30 && Math.abs(Number(value)*10000-Math.round(Number(value)*10000))<0.000001;

// Semester averages are separate estimates: they cannot reveal individual failures.
function calculateSemesterEstimates(semesters) {
  if(!Array.isArray(semesters)||!semesters.length||semesters.length>50)
    return {valid:false,issues:['Enter between 1 and 50 semesters.'],gwa:null};
  let points=0,units=0;
  const issues=[];
  semesters.forEach((semester,index)=>{
    const grade=Number(semester.gwa),credits=Number(semester.units);
    const precise=value=>Math.abs(value*10000-Math.round(value*10000))<0.000001;
    const validAverage=String(semester.gwa??'').trim()!==''&&Number.isFinite(grade)&&grade>=1&&grade<=5&&precise(grade);
    const validCredits=String(semester.units??'').trim()!==''&&Number.isFinite(credits)&&credits>0&&credits<=60&&precise(credits);
    if(!validAverage)issues.push(`Semester ${index+1}: enter a GWA from 1.0000 to 5.0000, up to 4 decimals.`);
    if(!validCredits)issues.push(`Semester ${index+1}: enter included units greater than 0 and up to 60, up to 4 decimals.`);
    if(validAverage&&validCredits){const ticks=Math.round(credits*10000);points+=Math.round(grade*10000)*ticks;units+=ticks;}
  });
  if(issues.length)return {valid:false,issues,gwa:null};
  const raw=points/units/10000;
  const gwa=Math.round((raw+Number.EPSILON)*10000)/10000;
  const match=POLICY.tiers.find(t=>gwa<=t.max);
  return {valid:true,issues:[],raw,gwa,units:units/10000,count:semesters.length,tier:match?.id||null,title:match?.name||'Outside honors GWA ranges'};
}
function calculate(courses,checks,overall=true){
  let points=0,unitTicks=0,count=0,incomplete=0,unresolved=0;
  const low=courses.some(c=>validGrade(c.grade)&&Number(c.grade)>3);
  for(const c of courses){
    if(['INC','DRP','PENDING'].includes(c.grade)){unresolved++;continue;}
    if(!c.include)continue;
    if(!validGrade(c.grade)||!validUnits(c.units)){incomplete++;continue;}
    const ticks=Math.round(Number(c.units)*10000);
    points+=Math.round(Number(c.grade)*10)*ticks;unitTicks+=ticks;count++;
  }
  // Both factors are integers. No course or semester average is rounded first.
  const raw=unitTicks?points/(unitTicks*10):null;
  const gwa=raw===null?null:Math.round((raw+Number.EPSILON)*10000)/10000;
  const match=gwa===null?null:POLICY.tiers.find(t=>gwa<=t.max);
  const tier=match?.id||null;
  let title='No grades entered',label='Awaiting your record',status='No estimate yet',detail='Add a course or import your grade list to calculate your weighted average.';
  if(gwa!==null){
    title=match?.name||'Outside honors range';label=tier?'GWA range · estimate':'GWA above 1.7500';status=tier?'GWA range only':'Outside honors GWA range';
    detail=tier?'Your GWA meets this numerical range. Review the record and eligibility requirements below.':'This GWA is above the Latin honors thresholds in the supplied handbook. It does not determine graduation eligibility.';
    if(!overall){label='Semester GWA only';status='Semester GWA range only';detail='Graduation honors use your complete degree record. Select All semesters to review your overall standing.';}
    else if(low||checks.history==='no'){label='Grade requirement not met';status='Grade requirement not met';detail='A grade academically lower than 3.0 prevents Latin honors and academic distinction under the supplied edition.';}
    else if(incomplete||unresolved){label='Record needs attention';status='Incomplete record';detail='Incomplete or unresolved entries are excluded from this GWA. Resolve these records before assessing eligibility.';}
    else if(tier&&['load','curriculum','residency'].some(k=>checks[k]==='no')){label='Other requirements not met';status='Other requirements not met';detail='At least one Latin honors requirement is not met. Academic Distinction requires a separate registrar evaluation; see the handbook guide.';}
    else if(tier&&checks.complete&&['load','curriculum','residency','history'].every(k=>checks[k]==='yes')){label='Potentially eligible';status='Potentially eligible · self-assessed';detail='Your entered record and self-reported checks meet this range. The college evaluation committee makes the final determination.';}
    else if(tier){detail='This describes your GWA range only. Eligibility is unconfirmed until your full record and requirements are checked.';}
  }
  return {gwa,raw,tier,title,label,status,detail,units:unitTicks/10000,count,incomplete,unresolved,low,overall,weightedPoints:points/100000};
}
function targetAverage(courses,remaining,target){
  const r=calculate(courses,{},true),u=Number(remaining),t=Number(target);
  const validRemaining=String(remaining).trim()!==''&&Number.isFinite(u)&&u>0&&u<=500&&Math.abs(u*10000-Math.round(u*10000))<0.000001;
  if(!r.count||!validRemaining||!Number.isFinite(t)||t<1||t>3)return null;
  const required=(t*(r.units+u)-r.weightedPoints)/u;
  return {required,possible:required>=1-1e-10,remaining:u,current:r,ceiling:Math.min(required,3)};
}
// Progress counts passed rows independently of their GWA inclusion setting.
// A manual earned-unit value can account for repeated or non-degree credits.
function degreeProgress(courses,totalValue,earnedValue=''){
  const precise=n=>Math.abs(n*10000-Math.round(n*10000))<0.000001;
  const unitValue=(value,allowZero)=>String(value??'').trim()!==''&&Number.isFinite(Number(value))&&Number(value)>=(allowZero?0:.0001)&&Number(value)<=500&&precise(Number(value));
  let ticks=0;const names=new Set();let repeated=false;
  for(const course of courses){
    if(!validUnits(course.units)||!validGrade(course.grade)||!Number.isFinite(Number(course.grade))||Number(course.grade)>3)continue;
    ticks+=Math.round(Number(course.units)*10000);
    const name=String(course.name||'').trim().toLowerCase();
    if(name&&names.has(name))repeated=true;
    if(name)names.add(name);
  }
  const automatic=ticks/10000,manual=String(earnedValue??'').trim()!=='';
  if(!unitValue(totalValue,false))return {valid:false,automatic,repeated,invalidField:'total',issue:'Enter total degree units greater than 0 and up to 500 (up to 4 decimals).'};
  if(manual&&!unitValue(earnedValue,true))return {valid:false,automatic,repeated,invalidField:'earned',issue:'Confirmed earned units must be from 0 to 500 (up to 4 decimals).'};
  const total=Number(totalValue),earned=manual?Number(earnedValue):automatic;
  if(earned>total)return {valid:false,automatic,repeated,invalidField:manual?'earned':'total',issue:'Earned units exceed the degree total. Review repeated courses or enter confirmed earned units.'};
  return {valid:true,total,earned,automatic,manual,repeated,remaining:Math.round((total-earned)*10000)/10000,percent:earned/total*100};
}
function projectGrades(courses,future){
  if(!Array.isArray(future)||!future.length||future.length>50)return {valid:false,issues:['Use between 1 and 50 future courses.']};
  const issues=[];
  future.forEach((course,i)=>{
    if(!validUnits(course.units))issues.push(`Future course ${i+1}: units must be greater than 0 and up to 30 (up to 4 decimals).`);
    if(!validGrade(course.grade)||!Number.isFinite(Number(course.grade)))issues.push(`Future course ${i+1}: choose a numeric final grade.`);
  });
  if(issues.length)return {valid:false,issues};
  const current=calculate(courses,{},true);
  const combined=calculate([...courses,...future.map(c=>({...c,include:true}))],{},false);
  return {valid:true,issues:[],current:current.gwa,gwa:combined.gwa,units:combined.units,tier:combined.tier,title:combined.title,
    change:current.gwa===null?null:Math.round((combined.gwa-current.gwa)*10000)/10000,
    review:current.incomplete+current.unresolved};
}
function parseDelimited(text){
  if(typeof text!=='string'||text.length>2000000)throw Error('Use a CSV smaller than 2 MB.');
  const content=text.replace(/^\uFEFF/,'').trim();if(!content)throw Error('Add at least one course.');
  const delimiter=content.split(/\r?\n/)[0].includes('\t')?'\t':',';
  const rows=[];let row=[],field='',quoted=false;
  for(let i=0;i<content.length;i++){
    const ch=content[i];
    if(ch==='"'){if(quoted&&content[i+1]==='"'){field+='"';i++;}else if(quoted||field===''){quoted=!quoted;}else throw Error('A quotation mark is misplaced. Use a spreadsheet CSV export.');}
    else if(!quoted&&ch===delimiter){row.push(field);field='';}
    else if(!quoted&&(ch==='\n'||ch==='\r')){if(ch==='\r'&&content[i+1]==='\n')i++;row.push(field);if(row.some(v=>v.trim()))rows.push(row);row=[];field='';}
    else field+=ch;
  }
  if(quoted)throw Error('A quoted field is missing its closing quotation mark.');
  row.push(field);if(row.some(v=>v.trim()))rows.push(row);
  if(rows[0]&&/^(course|subject|course name)$/i.test(rows[0][0].trim())&&/^units$/i.test(rows[0][1]?.trim()))rows.shift();
  if(!rows.length||rows.length>500)throw Error('Import between 1 and 500 courses at a time.');
  return rows.map((cols,i)=>{
    if(cols.length<3||cols.length>4)throw Error(`Row ${i+1}: expected Course, Units, Grade, and optional Semester.`);
    const [name,units,raw,semester='']=cols.map(c=>c.trim());
    const g=raw.toUpperCase(),grade=g!==''&&Number.isFinite(Number(g))?Number(g).toFixed(1):g;
    if(!name||name.length>150||!validUnits(units)||!validGrade(grade)||Number.isFinite(Number(g))&&Number(g)!==Number(grade)||semester.length>70)throw Error(`Row ${i+1}: check the course, units (0–30, up to 4 decimals), and BU grade (one decimal, INC, DRP, or PENDING).`);
    return {name,units,grade,semester};
  });
}
function exportCSV(courses,terms){
  const quote=value=>'"'+String(value).replace(/^[=+@-]/,"'$&").replace(/"/g,'""')+'"';
  return '\uFEFF'+['Course,Units,Grade,Semester',...courses.map(c=>[c.name,c.units,c.grade,terms.find(t=>t.id===c.term)?.name||''].map(quote).join(','))].join('\r\n');
}
