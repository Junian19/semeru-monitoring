
/* ==================================================
   SEMERU V2.0
   SISTEM ELEKTRONIK MONITORING ERUPSI BERBASIS IoT
   MULTIGAS DAN TEMPERATUR

   Prototype: SIMULATION MODE
================================================== */


/* ==================================================
   1. KONFIGURASI SENSOR
================================================== */

// Ambang berikut hanya untuk demonstrasi algoritma.
// Bukan ambang keselamatan maupun ambang erupsi.

const thresholds = {
    H2S: {
        warning: 5,
        danger: 10
    },

    SO2: {
        warning: 2,
        danger: 5
    },

    CO2: {
        warning: 1000,
        danger: 2000
    },

    TEMP: {
        warning: 35,
        danger: 45
    }
};


// Nilai awal sensor

const sensorData = {
    H2S: 2.4,
    SO2: 0.8,
    CO2: 420,
    TEMP: 28.5
};


// Baseline simulasi terpisah dari lonjakan

const baselineData = { ...sensorData };

let previousSensorData = { ...sensorData };


const sensorConfig = {

    H2S: {
        element: "valueH2S",
        status: "statusH2S",
        chart: "chartH2S",
        color: "#8b5cf6",
        min: 0,
        max: 15
    },

    SO2: {
        element: "valueSO2",
        status: "statusSO2",
        chart: "chartSO2",
        color: "#f59e0b",
        min: 0,
        max: 8
    },

    CO2: {
        element: "valueCO2",
        status: "statusCO2",
        chart: "chartCO2",
        color: "#2582df",
        min: 300,
        max: 2500
    },

    TEMP: {
        element: "valueTEMP",
        status: "statusTEMP",
        chart: "chartTEMP",
        color: "#ef5350",
        min: 15,
        max: 50
    }

};


/* ==================================================
   2. DATA GRAFIK
================================================== */

const history = [];

const chartData = {
    H2S: [],
    SO2: [],
    CO2: [],
    TEMP: []
};

const MAX_POINTS = 20;


function initializeChart() {

    for (let i = 0; i < 10; i++) {

        chartData.H2S.push(2 + Math.random());
        chartData.SO2.push(0.5 + Math.random() * 0.5);
        chartData.CO2.push(400 + Math.random() * 30);
        chartData.TEMP.push(27 + Math.random() * 2);

    }

}


/* ==================================================
   3. WAKTU DAN TANGGAL
================================================== */

function getTime() {

    return new Date().toLocaleTimeString("id-ID", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit"
    });

}


function updateClock() {

    const now = new Date();

    document.getElementById("clock").textContent =
        getTime();

    document.getElementById("currentDate").textContent =
        now.toLocaleDateString("id-ID", {
            day: "numeric",
            month: "long",
            year: "numeric"
        });

}


setInterval(updateClock, 1000);

updateClock();


/* ==================================================
   4. SIMULASI LONJAKAN SENSOR
================================================== */

let simulationTick = 0;

const SPIKE_INTERVAL = 12;

let spikeState = {
    active: false,
    ticks: 0,
    duration: 6,
    targets: {}
};


// Membuat lonjakan simulasi

function triggerSpike() {

    spikeState.active = true;

    spikeState.ticks = 0;

    spikeState.duration = 6;

    spikeState.targets = {

        H2S: 7 + Math.random() * 3,

        SO2: 2.5 + Math.random() * 1.5,

        CO2: 1200 + Math.random() * 500,

        TEMP: 37 + Math.random() * 5

    };

}


// Mengatur peningkatan dan pemulihan nilai

function applySpike(type, normalValue) {

    if (!spikeState.active) {
        return normalValue;
    }

    const target = spikeState.targets[type];

    const tick = spikeState.ticks;

    // Fase peningkatan
    if (tick <= 2) {

        const progress = tick / 2;

        return normalValue +
            (target - normalValue) * progress;

    }

    // Fase pemulihan
    const recovery = Math.min(
        (tick - 2) / 3,
        1
    );

    return target * (1 - recovery) +
        normalValue * recovery;

}


// Perubahan baseline secara alami dalam simulasi

function randomChange(value, range) {

    return value +
        (Math.random() - 0.5) * range;

}


// Generator simulasi utama

