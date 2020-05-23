# Zone.js

[![CDNJS](https://img.shields.io/cdnjs/v/zone.js.svg)](https://cdnjs.com/libraries/zone.js)

Implements _Zones_ for JavaScript, inspired by [Dart](https://dart.dev/articles/archive/zones).

> If you're using zone.js via unpkg (i.e. using `https://unpkg.com/zone.js`)
> and you're using any of the following libraries, make sure you import them first

> * 'newrelic' as it patches global.Promise before zone.js does
> * 'async-listener' as it patches global.setTimeout, global.setInterval before zone.js does
> * 'continuation-local-storage' as it uses async-listener

# NEW Zone.js POST-v0.6.0

See the new API [here](./lib/zone.ts).

Read up on [Zone Primer](https://docs.google.com/document/d/1F5Ug0jcrm031vhSMJEOgp1l-Is-Vf0UCNDY-LsQtAIY).

## What's a Zone?

A Zone is an execution context that persists across async tasks.
You can think of it as [thread-local storage](http://en.wikipedia.org/wiki/Thread-local_storage) for JavaScript VMs.

See this video from ng-conf 2014 for a detailed explanation:

[![screenshot of the zone.js presentation and ng-conf 2014](./presentation.png)](//www.youtube.com/watch?v=3IqtmUscE_U&t=150)

## See also
* [async-listener](https://github.com/othiym23/async-listener) - a similar library for node
* [Async stack traces in Chrome](http://www.html5rocks.com/en/tutorials/developertools/async-call-stack/)
* [strongloop/zone](https://github.com/strongloop/zone) (Deprecated)
* [vizone](https://github.com/gilbox/vizone) - control flow visualizer that uses zone.js

## Standard API support

zone.js patched most standard web APIs (such as DOM events, `XMLHttpRequest`, ...) and nodejs APIs
(`EventEmitter`, `fs`, ...), for more details, please see [STANDARD-APIS.md](STANDARD-APIS.md).

## Nonstandard API support

We are adding support to some nonstandard APIs, such as MediaQuery and
Notification. Please see [NON-STANDARD-APIS.md](NON-STANDARD-APIS.md) for more details.

## Examples

You can find some samples to describe how to use zone.js in [SAMPLE.md](SAMPLE.md).

## Modules

zone.js patches the async APIs described above, but those patches will have some overhead.
Starting from zone.js v0.8.9, you can choose which web API module you want to patch.
For more details, please
see [MODULE.md](MODULE.md).

## Bundles
There are several bundles under `dist` folder.

|Bundle|Summary|
|---|---|
|zone.js|the default bundle, contains the most used APIs such as `setTimeout/Promise/EventTarget...`, also this bundle supports all evergreen and legacy (IE/Legacy Firefox/Legacy Safari) Browsers|
|zone-evergreen.js|the bundle for evergreen browsers, doesn't include the `patch` for `legacy` browsers such as `IE` or old versions of `Firefox/Safari`|
|zone-legacy.js|the patch bundle for legacy browsers, only includes the `patch` for `legacy` browsers such as `IE` or old versions of `Firefox/Safari`. This bundle must be loaded after `zone-evergreen.js`, **`zone.js`=`zone-evergreen.js` + `zone-legacy.js`**|
|zone-testing.js|the bundle for zone testing support, including `jasmine/mocha` support and `async/fakeAsync/sync` test utilities|
|zone-externs.js|the API definitions for `closure compiler`|

And here are the additional optional patches not included in the main zone.js bundles

|Patch|Summary|
|---|---|
|webapis-media-query.js|patch for `MediaQuery APIs`|
|webapis-notification.js|patch for `Notification APIs`|
|webapis-rtc-peer-connection.js|patch for `RTCPeerConnection APIs`|
|webapis-shadydom.js|patch for `Shady DOM APIs`|
|zone-bluebird.js|patch for `Bluebird APIs`|
|zone-error.js|patch for `Error Global Object`, supports remove `Zone StackTrace`|
|zone-patch-canvas.js|patch for `Canvas API`|
|zone-patch-cordova.js|patch for `Cordova API`|
|zone-patch-electron.js|patch for `Electron API`|
|zone-patch-fetch.js|patch for `Fetch API`|
|zone-patch-jsonp.js|utility for `jsonp API`|
|zone-patch-resize-observer.js|patch for `ResizeObserver API`|
|zone-patch-rxjs.js|patch for `rxjs API`|
|zone-patch-rxjs-fake-async.js|patch for `rxjs fakeasync test`|
|zone-patch-socket-io.js|patch for `socket-io`|
|zone-patch-user-media.js|patch for `UserMedia API`|

## Promise A+ test passed
[![Promises/A+ 1.1 compliant](https://promisesaplus.com/assets/logo-small.png)](https://promisesaplus.com/)

## License
MIT
