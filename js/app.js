const tg = window.Telegram.WebApp;
tg.ready();
tg.expand();

const mainScreen = document.getElementById('mainScreen');
const formScreen = document.getElementById('formScreen');
const formTitle = document.getElementById('formTitle');
const saveBtnText = document.getElementById('saveBtnText');
const objectsList = document.getElementById('objectsList');

const customerName = document.getElementById('customerName');
const customerPhone = document.getElementById('customerPhone');
const objectAddress = document.getElementById('objectAddress');
const customerComment = document.getElementById('customerComment');
const gypsumArea = document.getElementById('gypsumArea');
const cementArea = document.getElementById('cementArea');
const slopes = document.getElementById('slopes');
const totalAmount = document.getElementById('totalAmount');

let editingObjectId = null;

// Завантажити з localStorage
function loadObjects() {
    try {
        return JSON.parse(localStorage.getItem('objects') || '[]');
    } catch (e) {
        return [];
    }
}

function saveObjects(objects) {
    localStorage.setItem('objects', JSON.stringify(objects));
}

function updateTotal() {
    const gypsum = parseFloat(gypsumArea.value) || 0;
    const cement = parseFloat(cementArea.value) || 0;
    const slope = parseFloat(slopes.value) || 0;
    totalAmount.textContent = gypsum + cement + slope;
}

gypsumArea.addEventListener('input', updateTotal);
cementArea.addEventListener('input', updateTotal);
slopes.addEventListener('input', updateTotal);

function formatDate(isoString) {
    if (!isoString) return '';
    const d = new Date(isoString);
    return d.toLocaleString('uk-UA', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}

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

        let editedHtml = '';
        if (obj.isEdited) {
            editedHtml = `<div class="object-edited">🕘 Редаговано: ${formatDate(obj.updatedAt)}</div>`;
        } else {
            editedHtml = `<div class="object-created">📅 Створено: ${formatDate(obj.createdAt)}</div>`;
        }

        card.innerHTML = `
            <div class="object-card-header">
                <span class="object-name">${escapeHtml(obj.customerName || 'Без назви')}</span>
                <span class="object-total">${obj.total} од.</span>
            </div>
            <div class="object-address">📍 ${escapeHtml(obj.address)}</div>
            <div class="object-customer">👤 ${escapeHtml(obj.customerName || '—')} | 📞 ${escapeHtml(obj.customerPhone || '—')}</div>
            <div style="font-size:12px;color:#8e8e93;margin-top:4px;">
                🧱 ${obj.gypsum} м² | 🏗️ ${obj.cement} м² | 📐 ${obj.slopes} пог.м
            </div>
            ${editedHtml}
        `;

        card.onclick = () => editObject(obj);
        objectsList.appendChild(card);
    });
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text || '';
    return div.innerHTML;
}

function editObject(obj) {
    editingObjectId = obj.id;
    formTitle.textContent = 'Редагування об\'єкта';
    saveBtnText.textContent = 'Оновити';
    customerName.value = obj.customerName || '';
    customerPhone.value = obj.customerPhone || '';
    objectAddress.value = obj.address || '';
    customerComment.value = obj.comment || '';
    gypsumArea.value = obj.gypsum;
    cementArea.value = obj.cement;
    slopes.value = obj.slopes;
    updateTotal();
    mainScreen.style.display = 'none';
    formScreen.style.display = 'block';
    if (tg.HapticFeedback) tg.HapticFeedback.impactOccurred('light');
}

document.getElementById('addObjectBtn').onclick = () => {
    editingObjectId = null;
    formTitle.textContent = 'Паспорт об\'єкта';
    saveBtnText.textContent = 'Зберегти';
    customerName.value = '';
    customerPhone.value = '';
    objectAddress.value = '';
    customerComment.value = '';
    gypsumArea.value = '';
    cementArea.value = '';
    slopes.value = '';
    totalAmount.textContent = '0';
    mainScreen.style.display = 'none';
    formScreen.style.display = 'block';
    if (tg.HapticFeedback) tg.HapticFeedback.impactOccurred('light');
};

document.getElementById('backBtn').onclick = () => {
    formScreen.style.display = 'none';
    mainScreen.style.display = 'block';
};

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
        comment: customerComment.value.trim(),
        gypsum: parseFloat(gypsumArea.value) || 0,
        cement: parseFloat(cementArea.value) || 0,
        slopes: parseFloat(slopes.value) || 0,
        total: (parseFloat(gypsumArea.value) || 0) + (parseFloat(cementArea.value) || 0) + (parseFloat(slopes.value) || 0),
    };

    if (editingObjectId) {
        const index = objects.findIndex(o => o.id === editingObjectId);
        if (index !== -1) {
            data.id = editingObjectId;
            data.createdAt = objects[index].createdAt;
            data.updatedAt = now;
            data.isEdited = true;
            objects[index] = data;
        }
    } else {
        data.id = Date.now();
        data.createdAt = now;
        data.updatedAt = now;
        data.isEdited = false;
        objects.unshift(data);
    }

    saveObjects(objects);
    renderObjects();
    formScreen.style.display = 'none';
    mainScreen.style.display = 'block';
    if (tg.HapticFeedback) tg.HapticFeedback.notificationOccurred('success');
};

renderObjects();
tg.MainButton.hide();
