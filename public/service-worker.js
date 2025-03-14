self.addEventListener('install', (event) => {
    console.log('Service Worker установлен');
    self.skipWaiting();
  });
  
  self.addEventListener('activate', (event) => {
    console.log('Service Worker активирован');
    event.waitUntil(self.clients.claim());
  });
  
  self.addEventListener('push', (event) => {
    console.log('Push-уведомление получено:', event.data ? event.data.text() : 'Нет данных');
    let data;
    try {
      data = event.data.json();
    } catch (error) {
      console.error('Ошибка разбора данных push:', error);
      data = { title: 'Уведомление', body: 'Данные не распознаны' };
    }
  
    const options = {
      body: data.body || 'Экран активирован.',
      icon: '/icon-192.png',
      badge: '/icon-192.png',
      requireInteraction: true, // Уведомление не исчезает до взаимодействия
      actions: [
        {
          action: 'activate',
          title: 'Активировать экран'
        }
      ]
    };
  
    event.waitUntil(
      self.registration.showNotification(data.title || 'Планшет включён!', options)
        .then(() => {
          console.log('Уведомление показано');
          // Отправляем сообщение для перезагрузки
          return self.clients.matchAll({ includeUncontrolled: true, type: 'window' })
            .then(clients => {
              if (clients.length > 0) {
                clients.forEach(client => {
                  client.postMessage({ type: 'reload' });
                });
              } else {
                console.log('Нет активных клиентов для перезагрузки');
              }
            });
        })
        .catch(err => console.error('Ошибка показа уведомления:', err))
    );
  });
  
  self.addEventListener('notificationclick', (event) => {
    if (event.action === 'activate') {
      console.log('Активация экрана по действию уведомления');
      event.notification.close();
      self.clients.matchAll({ includeUncontrolled: true, type: 'window' })
        .then(clients => {
          if (clients.length > 0) {
            clients.forEach(client => {
              client.focus();
              client.postMessage({ type: 'activate' });
            });
          }
        });
    }
  });