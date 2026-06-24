# Zone.js's support for standard apis

Zone.js patches most standard APIs, such as DOM event listeners and `XMLHttpRequest` in the browser, as well as `EventEmitter` and the `fs` API in Node.js, so they can operate within a zone.

In this document, all patched API are listed.

For non-standard APIs, please see [NON-STANDARD-APIS.md](NON-STANDARD-APIS.md)

## Patch Mechanisms

There are several patch mechanisms:

- Wrap: Makes callbacks run in zones, allowing applications to receive `onInvoke` and `onIntercept` callbacks.
- Task: Similar to the JavaScript VM, applications can receive `onScheduleTask`, `onInvokeTask`, `onCancelTask`, and `onHasTask` callbacks:
  1. MacroTask
  2. MicroTask
  3. EventTask

Some APIs which should be treated as Tasks, but are currently still patched in the wrap way.

## Browser

Web APIs

| API                                                    | Patch Mechanism | Others                                                                     |
| ------------------------------------------------------ | --------------- | -------------------------------------------------------------------------- |
| setTimeout/clearTimeout                                | MacroTask       | app can get handlerId, interval, args, isPeriodic(false) through task.data |
| setImmediate/clearImmediate                            | MacroTask       | same with setTimeout                                                       |
| setInterval/clearInterval                              | MacroTask       | isPeriodic is true, so setInterval will not trigger onHasTask callback     |
| requestAnimationFrame/cancelAnimationFrame             | MacroTask       |                                                                            |
| mozRequestAnimationFrame/mozCancelAnimationFrame       | MacroTask       |                                                                            |
| webkitRequestAnimationFrame/webkitCancelAnimationFrame | MacroTask       |                                                                            |
| alert                                                  | wrap            |                                                                            |
| prompt                                                 | wrap            |                                                                            |
| confirm                                                | wrap            |                                                                            |
| Promise                                                | MicroTask       |                                                                            |
| EventTarget                                            | EventTask       | see below Event Target for more details                                    |
| HTMLElement on properties                              | EventTask       | see below on properties for more details                                   |
| XMLHttpRequest.send/abort                              | MacroTask       |                                                                            |
| XMLHttpRequest on properties                           | EventTask       |                                                                            |
| IDBIndex on properties                                 | EventTask       |                                                                            |
| IDBRequest on properties                               | EventTask       |                                                                            |
| IDBOpenDBRequest on properties                         | EventTask       |                                                                            |
| IDBDatabaseRequest on properties                       | EventTask       |                                                                            |
| IDBTransaction on properties                           | EventTask       |                                                                            |
| IDBCursor on properties                                | EventTask       |                                                                            |
| WebSocket on properties                                | EventTask       |                                                                            |
| MutationObserver                                       | wrap            |                                                                            |
| WebkitMutationObserver                                 | wrap            |                                                                            |
| FileReader                                             | wrap            |                                                                            |
| registerElement                                        | wrap            |                                                                            |

### `EventTarget`

- For browsers supporting `EventTarget`, Zone.js just patches `EventTarget`, so everything that inherits from `EventTarget` will also be patched.
- For browsers that do not support `EventTarget`, Zone.js will patch the following APIs in the IDL
  that inherit from `EventTarget`

|                    |                  |                           |                      |
| ------------------ | ---------------- | ------------------------- | -------------------- |
| ApplicationCache   | EventSource      | FileReader                | InputMethodContext   |
| MediaController    | MessagePort      | Node                      | Performance          |
| SVGElementInstance | SharedWorker     | TextTrack                 | TextTrackCue         |
| TextTrackList      | WebKitNamedFlow  | Window                    | Worker               |
| WorkerGlobalScope  | XMLHttpRequest   | XMLHttpRequestEventTarget | XMLHttpRequestUpload |
| IDBRequest         | IDBOpenDBRequest | IDBDatabase               | IDBTransaction       |
| IDBCursor          | DBIndex          | WebSocket                 |

The following `on` properties, such as `onclick`, `onreadystatechange`, are patched in zone.js as EventTasks:

|                     |                      |                      |                           |
| ------------------- | -------------------- | -------------------- | ------------------------- |
| copy                | cut                  | paste                | abort                     |
| blur                | focus                | canplay              | canplaythrough            |
| change              | click                | contextmenu          | dblclick                  |
| drag                | dragend              | dragenter            | dragleave                 |
| dragover            | dragstart            | drop                 | durationchange            |
| emptied             | ended                | input                | invalid                   |
| keydown             | keypress             | keyup                | load                      |
| loadeddata          | loadedmetadata       | loadstart            | message                   |
| mousedown           | mouseenter           | mouseleave           | mousemove                 |
| mouseout            | mouseover            | mouseup              | pause                     |
| play                | playing              | progress             | ratechange                |
| reset               | scroll               | seeked               | seeking                   |
| select              | show                 | stalled              | submit                    |
| suspend             | timeupdate           | volumechange         | waiting                   |
| mozfullscreenchange | mozfullscreenerror   | mozpointerlockchange | mozpointerlockerror       |
| error               | webglcontextrestored | webglcontextlost     | webglcontextcreationerror |