function generateSimulation() {

    simulationTick++;

    previousSensorData = { ...sensorData };

    // Lonjakan setiap 12 siklus

    if (
        simulationTick % SPIKE_INTERVAL === 0 &&
        !spikeState.active
    ) {

        triggerSpike();

    }


    // Update baseline

    baselineData.H2S = Math.max(
        0,
        randomChange(baselineData.H2S, 0.7)
    );

    baselineData.SO2 = Math.max(
        0,
        randomChange(baselineData.SO2, 0.25)
    );

    baselineData.CO2 = Math.max(
        350,
        randomChange(baselineData.CO2, 40)
    );

    baselineData.TEMP = Math.max(
        15,
        randomChange(baselineData.TEMP, 0.7)
    );


    // Terapkan lonjakan

    sensorData.H2S =
        applySpike("H2S", baselineData.H2S);

    sensorData.SO2 =
        applySpike("SO2", baselineData.SO2);

    sensorData.CO2 =
        applySpike("CO2", baselineData.CO2);

    sensorData.TEMP =
        applySpike("TEMP", baselineData.TEMP);


    // Update durasi lonjakan

    if (spikeState.active) {

        spikeState.ticks++;

        if (spikeState.ticks >= spikeState.duration) {

            spikeState.active = false;

        }

    }


    updateDashboard();

}


/* ==================================================
   5. STATUS SENSOR
================================================== */

function getSensorStatus(type, value) {

    const limit = thresholds[type];

    if (value >= limit.danger) {
        return "DANGER";
    }

    if (value >= limit.warning) {
        return "WARNING";
    }

    return "NORMAL";

}


function updateSensorCards() {

    Object.keys(sensorData).forEach(type => {

        const value = sensorData[type];

        const config = sensorConfig[type];

        const valueElement =
            document.getElementById(config.element);

        const statusElement =
            document.getElementById(config.status);


        valueElement.textContent =
            type === "CO2"
                ? value.toFixed(0)
                : value.toFixed(2);


        const status =
            getSensorStatus(type, value);


        statusElement.textContent = status;

        statusElement.style.color =
            status === "DANGER" ? "#dc2626" :
            status === "WARNING" ? "#b7791f" :
            "#16854d";

        statusElement.style.background =
            status === "DANGER" ? "#fee2e2" :
            status === "WARNING" ? "#fff2d4" :
            "#e8f8ef";

    });

}


/* ==================================================
   6. STATUS KESELURUHAN SENSOR
================================================== */

function updateOverallStatus() {

    const statuses = Object.keys(sensorData).map(type =>

        getSensorStatus(type, sensorData[type])

    );


    const banner =
        document.getElementById("statusBanner");

    const symbol =
        document.querySelector(".status-symbol");

    const title =
        document.getElementById("overallStatus");

    const description =
        document.getElementById("statusDescription");

    const time =
        document.getElementById("statusTime");


    let overall = "NORMAL";


    if (statuses.includes("DANGER")) {

        overall = "DANGER";

    } else if (statuses.includes("WARNING")) {

        overall = "WARNING";

    }


    if (overall === "DANGER") {

        banner.style.background = "#feecec";
        banner.style.borderColor = "#f5b7b7";

        symbol.style.background = "#ffd1d1";
        symbol.style.color = "#dc2626";
        symbol.textContent = "!";

        title.textContent = "PERINGATAN TINGGI";
        title.style.color = "#dc2626";

        description.textContent =
            "Terdapat parameter yang melewati batas " +
            "simulasi bahaya. Periksa validitas data.";

        time.textContent = "SIMULATION ALERT";


    } else if (overall === "WARNING") {

        banner.style.background = "#fff5df";
        banner.style.borderColor = "#f4d69a";

        symbol.style.background = "#ffe8b5";
        symbol.style.color = "#b7791f";
        symbol.textContent = "!";

        title.textContent = "STATUS WASPADA";
        title.style.color = "#a56b14";

        description.textContent =
            "Terdapat parameter yang melewati batas " +
            "simulasi waspada.";

        time.textContent = "SIMULATION ALERT";


    } else {

        banner.style.background = "#e7f8ee";
        banner.style.borderColor = "#c6ecd5";

        symbol.style.background = "#c9f0d8";
        symbol.style.color = "#13864e";
        symbol.textContent = "✓";

        title.textContent = "KONDISI NORMAL";
        title.style.color = "#167647";

        description.textContent =
            "Seluruh parameter berada di bawah ambang simulasi.";

        time.textContent = "SYSTEM ACTIVE";

    }

    return overall;

}


