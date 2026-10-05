let lastEventId = null;

async function analyze(patientId = null, prompt = null) {
    const patient = patientId || document.getElementById("patient").value;
    const text = prompt !== null ? prompt : document.getElementById("prompt").value;

    if (!text.trim()) {
        alert("Enter a request first.");
        return;
    }

    const response = await fetch("/api/analyze", {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({
            patient_id: patient,
            prompt: text
        })
    });

    const data = await response.json();

    if (!response.ok) {
        alert(data.error || "Request failed.");
        return;
    }

    showResult(data);
    loadStats();
    loadLogs();
}

function showResult(data) {
    lastEventId = data.event_id;
    document.getElementById("empty").classList.add("hidden");
    document.getElementById("result").classList.remove("hidden");

    document.getElementById("riskScore").textContent = data.risk_score;
    document.getElementById("riskLevel").textContent = data.risk_level;

    const status = document.getElementById("status");
    status.textContent = `${data.action}: ${data.status}`;

    status.className = "status " +
        (data.status === "BLOCKED" ? "blocked" :
         data.status === "HUMAN_REVIEW" ? "review" : "allowed");

    const checks = document.getElementById("checks");

    checks.innerHTML = `
        <div class="check">
            <span>Prompt Injection</span>
            <strong class="${data.injection_detected ? 'bad' : 'ok'}">
                ${data.injection_detected ? '🚨 DETECTED' : '✓ SAFE'}
            </strong>
        </div>
        <div class="check">
            <span>Sensitive Data</span>
            <strong class="${data.sensitive_data.length ? 'warn' : 'ok'}">
                ${data.sensitive_data.length ? '⚠ DETECTED' : '✓ NONE'}
            </strong>
        </div>
        <div class="check">
            <span>Clinical Risk</span>
            <strong class="${data.human_review_required ? 'warn' : 'ok'}">
                ${data.human_review_required ? '⚠ REVIEW' : '✓ LOW'}
            </strong>
        </div>
    `;

    const reasons = document.getElementById("reasons");
    reasons.innerHTML = "";

    if (data.reasons.length === 0) {
        reasons.innerHTML = "<li>No security concerns detected.</li>";
    } else {
        data.reasons.forEach(reason => {
            const li = document.createElement("li");
            li.textContent = reason;
            reasons.appendChild(li);
        });
    }

    const aiBox = document.getElementById("aiBox");
    const reviewBox = document.getElementById("reviewBox");

    if (data.ai_response) {
        aiBox.classList.remove("hidden");
        document.getElementById("aiResponse").textContent = data.ai_response;
    } else {
        aiBox.classList.add("hidden");
    }

    if (data.human_review_required) {
        reviewBox.classList.remove("hidden");
    } else {
        reviewBox.classList.add("hidden");
    }
}

async function demo(scenario) {
    const response = await fetch(`/api/demo/${scenario}`);
    const data = await response.json();

    if (data.error) {
        alert(data.error);
        return;
    }

    document.getElementById("patient").value = data.patient.id;
    document.getElementById("prompt").value = data.masked_prompt || "";

    showResult(data);
    loadStats();
    loadLogs();
}

async function reviewAction(action) {
    const response = await fetch("/api/review", {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({event_id: lastEventId, decision: action})
    });
    const data = await response.json();

    if (!response.ok) {
        alert(data.error || "Review could not be recorded.");
        return;
    }

    alert(data.message);
    document.getElementById("reviewBox").classList.add("hidden");
}

async function loadStats() {
    const response = await fetch("/api/stats");
    const data = await response.json();

    document.getElementById("requests").textContent = data.requests;
    document.getElementById("threats").textContent = data.threats;
    document.getElementById("leaks").textContent = data.data_leaks;
    document.getElementById("reviews").textContent = data.reviews;
}

async function loadLogs() {
    const tbody = document.getElementById("logs");
    if (!tbody) return;

    const response = await fetch("/api/logs");
    const logs = await response.json();

    tbody.innerHTML = "";

    logs.forEach(log => {
        const row = document.createElement("tr");

        let threat = "Normal";
        if (log.injection) threat = "Prompt Injection";
        else if (log.sensitive) threat = "Sensitive Data";
        else if (log.high_risk) threat = "High Clinical Risk";

        row.innerHTML = `
            <td>${escapeHtml(log.time)}</td>
            <td>${escapeHtml(log.patient_id)}</td>
            <td>${log.risk_score}/100</td>
            <td>${escapeHtml(log.status)}</td>
            <td>${escapeHtml(threat)}</td>
            <td>${escapeHtml(log.review_decision || "-")}</td>
        `;

        tbody.appendChild(row);
    });
}

function escapeHtml(value) {
    return String(value)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}

loadStats();
loadLogs();
