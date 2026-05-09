const tg = window.Telegram.WebApp;
tg.ready();
tg.expand();

const user = tg.initDataUnsafe?.user;
let userName = "Гость";
let userId = "неизвестно";

if (user) {
    userName = user.first_name || "Пользователь";
    if (user.last_name) userName += " " + user.last_name;
    userId = user.id;
    document.getElementById('userNamePlaceholder').innerText = userName;
    document.getElementById('userIdPlaceholder').innerText = user.username ? `@${user.username} • ID: ${userId}` : `ID: ${userId}`;
} else {
    document.getElementById('userNamePlaceholder').innerText = "Гость";
    document.getElementById('userIdPlaceholder').innerText = "ID не определен";
}

let count = 0;

document.getElementById('incrementBtn').onclick = () => {
    count++;
    document.getElementById('counter').innerText = count;
    if (tg.HapticFeedback) tg.HapticFeedback.impactOccurred('light');
};

// Головна кнопка Telegram
tg.MainButton.setText("✨ Плюс ✨");
tg.MainButton.show();
tg.MainButton.onClick = () => {
    count++;
    document.getElementById('counter').innerText = count;
    if (tg.HapticFeedback) tg.HapticFeedback.impactOccurred('light');
};