/* ==================================================
   7. GRAFIK REAL-TIME
================================================== */

function drawChart(type) {

    const config = sensorConfig[type];

    const canvas =
        document.getElementById(config.chart);

    const ctx = canvas.getContext("2d");

    const rect = canvas.getBoundingClientRect();

    const width = rect.width;

    const height = 210;

    const dpr = window.devicePixelRatio || 1;


    canvas.width = Math.round(width * dpr);

    canvas.height = Math.round(height * dpr);

    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    ctx.clearRect(0, 0, width, height);


    const data = chartData[type];

    const left = 42;

    const right = 10;

    const top = 12;

    const bottom = 25;

    const chartWidth = width - left - right;

    const chartHeight = height - top - bottom;


    const min = config.min;

    const max = config.max;


    const styles = getComputedStyle(document.body);

    const gridColor =
        styles.getPropertyValue("--grid").trim();

    const textColor =
        styles.getPropertyValue("--muted").trim();


    // GRID

    ctx.strokeStyle = gridColor;

    ctx.lineWidth = 1;

    for (let i = 0; i <= 4; i++) {

        const y = top + (chartHeight / 4) * i;

        ctx.beginPath();

        ctx.moveTo(left, y);

        ctx.lineTo(width - right, y);

        ctx.stroke();


        const label =
            max - ((max - min) / 4) * i;

        ctx.fillStyle = textColor;

        ctx.font = "10px Inter";

        ctx.textAlign = "right";

        ctx.fillText(
            type === "CO2"
                ? Math.round(label)
                : label.toFixed(1),
            left - 7,
            y + 4
        );

    }


    // POINT DATA

    const points = data.map((value, index) => {

        const x = left +
            (index / (MAX_POINTS - 1)) * chartWidth;

        const normalized = Math.max(
            0,
            Math.min(1, (value - min) / (max - min))
        );

        const y = top +
            chartHeight -
            normalized * chartHeight;

        return { x, y };

    });


    if (points.length > 1) {

        // AREA

        ctx.beginPath();

        ctx.moveTo(
            points[0].x,
            top + chartHeight
        );

        points.forEach(point => {

            ctx.lineTo(point.x, point.y);

        });

        ctx.lineTo(
            points[points.length - 1].x,
            top + chartHeight
        );

        ctx.closePath();

        ctx.globalAlpha = 0.12;

        ctx.fillStyle = config.color;

        ctx.fill();

        ctx.globalAlpha = 1;


        // LINE

        ctx.beginPath();

        points.forEach((point, index) => {

            if (index === 0) {

                ctx.moveTo(point.x, point.y);

            } else {

                ctx.lineTo(point.x, point.y);

            }

        });

        ctx.strokeStyle = config.color;

        ctx.lineWidth = 2.5;

        ctx.lineJoin = "round";

        ctx.lineCap = "round";

        ctx.stroke();


        // CURRENT POINT

        const last = points[points.length - 1];

        ctx.beginPath();

        ctx.arc(last.x, last.y, 4, 0, Math.PI * 2);

        ctx.fillStyle = config.color;

        ctx.fill();

    }


    // TIME LABEL

    ctx.fillStyle = textColor;

    ctx.font = "9px Inter";

    ctx.textAlign = "left";

    ctx.fillText("AWAL", left, height - 5);

    ctx.textAlign = "right";

    ctx.fillText("TERKINI", width - right, height - 5);

}


function updateCharts() {

    Object.keys(chartData).forEach(type => {

        chartData[type].push(sensorData[type]);

        if (chartData[type].length > MAX_POINTS) {

            chartData[type].shift();

        }

        drawChart(type);

    });

}


/* ==================================================
   8. FUZZY MEMBERSHIP FUNCTION
================================================== */

// Fungsi keanggotaan trapezoidal

