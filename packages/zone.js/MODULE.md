# Modules

Starting from zone.js v0.8.9, you can choose which web API modules you want to patch as to reduce overhead introduced by the patching of these modules. For example,
the below samples show how to disable some modules. You just need to define a few global variables
before loading zone.js.

```html
<script>
  __Zone_disable_Error = true; // Zone will not patch Error
  __Zone_disable_on_property = true; // Zone will not patch `on` properties such as button.onclick
  __Zone_disable_geolocation = true; // Zone will not patch geolocation API
  __Zone_disable_toString = true; // Zone will not patch Function.prototype.toString
  __Zone_disable_blocking = true; // Zone will not patch alert/prompt/confirm
  __Zone_disable_PromiseRejectionEvent = true; // Zone will not patch PromiseRejectionEventHandler
</script>
<script src="../bundles/zone.umd.js"></script>
```

Below is the full list of currently supported modules.

### Common

| Module Name      | Behavior with zone.js patch                                                                                             | How to disable                           |
| ---------------- | ----------------------------------------------------------------------------------------------------------------------- | ---------------------------------------- |
| Error            | stack frames will have the Zone's name information, (By default, Error patch will not be loaded by zone.js)             | \_\_Zone_disable_Error = true            |
| toString         | Function.toString will be patched to return native version of toString                                                  | \_\_Zone_disable_toString = true         |
| ZoneAwarePromise | Promise.then will be patched as Zone aware MicroTask                                                                    | \_\_Zone_disable_ZoneAwarePromise = true |
| bluebird         | Bluebird will use Zone.scheduleMicroTask as async scheduler. (By default, bluebird patch will not be loaded by zone.js) | \_\_Zone_disable_bluebird = true         |

### Browser

| Module Name           | Behavior with zone.js patch                                                                                                           | How to disable                                |
| --------------------- | ------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------- |
| on_property           | target.onProp will become zone aware target.addEventListener(prop)                                                                    | \_\_Zone_disable_on_property = true           |
| timers                | setTimeout/setInterval/setImmediate will be patched as Zone MacroTask                                                                 | \_\_Zone_disable_timers = true                |
| requestAnimationFrame | requestAnimationFrame will be patched as Zone MacroTask                                                                               | \_\_Zone_disable_requestAnimationFrame = true |
| blocking              | alert/prompt/confirm will be patched as Zone.run                                                                                      | \_\_Zone_disable_blocking = true              |
| EventTarget           | target.addEventListener will be patched as Zone aware EventTask                                                                       | \_\_Zone_disable_EventTarget = true           |
| MutationObserver      | MutationObserver will be patched as Zone aware operation                                                                              | \_\_Zone_disable_MutationObserver = true      |
| IntersectionObserver  | Intersection will be patched as Zone aware operation                                                                                  | \_\_Zone_disable_IntersectionObserver = true  |
| FileReader            | FileReader will be patched as Zone aware operation                                                                                    | \_\_Zone_disable_FileReader = true            |
| canvas                | HTMLCanvasElement.toBlob will be patched as Zone aware operation                                                                      | \_\_Zone_disable_canvas = true                |
| IE BrowserTools check | in IE, browser tool will not use zone patched eventListener                                                                           | \_\_Zone_disable_IE_check = true              |
| CrossContext check    | in webdriver, enable check event listener is cross context                                                                            | \_\_Zone_enable_cross_context_check = true    |
| `beforeunload`        | enable the default `beforeunload` handling behavior, where event handlers return strings to prompt the user                           | **zone_symbol**enable_beforeunload = true     |
| XHR                   | XMLHttpRequest will be patched as Zone aware MacroTask                                                                                | \_\_Zone_disable_XHR = true                   |
| geolocation           | navigator.geolocation's prototype will be patched as Zone.run                                                                         | \_\_Zone_disable_geolocation = true           |
| PromiseRejectionEvent | PromiseRejectEvent will fire when ZoneAwarePromise has unhandled error                                                                | \_\_Zone_disable_PromiseRejectionEvent = true |
| mediaQuery            | mediaQuery addListener API will be patched as Zone aware EventTask. (By default, mediaQuery patch will not be loaded by zone.js)      | \_\_Zone_disable_mediaQuery = true            |
| notification          | notification onProperties API will be patched as Zone aware EventTask. (By default, notification patch will not be loaded by zone.js) | \_\_Zone_disable_notification = true          |
| MessagePort           | MessagePort onProperties APIs will be patched as Zone aware EventTask. (By default, MessagePort patch will not be loaded by zone.js)  | \_\_Zone_disable_MessagePort = true           |

### Node.js

