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

function addMessage(text, isUser = true) {
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
// --- EcoTrack Chart & Audit Update ---

async function updateAudit(bytes) {
    try {
        const res = await fetch('/api/audit', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ bytes })
        });

        // 1. Always check if the response was successful
        if (!res.ok) throw new Error("Server response was not ok");

        const data = await res.json();

        // 2. Fix the .toFixed crash: ensure carbonMg is a number or default to 0
        const carbonValue = (data && typeof data.carbonMg === 'number') ? data.carbonMg : 0;
        
        // Update UI Cards
        document.getElementById('data-val').innerText = (bytes / (1024 * 1024)).toFixed(2) + " MB";
        document.getElementById('carbon-val').innerText = carbonValue.toFixed(2) + " mg CO2";

        // 3. Chart Logic: Push new data to the arrays
        const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
        
        timestamps.push(now);
        carbonData.push(carbonValue);

        // Keep only the last 15 points to keep the chart clean
        if (timestamps.length > 15) {
            timestamps.shift();
            carbonData.shift();
        }

        // 4. Update the visual Chart.js instance
        // 'none' prevents the bars/lines from jumping around during frequent updates
        carbonChart.update('none');

    } catch (error) {
        console.error("Dashboard update error:", error);
        // Default values to keep the UI from looking broken
        document.getElementById('carbon-val').innerText = "0.00 mg CO2";
    }
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
