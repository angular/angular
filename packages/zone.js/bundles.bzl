"""
Describe all the output bundles in the zone.js npm package
by mapping the bundle name to the source location.
"""

_DIR = "//packages/zone.js/lib:"

BUNDLES_ENTRY_POINTS = {
    "zone": {
        "es5": _DIR + "browser/rollup-legacy-main",
        "es2015": _DIR + "browser/rollup-main",
    },
    "zone-mix": {
        "entrypoint": _DIR + "mix/rollup-mix",
    },
    "zone-node": {
        "entrypoint": _DIR + "node/rollup-main",
    },
    "async-test": {
        "entrypoint": _DIR + "testing/async-testing",
    },
    "fake-async-test": {
        "entrypoint": _DIR + "testing/fake-async",
    },
    "long-stack-trace-zone": {
        "entrypoint": _DIR + "zone-spec/long-stack-trace",
    },
    "proxy": {
        "entrypoint": _DIR + "zone-spec/proxy",
    },
    "zone-patch-rxjs-fake-async": {
        "entrypoint": _DIR + "zone-spec/proxy",
    },
    "sync-test": {
        "entrypoint": _DIR + "zone-spec/sync-test",
    },
    "task-tracking": {
        "entrypoint": _DIR + "zone-spec/task-tracking",
    },
    "wtf": {
        "entrypoint": _DIR + "zone-spec/wtf",
    },
    "zone-error": {
        "entrypoint": _DIR + "common/error-rewrite",
    },
    "zone-legacy": {
        "entrypoint": _DIR + "browser/browser-legacy",
    },
    "zone-bluebird": {
        "entrypoint": _DIR + "extra/bluebird",
    },
    "zone-patch-canvas": {
        "entrypoint": _DIR + "browser/canvas",
    },
    "zone-patch-cordova": {
        "entrypoint": _DIR + "extra/cordova",
    },
    "zone-patch-electron": {
        "entrypoint": _DIR + "extra/electron",
    },
    "zone-patch-fetch": {
        "entrypoint": _DIR + "common/fetch",
    },
    "jasmine-patch": {
        "entrypoint": _DIR + "jasmine/jasmine",
    },
    "zone-patch-jsonp": {
        "entrypoint": _DIR + "extra/jsonp",
    },
    "webapis-media-query": {
        "entrypoint": _DIR + "browser/webapis-media-query",
    },
    "mocha-patch": {
        "entrypoint": _DIR + "mocha/mocha",
    },
    "webapis-notification": {
        "entrypoint": _DIR + "browser/webapis-notification",
    },
    "zone-patch-promise-test": {
        "entrypoint": _DIR + "testing/promise-testing",
    },
    "zone-patch-resize-observer": {
        "entrypoint": _DIR + "browser/webapis-resize-observer",
    },
    "webapis-rtc-peer-connection": {
        "entrypoint": _DIR + "browser/webapis-rtc-peer-connection",
    },
    "zone-patch-rxjs": {
        "entrypoint": _DIR + "rxjs/rxjs",
    },
    "webapis-shadydom": {
        "entrypoint": _DIR + "browser/shadydom",
    },
    "zone-patch-socket-io": {
        "entrypoint": _DIR + "extra/socket-io",
    },
    "zone-patch-message-port": {
        "entrypoint": _DIR + "browser/message-port",
    },
    "zone-patch-user-media": {
        "entrypoint": _DIR + "browser/webapis-user-media",
    },
    "zone-testing": {
        "entrypoint": _DIR + "testing/zone-testing",
    },
    "zone-testing-bundle": {
        "es5": _DIR + "browser/rollup-legacy-test-main",
        "es2015": _DIR + "browser/rollup-test-main",
    },
    "zone-testing-node-bundle": {
        "entrypoint": _DIR + "node/rollup-test-main",
    },
}
