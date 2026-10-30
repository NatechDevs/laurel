
'use strict';
const KEY='laurel-bu-v1';
const $=id=>document.getElementById(id);
const escapeHTML=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function fresh(){return {version:1,name:'',program:'',degreeUnits:'',earnedUnits:'',terms:[{id:'t1',name:'Year 1 · 1st semester'}],courses:[],checks:{load:'unknown',curriculum:'unknown',residency:'unknown',history:'unknown',complete:false}}}
let state=fresh(),filter='all',result=null,saveTimer,toastTimer;
function validateState(s){if(!s||s.version!==1||typeof s.name!=='string'||s.name.length>100||typeof s.program!=='string'||s.program.length>120||!Array.isArray(s.terms)||!s.terms.length||s.terms.length>100||!Array.isArray(s.courses)||s.courses.length>3000)throw Error('Invalid backup structure.');const ids=new Set();for(const t of s.terms){if(typeof t.id!=='string'||typeof t.name!=='string'||t.name.length>70||ids.has(t.id))throw Error('Invalid semesters.');ids.add(t.id)}const cids=new Set();for(const c of s.courses){if(typeof c.id!=='string'||cids.has(c.id)||!ids.has(c.term)||typeof c.name!=='string'||c.name.length>150||typeof c.include!=='boolean'||!((typeof c.units==='string'&&c.units.length<=30)||(typeof c.units==='number'&&Number.isFinite(c.units)))||!(c.grade===''||validGrade(c.grade)))throw Error('Invalid course data.');cids.add(c.id)}if(!s.checks||typeof s.checks.complete!=='boolean'||!['load','curriculum','residency','history'].every(k=>['unknown','yes','no'].includes(s.checks[k])))throw Error('Invalid eligibility checks.');for(const key of ['degreeUnits','earnedUnits'])if(s[key]!==undefined&&(typeof s[key]!=='string'||s[key].length>30))throw Error('Invalid degree progress settings.');return {...s,degreeUnits:s.degreeUnits??'',earnedUnits:s.earnedUnits??''}}
try{const saved=localStorage.getItem(KEY);if(saved)state=validateState(JSON.parse(saved))}catch(e){$('saved').textContent='Saved data unavailable; use a backup';}
let recordsDirty=false;
function persistRecords(){if(!recordsDirty)return;clearTimeout(saveTimer);try{localStorage.setItem(KEY,JSON.stringify(state));recordsDirty=false;$('saved').textContent='✓ Saved on this device'}catch(e){$('saved').textContent='Saving unavailable — download a backup'}}
function save(){recordsDirty=true;clearTimeout(saveTimer);$('saved').textContent='Saving…';saveTimer=setTimeout(persistRecords,350)}
window.addEventListener('pagehide',persistRecords);
document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='hidden')persistRecords()});

function notify(s){$('toast').textContent=s;clearTimeout(toastTimer);toastTimer=setTimeout(()=>$('toast').textContent='',4200)}
function uid(){return typeof crypto.randomUUID==='function'?crypto.randomUUID():Date.now().toString(36)+Math.random().toString(36).slice(2)}
function activeTerm(){return filter==='all'?state.terms[state.terms.length-1].id:filter}
function gradeOptions(current){let options='<option value="">Select</option>';for(let i=10;i<=40;i++){const g=(i/10).toFixed(1);options+=`<option value="${g}" ${g===current?'selected':''}>${g}${i>30?' · Cond.':''}</option>`}for(const [v,label] of [['5.0','5.0 · Failed'],['INC','INC'],['DRP','DRP'],['PENDING','Pending']])options+=`<option value="${v}" ${v===current?'selected':''}>${label}</option>`;return options}
function renderTerms(){$('termFilter').innerHTML='<option value="all">All semesters</option>'+state.terms.map(t=>`<option value="${escapeHTML(t.id)}">${escapeHTML(t.name)}</option>`).join('');$('termFilter').value=filter}
function renderRows(){const courses=state.courses.filter(c=>filter==='all'||c.term===filter);$('rows').innerHTML=courses.map(c=>`<tr data-id="${escapeHTML(c.id)}"><td><input data-field="name" aria-label="Course name" maxlength="150" placeholder="Course name" value="${escapeHTML(c.name)}"><span class="termnote">${escapeHTML(state.terms.find(t=>t.id===c.term).name)}</span></td><td><input class="units" data-field="units" type="number" min="0.0001" max="30" step="0.0001" inputmode="decimal" aria-label="Units for ${escapeHTML(c.name||'course')}" placeholder="3" value="${escapeHTML(c.units)}"></td><td><select class="grade" data-field="grade" aria-label="Final grade for ${escapeHTML(c.name||'course')}">${gradeOptions(c.grade)}</select></td><td style="text-align:center"><input class="include" data-field="include" type="checkbox" aria-label="Include ${escapeHTML(c.name||'course')} in GWA" ${c.include?'checked':''}></td><td><button class="remove" data-remove="${escapeHTML(c.id)}" aria-label="Remove ${escapeHTML(c.name||'course')}">×</button></td></tr>`).join('');$('empty').hidden=courses.length>0;update()}

