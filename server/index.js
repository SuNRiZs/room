const express = require('express');
const webpush = require('web-push');
const dotenv = require('dotenv');
const fs = require('fs').promises;
const path = require('path');

dotenv.config();
const app = express();
app.use(express.json());

const SUBSCRIPTIONS_DIR = '/app/subscriptions';
const SUBSCRIPTIONS_FILE = path.join(SUBSCRIPTIONS_DIR, 'subscriptions.json');

// Настраиваемая задержка для второго пуша (по умолчанию 5 секунд)
const PUSH_DELAY = parseInt(process.env.PUSH_DELAY, 10) || 5000;

const ensureDirectoryExists = async (dir) => {
  try {
    await fs.mkdir(dir, { recursive: true });
  } catch (error) {
    if (error.code !== 'EEXIST') throw error;
  }
};

const loadSubscriptions = async () => {
  try {
    const data = await fs.readFile(SUBSCRIPTIONS_FILE, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.log('Файл подписок не найден, создаём новый');
    const initialData = [];
    await ensureDirectoryExists(SUBSCRIPTIONS_DIR);
    await fs.writeFile(SUBSCRIPTIONS_FILE, JSON.stringify(initialData, null, 2));
    return initialData;
  }
};

const saveSubscriptions = async (subscriptions) => {
  await ensureDirectoryExists(SUBSCRIPTIONS_DIR);
  await fs.writeFile(SUBSCRIPTIONS_FILE, JSON.stringify(subscriptions, null, 2));
};

let subscriptions = [];

loadSubscriptions()
  .then(data => {
    subscriptions = data;
    console.log('Подписки загружены:', subscriptions);
  })
  .catch(err => {
    console.error('Ошибка при загрузке подписок:', err);
  });

webpush.setVapidDetails(
  process.env.VAPID_EMAIL,
  process.env.VAPID_PUBLIC_KEY,
  process.env.VAPID_PRIVATE_KEY
);

app.post('/api/save-subscription', async (req, res) => {
  const { subscription, deviceId } = req.body;
  console.log('Подписка сохранена:', { subscription, deviceId });
  subscriptions.push({ subscription, deviceId });
  await saveSubscriptions(subscriptions);
  res.status(201).json({ success: true });
});

app.post('/api/send-notification', async (req, res) => {
  const { deviceId } = req.body;
  console.log('Отправка уведомления для deviceId:', deviceId);
  console.log('Текущие подписки:', subscriptions);

  if (subscriptions.length === 0) {
    console.log('Ошибка: Нет активных подписок');
    return res.status(400).json({ error: 'Нет активных подписок' });
  }

  const targetSubscriptions = deviceId
    ? subscriptions.filter(sub => sub.deviceId === deviceId)
    : subscriptions;

  if (targetSubscriptions.length === 0) {
    console.log('Ошибка: Нет подписок для этого deviceId:', deviceId);
    return res.status(400).json({ error: 'Нет подписок для этого deviceId' });
  }

  const payload = JSON.stringify({
    title: 'Планшет включён!',
    body: 'Экран активирован.'
  });

  // Функция для отправки пушей
  const sendPush = (subscriptionsToSend) => {
    const sendPromises = subscriptionsToSend.map(({ subscription }) =>
      webpush.sendNotification(subscription, payload)
        .then(() => {
          console.log('Push успешно отправлен для:', subscription.endpoint);
          return { success: true, endpoint: subscription.endpoint };
        })
        .catch(error => {
          console.error('Ошибка отправки для подписки:', subscription.endpoint, error);
          // Очищаем невалидную подписку
          subscriptions = subscriptions.filter(sub => sub.subscription.endpoint !== subscription.endpoint);
          saveSubscriptions(subscriptions).catch(err => console.error('Ошибка сохранения после очистки:', err));
          return { success: false, endpoint: subscription.endpoint, error: error.message };
        })
    );
    return Promise.all(sendPromises);
  };

  // Отправляем первый пуш сразу
  sendPush(targetSubscriptions)
    .then(results => {
      const successful = results.filter(r => r.success);
      const failed = results.filter(r => !r.success);
      console.log('Результат отправки первого пуша:');
      console.log('Успешно отправлено:', successful);
      if (failed.length > 0) {
        console.log('Не удалось отправить:', failed);
      }

      // Планируем отправку второго пуша через PUSH_DELAY (по умолчанию 5 секунд)
      console.log(`Планируем отправку второго пуша через ${PUSH_DELAY / 1000} секунд...`);
      setTimeout(() => {
        console.log('Текущие подписки перед вторым пушем:', targetSubscriptions);
        console.log('Отправляем второй пуш для deviceId:', deviceId);
        sendPush(targetSubscriptions)
          .then(secondResults => {
            const secondSuccessful = secondResults.filter(r => r.success);
            const secondFailed = secondResults.filter(r => !r.success);
            console.log('Результат отправки второго пуша:');
            console.log('Успешно отправлено:', secondSuccessful);
            if (secondFailed.length > 0) {
              console.log('Не удалось отправить:', secondFailed);
              // Добавляем повторную попытку через 2 секунды, если есть неудачные отправки
              console.log('Повторная попытка отправки второго пуша через 2 секунды...');
              setTimeout(() => {
                sendPush(targetSubscriptions.filter(sub =>
                  secondFailed.some(failed => failed.endpoint === sub.subscription.endpoint)
                ))
                  .then(retryResults => {
                    const retrySuccessful = retryResults.filter(r => r.success);
                    const retryFailed = retryResults.filter(r => !r.success);
                    console.log('Результат повторной попытки второго пуша:');
                    console.log('Успешно отправлено:', retrySuccessful);
                    if (retryFailed.length > 0) {
                      console.log('Не удалось отправить при повторной попытке:', retryFailed);
                    }
                  })
                  .catch(retryError => {
                    console.error('Критическая ошибка при повторной попытке второго пуша:', retryError);
                  });
              }, 2000);
            }
          })
          .catch(secondError => {
            console.error('Критическая ошибка отправки второго пуша:', secondError);
          });
      }, PUSH_DELAY);

      // Отвечаем клиенту сразу после первого пуша
      if (successful.length === 0) {
        return res.status(500).json({ error: 'Все уведомления не удалось отправить', failed });
      }
      res.status(200).json({ success: true, successful });
    })
    .catch(error => {
      console.error('Критическая ошибка отправки первого пуша:', error);
      res.status(500).json({ error: error.message });
    });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Сервер запущен на порту ${PORT}`));