function trapezoidMF(x, a, b, c, d) {

    if (x <= a || x >= d) {

        if (x === a && a === b) return 1;
        if (x === d && c === d) return 1;

        return 0;
    }

    if (x >= b && x <= c) {

        return 1;

    }

    if (x > a && x < b) {

        return (x - a) / (b - a);

    }

    if (x > c && x < d) {

        return (d - x) / (d - c);

    }

    return 0;

}


// Fungsi keanggotaan segitiga

function triangleMF(x, a, b, c) {

    if (x <= a || x >= c) {

        if (x === b) return 1;

        return 0;

    }

    if (x === b) return 1;

    if (x < b) {

        return (x - a) / (b - a);

    }

    return (c - x) / (c - b);

}


// Fuzzifikasi nilai sensor

function fuzzyMembership(value, warning, danger) {

    const safe = trapezoidMF(
        value,
        -Infinity,
        -Infinity,
        warning * 0.7,
        warning * 1.1
    );

    const alert = triangleMF(
        value,
        warning * 0.7,
        (warning + danger) / 2,
        danger * 1.15
    );

    const dangerDegree = trapezoidMF(
        value,
        warning * 0.9,
        danger,
        Infinity,
        Infinity
    );

    return {
        safe,
        alert,
        danger: dangerDegree
    };

}


/* ==================================================
   9. PREDIKSI TREN SENSOR
================================================== */

// Prediksi satu langkah berdasarkan perubahan terakhir.
// Ini bukan prediksi erupsi.

function predictSensor(type) {

    const current = sensorData[type];

    const previous = previousSensorData[type];

    const change = current - previous;

    let prediction = current + change * 0.7;

    return Math.max(0, prediction);

}


/* ==================================================
   10. FUZZY OUTPUT MEMBERSHIP
================================================== */

// Semesta output: 0 sampai 100

function outputMembership(x) {

    return {

        safe: trapezoidMF(
            x, 0, 0, 20, 40
        ),

        alert: triangleMF(
            x, 25, 50, 75
        ),

        danger: trapezoidMF(
            x, 60, 80, 100, 100
        )

    };

}


/* ==================================================
   11. FUZZY MAMDANI INFERENCE
================================================== */

function runFuzzyPrediction() {

    const degrees = {};


    // FUZZIFIKASI SEMUA SENSOR

    Object.keys(sensorData).forEach(type => {

        const predictedValue = predictSensor(type);

        const limit = thresholds[type];

        degrees[type] = fuzzyMembership(
            predictedValue,
            limit.warning,
            limit.danger
        );

    });


    // RULE BASE

    /*
       R1:
       IF H2S AMAN AND SO2 AMAN
       AND CO2 AMAN AND TEMP AMAN
       THEN OUTPUT AMAN

       R2:
       IF salah satu sensor SIAGA
       THEN OUTPUT SIAGA

       R3:
       IF salah satu sensor BAHAYA
       THEN OUTPUT BAHAYA
    */


    const safeDegree = Math.min(

        ...Object.values(degrees).map(x => x.safe)

    );


    const alertDegree = Math.max(

        ...Object.values(degrees).map(x => x.alert)

    );


    const dangerDegree = Math.max(

        ...Object.values(degrees).map(x => x.danger)

    );


    // INFERENSI DAN AGREGASI MAMDANI

    const aggregated = [];

    for (let x = 0; x <= 100; x++) {

        const output = outputMembership(x);

        // Operator MIN untuk implikasi

        const ruleSafe = Math.min(
            safeDegree,
            output.safe
        );

        const ruleAlert = Math.min(
            alertDegree,
            output.alert
        );

        const ruleDanger = Math.min(
            dangerDegree,
            output.danger
        );

        // Operator MAX untuk agregasi

        const combined = Math.max(
            ruleSafe,
            ruleAlert,
            ruleDanger
        );

        aggregated.push({
            x,
            membership: combined
        });

    }


    // DEFUZZIFIKASI CENTROID

    let numerator = 0;

    let denominator = 0;

    aggregated.forEach(point => {

        numerator += point.x * point.membership;

        denominator += point.membership;

    });


    const riskScore = denominator === 0
        ? 0
        : numerator / denominator;


    // KATEGORI HASIL

    let category;

    if (riskScore < 33) {

        category = "AMAN";

    } else if (riskScore < 67) {

        category = "SIAGA";

    } else {

        category = "BAHAYA";

    }


    return {

        category,

        riskScore,

        safeDegree,

        alertDegree,

        dangerDegree,

        degrees,

        predictedValues: {
            H2S: predictSensor("H2S"),
            SO2: predictSensor("SO2"),
            CO2: predictSensor("CO2"),
            TEMP: predictSensor("TEMP")
        }

    };

}


