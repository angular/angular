"""
Describe all the output bundles in the zone.js npm package
by mapping the bundle name to the source location.
"""

_DIR = "//packages/zone.js/lib:"

ES5_GLOBAL_BUNDLES = {
    "zone": _DIR + "browser/rollup-legacy-main",
    "zone-mix": _DIR + "mix/rollup-mix",
    "zone-node": _DIR + "node/rollup-main",
    "zone-testing-node-bundle": _DIR + "node/rollup-test-main",
}

ES5_BUNDLES = {
    "async-test": _DIR + "testing/async-testing",
    "fake-async-test": _DIR + "testing/fake-async",
    "long-stack-trace-zone": _DIR + "zone-spec/long-stack-trace",
    "proxy": _DIR + "zone-spec/proxy",
    "zone-patch-rxjs-fake-async": _DIR + "rxjs/rxjs-fake-async",
    "sync-test": _DIR + "zone-spec/sync-test",
    "task-tracking": _DIR + "zone-spec/task-tracking",
    "wtf": _DIR + "zone-spec/wtf",
    "zone-error": _DIR + "common/error-rewrite",
    "zone-legacy": _DIR + "browser/browser-legacy",
    "zone-bluebird": _DIR + "extra/bluebird",
    "zone-patch-canvas": _DIR + "browser/canvas",
    "zone-patch-cordova": _DIR + "extra/cordova",
    "zone-patch-electron": _DIR + "extra/electron",
    "zone-patch-fetch": _DIR + "common/fetch",
    "jasmine-patch": _DIR + "jasmine/jasmine",
    "zone-patch-jsonp": _DIR + "extra/jsonp",
    "webapis-media-query": _DIR + "browser/webapis-media-query",
    "mocha-patch": _DIR + "mocha/mocha",
    "webapis-notification": _DIR + "browser/webapis-notification",
    "zone-patch-promise-test": _DIR + "testing/promise-testing",
    "zone-patch-resize-observer": _DIR + "browser/webapis-resize-observer",
    "webapis-rtc-peer-connection": _DIR + "browser/webapis-rtc-peer-connection",
    "zone-patch-rxjs": _DIR + "rxjs/rxjs",
    "webapis-shadydom": _DIR + "browser/shadydom",
    "zone-patch-socket-io": _DIR + "extra/socket-io",
    "zone-patch-user-media": _DIR + "browser/webapis-user-media",
    "zone-testing": _DIR + "testing/zone-testing",
    "zone-testing-bundle": _DIR + "browser/rollup-legacy-test-main",
}

ES2015_BUNDLES = {
    "zone-evergreen": _DIR + "browser/rollup-main",
    "zone-evergreen-testing-bundle": _DIR + "browser/rollup-test-main",
}
