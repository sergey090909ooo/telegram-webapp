const tg = window.Telegram.WebApp;
tg.ready();
tg.expand();

// ==================== ЕКРАНИ ====================
const mainScreen = document.getElementById('mainScreen');
const formScreen = document.getElementById('formScreen');
const progressScreen = document.getElementById('progressScreen');

// ==================== ГОЛОВНИЙ ====================
const objectsList = document.getElementById('objectsList');

// ==================== ФОРМА ====================
const formTitle = document.getElementById('formTitle');
const saveBtnText = document.getElementById('saveBtnText');
const customerName = document.getElementById('customerName');
const customerPhone = document.getElementById('customerPhone');
const objectAddress = document.getElementById('objectAddress');
const objectDeadline = document.getElementById('objectDeadline');
const customerComment = document.getElementById('customerComment');
const gypsumArea = document.getElementById('gypsumArea');
const cementArea = document.getElementById('cementArea');
const slopes = document.getElementById('slopes');
const totalAmount = document.getElementById('totalAmount');
const plastererInfo = document.getElementById('plastererInfo');
const plastererName = document.getElementById('plastererName');
const plastererAssigned = document.getElementById('plastererAssigned');
const plastererAssignedName = document.getElementById('plastererAssignedName');
const takeWorkBtn = document.getElementById('takeWorkBtn');
const progressBtn = document.getElementById('progressBtn');

// ==================== КАЛЬКУЛЯТОР ====================
const progressObjectAddress = document.getElementById('progressObjectAddress');
const pricePerUnit = document.getElementById('pricePerUnit');
const todayGypsum = document.getElementById('todayGypsum');
const todayCement = document.getElementById('todayCement');
const todaySlopes = document.getElementById('todaySlopes');
const extraWorkName = document.getElementById('extraWorkName');
const extraWorkPrice = document.getElementById('extraWorkPrice');
const todayVolume = document.getElementById('todayVolume');
const todaySum = document.getElementById('todaySum');
const progressPercent = document.getElementById('progressPercent');
const progressBarFill = document.getElementById('progressBarFill');
const progressDetail = document.getElementById('progressDetail');
const deadlineStatus = document.getElementById('deadlineStatus');

// ==================== ДАНІ ====================
let editingObjectId = null;
let currentProgressObjectId = null;

function loadObjects() {
    try { return JSON.parse(localStorage.getItem('objects') || '[]'); }
    catch (e) { return []; }
}

function saveObjects(objects) {
    localStorage.setItem('objects', JSON.stringify(objects));
}

function updateTotal() {
    const g = parseFloat(gypsumArea.value) || 0;
    const c = parseFloat(cementArea.value) || 0;
    const s = parseFloat(slopes.value) || 0;
    totalAmount.textContent = g + c + s;
}

gypsumArea.addEventListener('input', updateTotal);
cementArea.addEventListener('input', updateTotal);
slopes.addEventListener('input', updateTotal);

// ==================== КАЛЬКУЛЯТОР: ОНОВЛЕННЯ ====================
function updateCalculator() {
    const price = parseFloat(pricePerUnit.value) || 0;
    const g = parseFloat(todayGypsum.value) || 0;
    const c = parseFloat(todayCement.value) || 0;
    const s = parseFloat(todaySlopes.value) || 0;
    const extra = parseFloat(extraWorkPrice.value) || 0;
    const vol = g + c + s;
    const sum = (vol * price) + extra;
    todayVolume.textContent = vol;
    todaySum.textContent = sum.toFixed(2);
}

pricePerUnit.addEventListener('input', updateCalculator);
todayGypsum.addEventListener('input', updateCalculator);
todayCement.addEventListener('input', updateCalculator);
todaySlopes.addEventListener('input', updateCalculator);
extraWorkPrice.addEventListener('input', updateCalculator);

