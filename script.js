const questions = [
  "Apakah kamu sering merasa lelah atau cepat kehabisan energi?",
  "Apakah kamu sering merasa pusing atau kepala terasa ringan?",
  "Apakah kamu mudah mengantuk atau sulit berkonsentrasi saat belajar?",
  "Apakah kamu merasa tubuh lemas meskipun sudah cukup beristirahat?",
  "Apakah kamu pernah merasa jantung berdebar lebih cepat dari biasanya?",
  "Apakah kamu sering merasa sesak atau cepat lelah saat aktivitas ringan?",
  "Apakah kamu mengalami sakit kepala berulang?",
  "Apakah tangan atau kaki kamu sering terasa dingin?",
  "Apakah kamu merasa wajah atau bagian dalam kelopak mata tampak lebih pucat dari biasanya?",
  "Apakah nafsu makan kamu menurun atau pola makan menjadi kurang teratur?",
  "Apakah kamu jarang mengonsumsi makanan sumber zat besi seperti daging, telur, kacang-kacangan, atau sayuran hijau?",
  "Apakah kamu merasa keluhan-keluhan tersebut mengganggu aktivitas kuliah sehari-hari?"
];
const choices = [
  ["Tidak pernah",0],["Jarang",1],["Sering",2],["Sangat sering",3]
];
let answers = Array(questions.length).fill(null);
let imageReady = false;
let stream = null;

const form = document.getElementById("surveyForm");
questions.forEach((q,i)=>{
  const div=document.createElement("div"); div.className="question";
  div.innerHTML=`<h3>${i+1}. ${q}</h3><div class="options">${
    choices.map(([label,val])=>`<label class="option" data-q="${i}" data-v="${val}"><input type="radio" name="q${i}" value="${val}">${label}</label>`).join("")
  }</div>`;
  form.appendChild(div);
});
document.querySelectorAll(".option").forEach(el=>el.addEventListener("click",()=>{
  const q=+el.dataset.q, v=+el.dataset.v; answers[q]=v;
  document.querySelectorAll(`.option[data-q="${q}"]`).forEach(x=>x.classList.remove("selected"));
  el.classList.add("selected"); updateProgress();
}));
function updateProgress(){
  const done=answers.filter(x=>x!==null).length;
  document.getElementById("progressText").textContent=`${done}/${questions.length}`;
  document.getElementById("progressBar").style.width=`${done/questions.length*100}%`;
}
function startSurvey(){document.getElementById("surveySection").classList.remove("hidden"); document.getElementById("surveySection").scrollIntoView({behavior:"smooth"});}
function resetSurvey(){answers=Array(questions.length).fill(null);document.querySelectorAll(".option").forEach(x=>x.classList.remove("selected"));updateProgress();}
function submitSurvey(){
  if(answers.includes(null)){alert("Silakan jawab semua pertanyaan terlebih dahulu.");return;}
  document.getElementById("scanSection").classList.remove("hidden");
  document.getElementById("scanSection").scrollIntoView({behavior:"smooth"});
}
const fileInput=document.getElementById("fileInput");
fileInput.addEventListener("change",e=>{
  const file=e.target.files[0]; if(!file)return;
  stopCamera();
  const url=URL.createObjectURL(file);
  showPreview(url);
});
function showPreview(url){
  document.getElementById("preview").src=url;
  document.getElementById("preview").classList.remove("hidden");
  document.getElementById("camera").classList.add("hidden");
  document.getElementById("cameraPlaceholder").classList.add("hidden");
  document.getElementById("analyzeBtn").disabled=false; imageReady=true;
  document.getElementById("cameraStatus").textContent="Foto siap dianalisis sebagai bagian dari simulasi.";
}
async function openCamera(){
  try{
    stream=await navigator.mediaDevices.getUserMedia({video:{facingMode:"user"},audio:false});
    const video=document.getElementById("camera"); video.srcObject=stream;
    video.classList.remove("hidden"); document.getElementById("preview").classList.add("hidden");
    document.getElementById("cameraPlaceholder").classList.add("hidden");
    document.getElementById("captureBtn").classList.remove("hidden");
    document.getElementById("cameraStatus").textContent="Kamera aktif. Posisikan konjungtiva pada area yang terlihat jelas.";
  }catch(e){alert("Kamera tidak dapat diakses. Coba gunakan Pilih dari Galeri dan izinkan akses kamera jika diminta.");}
}
function capturePhoto(){
  const video=document.getElementById("camera"), canvas=document.getElementById("canvas");
  canvas.width=video.videoWidth;canvas.height=video.videoHeight;canvas.getContext("2d").drawImage(video,0,0);
  showPreview(canvas.toDataURL("image/jpeg",.9));stopCamera();document.getElementById("captureBtn").classList.add("hidden");
}
function stopCamera(){if(stream){stream.getTracks().forEach(t=>t.stop());stream=null;}}

