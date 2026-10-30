/* Optional degree progress and temporary, isolated planning tools. */
'use strict';
const deletedCourses=[];
let futureCourses=[{name:'',units:'3',grade:''}];

function rememberDeletedCourse(course,index){
  deletedCourses.push({course:{...course},index});
  if(deletedCourses.length>20)deletedCourses.shift();
}
function clearDeletionHistory(){deletedCourses.length=0;renderDeletionHistory()}
function renderDeletionHistory(){
  $('undoNotice').hidden=!deletedCourses.length;
  if(!deletedCourses.length)return;
  const latest=deletedCourses[deletedCourses.length-1];
  $('undoMessage').textContent=`Removed ${latest.course.name||'a course'}. ${deletedCourses.length>1?`${deletedCourses.length} deletions available to undo.`:''}`;
}
$('undoDelete').onclick=()=>{
  const latest=deletedCourses[deletedCourses.length-1];if(!latest)return;
  if(state.courses.length>=3000){notify('The workspace is full. Remove a course before restoring another.');return}
  if(!state.terms.some(t=>t.id===latest.course.term)){clearDeletionHistory();notify('The original semester is no longer available. Restore a backup instead.');return}
  deletedCourses.pop();
  if(!state.courses.some(c=>c.id===latest.course.id))state.courses.splice(Math.min(latest.index,state.courses.length),0,{...latest.course});
  filter=latest.course.term;renderTerms();renderRows();save();
  notify('Course restored with its grades, units, and inclusion setting.');
  const input=[...$('rows').querySelectorAll('tr')].find(row=>row.dataset.id===latest.course.id)?.querySelector('input');
  input?.focus();
};
$('dismissUndo').onclick=clearDeletionHistory;

function renderDegreeProgress(){
  const progress=degreeProgress(state.courses,state.degreeUnits||'',state.earnedUnits||'');
  const fmt=n=>n.toLocaleString(undefined,{maximumFractionDigits:4});
  $('degreeTotal').setAttribute('aria-invalid',String(Boolean(state.degreeUnits)&&progress.invalidField==='total'));
  $('earnedOverride').setAttribute('aria-invalid',String(progress.invalidField==='earned'));
  const box=$('progressResult');
  if(!progress.valid){
    box.innerHTML=`<strong>${fmt(progress.automatic)}</strong><span>passed course units entered</span><p class="helper">${state.degreeUnits?escapeHTML(progress.issue):'Add your total degree units to see progress and remaining units.'}</p>`;
    return;
  }
  box.innerHTML=`<div class="progress-numbers"><strong>${progress.percent.toFixed(1)}<small>%</small></strong><span>${progress.manual?'Using confirmed earned units':'Estimated from passed rows'}</span></div><progress value="${progress.percent}" max="100" aria-label="Estimated degree unit completion">${progress.percent.toFixed(1)}%</progress><div class="progress-unit-stats"><span><b>${fmt(progress.earned)}</b> of ${fmt(progress.total)} units</span><span><b>${fmt(progress.remaining)}</b> remaining</span></div>${progress.repeated&&!progress.manual?'<p class="progress-caution">Some passed course names repeat. Check for retakes or enter confirmed earned units above.</p>':''}<p class="helper">${progress.remaining===0?'Your entered unit total is reached. This does not confirm completion of degree requirements.':'Based on all semesters, regardless of the current filter.'}</p>`;
}
for(const [id,key] of [['degreeTotal','degreeUnits'],['earnedOverride','earnedUnits']])$(id).addEventListener('input',()=>{state[key]=$(id).value;renderDegreeProgress();save()});

function renderFutureRows(){
  $('scenarioRows').innerHTML=futureCourses.map((course,i)=>`<div class="future-course"><div class="future-course-head"><span>Future course ${i+1}</span><button class="remove" type="button" data-remove-future="${i}" aria-label="Remove future course ${i+1}" ${futureCourses.length===1?'disabled':''}>×</button></div><div class="future-fields"><div class="future-name"><label for="futureName${i}">Course name <span class="optional">Optional</span></label><input id="futureName${i}" data-future="${i}" data-field="name" maxlength="150" placeholder="e.g. Research project" value="${escapeHTML(course.name)}"></div><div><label for="futureUnits${i}">Units</label><input id="futureUnits${i}" data-future="${i}" data-field="units" type="number" min="0.0001" max="30" step="0.0001" inputmode="decimal" value="${escapeHTML(course.units)}"></div><div><label for="futureGrade${i}">Possible grade</label><select id="futureGrade${i}" data-future="${i}" data-field="grade">${gradeOptions(course.grade).replace(/<option value="(?:INC|DRP|PENDING)"[^>]*>[^<]*<\/option>/g,'')}</select></div></div></div>`).join('');
  $('scenarioAdd').disabled=futureCourses.length>=50;
  renderScenarioResult();
}
function renderScenarioResult(){
  const projection=projectGrades(state.courses,futureCourses),box=$('scenarioResult');
  if(!projection.valid){box.innerHTML='<strong>Complete your future courses</strong><p>'+projection.issues.map(escapeHTML).join('<br>')+'</p>';return}
  let change='No current numeric GWA to compare.';
  if(projection.change!==null)change=projection.change===0?'No change to the rounded GWA.':`${Math.abs(projection.change).toFixed(4)} ${projection.change<0?'lower (improved)':'higher'} than your current GWA. Lower numeric grades are better.`;
  box.innerHTML=`<span class="eyebrow">PROJECTED OVERALL GWA</span><div class="scenario-comparison"><div><span>Current</span><strong>${projection.current===null?'—':projection.current.toFixed(4)}</strong></div><span aria-hidden="true">→</span><div><span>With future courses</span><strong>${projection.gwa.toFixed(4)}</strong></div></div><p>${escapeHTML(change)}</p><span class="scenario-range">${escapeHTML(projection.title)} · GWA range only</span><p class="helper">${projection.units} included units in this scenario.${projection.review?' Your saved record has missing or unresolved entries; only valid included grades enter this projection.':''}</p>`;
}
$('scenarioOpen').onclick=()=>{renderFutureRows();$('scenarioDialog').showModal()};
$('scenarioAdd').onclick=()=>{if(futureCourses.length>=50)return;futureCourses.push({name:'',units:'3',grade:''});renderFutureRows();$('scenarioRows').querySelectorAll('input[data-field="name"]')[futureCourses.length-1].focus()};
$('scenarioReset').onclick=()=>{futureCourses=[{name:'',units:'3',grade:''}];renderFutureRows()};
$('scenarioRows').addEventListener('input',event=>{
  const input=event.target,index=Number(input.dataset.future),field=input.dataset.field;
  if(!futureCourses[index]||!['name','units','grade'].includes(field))return;
  futureCourses[index][field]=input.value;renderScenarioResult();
});
$('scenarioRows').addEventListener('click',event=>{
  const button=event.target.closest('[data-remove-future]');if(!button||futureCourses.length===1)return;
  const index=Number(button.dataset.removeFuture);futureCourses.splice(index,1);renderFutureRows();
  $('scenarioRows').querySelectorAll('button')[Math.min(index,futureCourses.length-1)]?.focus();
});
function refreshPlanningTools(){renderDegreeProgress();renderDeletionHistory();if($('scenarioDialog').open)renderScenarioResult()}
refreshPlanningTools();
