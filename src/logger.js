
import { GetLang, GetLogTranslation } from './translations'

export function createNotification(message, type) {
    let msg = message
    if (GetLang() === 'RU') {
        msg = GetLogTranslation(message)
    }
    const existingNotification = document.querySelector('.notification');
    if (existingNotification) {
        existingNotification.remove();
    }

    // Создаем новый элемент уведомления
    const notificationContainer = document.getElementById('notification-container');
    const notification = document.createElement('div');
    notification.textContent = msg;
    notification.classList.add('notification', type, 'show'); // Добавляем класс 'show' для применения перехода
    notificationContainer.appendChild(notification);

    // Скрываем уведомление через 3 секунды (или другой удобный вам интервал)
    setTimeout(() => {
        notification.remove();
    }, 5000);
}