## NodeJS

| API                         | Patch Mechanism | Others                                                                     |
| --------------------------- | --------------- | -------------------------------------------------------------------------- |
| setTimeout/clearTimeout     | MacroTask       | app can get handlerId, interval, args, isPeriodic(false) through task.data |
| setImmediate/clearImmediate | MacroTask       | same with setTimeout                                                       |
| setInterval/clearInterval   | MacroTask       | isPeriodic is true, so setInterval will not trigger onHasTask callback     |
| process.nextTick            | Microtask       | isPeriodic is true, so setInterval will not trigger onHasTask callback     |
| Promise                     | MicroTask       |                                                                            |
| EventEmitter                | EventTask       | All APIs inherit EventEmitter are patched as EventTask                     |
| crypto                      | MacroTask       |                                                                            |
| fs                          | MacroTask       | all async methods are patched                                              |

`EventEmitter`, `addEventListener`, `prependEventListener`, and `on` will be patched once as EventTasks, while `removeEventListener` and `removeAllListeners` will remove those EventTasks.

## Electron

Zone.js does not patch the Electron API. However, in Electron, both browser APIs and Node APIs are patched. Therefore, if you want to include Zone.js in an Electron application, please use `dist/zone-mix.js`.

## ZoneAwareError

`ZoneAwareError` replaces the global `Error` and adds zone information to the stack trace. It also addresses the 'this' issue. This problem can occur when creating an error without `new`: `this` will be `undefined` in strict mode and `global` in non-strict mode, potentially leading to difficult-to-detect issues.

```js
const error = Error();
```

`ZoneAwareError` makes sure that `this` is `ZoneAwareError` even without `new`.

## ZoneAwarePromise

`ZoneAwarePromise` wraps the global `Promise` and allows it to run in zones as a MicroTask. It also passes _mostly_ all Promise A+ tests.

## UnpatchedEvents

Event unpatching means calling the native implementation immediately, without any additional functionality such as task tracking, zone capturing, etc.

Sometimes we don't want certain `events` to be patched by `zone.js`. We can instruct `zone.js` to leave these `events`.

This can be done through `__Zone_ignore_on_properties` and `__zone_symbol__UNPATCHED_EVENTS`, which should be available on the `window` object. It is usually recommended to declare these lists in the `<head>` element before your code is loaded. Once the zone.js code is executed and all the patches are initialized, the `__Zone_ignore_on_properties` and `__zone_symbol__UNPATCHED_EVENTS` lists will no longer be read:

```html
<head>
  <script>
    // Disable patching `on` properties for the following targets:
    const targets = [
      window,
      Document.prototype,
      HTMLBodyElement.prototype,
      HTMLElement.prototype,
    ];

    // This is declared without `let` or `const`, so it will become a property
    // of the global `window` object:
    __Zone_ignore_on_properties = [];

    // For the following targets, the `onscroll` property will not be patched.
    // Therefore, when using `window.onscroll = () => {}`, the callback will
    // always be invoked inside the root zone, because the implementation is not
    // patched and the task is not tracked for the current target:
    targets.forEach((target) => {
      __Zone_ignore_on_properties.push({
        target: target,
        ignoreProperties: ['scroll'],
      });
    });

    // When calling `addEventListener` with the `scroll` event, `zone.js` will
    // invoke the native browser `addEventListener` implementation immediately:
    __zone_symbol__UNPATCHED_EVENTS = ['scroll'];
  </script>
</head>
```

When we declare events in `__zone_symbol__UNPATCHED_EVENTS`, their callbacks will not be intercepted by zone.js, since zone.js calls the native `addEventListener` of the `EventTarget` (not the patched function):

```js
__zone_symbol__UNPATCHED_EVENTS = ['scroll'];

Zone.current.fork({ name: 'child' }).run(() => {
  window.addEventListener('scroll', () => {
    console.log(Zone.current); // <root>
  });
});
```

Note that for `__Zone_ignore_on_properties`, we need to specify object prototypes (like `Document.prototype`), with `window` being the exception. This is because `on` properties are part of the prototypes.

When the `target` is `Document.prototype` and `ignoreProperties` is a list containing `['scroll']`, then `document.onscroll` will not be patched.

Note that `__Zone_ignore_on_properties` allows for individually unpatching events, but this only applies to `on` properties. In contrast, `__zone_symbol__UNPATCHED_EVENTS` affects all events with the specified name. For example, if you're dealing with a library that uses `FileReader` and sets the `load` event using `reader.onload = () => { ... }`, you can simply use `__Zone_ignore_on_properties = [{ target: FileReader.prototype, ignoreProperties: ['load'] }]`. However, if the library adds a `load` event listener using `addEventListener`, you would need to use `__zone_symbol__UNPATCHED_EVENTS = ['load']`, which would affect other targets as well. For instance, the `load` event of `XMLHttpRequest` would also be unpatched.
