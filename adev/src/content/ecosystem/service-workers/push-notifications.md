# Push-уведомления {#push-notifications}

Push-уведомления — это эффективный способ вовлечения пользователей.
Благодаря возможностям Service Workerов, уведомления могут быть доставлены на устройство, даже когда ваше приложение не
находится в фокусе.

Service Worker в Angular позволяет отображать push-уведомления и обрабатывать события клика по ним.

HELPFUL: При использовании Service Workerа в Angular взаимодействие с push-уведомлениями обрабатывается с помощью сервиса
`SwPush`.
Чтобы узнать больше о задействованных браузерных API,
см. [Push API](https://developer.mozilla.org/docs/Web/API/Push_API)
и [Использование Notifications API](https://developer.mozilla.org/docs/Web/API/Notifications_API/Using_the_Notifications_API).

## Полезная нагрузка уведомления {#notification-payload}

Вызывайте push-уведомления, отправляя сообщение с корректной полезной нагрузкой (payload).
См. `SwPush` для получения инструкций.

HELPFUL: В Chrome вы можете тестировать push-уведомления без бэкенда.
Откройте Devtools -> Application -> Service Workers и используйте поле ввода `Push` для отправки полезной нагрузки
уведомления в формате JSON.

## Обработка кликов по уведомлениям {#notification-click-handling}

Поведение по умолчанию для события `notificationclick` — закрыть уведомление и оповестить `SwPush.notificationClicks`.

Вы можете указать дополнительную операцию, которая будет выполнена при `notificationclick`, добавив свойство
`onActionClick` в объект `data` и предоставив запись `default`.
Это особенно полезно, когда в момент клика по уведомлению нет открытых клиентов.

```json
{
  "notification": {
    "title": "New Notification!",
    "data": {
      "onActionClick": {
        "default": {"operation": "openWindow", "url": "foo"}
      }
    }
  }
}
```

### Операции {#operations}

Service Worker в Angular поддерживает следующие операции:

| Операции                    | Подробности                                                                                                                                         |
| :-------------------------- | :-------------------------------------------------------------------------------------------------------------------------------------------------- |
| `openWindow`                | Открывает новую вкладку по указанному URL.                                                                                                          |
| `focusLastFocusedOrOpen`    | Фокусирует последний активный клиент. Если открытых клиентов нет, открывает новую вкладку по указанному URL.                                        |
| `navigateLastFocusedOrOpen` | Фокусирует последний активный клиент и перенаправляет его по указанному URL. Если открытых клиентов нет, открывает новую вкладку по указанному URL. |
| `sendRequest`               | Отправляет простой GET-запрос по указанному URL.                                                                                                    |

IMPORTANT: URL-адреса разрешаются относительно области регистрации (scope) Service Workerа.<br />Если элемент
`onActionClick` не определяет `url`, используется область регистрации Service Workerа.

### Действия (Actions) {#actions}

Действия предлагают способ настройки того, как пользователь может взаимодействовать с уведомлением.

Используя свойство `actions`, вы можете определить набор доступных действий.
Каждое действие представлено в виде кнопки, на которую пользователь может нажать для взаимодействия с уведомлением.

Кроме того, используя свойство `onActionClick` в объекте `data`, вы можете связать каждое действие с операцией, которая
будет выполнена при нажатии соответствующей кнопки действия:

```json
{
  "notification": {
    "title": "New Notification!",
    "actions": [
      {"action": "foo", "title": "Open new tab"},
      {"action": "bar", "title": "Focus last"},
      {"action": "baz", "title": "Navigate last"},
      {"action": "qux", "title": "Send request in the background"},
      {"action": "other", "title": "Just notify existing clients"}
    ],
    "data": {
      "onActionClick": {
        "default": {"operation": "openWindow"},
        "foo": {"operation": "openWindow", "url": "/absolute/path"},
        "bar": {"operation": "focusLastFocusedOrOpen", "url": "relative/path"},
        "baz": {"operation": "navigateLastFocusedOrOpen", "url": "https://other.domain.com/"},
        "qux": {"operation": "sendRequest", "url": "https://yet.another.domain.com/"}
      }
    }
  }
}
```

IMPORTANT: Если у действия нет соответствующей записи `onActionClick`, уведомление закрывается, и существующие клиенты
получают оповещение через `SwPush.notificationClicks`.

## Подробнее о Service Workerах в Angular {#more-on-angular-service-workers}

Вас также может заинтересовать следующее:

<docs-pill-row>
  <docs-pill href="ecosystem/service-workers/communications" title="Взаимодействие с Service Worker"/>
  <docs-pill href="ecosystem/service-workers/devops" title="DevOps для Service Worker"/>
</docs-pill-row>