/* ==================================================
   12. UPDATE FUZZY DASHBOARD
================================================== */

function updateFuzzyDashboard() {

    const result = runFuzzyPrediction();

    const resultElement =
        document.getElementById("fuzzyResult");

    const scoreElement =
        document.getElementById("fuzzyScore");

    const description =
        document.getElementById("fuzzyDescription");

    const riskBar =
        document.getElementById("riskBar");


    const colors = {

        AMAN: "#16a36a",

        SIAGA: "#e9a23b",

        BAHAYA: "#ef4444"

    };


    const color = colors[result.category];


    resultElement.textContent = result.category;

    resultElement.style.color = color;


    scoreElement.textContent =
        result.riskScore.toFixed(1);


    riskBar.style.width =
        result.riskScore + "%";

    riskBar.style.background = color;


    const descriptions = {

        AMAN:
            "Prediksi pembacaan sensor menunjukkan kondisi relatif aman berdasarkan konfigurasi fuzzy.",

        SIAGA:
            "Prediksi menunjukkan peningkatan parameter. Diperlukan pemeriksaan dan validasi data.",

        BAHAYA:
            "Prediksi menunjukkan parameter berada pada rentang bahaya konfigurasi. Verifikasi data dan ikuti prosedur keselamatan."

    };


    description.textContent =
        descriptions[result.category];


    // MEMBERSHIP DEGREE

    const memberships = [

        {
            id: "Safe",
            value: result.safeDegree
        },

        {
            id: "Alert",
            value: result.alertDegree
        },

        {
            id: "Danger",
            value: result.dangerDegree
        }

    ];


    memberships.forEach(item => {

        const percentage = item.value * 100;

        document.getElementById(
            "membership" + item.id
        ).textContent =
            percentage.toFixed(1) + "%";


        document.getElementById(
            "bar" + item.id
        ).style.width =
            percentage + "%";

    });


    return result;

}


/* ==================================================
   13. ALERT NOTIFICATION
================================================== */

function updateAlerts() {

    const alertList =
        document.getElementById("alertList");

    let activeAlerts = [];


    Object.keys(sensorData).forEach(type => {

        const value = sensorData[type];

        const status =
            getSensorStatus(type, value);


        if (status !== "NORMAL") {

            activeAlerts.push({

                type,

                value,

                status

            });

        }

    });


    if (activeAlerts.length === 0) {

        alertList.innerHTML = `
            <div class="empty-alert">
                ✓ Belum terdapat notifikasi peringatan.
            </div>
        `;

    } else {

        alertList.innerHTML = "";


        activeAlerts.forEach(alert => {

            const div = document.createElement("div");

            div.className =
                alert.status === "DANGER"
                    ? "alert-item danger"
                    : "alert-item";


            const unit =
                alert.type === "TEMP" ? "°C" : "ppm";


            div.textContent =
                `[${getTime()}] ${alert.type}: ` +
                `${alert.value.toFixed(2)} ${unit} — ` +
                `${alert.status} (AMBANG SIMULASI)`;


            alertList.appendChild(div);

        });

    }


    document.getElementById("alertCount").textContent =
        `${activeAlerts.length} NOTIFIKASI`;

}


/* ==================================================
   14. HISTORY MONITORING
================================================== */

function updateHistory(fuzzyResult, overall) {

    const record = {

        time: new Date().toLocaleString("id-ID"),

        H2S: sensorData.H2S,

        SO2: sensorData.SO2,

        CO2: sensorData.CO2,

        TEMP: sensorData.TEMP,

        status: overall,

        fuzzy: fuzzyResult.category,

        risk: fuzzyResult.riskScore

    };


    history.unshift(record);


    if (history.length > 100) {

        history.pop();

    }


    renderHistory();

}


