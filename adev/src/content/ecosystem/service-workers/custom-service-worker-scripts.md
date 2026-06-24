# Пользовательские скрипты Service Worker

Хотя Service Worker в Angular предоставляет отличные возможности, вам может потребоваться добавить пользовательскую
функциональность, такую как обработка Push-уведомлений, фоновая синхронизация или другие события Service Worker. Вы
можете создать пользовательский скрипт Service Worker, который импортирует и расширяет Service Worker из Angular.

## Создание пользовательского Service Worker

Чтобы создать пользовательский Service Worker, расширяющий функциональность Angular:

1. Создайте файл пользовательского Service Worker (например, `custom-sw.js`) в директории `src`:

```js
// Импорт Service Worker из Angular
importScripts('./ngsw-worker.js');

(function () {
  'use strict';

  // Добавление пользовательского обработчика клика по уведомлению
  self.addEventListener('notificationclick', (event) => {
    console.log('Custom notification click handler');
    console.log('Notification details:', event.notification);

    // Обработка клика по уведомлению - открытие URL, если он предоставлен
    if (clients.openWindow && event.notification.data.url) {
      event.waitUntil(clients.openWindow(event.notification.data.url));
      console.log('Opening URL:', event.notification.data.url);
    }
  });

  // Добавление пользовательского обработчика фоновой синхронизации
  self.addEventListener('sync', (event) => {
    console.log('Custom background sync handler');

    if (event.tag === 'background-sync') {
      event.waitUntil(doBackgroundSync());
    }
  });

  function doBackgroundSync() {
    // Реализуйте логику фоновой синхронизации здесь
    return fetch('https://example.com/api/sync')
      .then((response) => response.json())
      .then((data) => console.log('Background sync completed:', data))
      .catch((error) => console.error('Background sync failed:', error));
  }
})();
```

2. Обновите файл `angular.json`, чтобы использовать пользовательский Service Worker:

```json
{
  "projects": {
    "your-app": {
      "architect": {
        "build": {
          "options": {
            "assets": [
              {
                "glob": "**/*",
                "input": "public"
              },
              "app/src/custom-sw.js"
            ]
          }
        }
      }
    }
  }
}
```

3. Настройте регистрацию Service Worker для использования вашего пользовательского скрипта:

```ts
import { ApplicationConfig, isDevMode } from '@angular/core';
import { provideServiceWorker } from '@angular/service-worker';

export const appConfig: ApplicationConfig = {
  providers: [
    provideServiceWorker('custom-sw.js', {
      enabled: !isDevMode(),
      registrationStrategy: 'registerWhenStable:30000',
    }),
  ],
};
```

### Лучшие практики для пользовательских Service Worker

При расширении Service Worker из Angular:

- **Всегда импортируйте Service Worker из Angular первым**, используя `importScripts('./ngsw-worker.js')`, чтобы
  гарантировать получение всей функциональности кэширования и обновлений.
- **Оберните свой код в IIFE** (Immediately Invoked Function Expression — немедленно вызываемое функциональное
  выражение), чтобы избежать загрязнения глобальной области видимости.
- **Используйте `event.waitUntil()`** для асинхронных операций, чтобы гарантировать их завершение до того, как работа
  Service Worker будет прекращена.
- **Тщательно тестируйте** как в среде разработки, так и в продакшене.
- **Корректно обрабатывайте ошибки**, чтобы ваш код не нарушал работу функциональности Service Worker из Angular.

### Распространенные сценарии использования

Пользовательские Service Worker обычно используются для:

- **Push-уведомления**: Обработка входящих push-сообщений и отображение уведомлений.
- **Фоновая синхронизация**: Синхронизация данных при восстановлении сетевого соединения.
- **Пользовательская навигация**: Обработка специальных сценариев маршрутизации или страниц в офлайн-режиме.
