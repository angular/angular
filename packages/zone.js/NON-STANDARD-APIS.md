# Zone.js's support for non standard apis

Zone.js patches most standard APIs, such as DOM event listeners and `XMLHttpRequest` in the browser, as well as `EventEmitter` and the `fs` API in Node.js, so they can operate within a zone.

But there are still many non-standard APIs that are not patched by default, such as MediaQuery, Notification, and WebAudio. This page provides updates on the current state of zone support for Angular APIs.

## Currently Supported Non-Standard Web APIs

- MediaQuery
- Notification

## Currently Supported Polyfills

- WebComponents

Usage:

```html
<script src="webcomponents-lite.js"></script>
<script src="node_modules/zone.js/bundles/zone.umd.js"></script>
<script src="node_modules/zone.js/bundles/webapis-shadydom.umd.js"></script>
```

## Currently Supported Non-Standard Node.js APIs

- (empty)

## Currently Supported Non-Standard Common APIs

- [Bluebird](http://bluebirdjs.com/docs/getting-started.html) Promise

Browser Usage:

```html
<script src="zone.js"></script>
<script src="bluebird.js"></script>
<script src="zone-bluebird.js"></script>
<script>
  Zone[Zone['__symbol__']('bluebird')](Promise);
</script>
```

After completing those steps, `window.Promise` will be replaced by Bluebird `Promise` and will also be zone-aware.

Angular Usage:

In `polyfills.ts`, import the `zone-bluebird` package:

```ts
import 'zone.js'; // Included with Angular CLI.
import 'zone.js/plugins/zone-bluebird';
```

In `main.ts`, patch `bluebird`:

```ts
/// <reference types="zone.js" />

bootstrapApplication(AppComponent, appConfig)
  .then(() => {
    import('bluebird').then((Bluebird) => {
      const bluebirdSymbol = Zone.__symbol__('bluebird');
      const patchBluebirdFn = (Zone as any)[bluebirdSymbol];
      patchBluebirdFn(Bluebird.default);
    });
  })
  .catch((err) => console.error(err));
```

After this step, `window.Promise` will be replaced by Bluebird's `Promise`, and the callback for `Bluebird.then` will be executed within the Angular zone.

Node Sample Usage:

```ts
require('zone.js');
const Bluebird = require('bluebird');
require('zone.js/plugins/zone-bluebird');

const bluebirdSymbol = Zone.__symbol__('bluebird');
const patchBluebirdFn = (Zone as any)[bluebirdSymbol];
patchBluebirdFn(Bluebird);

Zone.current
  .fork({
    name: 'bluebird',
  })
  .run(() => {
    Bluebird.resolve(1).then((result) => {
      console.log('result ', result, 'Zone', Zone.current.name);
    });
  });
```

In a Node.js environment, you can choose to use Bluebird `Promise` as `global.Promise` or `ZoneAwarePromise` as `global.Promise`.

To run the jasmine test cases of bluebird:

```shell
npm install bluebird
```

Then modify `test/node_tests.ts` and remove the comment of the following line:

```ts
//import './extra/bluebird.spec';
```

## Others

- Cordova

patch `cordova.exec` API

`cordova.exec(success, error, service, action, args);`

`success` and `error` will be patched with `Zone.wrap`.

to load the patch, you should load in the following order.

```html
<script src="zone.js"></script>
<script src="cordova.js"></script>
<script src="zone-patch-cordova.js"></script>
```

## Usage

By default, support for those APIs is not included in zone.js or `zone-node.js`. If you want to enable support for these APIs, you will need to load the files yourself.

For example, if you want to add a MediaQuery patch, you should do it like this:

```html
<script src="path/zone.js"></script>
<script src="path/webapis-media-query.js"></script>
```

- RxJS

zone.js also provides an `rxjs` patch to ensure that RxJS Observables, Subscriptions, and Operators run in the correct zone. For details, please refer to [pull request 843](https://github.com/angular/zone.js/pull/843). The following sample code illustrates this concept:

```ts
const constructorZone = Zone.current.fork({name: 'constructor'});
const subscriptionZone = Zone.current.fork({name: 'subscription'});
const operatorZone = Zone.current.fork({name: 'operator'});

let observable;
let subscriber;

constructorZone.run(() => {
  observable = new Observable((_subscriber) => {
    subscriber = _subscriber;
    console.log('current zone when construct observable:', Zone.current.name); // will output constructor.
    return () => {
      console.log('current zone when unsubscribe observable:', Zone.current.name); // will output constructor.
    };
  });
});

subscriptionZone.run(() => {
  observable.subscribe({
    next: () => {
      console.log('current zone when subscription next', Zone.current.name); // will output subscription.
    },
    error: () => {
      console.log('current zone when subscription error', Zone.current.name); // will output subscription.
    },
    complete: () => {
      console.log('current zone when subscription complete', Zone.current.name); // will output subscription.
    },
  });
});

operatorZone.run(() => {
  observable.map(() => {
    console.log('current zone when map operator', Zone.current.name); // will output operator.
  });
});
```

Currently basically everything the `rxjs` API includes

- Observable
- Subscription
- Subscriber
- Operators
- Scheduler

is patched, so each asynchronous call will run in the correct zone.

## Usage.

For example, in an Angular application, you can load this patch in your `app.module.ts`.

```ts
import 'zone.js/plugins/zone-patch-rxjs';
```

- electron

In electron, we patched the following APIs with `zone.js`

1. Browser API
2. NodeJS
3. Electron Native API

## Usage.

add following line into `polyfill.ts` after loading zone-mix.

```ts
//import 'zone.js'; // originally added by angular-cli, comment it out
import 'zone.js/mix'; // add zone-mix to patch both Browser and Nodejs
import 'zone.js/plugins/zone-patch-electron'; // add zone-patch-electron to patch Electron native API
```

there is a sample repo [zone-electron](https://github.com/JiaLiPassion/zone-electron).

- socket.io-client

user need to patch `io` themselves just like following code.

```html
<script src="socket.io-client/dist/socket.io.js"></script>
<script src="zone.js/bundles/zone.umd.js"></script>
<script src="zone.js/bundles/zone-patch-socket-io.js"></script>
<script>
  // patch io here
  const patchSocketIOFn = Zone[Zone.__symbol__('socketio')];
  patchSocketIOFn(io);
</script>
```

Please refer to the sample repository [zone-socketio](https://github.com/JiaLiPassion/zone-socketio) for detailed usage.

- jsonp

## Usage.

A helper method is provided to patch JSONP. Since JSONP has many implementations, the user needs to supply the information necessary for JSON to `send` and `callback` in the zone.

There is a sample repository, [zone-jsonp](https://github.com/JiaLiPassion/test-zone-js-with-jsonp), available here. The sample usage is as follows:

```javascript
import 'zone.js/plugins/zone-patch-jsonp';

Zone['__zone_symbol__jsonp']({
  jsonp: getJSONP,
  sendFuncName: 'send',
  successFuncName: 'jsonpSuccessCallback',
  failedFuncName: 'jsonpFailedCallback'
});
```

- ResizeObserver

Currently, only Chrome 64 natively supports this feature. You can add the following line to `polyfill.ts` after loading zone.js:

```ts
import 'zone.js';
import 'zone.js/plugins/zone-patch-resize-observer';
```

There is a sample repository, [zone-resize-observer](https://github.com/JiaLiPassion/zone-resize-observer), available here.