| Module Name                     | Behavior with zone.js patch                                   | How to disable                                          |
| ------------------------------- | ------------------------------------------------------------- | ------------------------------------------------------- |
| node_timers                     | NodeJS patch timer                                            | \_\_Zone_disable_node_timers = true                     |
| fs                              | NodeJS patch fs function as macroTask                         | \_\_Zone_disable_fs = true                              |
| EventEmitter                    | NodeJS patch EventEmitter as Zone aware EventTask             | \_\_Zone_disable_EventEmitter = true                    |
| nextTick                        | NodeJS patch process.nextTick as microTask                    | \_\_Zone_disable_nextTick = true                        |
| handleUnhandledPromiseRejection | NodeJS handle unhandledPromiseRejection from ZoneAwarePromise | \_\_Zone_disable_handleUnhandledPromiseRejection = true |
| crypto                          | NodeJS patch crypto function as macroTask                     | \_\_Zone_disable_crypto = true                          |

### Test Framework

| Module Name | Behavior with zone.js patch | How to disable                  |
| ----------- | --------------------------- | ------------------------------- |
| Jasmine     | Jasmine APIs patch          | \_\_Zone_disable_jasmine = true |
| Mocha       | Mocha APIs patch            | \_\_Zone_disable_mocha = true   |

### `on` properties

You can also disable specific `on` properties by setting `__Zone_ignore_on_properties` as follows. For example, if you want to disable `window.onmessage` and `HTMLElement.prototype.onclick` from zone.js patching, you can do so like this:

```html
<script>
  __Zone_ignore_on_properties = [
    {
      target: window,
      ignoreProperties: ['message'],
    },
    {
      target: HTMLElement.prototype,
      ignoreProperties: ['click'],
    },
  ];
</script>
<script src="../bundles/zone.umd.js"></script>
```

Excluding `on` properties from being patched means that callbacks will always be invoked within the root context, regardless of where the `on` callback has been set. Even if `onclick` is set within a child zone, the callback will be called inside the root zone:

```ts
Zone.current.fork({ name: 'child' }).run(() => {
  document.body.onclick = () => {
    console.log(Zone.current); // <root>
  };
});
```

You can find more information on adding unpatched events via `addEventListener`, please refer to [UnpatchedEvents](./STANDARD-APIS.md#unpatchedevents).

### Error

By default, `zone.js/plugins/zone-error` will not be loaded for performance reasons.
This package provides the following functionality:

1. **Error Inheritance:** Handle the `extend Error` issue:

   ```ts
     class MyError extends Error {}
     const myError = new MyError();
     console.log('is MyError instanceof Error', (myError instanceof Error));
   ```

   Without the `zone-error` patch, the example above will output `false`. With the patch, the result will be `true`.

2. **ZoneJsInternalStackFrames:** Remove the zone.js stack from `stackTrace` and add `zone` information. Without this patch, many `zone.js` invocation stacks will be displayed in the stack frames.

   ```
     at zone.run (polyfill.bundle.js: 3424)
     at zoneDelegate.invokeTask (polyfill.bundle.js: 3424)
     at zoneDelegate.runTask (polyfill.bundle.js: 3424)
     at zone.drainMicroTaskQueue (polyfill.bundle.js: 3424)
     at a.b.c (vendor.bundle.js: 12345 <angular>)
     at d.e.f (main.bundle.js: 23456)
   ```

   With this patch, those zone frames will be removed, and the zone information `<angular>/<root>` will be added.

   ```
     at a.b.c (vendor.bundle.js: 12345 <angular>)
     at d.e.f (main.bundle.js: 23456 <root>)
   ```

The second feature may slow down `Error` performance, so `zone.js` provides a flag that allows you to control this behavior.
The flag is `__Zone_Error_ZoneJsInternalStackFrames_policy`. The available options are:

1. **default:** This is the default setting. If you load `zone.js/plugins/zone-error` without setting the flag, `default` will be used. In this case, `ZoneJsInternalStackFrames` will be available when using `new Error()`, allowing you to obtain an `error.stack` that is zone-stack-free. However, this may slightly slow down the performance of new `Error()`.

2. **disable:** This option will disable the `ZoneJsInternalStackFrames` feature. If you load `zone.js/plugins/zone-error`, you will only receive a wrapped `Error`, which can handle the `Error` inheritance issue.

3. **lazy:** This feature allows you to access `ZoneJsInternalStackFrames` without impacting performance. However, as a trade-off, you won't be able to obtain the zone-free stack frames via `error.stack`. You can only access them through `error.zoneAwareStack`.

### Angular

Angular uses zone.js to manage asynchronous operations and determine when to perform change detection. Therefore, in Angular, the following APIs should be patched; otherwise, Angular may not work as expected:

1. ZoneAwarePromise
2. timer
3. on_property
4. EventTarget
5. XHR