function update(){const courses=state.courses.filter(c=>filter==='all'||c.term===filter);result=calculate(courses,state.checks,filter==='all');$('gwa').textContent=result.gwa===null?'—':result.gwa.toFixed(4);$('scopeTag').textContent=filter==='all'?'Overall':'Semester';$('gwaLabel').textContent=filter==='all'?'General weighted average':'Semester weighted average';$('standingLabel').textContent=result.label;$('honorTitle').textContent=result.title;$('honorDetail').textContent=result.detail;$('totalUnits').textContent=result.units.toLocaleString(undefined,{maximumFractionDigits:4});$('totalCourses').textContent=result.count;$('shareBtn').disabled=result.gwa===null;document.querySelectorAll('[data-range]').forEach(el=>el.classList.toggle('active',el.dataset.range===result.tier));const notes=[];if(result.incomplete)notes.push(`${result.incomplete} included course(s) need a valid final grade and units (greater than 0, up to 30; maximum 4 decimals).`);if(result.unresolved)notes.push(`${result.unresolved} unresolved/non-numeric record(s) excluded from GWA.`);$('validation').textContent=notes.join(' ');document.querySelectorAll('#rows input[data-field="units"]').forEach(el=>{const invalid=el.value!==''&&!validUnits(el.value);el.classList.toggle('invalid',invalid);el.setAttribute('aria-invalid',String(invalid))});renderReports();}
function render(){renderTerms();$('degreeTotal').value=state.degreeUnits||'';$('earnedOverride').value=state.earnedUnits||'';$('studentName').value=state.name;$('program').value=state.program;for(const k of ['load','curriculum','residency','history'])$(k).value=state.checks[k];$('complete').checked=state.checks.complete;renderRows()}
$('rows').addEventListener('input',e=>{const field=e.target.dataset.field;if(!field)return;const c=state.courses.find(c=>c.id===e.target.closest('tr').dataset.id);c[field]=field==='include'?e.target.checked:e.target.value;update();save()});
$('rows').addEventListener('click',e=>{const b=e.target.closest('[data-remove]');if(!b)return;const index=state.courses.findIndex(c=>c.id===b.dataset.remove);if(index<0)return;rememberDeletedCourse(state.courses[index],index);state.courses.splice(index,1);renderRows();save();const next=$('rows').querySelectorAll('input[data-field="name"]');(next[Math.min(index,next.length-1)]||$('addCourse')).focus()});
$('termFilter').addEventListener('change',()=>{filter=$('termFilter').value;renderRows()});
$('addCourse').onclick=()=>{state.courses.push({id:uid(),name:'',units:'3',grade:'',include:true,term:activeTerm()});renderRows();save();const inputs=$('rows').querySelectorAll('[data-field="name"]');inputs[inputs.length-1].focus()};
for(const [id,key] of [['studentName','name'],['program','program']])$(id).addEventListener('input',()=>{state[key]=$(id).value;save()});
for(const k of ['load','curriculum','residency','history','complete'])$(k).addEventListener('change',()=>{state.checks[k]=k==='complete'?$(k).checked:$(k).value;update();save()});
document.querySelectorAll('[data-close]').forEach(b=>b.onclick=()=>$(b.dataset.close).close());
$('newTerm').onclick=()=>{$('termName').value='';$('termDialog').showModal();$('termName').focus()};
$('termForm').onsubmit=e=>{e.preventDefault();const name=$('termName').value.trim();if(!name)return;const t={id:uid(),name};state.terms.push(t);filter=t.id;renderTerms();renderRows();save();$('termDialog').close();$('addCourse').focus()};
$('demo').onclick=()=>{const term=activeTerm();for(const [name,units,grade] of [['Mathematics in the Modern World','3','1.2'],['Understanding the Self','3','1.4'],['Purposive Communication','3','1.5'],['Science, Technology and Society','3','1.3']])state.courses.push({id:uid(),name,units,grade,term,include:true});renderRows();save();notify('Example grades added. Replace them with your actual grades or reset to start fresh.')};
$('pasteBtn').onclick=()=>{$('pasteText').value='';$('pasteError').textContent='';$('pasteDialog').showModal();$('pasteText').focus()};
$('confirmPaste').onclick=()=>importCourses($('pasteText').value);
function download(blob,name){const a=document.createElement('a'),url=URL.createObjectURL(blob);a.href=url;a.download=name;document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),3000)}
$('exportData').onclick=()=>download(new Blob([JSON.stringify(state,null,2)],{type:'application/json'}),'laurel-grade-backup.json');
$('importData').onclick=()=>$('importFile').click();$('importFile').onchange=async()=>{const file=$('importFile').files[0];if(!file)return;try{if(file.size>2e6)throw Error('File is too large.');const restored=validateState(JSON.parse(await file.text()));if(state.courses.length&&!confirm('Replace your current records with this backup? Download a backup first if needed.'))return;clearDeletionHistory();state=restored;filter='all';render();save();notify('Records restored.')}catch(e){notify('Could not restore: '+e.message)}finally{$('importFile').value=''}};
$('reset').onclick=()=>$('resetDialog').showModal();$('confirmReset').onclick=()=>{clearDeletionHistory();state=fresh();filter='all';render();save();$('resetDialog').close();notify('All records cleared.')};
function scope(){return filter==='all'?'All semesters':state.terms.find(t=>t.id===filter).name}
function shareTitle(){return result.tier?result.title+' · GWA range':'Academic progress'}
function shareText(){return ['LAUREL / BU GRADE SUMMARY',$('includeName').checked?[state.name,state.program].filter(Boolean).join(' · '):'',scope(),`GWA: ${result.gwa.toFixed(4)} | ${result.units} units | ${result.count} graded courses`,shareTitle(),result.status,'Estimate from entered grades and self-reported checks. Not an official BU assessment.','Reference: BU Student Handbook, revised 2019.','Laurel is not affiliated with or endorsed by Bicol University.'].filter(Boolean).join('\n')}
// One vector drawing is shared by the live preview and PNG export.
const snapshotSprigPaths={
 stem:'M64 216 C27 161 22 87 50 16',
 leaves:[
 'M54 199 Q27 194 20 166 Q45 171 54 199 Z',
 'M45 179 Q42 150 67 137 Q70 165 45 179 Z',
 'M36 159 Q10 149 8 122 Q32 133 36 159 Z',
 'M31 136 Q38 110 61 105 Q59 129 31 136 Z',
 'M30 112 Q9 98 14 73 Q34 88 30 112 Z',
 'M32 89 Q44 66 66 67 Q59 89 32 89 Z',
 'M37 65 Q20 48 29 26 Q45 43 37 65 Z',
 'M44 43 Q48 20 65 9 Q67 33 44 43 Z'
 ]
};
function snapshotSprigSVG(){return `<svg viewBox="0 0 80 230" fill="currentColor" aria-hidden="true"><path d="${snapshotSprigPaths.stem}" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>${snapshotSprigPaths.leaves.map(d=>`<path d="${d}"/>`).join('')}</svg>`}
let snapshotStyle='signature';
let snapshotCelebrationTimer;
function previewShare(){
  $('animationOutput').hidden=true;$('animationPreview').pause();
  $('shareIdentity').hidden=!$('includeName').checked;
  $('shareNameHint').textContent=state.name.trim()?'Your preview updates as you type.':'Enter your name above to show it on your card.';
  const card=$('sharePreview');card.dataset.tier=result.tier||'progress';card.dataset.style=snapshotStyle;
  const note=result.tier?'Your hard work, in perspective.':'Every course is a step forward.';
  card.innerHTML=`<div class="snapshot-frame" aria-hidden="true"><i></i><i></i><i></i><i></i></div><div class="snapshot-spark" aria-hidden="true">✦</div><div class="eyebrow">Laurel / Your academic snapshot</div><p class="snapshot-message">${note}</p>${$('includeName').checked?`<p class="name">${escapeHTML(state.name)}</p><p>${escapeHTML(state.program)}</p>`:''}<p class="snapshot-scope">${escapeHTML(scope())}</p><div class="snapshot-score"><span class="snapshot-sprig" aria-hidden="true">${snapshotSprigSVG()}</span><div><span class="sr-only">GWA</span><div class="gwa">${result.gwa.toFixed(4)}</div><span class="snapshot-score-label">${filter==='all'?'GENERAL':'SEMESTER'} WEIGHTED AVERAGE</span></div><span class="snapshot-sprig mirrored" aria-hidden="true">${snapshotSprigSVG()}</span></div><h3>${escapeHTML(result.tier?result.title:'Your academic progress')}</h3><span class="snapshot-badge">${result.tier?'GWA range · Unofficial estimate':'Academic snapshot · Unofficial estimate'}</span><p class="snapshot-status">${escapeHTML(result.status)}</p><div class="snapshot-stats"><span><b>${result.units}</b> included units</span><span><b>${result.count}</b> graded ${result.count===1?'course':'courses'}</span></div><p class="snapshot-fine"><strong>Not an official honors confirmation.</strong><br>Independent tool · <strong>Not affiliated with Bicol University.</strong></p>`;
}

