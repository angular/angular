ES5_GLOBAL_BUNDLES = {
    "zone": "lib/browser/rollup-legacy-main",
    "zone-mix": "lib/mix/rollup-mix",
    "zone-node": "lib/node/rollup-main",
    "zone-testing-node-bundle": "lib/node/rollup-test-main",
}

ES5_BUNDLES = {
    "async-test": "lib/testing/async-testing",
    "fake-async-test": "lib/testing/fake-async",
    "long-stack-trace-zone": "lib/zone-spec/long-stack-trace",
    "proxy": "lib/zone-spec/proxy",
    "zone-patch-rxjs-fake-async": "lib/rxjs/rxjs-fake-async",
    "sync-test": "lib/zone-spec/sync-test",
    "task-tracking": "lib/zone-spec/task-tracking",
    "wtf": "lib/zone-spec/wtf",
    "zone-error": "lib/common/error-rewrite",
    "zone-legacy": "lib/browser/browser-legacy",
    "zone-bluebird": "lib/extra/bluebird",
    "zone-patch-canvas": "lib/browser/canvas",
    "zone-patch-cordova": "lib/extra/cordova",
    "zone-patch-electron": "lib/extra/electron",
    "zone-patch-fetch": "lib/common/fetch",
    "jasmine-patch": "lib/jasmine/jasmine",
    "zone-patch-jsonp": "lib/extra/jsonp",
    "webapis-media-query": "lib/browser/webapis-media-query",
    "mocha-patch": "lib/mocha/mocha",
    "webapis-notification": "lib/browser/webapis-notification",
    "zone-patch-promise-test": "lib/testing/promise-testing",
    "zone-patch-resize-observer": "lib/browser/webapis-resize-observer",
    "webapis-rtc-peer-connection": "lib/browser/webapis-rtc-peer-connection",
    "zone-patch-rxjs": "lib/rxjs/rxjs",
    "webapis-shadydom": "lib/browser/shadydom",
    "zone-patch-socket-io": "lib/extra/socket-io",
    "zone-patch-user-media": "lib/browser/webapis-user-media",
    "zone-testing": "lib/testing/zone-testing",
    "zone-testing-bundle": "lib/browser/rollup-legacy-test-main",
}

ES2015_BUNDLES = {
    "zone-evergreen": "lib/browser/rollup-main",
    "zone-evergreen-testing-bundle": "lib/browser/rollup-test-main",
}