function updateProgressBar(obj) {
    const plan = (obj.gypsum || 0) + (obj.cement || 0) + (obj.slopes || 0);
    const done = (obj.doneGypsum || 0) + (obj.doneCement || 0) + (obj.doneSlopes || 0);
    const pct = plan > 0 ? Math.min(100, Math.round((done / plan) * 100)) : 0;
    progressPercent.textContent = pct + '%';
    progressBarFill.style.width = pct + '%';
    progressDetail.textContent = `Виконано ${done} із ${plan} од.`;

    // Колір залежно від строку
    if (obj.deadline && plan > 0) {
        const now = new Date();
        const deadline = new Date(obj.deadline);
        const daysLeft = Math.ceil((deadline - now) / (1000 * 60 * 60 * 24));
        const neededPct = plan > 0 ? ((daysLeft > 0 ? (100 - pct) / daysLeft : 100)) : 0;

        if (pct >= 100) {
            progressBarFill.style.background = '#34c759';
            deadlineStatus.innerHTML = '✅ Об\'єкт завершено!';
            deadlineStatus.style.color = '#34c759';
        } else if (daysLeft <= 0) {
            progressBarFill.style.background = '#ff3b30';
            deadlineStatus.innerHTML = '🔴 Строк минув!';
            deadlineStatus.style.color = '#ff3b30';
        } else if (neededPct > 10) {
            progressBarFill.style.background = '#ff3b30';
            deadlineStatus.innerHTML = `🔴 Відстає! Залишилось ${daysLeft} дн., треба ~${Math.round(neededPct)}%/день`;
            deadlineStatus.style.color = '#ff3b30';
        } else if (neededPct > 5) {
            progressBarFill.style.background = '#ff9500';
            deadlineStatus.innerHTML = `🟡 У графіку. ${daysLeft} дн.`;
            deadlineStatus.style.color = '#ff9500';
        } else {
            progressBarFill.style.background = '#34c759';
            deadlineStatus.innerHTML = `🟢 Випереджає графік! ${daysLeft} дн.`;
            deadlineStatus.style.color = '#34c759';
        }
    } else {
        progressBarFill.style.background = '#007aff';
        deadlineStatus.innerHTML = '';
    }
}

// ==================== РЕНДЕР ГОЛОВНОГО ====================
function renderObjects() {
    const objects = loadObjects();
    objectsList.innerHTML = '';
    if (objects.length === 0) {
        objectsList.innerHTML = '<div class="empty-state">Немає збережених об\'єктів</div>';
        return;
    }
    objects.forEach(obj => {
        const card = document.createElement('div');
        card.className = 'object-card';
        const plan = (obj.gypsum || 0) + (obj.cement || 0) + (obj.slopes || 0);
        const done = (obj.doneGypsum || 0) + (obj.doneCement || 0) + (obj.doneSlopes || 0);
        const pct = plan > 0 ? Math.min(100, Math.round((done / plan) * 100)) : 0;
        let statusHtml = '';
        if (pct >= 100) statusHtml = '<span class="object-status status-done">🟢 Завершено</span>';
        else if (obj.plastererName) statusHtml = '<span class="object-status status-in-progress">🟡 В роботі</span>';
        else statusHtml = '<span class="object-status status-new">🔵 Новий</span>';

        card.innerHTML = `
            <div class="object-card-header">
                <span class="object-name">${esc(obj.customerName || 'Без назви')}</span>
                <span class="object-total">${obj.total || plan} од.</span>
            </div>
            <div class="object-address">📍 ${esc(obj.address)}</div>
            <div class="object-customer">👤 ${esc(obj.customerName || '—')} | 📞 ${esc(obj.customerPhone || '—')}</div>
            ${obj.plastererName ? `<div style="font-size:12px;color:#8e8e93;margin-top:2px;">🛠️ ${esc(obj.plastererName)}</div>` : ''}
            <div style="margin-top: 6px;">
                <div class="progress-bar-bg" style="height: 6px;">
                    <div class="progress-bar-fill" style="width: ${pct}%; background: ${pct >= 100 ? '#34c759' : obj.plastererName ? '#ff9500' : '#007aff'}; height: 100%; border-radius: 3px;"></div>
                </div>
                <span style="font-size: 11px; color: #8e8e93;">${done}/${plan} од. (${pct}%)</span>
            </div>
            ${statusHtml}
        `;
        card.onclick = () => openObject(obj);
        objectsList.appendChild(card);
    });
}

