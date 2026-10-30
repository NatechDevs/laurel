/* Presentation helpers and additional workspace features. Uses core.js and app.js. */
'use strict';
function importCourses(text) {
  try {
    const parsed = parseDelimited(text);
    if (state.courses.length + parsed.length > 3000) throw Error('The workspace supports up to 3,000 courses.');
    const terms = state.terms.map(t => ({...t}));
    const courses = parsed.map(c => {
      let term = c.semester ? terms.find(t => t.name.toLowerCase() === c.semester.toLowerCase()) : terms.find(t => t.id === activeTerm());
      if (!term) { term = {id:uid(),name:c.semester}; terms.push(term); }
      return {id:uid(),name:c.name,units:c.units,grade:c.grade,include:true,term:term.id};
    });
    if (terms.length > 100) throw Error('The workspace supports up to 100 semesters.');
    state.terms = terms;
    state.courses.push(...courses);
    // Show all imported rows, including courses assigned to newly created semesters.
    filter = 'all';
    renderTerms();renderRows();save();
    $('pasteDialog').close();
    notify(`${courses.length} course records imported. Review them against your official grades.`);
  } catch(error) { $('pasteError').textContent = error.message; }
}

function renderReports() {
  const semesters = state.terms.map(term => ({term, courses:state.courses.filter(c => c.term === term.id)})).filter(s => s.courses.length);
  $('semesterReport').innerHTML = semesters.length ? `<div class="tablewrap"><table><thead><tr><th scope="col">Semester</th><th scope="col">Included units</th><th scope="col">GWA</th><th scope="col">Record</th></tr></thead><tbody>${semesters.map(({term,courses}) => {
    const r=calculate(courses,state.checks,false);
    const review = r.incomplete + r.unresolved;
    return `<tr><td>${escapeHTML(term.name)}</td><td>${r.units}</td><td>${r.gwa===null?'—':r.gwa.toFixed(4)}<span class="mini-bar" aria-hidden="true"><span style="width:${r.gwa===null?0:Math.max(0,(5-r.gwa)/4*100)}%"></span></span></td><td><span class="status ${review?'review':'met'}">${review?`${review} to review`:'No missing entries'}</span></td></tr>`;
  }).join('')}</tbody></table></div><p class="helper">Overall GWA combines course grades and units. Semester averages are never averaged equally.</p>` : '<p class="helper">Your semester summary will appear here when you add course records.</p>';

  const all=calculate(state.courses,state.checks,true);
  const item=(label,status,text)=>`<div class="assessment-item"><span>${escapeHTML(label)}</span><span class="status ${status}">${escapeHTML(text)}</span></div>`;
  const self=(key,label)=>item(label,state.checks[key]==='yes'?'met':state.checks[key]==='no'?'unmet':'review',state.checks[key]==='yes'?'Self-reported met':state.checks[key]==='no'?'Not met':'Not reviewed');
  $('assessmentReport').innerHTML='<h3>Assessment breakdown · All semesters</h3>'+
    item('Honors GWA threshold',all.gwa===null?'review':all.tier?'met':'unmet',all.gwa===null?'No GWA':all.tier?'Within a range':'Above 1.7500')+
    item('Entered record completeness',all.incomplete||all.unresolved||!all.count?'review':'met',!all.count?'No numeric grades':all.incomplete||all.unresolved?`${all.incomplete+all.unresolved} to review`:'No missing entries')+
    item('Entered grades academically below 3.0',all.low?'unmet':all.count?'met':'review',all.low?'Found':all.count?'None entered':'No records')+
    self('load','Regular semester load')+self('curriculum','Curriculum & transfer credits')+self('residency','Required residency')+self('history','Full grade history, all institutions')+
    item('Complete degree record confirmed',state.checks.complete?'met':'review',state.checks.complete?'Self-reported complete':'Not confirmed');
  updatePlanner();
  if(typeof refreshPlanningTools==='function')refreshPlanningTools();
}

