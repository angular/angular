# Service worker notifications

Push notifications are a compelling way to engage users. Through the power of service workers, notifications can be delivered to a device even when your application is not in focus.

The Angular service worker enables the display of push notifications and the handling of notification click events.

#### Prerequisites

A basic understanding of the following:

- [Getting Started with Service Workers](guide/service-worker-getting-started).

### Notification Payload

Invoke Push Notifications by pushing a message with the following payload.

```json
 {
   "notification": {
     "actions": NotificationAction[],
     "badge": USVString
     "body": DOMString,
     "data": any,
     "dir": "auto"|"ltr"|"rtl",
     "icon": USVString,
     "image": USVString,
     "lang": DOMString,
     "renotify": boolean,
     "requireInteraction": boolean,
     "silent": boolean,
     "tag": DOMString,
     "timestamp": DOMTimeStamp,
     "title": DOMString,
     "vibrate": number[]
   }
 }
```

Only `title` is required. See `Notification` [instance properties](https://developer.mozilla.org/en-US/docs/Web/API/Notification#Instance_properties).

<div class="alert is-helpful">

  In chrome you can push a notification without a backend.
  Open chrome devtools -> Application -> Service Workers -> Use the `Push` input to send a valid json notification payload

</div>

### Notification Behaviour

The default behaviour for the `notificationclick` event, is to close the notification.

This can easily be changed by adding a `onActionClick` field to the data object, and provide a `default` operation.

```json
{
  "notification": {
    "title": "New Notification!",
    "data": {
      "onActionClick": {
        "default": {"operation": "openWindow", "url": "/foo"}
      }
    }
  }
}
```

### Operations

Angular service worker supports the following operations:

- `openWindow`: will open a new client at the given url relative to the service worker scope

- `focusLastFocusedOrOpen`: will focus the last focussed client. If there is no client open, then will open a new client at the given url relative to the service worker scope

- `navigateLastFocusedOrOpen`: will focus the last focussed client and navigate that client to the given url relative to the service worker scope. If there is no client open, then will open a new client at the given url relative to the service worker scope

### Actions

Actions are a good way to expand how the end user interacts with the notification.

Using the `onActionClick` field, each action can be tied to an `operation`:

```ts
{
  "notification": {
    "title": "New Notification!",
    "actions": [
      {"action": "foo", "title": "Open new tab"},
      {"action": "bar", "title": "Focus last"},
      {"action": "baz", "title": "Navigate last"},
      {"action": "bazza", "title": "default openWindow"}
    ],
    "data": {
      "onActionClick": {
        "default": {"operation": "openWindow", "url": "/foo"},
        "foo": {"operation": "openWindow", "url": "/foo"},
        "bar": {"operation": "focusLastFocusedOrOpen", "url": "/foo"},
        "baz": {"operation": "navigateLastFocusedOrOpen", "url": "/foo"}
      }
    }
  }
}
```

<div class="alert is-important">

  If an action does not have a corresponding `onActionClick` field, then it will use the configured `default` `onActionClick`.

</div>

<div class="alert is-important">

  If a corresponding `onActionClick` field does not have a defined `url` then the service worker's registration scope will be used with no path.
  
</div>

## More on Angular service workers

You may also be interested in the following:

- [Service Worker in Production](guide/service-worker-devops).