function esc(t) {
    const d = document.createElement('div');
    d.textContent = t || '';
    return d.innerHTML;
}

// ==================== ВІДКРИТТЯ ОБ'ЄКТА ====================
function openObject(obj) {
    editingObjectId = obj.id;
    formTitle.textContent = 'Паспорт об\'єкта';
    saveBtnText.textContent = 'Оновити';
    customerName.value = obj.customerName || '';
    customerPhone.value = obj.customerPhone || '';
    objectAddress.value = obj.address || '';
    objectDeadline.value = obj.deadline || '';
    customerComment.value = obj.comment || '';
    gypsumArea.value = obj.gypsum || 0;
    cementArea.value = obj.cement || 0;
    slopes.value = obj.slopes || 0;
    updateTotal();

    if (obj.plastererName) {
        plastererInfo.style.display = 'none';
        plastererAssigned.style.display = 'block';
        plastererAssignedName.textContent = obj.plastererName;
        takeWorkBtn.style.display = 'none';
        progressBtn.style.display = 'block';
    } else {
        plastererInfo.style.display = 'none';
        plastererAssigned.style.display = 'none';
        takeWorkBtn.style.display = 'block';
        progressBtn.style.display = 'none';
    }

    mainScreen.style.display = 'none';
    formScreen.style.display = 'block';
    progressScreen.style.display = 'none';
}

// ==================== ДОДАТИ НОВИЙ ====================
document.getElementById('addObjectBtn').onclick = () => {
    editingObjectId = null;
    formTitle.textContent = 'Паспорт об\'єкта';
    saveBtnText.textContent = 'Зберегти';
    customerName.value = '';
    customerPhone.value = '';
    objectAddress.value = '';
    objectDeadline.value = '';
    customerComment.value = '';
    gypsumArea.value = '';
    cementArea.value = '';
    slopes.value = '';
    totalAmount.textContent = '0';
    plastererInfo.style.display = 'none';
    plastererAssigned.style.display = 'none';
    takeWorkBtn.style.display = 'none';
    progressBtn.style.display = 'none';
    mainScreen.style.display = 'none';
    formScreen.style.display = 'block';
    progressScreen.style.display = 'none';
};

// ==================== ВЗЯТИ В РОБОТУ ====================
takeWorkBtn.onclick = () => {
    plastererInfo.style.display = 'block';
    plastererAssigned.style.display = 'none';
    takeWorkBtn.style.display = 'none';
};

// ==================== ЗБЕРЕГТИ ====================
document.getElementById('saveBtn').onclick = () => {
    const address = objectAddress.value.trim();
    if (!address) {
        if (tg.showAlert) tg.showAlert('📍 Адреса обов\'язкова');
        else alert('📍 Адреса обов\'язкова');
        return;
    }
    const objects = loadObjects();
    const now = new Date().toISOString();
    const data = {
        customerName: customerName.value.trim(),
        customerPhone: customerPhone.value.trim(),
        address: address,
        deadline: objectDeadline.value,
        comment: customerComment.value.trim(),
        gypsum: parseFloat(gypsumArea.value) || 0,
        cement: parseFloat(cementArea.value) || 0,
        slopes: parseFloat(slopes.value) || 0,
        total: (parseFloat(gypsumArea.value) || 0) + (parseFloat(cementArea.value) || 0) + (parseFloat(slopes.value) || 0),
        doneGypsum: 0,
        doneCement: 0,
        doneSlopes: 0,
        plastererName: plastererName.value.trim() || '',
        pricePerUnit: 0,
    };

    if (editingObjectId) {
        const idx = objects.findIndex(o => o.id === editingObjectId);
        if (idx !== -1) {
            data.id = editingObjectId;
            data.createdAt = objects[idx].createdAt;
            data.updatedAt = now;
            data.doneGypsum = objects[idx].doneGypsum || 0;
            data.doneCement = objects[idx].doneCement || 0;
            data.doneSlopes = objects[idx].doneSlopes || 0;
            data.pricePerUnit = objects[idx].pricePerUnit || 0;
            if (data.plastererName && !objects[idx].plastererName) {
                data.plastererName = data.plastererName;
            } else {
                data.plastererName = objects[idx].plastererName || data.plastererName;
            }
            objects[idx] = data;
        }
    } else {
        data.id = Date.now();
        data.createdAt = now;
        data.updatedAt = now;
        objects.unshift(data);
    }
    saveObjects(objects);
    renderObjects();
    formScreen.style.display = 'none';
    mainScreen.style.display = 'block';
};