function updatePlanner() {
  const target=targetAverage(state.courses,$('remainingUnits').value,$('targetGWA').value);
  const box=$('plannerResult');box.classList.remove('warning');
  if(!state.courses.some(c=>c.include&&validGrade(c.grade)&&validUnits(c.units)&&Number.isFinite(Number(c.grade)))){
    box.textContent='Add at least one valid numeric course grade to explore a target.';return;
  }
  if(!target){box.textContent=$('remainingUnits').value?'Enter remaining units greater than 0 and up to 500 (maximum 4 decimal places).':'Enter your remaining units to explore a target.';return;}
  const r=target.current;
  const caution=(r.incomplete||r.unresolved)?'<span class="helper">Your current record has incomplete or unresolved entries. This scenario uses only valid included numeric grades.</span>':'';
  if(!target.possible){box.classList.add('warning');box.innerHTML=`This target would require an average better than 1.0000 across your remaining ${target.remaining} units. It is not reachable with those units on the BU scale.${caution}`;return;}
  // Show a conservative attainable ceiling: never round a required average upward.
  const ceiling=Math.floor((target.ceiling+1e-10)*10000)/10000;
  box.innerHTML=`Required remaining average<strong>${ceiling.toFixed(4)} or better</strong>Across ${target.remaining} units to finish at or below ${Number($('targetGWA').value).toFixed(4)}. ${target.required>3?'Any passing average meets this numerical target.':''}${caution}<span class="helper">Computed using unrounded weighted points. Individual grade rules and all honors requirements still apply.</span>`;
}

$('remainingUnits').addEventListener('input',updatePlanner);
$('targetGWA').addEventListener('change',updatePlanner);
$('chooseCSV').onclick=()=>$('csvFile').click();
$('csvFile').onchange=async()=>{
  const file=$('csvFile').files[0];if(!file)return;
  try {if(file.size>2000000)throw Error('Use a CSV smaller than 2 MB.');$('pasteText').value=await file.text();$('pasteError').textContent='File loaded. Review the text, then select Add courses.';}
  catch(error){$('pasteError').textContent=error.message;}
  finally{$('csvFile').value='';}
};
$('sampleCSV').onclick=()=>download(new Blob(['Course,Units,Grade,Semester\r\nMathematics,3,1.2,Year 1 - First semester\r\n"Science, Technology and Society",3,1.5,Year 1 - First semester\r\n'],{type:'text/csv;charset=utf-8'}),'laurel-import-template.csv');
$('exportCSV').onclick=()=>{
  if(!state.courses.length){notify('Add course records before exporting.');return;}
  download(new Blob([exportCSV(state.courses,state.terms)],{type:'text/csv;charset=utf-8'}),'laurel-course-records.csv');
};

// Build a printable document from escaped summary text, without inline scripts.
$('printResult').onclick=()=>{
  const output=window.open('','_blank');
  if(!output){notify('Allow the print pop-up, then try again.');return;}
  const paragraphs=shareText().split('\n').map(text=>`<p>${escapeHTML(text)}</p>`).join('');
  let faces='';
  for(const sheet of document.styleSheets){
    try{
      for(const rule of sheet.cssRules){
        if(rule.type!==5)continue;
        faces+=rule.cssText.replace(/url\(["']?([^)'" ]+)["']?\)/g,(match,url)=>url.startsWith('data:')?match:`url("${new URL(url,sheet.href||document.baseURI).href}")`);
      }
    }catch{/* Native fallback fonts remain available if a stylesheet is unreadable. */}
  }
  output.document.write(`<!doctype html><html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Laurel Academic Summary</title><style>${faces}body{font:14px/1.9 Poppins,Arial,sans-serif;color:#182e45;max-width:680px;margin:60px auto;padding:35px;border:1px solid #ccd3da}p:first-child{font-size:11px;letter-spacing:2px}p{overflow-wrap:anywhere}button{font:inherit;padding:10px 18px;border:1px solid #ccd3da;background:#fff;color:#182e45;cursor:pointer}@media print{button{display:none}body{margin:20px auto}}</style></head><body>${paragraphs}<button type="button">Print / Save as PDF</button></body></html>`);
  output.document.close();
  output.document.querySelector('button').addEventListener('click',()=>output.print());
  output.focus();
  output.document.fonts.ready.then(()=>output.print());
};

// Initialize only after all three scripts and their helpers are available.
render();

// Direct links from the landing page should reveal their policy text immediately.
function revealLinkedSection() {
  try {
    const target = document.getElementById(decodeURIComponent(location.hash.slice(1)));
    if (target?.tagName === 'DETAILS') target.open = true;
  } catch { /* Ignore a malformed URL fragment without affecting the workspace. */ }
}
window.addEventListener('hashchange', revealLinkedSection);
revealLinkedSection();