function analyze(){
  if(!imageReady){alert("Silakan masukkan foto terlebih dahulu.");return;}
  const surveyScore=answers.reduce((a,b)=>a+b,0);
  // Simulasi visual: dibuat deterministik dari skor survei agar demo dapat diuji tanpa model AI.
  // Untuk penelitian nyata, bagian ini harus diganti model computer vision yang tervalidasi.
  const visualScore = Math.min(3, Math.max(0, Math.round(surveyScore/8)));
  let level, label, color, message, icon;
  if(surveyScore>=21 || visualScore>=3){level="red";label="RISIKO TINGGI";color="red";icon="!";message="Jawaban survei dan simulasi visual menunjukkan tanda yang perlu mendapat perhatian. Hasil ini bukan diagnosis anemia.";}
  else if(surveyScore>=10 || visualScore>=2){level="yellow";label="PERLU PERHATIAN";color="yellow";icon="!";message="Terdapat beberapa tanda yang dapat berkaitan dengan anemia. Perhatikan pola makan dan keluhan, lalu pertimbangkan berkonsultasi dengan tenaga kesehatan.";}
  else {level="green";label="RISIKO RENDAH";color="green";icon="✓";message="Tidak banyak tanda yang teridentifikasi dalam skrining ini. Tetap pertahankan pola makan seimbang dan perhatikan perubahan kondisi tubuh.";}
  renderResult({level,label,color,message,icon,surveyScore,visualScore});
}
function renderResult(r){
  const section=document.getElementById("resultSection");section.classList.remove("hidden");section.scrollIntoView({behavior:"smooth"});
  document.getElementById("resultTitle").textContent=r.label;
  document.getElementById("resultSub").textContent="Ringkasan berdasarkan survei dan simulasi analisis foto.";
  const circle=document.getElementById("resultCircle"), card=document.getElementById("resultCard");
  circle.className=`result-circle ${r.color}`;card.className=`result-card ${r.color}`;
  document.getElementById("resultIcon").textContent=r.icon;
  document.getElementById("resultLabel").textContent=r.label;
  document.getElementById("resultMessage").textContent=r.message;
  document.getElementById("surveyScore").textContent=r.surveyScore;
  document.getElementById("visualScore").textContent=["rendah","sedang","cukup tinggi","tinggi"][r.visualScore];
  document.getElementById("levelText").textContent=r.color==="green"?"Aman":r.color==="yellow"?"Perlu perhatian":"Risiko tinggi";
  buildRecommendations(r.color);
}
function buildRecommendations(level){
  const list=document.getElementById("recommendationList");
  let recs=[];
  const hasFatigue=answers[0]>=2, hasDizzy=answers[1]>=2, poorFocus=answers[2]>=2, pale=answers[8]>=2, poorDiet=answers[9]>=2 || answers[10]>=2;
  if(poorDiet) recs.push(["🥗","Perbaiki pola makan","Usahakan makan teratur dan pilih makanan beragam, termasuk sumber zat besi dan protein."]);
  if(hasFatigue || poorFocus) recs.push(["😴","Jaga istirahat","Atur waktu tidur dan jeda belajar agar tubuh mendapat pemulihan yang cukup."]);
  if(hasDizzy) recs.push(["💧","Perhatikan kondisi saat pusing","Duduk atau beristirahat ketika pusing. Jika sering berulang atau berat, sampaikan keluhan kepada tenaga kesehatan."]);
  if(pale) recs.push(["👁️","Perhatikan perubahan warna","Konjungtiva pucat tidak cukup untuk memastikan anemia. Pemeriksaan klinis dan darah dapat diperlukan."]);
  if(level!=="green") recs.push(["🩺","Pertimbangkan pemeriksaan","Jika keluhan menetap, mengganggu aktivitas, atau hasil skrining berisiko, konsultasikan dengan tenaga kesehatan."]);
  if(!recs.length) recs.push(["🌱","Pertahankan kebiasaan sehat","Lanjutkan pola makan seimbang, aktivitas yang sesuai, tidur cukup, dan pantau perubahan kondisi tubuh."]);
  if(level==="red") recs.push(["📌","Jangan menunda bantuan","Skrining ini bukan diagnosis. Jika kondisi terasa memburuk atau mengganggu aktivitas, cari bantuan medis."]);
  list.innerHTML=recs.map(x=>`<div class="recommendation"><div class="r-icon">${x[0]}</div><div><b>${x[1]}</b><p>${x[2]}</p></div></div>`).join("");
}
// Inject result colors after stylesheet loads.
const extra=document.createElement("style");extra.textContent=`
.result-circle.red{background:#fff0f0;color:#df5757}.result-circle.yellow{background:#fff7dc;color:#c48b0b}.result-circle.green{background:#e7f7ef;color:#26a269}
.result-card.red{background:#fff0f0;color:#9c3434}.result-card.yellow{background:#fff7dc;color:#8c6810}.result-card.green{background:#e7f7ef;color:#176f49}
`;document.head.appendChild(extra);
updateProgress();
