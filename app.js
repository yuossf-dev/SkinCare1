import { initializeApp } from "https://www.gstatic.com/firebasejs/12.7.0/firebase-app.js";
import { getFirestore, collection, addDoc } from "https://www.gstatic.com/firebasejs/12.7.0/firebase-firestore.js";

/* Firebase */
const firebaseConfig = {
  apiKey: "AIzaSyC67RriaM5nAI5VoDBCgvuW-bNnkbs6igE",
  authDomain: "skincare-78919.firebaseapp.com",
  projectId: "skincare-78919",
};
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const answers = {};

// simple toast for friendly messages when running the standalone app.js version
function showToast(msg, duration=2200){
    const t = document.createElement('div');
    t.textContent = msg;
    t.style.position = 'fixed';
    t.style.left = '50%';
    t.style.bottom = '28px';
    t.style.transform = 'translateX(-50%)';
    t.style.background = 'linear-gradient(135deg,#ff8fd6,#b25cff)';
    t.style.color = 'white';
    t.style.padding = '10px 16px';
    t.style.borderRadius = '18px';
    t.style.boxShadow = '0 10px 25px rgba(178,92,255,0.2)';
    t.style.zIndex = 9999;
    document.body.appendChild(t);
    setTimeout(()=>{ t.style.opacity = '0'; setTimeout(()=>t.remove(),300); }, duration);
}

/* Option click */
document.querySelectorAll(".option").forEach(o=>{
    o.onclick = () => o.querySelector("input").checked = true;
});

/* Show step */
window.show = n => {
    document.querySelectorAll(".step").forEach(s=>s.classList.remove("active"));
    document.getElementById("step"+n).classList.add("active");
};

/* Bubble Transition */
function bubbleTransition(cb){
    const layer = document.getElementById("bubble-layer");
    layer.innerHTML = "";
    for(let i=0;i<14;i++){
        const b = document.createElement("div");
        b.className = "bubble";
        b.style.width = b.style.height = Math.random()*200+150+"px";
        b.style.left = Math.random()*100+"%";
        b.style.top = Math.random()*100+"%";
        layer.appendChild(b);
    }
    setTimeout(()=>{layer.innerHTML=""; cb();}, 600);
}

/* Override show */
const originalShow = window.show;
window.show = n => bubbleTransition(()=>originalShow(n));

/* Next / Back */
window.next = step => {
    if(step===1){
        const s = document.querySelector('input[name="skin"]:checked');
        if(!s) return showToast("شكلك نسيت تجاوب — اختار نوع البشرة");
        answers.skin = s.value;
        answers.other = document.getElementById("otherSkin").value;
    }
    if(step===2){
        answers.problems = document.getElementById("problems").value;
        if(!answers.problems) return showToast("شكلك نسيت تجاوب — اكتب مشكلة");
    }
    if(step===3){
        answers.target = document.getElementById("targetSkin").value;
        if(!answers.target) return showToast("شكلك نسيت تجاوب — اكتب الهدف");
    }
    if(step===4){
        answers.products = document.getElementById("products").value;
    }
    show(step+1);
};

window.back = step => show(step-1);

/* No Problems */
window.noProblems = () => {
    if(confirm("متأكد؟ 😉")){
        document.getElementById("problems").value = "لا يوجد مشاكل بشرة";
    }
};

/* Submit to Firebase */
window.submitData = async () => {
    const phone = document.getElementById("phone").value;
    if(!phone) return showToast("شكلك نسيت تجاوب — اكتب رقمك");

    answers.phone = phone;
    answers.date = new Date();

    try {
        await addDoc(collection(db,"skinQuiz"), answers);
        showToast("تم الإرسال 💜 — شكرًا!");
        console.log("Saved answers:", answers);
    } catch(e) {
        showToast("حدث خطأ أثناء الإرسال: " + (e.message || e));
        console.error(e);
    }
};

/* Floating bottles */
for(let i=0;i<6;i++){
    const f = document.createElement("div");
    f.className = "floating";
    f.innerText = "🧴";
    f.style.left = Math.random()*100+"%";
    f.style.animationDuration = 20 + Math.random()*10 + "s";
    document.body.appendChild(f);
}

/* Smooth Soap Cursor */
const cursor = document.getElementById("soap-cursor");
let mouseX = 0, mouseY = 0, posX = 0, posY = 0;
let lastBubble = 0; // rate-limit bubble creation to reduce CPU

document.addEventListener("mousemove", e => { mouseX = e.clientX; mouseY = e.clientY; });

function animateCursor(){
    posX += (mouseX - posX)*0.15;
    posY += (mouseY - posY)*0.15;
    cursor.style.left = posX + "px";
    cursor.style.top = posY + "px";

    // create a small soap bubble occasionally instead of every frame
    if(Date.now() - lastBubble > 80){
        const b = document.createElement("div");
        b.className = "soap-bubble";
        b.style.left = posX + "px";
        b.style.top = posY + "px";
        document.body.appendChild(b);
        setTimeout(()=>b.remove(),1200);
        lastBubble = Date.now();
    }

    requestAnimationFrame(animateCursor);
}
animateCursor();