document.querySelectorAll('[data-snapshot-style]').forEach(button=>button.addEventListener('click',()=>{
 snapshotStyle=button.dataset.snapshotStyle;
 document.querySelectorAll('[data-snapshot-style]').forEach(option=>option.setAttribute('aria-pressed',String(option===button)));
 previewShare();$('snapshotDesignStatus').textContent=button.textContent.trim()+' style · Ready to save';
}));
$('celebrateSnapshot').onclick=()=>{
 const card=$('sharePreview');card.querySelector('.snapshot-confetti')?.remove();clearTimeout(snapshotCelebrationTimer);
 if(window.matchMedia('(prefers-reduced-motion: reduce)').matches){$('snapshotDesignStatus').textContent='A moment worth keeping. Your snapshot is ready.';return;}
 const burst=document.createElement('div');burst.className='snapshot-confetti';burst.setAttribute('aria-hidden','true');
 for(let i=0;i<22;i++){const piece=document.createElement('i');piece.style.setProperty('--x',((i*37)%100)+'%');piece.style.setProperty('--delay',((i%5)*.06)+'s');piece.style.setProperty('--turn',(i%2?1:-1)*((i*23)%240)+'deg');piece.style.setProperty('--drift',((i%7)-3)*17+'px');burst.append(piece)}
 card.append(burst);$('snapshotDesignStatus').textContent='Your progress deserves a moment. ✦';
 snapshotCelebrationTimer=setTimeout(()=>{burst.remove();$('snapshotDesignStatus').textContent=snapshotStyle[0].toUpperCase()+snapshotStyle.slice(1)+' style · Ready to save'},1900);
};
$('shareBtn').onclick=()=>{$('shareName').value=state.name;$('shareProgram').value=state.program;$('includeName').checked=false;$('copyFallback').hidden=true;previewShare();$('shareDialog').showModal()};$('includeName').onchange=()=>{previewShare();if($('includeName').checked)$('shareName').focus()};
for(const [input,profile,key] of [['shareName','studentName','name'],['shareProgram','program','program']])$(input).addEventListener('input',()=>{state[key]=$(input).value;$(profile).value=state[key];save();previewShare()});
$('copyResult').onclick=async()=>{try{await navigator.clipboard.writeText(shareText());notify('Summary copied. Ready to share.')}catch(e){$('copyFallback').hidden=false;$('copyFallback').value=shareText();$('copyFallback').focus();$('copyFallback').select();notify('Select and copy the summary below.')}};
function drawResultCard(){
 const canvas=document.createElement('canvas');canvas.width=1200;canvas.height=1200;
 const ctx=canvas.getContext('2d');
 const palettes={summa:['#f5e4b9','#99702d'],magna:['#dbe6ff','#546fa6'],cum:['#cfe9dc','#3a7a65'],progress:['#dcebf3','#52768e']};
 let [glow,accent]=palettes[result.tier||'progress'];
 const night=snapshotStyle==='midnight';
 if(night){glow='#35425b';accent='#e9cf9d'}else if(snapshotStyle==='botanical'){glow='#cde8d6';accent='#3c7860'}
 const textColor=night?'#edf4fa':'#20374c',mutedColor=night?'#bacbd9':'#586c7b';
 const gradient=ctx.createLinearGradient(0,0,1200,1200);gradient.addColorStop(0,glow);gradient.addColorStop(.52,night?'#192b3d':'#fbfaf6');gradient.addColorStop(1,night?'#102130':'#edf2f1');ctx.fillStyle=gradient;ctx.fillRect(0,0,1200,1200);
 // Restrained double keyline and offset corner rules, shared by all card styles.
 ctx.strokeStyle=accent;ctx.globalAlpha=.52;ctx.lineWidth=1.5;ctx.strokeRect(38,38,1124,1124);
 ctx.globalAlpha=.28;ctx.lineWidth=1;ctx.strokeRect(64,64,1072,1072);
 for(const [x,y,sx,sy] of [[54,54,1,1],[1146,54,-1,1],[1146,1146,-1,-1],[54,1146,1,-1]]){
  ctx.save();ctx.translate(x,y);ctx.scale(sx,sy);ctx.globalAlpha=.8;ctx.lineWidth=2.5;ctx.beginPath();ctx.moveTo(0,47);ctx.lineTo(0,0);ctx.lineTo(47,0);ctx.stroke();ctx.restore();
 }
 ctx.globalAlpha=1;
 // Small original botanical marks; no university insignia.
 function branch(x,mirror){
  ctx.save();ctx.translate(x,364);ctx.scale(mirror*.92,.92);ctx.strokeStyle=accent;ctx.fillStyle=accent;ctx.globalAlpha=.72;ctx.lineWidth=1.8;ctx.lineCap='round';
  ctx.stroke(new Path2D(snapshotSprigPaths.stem));
  for(const leaf of snapshotSprigPaths.leaves)ctx.fill(new Path2D(leaf));
  ctx.restore();
 }
 branch(202,1);branch(998,-1);
 function star(x,y,r){ctx.save();ctx.translate(x,y);ctx.fillStyle=accent;ctx.beginPath();ctx.moveTo(0,-r);ctx.quadraticCurveTo(2,-2,r,0);ctx.quadraticCurveTo(2,2,0,r);ctx.quadraticCurveTo(-2,2,-r,0);ctx.quadraticCurveTo(-2,-2,0,-r);ctx.fill();ctx.restore()}
 star(600,130,23);star(160,240,10);star(1040,240,10);star(170,880,8);star(1030,880,8);
 ctx.textAlign='center';const line=(text,y,font,color=textColor)=>{ctx.font=font;ctx.fillStyle=color;ctx.fillText(text,600,y,990)};
 line('L A U R E L   /   A C A D E M I C   S N A P S H O T',200,'500 18px Poppins, sans-serif');
 line(result.tier?'Your hard work, in perspective.':'Every course is a step forward.',254,'400 25px Poppins, sans-serif',accent);
 if($('includeName').checked){line(state.name,320,'500 30px Poppins, sans-serif');line(state.program,357,'400 20px Poppins, sans-serif',mutedColor)}
 line(scope(),412,'400 23px Poppins, sans-serif',mutedColor);line(result.gwa.toFixed(4),567,'600 135px Poppins, sans-serif');
 line(filter==='all'?'G E N E R A L   W E I G H T E D   A V E R A G E':'S E M E S T E R   W E I G H T E D   A V E R A G E',615,'400 16px Poppins, sans-serif',mutedColor);
 line(result.tier?result.title:'Your academic progress',710,'500 43px Poppins, sans-serif');line(result.tier?'GWA RANGE · UNOFFICIAL ESTIMATE':'ACADEMIC SNAPSHOT · UNOFFICIAL ESTIMATE',761,'500 17px Poppins, sans-serif',accent);
 line(result.status,810,'400 22px Poppins, sans-serif',mutedColor);
 ctx.strokeStyle=accent;ctx.globalAlpha=.3;ctx.lineWidth=1;ctx.strokeRect(275,842,650,70);ctx.beginPath();ctx.moveTo(600,854);ctx.lineTo(600,900);ctx.stroke();ctx.globalAlpha=1;
 ctx.font='500 21px Poppins, sans-serif';ctx.fillStyle=textColor;ctx.fillText(`${result.units} INCLUDED UNITS`,438,883,285);ctx.fillText(`${result.count} GRADED ${result.count===1?'COURSE':'COURSES'}`,762,883,285);
 ctx.strokeStyle=accent;ctx.globalAlpha=.3;ctx.beginPath();ctx.moveTo(280,933);ctx.lineTo(920,933);ctx.stroke();ctx.globalAlpha=1;
 ctx.save();ctx.strokeStyle=accent;ctx.globalAlpha=.38;ctx.lineWidth=1.5;ctx.strokeRect(150,960,900,90);ctx.restore();line('Based on entered grades and self-reported requirements.',988,'400 20px Poppins, sans-serif',mutedColor);line('Not an official honors confirmation or certification.',1024,'500 20px Poppins, sans-serif',textColor);line('Reference: BU Student Handbook · Revised 2019',1081,'400 18px Poppins, sans-serif',mutedColor);line('Independent tool. Not affiliated with Bicol University.',1120,'500 20px Poppins, sans-serif',textColor);
 return canvas;
}
$('downloadCard').onclick=async()=>{await document.fonts.ready;drawResultCard().toBlob(blob=>{if(blob){download(blob,'laurel-gwa-result.png');notify('Your snapshot is saved. Ready when you are.')}else notify('Image export unavailable. Try Print / PDF.')},'image/png')};

