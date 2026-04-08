import { initializeApp } from "https://www.gstatic.com/firebasejs/12.11.0/firebase-app.js";
import { getDatabase, ref, set } from "https://www.gstatic.com/firebasejs/12.11.0/firebase-database.js";

const firebaseConfig = {
    apiKey: "AIzaSyCjJr9RfRARGbEOucL5-8EU6b-o-dtZxyg",
    authDomain: "ecotrack-a8cc2.firebaseapp.com",
    projectId: "ecotrack-a8cc2",
    storageBucket: "ecotrack-a8cc2.firebasestorage.app",
    messagingSenderId: "972183035152",
    appId: "1:972183035152:web:f41f1e1c7d673176f51995"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);
const sessionId = "session_" + Date.now();

let totalBytes = 0;
let carbonData = [];
let timestamps = [];

// --- Chart setup ---
const ctx = document.getElementById('carbonChart').getContext('2d');
const carbonChart = new Chart(ctx, {
    type: 'line',
    data: {
        labels: timestamps,
        datasets: [{
            label: 'mg CO2',
            data: carbonData,
            borderColor: '#00ff88',
            backgroundColor: 'rgba(0, 255, 136, 0.1)',
            tension: 0.4
        }]
    },
    options: { responsive: true, maintainAspectRatio: false }
});

// --- AI Chat Logic ---
const chatMessages = document.getElementById('chat-messages');
const chatInput = document.getElementById('chat-input');
const sendBtn = document.getElementById('send-btn');

function addMessage(text, isUser = false) {
    const msg = document.createElement('div');
    msg.className = isUser ? 'user-message' : 'ai-message';
    msg.textContent = text;
    chatMessages.appendChild(msg);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

async function getAIResponse(userMessage) {
    const carbonMg = document.getElementById('carbon-val').textContent;
    const cpuState = document.getElementById('cpu-val').textContent;

    try {
        const res = await fetch('/api/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ message: userMessage, carbonMg, cpuState })
        });
        const data = await res.json();
        addMessage(data.response);
    } catch (e) {
        addMessage("Server issue hai, please try again later.");
    }
}

sendBtn.addEventListener('click', () => {
    const msg = chatInput.value.trim();
    if(msg) {
        addMessage(msg, true);
        getAIResponse(msg);
        chatInput.value = '';
    }
});

// --- Data Tracking & Firebase Sync ---
async function updateAudit(bytes) {
    const res = await fetch('/api/audit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bytes })
    });
    const data = await res.json();
    
    document.getElementById('data-val').innerText = (bytes / (1024*1024)).toFixed(2) + " MB";
    document.getElementById('carbon-val').innerText = data.carbonMg.toFixed(2) + " mg CO2";

    // Chart Update
    timestamps.push(new Date().toLocaleTimeString());
    carbonData.push(data.carbonMg);
    if(timestamps.length > 15) { timestamps.shift(); carbonData.shift(); }
    carbonChart.update();

    // Firebase Sync
    set(ref(db, 'live_audit/' + sessionId), { 
        carbon_mg: data.carbonMg, 
        mb_transferred: (bytes / (1024*1024)).toFixed(2),
        timestamp: Date.now() 
    });
}

// --- Live Observers ---
const netObserver = new PerformanceObserver((list) => {
    list.getEntries().forEach(e => totalBytes += e.transferSize || 0);
    updateAudit(totalBytes);
});
netObserver.observe({ type: "resource", buffered: true });

if ('PressureObserver' in window) {
    const cpuObserver = new PressureObserver((r) => {
        document.getElementById('cpu-val').innerText = r[0].state.toUpperCase();
    });
    cpuObserver.observe("cpu");
} else {
    document.getElementById('cpu-val').innerText = "STABLE";
}
