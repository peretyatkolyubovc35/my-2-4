// Реєстрація Service Worker
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('./sw.js')
            .then(reg => console.log('SW зареєстровано!'))
            .catch(err => console.error('Помилка SW:', err));
    });
}

// Функція оновлення сайту (Завдання 5)
async function updateSW() {
    const reg = await navigator.serviceWorker.getRegistration();
    if (!reg) return alert('Service Worker не знайдено');
    reg.update();
    reg.addEventListener('updatefound', () => {
        const newSW = reg.installing;
        newSW.addEventListener('statechange', () => {
            if (newSW.state === 'installed' && navigator.serviceWorker.controller) {
                if (confirm('Доступна нова версія кав’ярні! Оновити?')) {
                    newSW.postMessage({ action: 'skipWaiting' });
                }
            }
        });
    });
}

// Слідкуємо за зміною контролера для перезавантаження
navigator.serviceWorker.addEventListener('controllerchange', () => window.location.reload());

// Виявлення онлайн/офлайн
window.addEventListener('online', () => {
    document.getElementById('offline').style.display = 'none';
});
window.addEventListener('offline', () => {
    document.getElementById('offline').style.display = 'block';
});

// Замовлення через Background Sync (Завдання 7)
async function placeOrder() {
    const reg = await navigator.serviceWorker.ready;
    if ('sync' in reg) {
        try {
            await reg.sync.register('send-order');
            alert('Ви офлайн. Замовлення додано в чергу і буде відправлено автоматично!');
        } catch (e) {
            console.error('Sync failed', e);
        }
    } else {
        alert('Ваш браузер не підтримує фонову синхронізацію.');
    }
}

// Слухаємо відповіді від Service Worker
navigator.serviceWorker.addEventListener('message', event => {
    alert('Сповіщення від системи: ' + event.data);
});