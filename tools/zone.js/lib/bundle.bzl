ES5_GLOBAL_BUNDLES = {
    "zone": "tools/zone.js/lib/browser/rollup-legacy-main",
    "zone-mix": "tools/zone.js/lib/mix/rollup-mix",
    "zone-node": "tools/zone.js/lib/node/rollup-main",
    "zone-testing-node-bundle": "tools/zone.js/lib/node/rollup-test-main",
}

ES5_BUNDLES = {
    "async-test": "tools/zone.js/lib/testing/async-testing",
    "fake-async-test": "tools/zone.js/lib/testing/fake-async",
    "long-stack-trace-zone": "tools/zone.js/lib/zone-spec/long-stack-trace",
    "proxy": "tools/zone.js/lib/zone-spec/proxy",
    "zone-patch-rxjs-fake-async": "tools/zone.js/lib/rxjs/rxjs-fake-async",
    "sync-test": "tools/zone.js/lib/zone-spec/sync-test",
    "task-tracking": "tools/zone.js/lib/zone-spec/task-tracking",
    "wtf": "tools/zone.js/lib/zone-spec/wtf",
    "zone-error": "tools/zone.js/lib/common/error-rewrite",
    "zone-legacy": "tools/zone.js/lib/browser/browser-legacy",
    "zone-bluebird": "tools/zone.js/lib/extra/bluebird",
    "zone-patch-canvas": "tools/zone.js/lib/browser/canvas",
    "zone-patch-cordova": "tools/zone.js/lib/extra/cordova",
    "zone-patch-electron": "tools/zone.js/lib/extra/electron",
    "zone-patch-fetch": "tools/zone.js/lib/common/fetch",
    "jasmine-patch": "tools/zone.js/lib/jasmine/jasmine",
    "zone-patch-jsonp": "tools/zone.js/lib/extra/jsonp",
    "webapis-media-query": "tools/zone.js/lib/browser/webapis-media-query",
    "mocha-patch": "tools/zone.js/lib/mocha/mocha",
    "webapis-notification": "tools/zone.js/lib/browser/webapis-notification",
    "zone-patch-promise-test": "tools/zone.js/lib/testing/promise-testing",
    "zone-patch-resize-observer": "tools/zone.js/lib/browser/webapis-resize-observer",
    "webapis-rtc-peer-connection": "tools/zone.js/lib/browser/webapis-rtc-peer-connection",
    "zone-patch-rxjs": "tools/zone.js/lib/rxjs/rxjs",
    "webapis-shadydom": "tools/zone.js/lib/browser/shadydom",
    "zone-patch-socket-io": "tools/zone.js/lib/extra/socket-io",
    "zone-patch-user-media": "tools/zone.js/lib/browser/webapis-user-media",
    "zone-testing": "tools/zone.js/lib/testing/zone-testing",
    "zone-testing-bundle": "tools/zone.js/lib/browser/rollup-legacy-test-main",
}

ES2015_BUNDLES = {
    "zone-evergreen": "tools/zone.js/lib/browser/rollup-main",
    "zone-evergreen-testing-bundle": "tools/zone.js/lib/browser/rollup-test-main",
}