// Record only a locally drawn card; no camera, microphone, or screen capture.
let snapshotAnimationURL;
$('downloadAnimation').onclick=async()=>{
 const button=$('downloadAnimation'),status=$('animationStatus');
 if(!window.MediaRecorder||!HTMLCanvasElement.prototype.captureStream){status.textContent='Video export is unavailable in this browser. You can still save a PNG image.';return}
 const mime=['video/webm;codecs=vp9','video/webm;codecs=vp8','video/webm'].find(type=>MediaRecorder.isTypeSupported(type));
 if(!mime){status.textContent='This browser cannot save WebM video. Try a recent Chrome or Edge, or save a PNG.';return}
 button.disabled=true;button.textContent='Creating animation…';status.textContent='Preparing your card. Keep this tab open for a few seconds.';
 let stream,frame,timer,recorder,aborted=false;
 const cleanup=()=>{cancelAnimationFrame(frame);clearTimeout(timer);stream?.getTracks().forEach(track=>track.stop());window.removeEventListener('pagehide',abort);button.disabled=false;button.textContent='✦ Save animation'};
 const abort=()=>{aborted=true;if(recorder?.state==='recording')recorder.stop();cleanup()};
 try{
  await document.fonts.ready;
  const base=drawResultCard();
  const canvas=document.createElement('canvas');canvas.width=canvas.height=1200;
  const ctx=canvas.getContext('2d');ctx.drawImage(base,0,0);
  stream=canvas.captureStream(30);recorder=new MediaRecorder(stream,{mimeType:mime,videoBitsPerSecond:5000000});
  const chunks=[];
  recorder.ondataavailable=event=>{if(event.data.size)chunks.push(event.data)};
  recorder.onerror=()=>{aborted=true;status.textContent='Could not create the animation. Your PNG image is still available.';if(recorder.state==='recording')recorder.stop();cleanup()};
  recorder.onstop=()=>{
   cleanup();if(aborted)return;
   const blob=new Blob(chunks,{type:recorder.mimeType});
   if(!blob.size){status.textContent='The video was empty. Keep this tab visible and try again.';return}
   if(snapshotAnimationURL)URL.revokeObjectURL(snapshotAnimationURL);
   snapshotAnimationURL=URL.createObjectURL(blob);
   $('animationPreview').src=snapshotAnimationURL;$('animationOutput').hidden=false;
   $('animationDownload').href=snapshotAnimationURL;
   $('animationDownload').click();
   status.textContent='Your 4-second animated snapshot is ready. Play it below or download it again.';
   if(!matchMedia('(prefers-reduced-motion: reduce)').matches)$('animationPreview').play().catch(()=>{});
  };
  window.addEventListener('pagehide',abort,{once:true});
  const start=performance.now();
  const colors=snapshotStyle==='midnight'?['#efcf87','#c9dcf7','#9ed0b9']:['#b78c40','#87ad9b','#809db6'];
  function paint(now){
   const time=(now-start)/1000;ctx.drawImage(base,0,0);
   // Keep the central record, name, and disclaimer clear. Accents travel in the side margins.
   for(let i=0;i<36;i++){
    const phase=(time+i*.073)%4,progress=phase/4;
    const side=i%2===0?-1:1;
    const x=600+side*(410+(i%4)*24)+Math.sin(time*1.4+i)*15;
    const y=90+progress*1000;
    ctx.save();ctx.translate(x,y);ctx.rotate(time*.7+i);ctx.globalAlpha=Math.sin(progress*Math.PI)*.7;ctx.fillStyle=colors[i%colors.length];
    if(i%3===0){ctx.beginPath();ctx.moveTo(0,-8);ctx.quadraticCurveTo(2,-2,8,0);ctx.quadraticCurveTo(2,2,0,8);ctx.quadraticCurveTo(-2,2,-8,0);ctx.quadraticCurveTo(-2,-2,0,-8);ctx.fill()}
    else{ctx.fillRect(-3,-6,6,12)}
    ctx.restore();
   }
   // A gentle pulse on the existing top sparkle, without changing any result text.
   const glow=.09+.06*Math.sin(time*Math.PI);
   const halo=ctx.createRadialGradient(600,130,3,600,130,65);halo.addColorStop(0,`rgba(225,183,97,${glow})`);halo.addColorStop(1,'rgba(225,183,97,0)');ctx.fillStyle=halo;ctx.fillRect(535,65,130,130);
   if(recorder.state==='recording')frame=requestAnimationFrame(paint);
  }
  recorder.start();frame=requestAnimationFrame(paint);
  status.textContent='Creating your 4-second celebration…';
  timer=setTimeout(()=>{if(recorder.state==='recording')recorder.stop()},4000);
 }catch{aborted=true;status.textContent='Animation export could not start. Try saving a PNG image instead.';if(recorder?.state==='recording')recorder.stop();cleanup()}
};
window.addEventListener('pagehide',()=>{if(snapshotAnimationURL)URL.revokeObjectURL(snapshotAnimationURL)});

$('shareDialog').addEventListener('close',()=>$('animationPreview').pause());