// ==================== КАЛЬКУЛЯТОР: ВІДКРИТИ ====================
progressBtn.onclick = () => {
    const objects = loadObjects();
    const obj = objects.find(o => o.id === editingObjectId);
    if (!obj) return;
    currentProgressObjectId = obj.id;
    progressObjectAddress.textContent = obj.address;
    pricePerUnit.value = obj.pricePerUnit || '';
    todayGypsum.value = '';
    todayCement.value = '';
    todaySlopes.value = '';
    extraWorkName.value = '';
    extraWorkPrice.value = '';
    todayVolume.textContent = '0';
    todaySum.textContent = '0.00';
    updateProgressBar(obj);
    formScreen.style.display = 'none';
    progressScreen.style.display = 'block';
};

// ==================== КАЛЬКУЛЯТОР: ЗБЕРЕГТИ ПРОГРЕС ====================
document.getElementById('saveProgressBtn').onclick = () => {
    const objects = loadObjects();
    const obj = objects.find(o => o.id === currentProgressObjectId);
    if (!obj) return;
    const price = parseFloat(pricePerUnit.value) || 0;
    const g = parseFloat(todayGypsum.value) || 0;
    const c = parseFloat(todayCement.value) || 0;
    const s = parseFloat(todaySlopes.value) || 0;
    const extra = parseFloat(extraWorkPrice.value) || 0;
    obj.doneGypsum = (obj.doneGypsum || 0) + g;
    obj.doneCement = (obj.doneCement || 0) + c;
    obj.doneSlopes = (obj.doneSlopes || 0) + s;
    obj.pricePerUnit = price;
    obj.updatedAt = new Date().toISOString();
    saveObjects(objects);
    updateProgressBar(obj);
    const plan = (obj.gypsum || 0) + (obj.cement || 0) + (obj.slopes || 0);
    const done = (obj.doneGypsum || 0) + (obj.doneCement || 0) + (obj.doneSlopes || 0);
    const pct = plan > 0 ? Math.min(100, Math.round((done / plan) * 100)) : 0;
    if (pct >= 100) {
        if (tg.showAlert) tg.showAlert('🎉 Об\'єкт завершено на 100%!');
        else alert('🎉 Об\'єкт завершено на 100%!');
    }
    renderObjects();
    if (tg.HapticFeedback) tg.HapticFeedback.notificationOccurred('success');
};

// ==================== НАЗАД ====================
document.getElementById('backBtn').onclick = () => {
    formScreen.style.display = 'none';
    mainScreen.style.display = 'block';
    renderObjects();
};

document.getElementById('backFromProgressBtn').onclick = () => {
    progressScreen.style.display = 'none';
    formScreen.style.display = 'block';
    const objects = loadObjects();
    const obj = objects.find(o => o.id === currentProgressObjectId);
    if (obj) {
        plastererAssigned.style.display = obj.plastererName ? 'block' : 'none';
        plastererAssignedName.textContent = obj.plastererName || '';
        progressBtn.style.display = obj.plastererName ? 'block' : 'none';
    }
};

// ==================== СТАРТ ====================
renderObjects();
tg.MainButton.hide();