function renderHistory() {

    const table =
        document.getElementById("historyTable");

    table.innerHTML = "";


    history.slice(0, 10).forEach(item => {

        const row = document.createElement("tr");


        const values = [

            item.time,

            item.H2S.toFixed(2),

            item.SO2.toFixed(2),

            item.CO2.toFixed(0),

            item.TEMP.toFixed(2),

            item.status,

            item.fuzzy

        ];


        values.forEach((value, index) => {

            const cell = document.createElement("td");

            cell.textContent = value;


            if (index === 5 || index === 6) {

                const badge = document.createElement("span");

                badge.className = "table-status";

                badge.textContent = value;


                if (value === "DANGER" || value === "BAHAYA") {

                    badge.style.background = "#fee2e2";

                    badge.style.color = "#dc2626";

                } else if (
                    value === "WARNING" || value === "SIAGA"
                ) {

                    badge.style.background = "#fff2d4";

                    badge.style.color = "#a56b14";

                }


                cell.textContent = "";

                cell.appendChild(badge);

            }


            row.appendChild(cell);

        });


        table.appendChild(row);

    });

}


/* ==================================================
   15. EXPORT DATA CSV
================================================== */

function exportCSV() {

    if (history.length === 0) {

        alert("Belum ada data untuk diekspor.");

        return;

    }


    const header = [

        "Waktu",

        "H2S_ppm",

        "SO2_ppm",

        "CO2_ppm",

        "Temperature_C",

        "Status_Sensor",

        "Fuzzy_Category",

        "Risk_Score"

    ];


    const rows = history.map(item => [

        item.time,

        item.H2S.toFixed(2),

        item.SO2.toFixed(2),

        item.CO2.toFixed(2),

        item.TEMP.toFixed(2),

        item.status,

        item.fuzzy,

        item.risk.toFixed(2)

    ]);


    const csv = [

        header.join(","),

        ...rows.map(row =>

            row.map(value =>

                `"${String(value).replace(/"/g, '""')}"`

            ).join(",")

        )

    ].join("\n");


    const blob = new Blob(

        ["\uFEFF" + csv],

        { type: "text/csv;charset=utf-8;" }

    );


    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");

    link.href = url;

    link.download = "SEMERU_Monitoring_Data.csv";

    link.click();

    URL.revokeObjectURL(url);

}


/* ==================================================
   16. THEME SWITCHER
================================================== */

function applyTheme(theme) {

    const isDark = theme === "dark";


    document.body.classList.toggle(
        "dark-mode",
        isDark
    );


    document.getElementById("themeIcon").textContent =
        isDark ? "☀️" : "🌙";


    document.getElementById("themeLabel").textContent =
        isDark ? "Light Mode" : "Dark Mode";


    try {

        localStorage.setItem("semeruTheme", theme);

    } catch (error) {

        console.warn("Tema tidak dapat disimpan.", error);

    }


    // Refresh grafik

    Object.keys(chartData).forEach(type => {

        drawChart(type);

    });

}


function toggleTheme() {

    const isDark =
        document.body.classList.contains("dark-mode");


    applyTheme(isDark ? "light" : "dark");

}


// Load tema terakhir

let savedTheme = "light";

try {

    savedTheme =
        localStorage.getItem("semeruTheme") || "light";

} catch (error) {

    console.warn("Menggunakan tema default.");

}

applyTheme(savedTheme);


/* ==================================================
   17. UPDATE DASHBOARD
================================================== */

function updateDashboard() {

    // Update nilai sensor

    updateSensorCards();


    // Update grafik

    updateCharts();


    // Status sensor

    const overall = updateOverallStatus();


    // Fuzzy prediction

    const fuzzyResult = updateFuzzyDashboard();


    // Notifikasi

    updateAlerts();


    // Riwayat

    updateHistory(fuzzyResult, overall);


    // Status perangkat

    document.getElementById("lastUpdate").textContent =
        "Update: " + getTime();


    document.getElementById("connectionStatus").textContent =
        "SIMULATION MODE";

}


/* ==================================================
   18. RESPONSIVE CHART
================================================== */

window.addEventListener("resize", () => {

    Object.keys(chartData).forEach(type => {

        drawChart(type);

    });

});


/* ==================================================
   19. START SYSTEM
================================================== */

// Inisialisasi grafik

initializeChart();


// Inisialisasi dashboard

updateDashboard();


// Update data setiap 3 detik

setInterval(generateSimulation, 1000);


/* ==================================================
   END OF SEMERU V2.0
================================================== */
