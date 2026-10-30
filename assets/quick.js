/* Temporary semester-average estimate. Never changes the saved course record. */
(()=>{
  'use strict';
  let semesters=[{gwa:'',units:''},{gwa:'',units:''}],estimate=null;
  const dialog=$('quickDialog');
  function updateEstimate(){
    estimate=calculateSemesterEstimates(semesters);
    $('quickGWA').textContent=estimate.valid?estimate.gwa.toFixed(4):'—';
    $('quickRange').textContent=estimate.valid?estimate.title+' · GWA range only':'Complete each semester to see your estimate.';
    $('quickUnits').textContent=estimate.valid?`${estimate.units} included units · ${estimate.count} semesters`:'Use the units included in each semester’s GWA.';
    $('quickCopy').disabled=!estimate.valid;
    const started=semesters.some(s=>s.gwa!==''||s.units!=='');
    $('quickErrors').textContent=started&&!estimate.valid?estimate.issues[0]:'';
  }
  function renderEstimates(){
    $('quickRows').innerHTML=semesters.map((semester,index)=>`<div class="quick-row" data-semester="${index}"><span class="quick-row-name">Semester ${index+1}</span><div><label for="quick-grade-${index}">Semester GWA</label><input id="quick-grade-${index}" data-quick-field="gwa" type="number" min="1" max="5" step="0.0001" inputmode="decimal" placeholder="e.g. 1.4500" value="${escapeHTML(semester.gwa)}"></div><div><label for="quick-units-${index}">Included units</label><input id="quick-units-${index}" data-quick-field="units" type="number" min="0.0001" max="60" step="0.0001" inputmode="decimal" placeholder="e.g. 21" value="${escapeHTML(semester.units)}"></div><button type="button" class="remove" data-quick-remove="${index}" aria-label="Remove semester ${index+1}" ${semesters.length===1?'disabled':''}>×</button></div>`).join('');
    $('quickAdd').disabled=semesters.length>=50;
    updateEstimate();
  }
  $('quickOpen').onclick=()=>{renderEstimates();$('quickFallback').hidden=true;dialog.showModal();};
  $('quickClose').onclick=()=>dialog.close();
  $('quickAdd').onclick=()=>{if(semesters.length>=50)return;semesters.push({gwa:'',units:''});renderEstimates();$(`quick-grade-${semesters.length-1}`).focus();};
  $('quickRows').addEventListener('input',event=>{
    const field=event.target.dataset.quickField;if(!field)return;
    semesters[Number(event.target.closest('[data-semester]').dataset.semester)][field]=event.target.value;
    updateEstimate();
  });
  $('quickRows').addEventListener('click',event=>{
    const button=event.target.closest('[data-quick-remove]');if(!button||semesters.length===1)return;
    const index=Number(button.dataset.quickRemove);semesters.splice(index,1);renderEstimates();$(`quick-grade-${Math.min(index,semesters.length-1)}`).focus();
  });
  $('quickCopy').onclick=async()=>{
    if(!estimate?.valid)return;
    const summary=['LAUREL / SEMESTER GWA ESTIMATE',`Cumulative GWA estimate: ${estimate.gwa.toFixed(4)}`,`${estimate.units} included units across ${estimate.count} semesters`,`${estimate.title} · GWA range only`,'Latin honors eligibility has not been assessed.','Computed from entered semester averages, which may already be rounded.','Reference: BU Student Handbook, revised 2019. Not an official BU assessment.','Laurel is not affiliated with or endorsed by Bicol University.'].join('\n');
    try{await navigator.clipboard.writeText(summary);notify('Semester estimate copied.');}
    catch{$('quickFallback').hidden=false;$('quickFallback').value=summary;$('quickFallback').focus();$('quickFallback').select();}
  };
})();
