"""
Describe all the output bundles in the zone.js npm package
by mapping the bundle name to the source location.
"""

_DIR = "//packages/zone.js/lib:"

BUNDLES_ENTRY_POINTS = {
    "zone": {
        "es5": _DIR + "browser/rollup-legacy-main",
        "es2015": _DIR + "browser/rollup-main",
        "rollup": "global-es2015",
    },
    "zone-mix": {
        "entrypoint": _DIR + "mix/rollup-mix",
        "rollup": "global-es2015",
    },
    "zone-node": {
        "entrypoint": _DIR + "node/rollup-main",
        "rollup": "global-es2015",
    },
    "async-test": {
        "entrypoint": _DIR + "testing/async-testing",
        "rollup": "es5",
    },
    "fake-async-test": {
        "entrypoint": _DIR + "testing/fake-async",
        "rollup": "es5",
    },
    "long-stack-trace-zone": {
        "entrypoint": _DIR + "zone-spec/long-stack-trace",
        "rollup": "es5",
    },
    "proxy": {
        "entrypoint": _DIR + "zone-spec/proxy",
        "rollup": "es5",
    },
    "zone-patch-rxjs-fake-async": {
        "entrypoint": _DIR + "zone-spec/proxy",
        "rollup": "es5",
    },
    "sync-test": {
        "entrypoint": _DIR + "zone-spec/sync-test",
        "rollup": "es5",
    },
    "task-tracking": {
        "entrypoint": _DIR + "zone-spec/task-tracking",
        "rollup": "es5",
    },
    "wtf": {
        "entrypoint": _DIR + "zone-spec/wtf",
        "rollup": "es5",
    },
    "zone-error": {
        "entrypoint": _DIR + "common/error-rewrite",
        "rollup": "es5",
    },
    "zone-legacy": {
        "entrypoint": _DIR + "browser/browser-legacy",
        "rollup": "es5",
    },
    "zone-bluebird": {
        "entrypoint": _DIR + "extra/bluebird",
        "rollup": "es5",
    },
    "zone-patch-canvas": {
        "entrypoint": _DIR + "browser/canvas",
        "rollup": "es5",
    },
    "zone-patch-cordova": {
        "entrypoint": _DIR + "extra/cordova",
        "rollup": "es5",
    },
    "zone-patch-electron": {
        "entrypoint": _DIR + "extra/electron",
        "rollup": "es5",
    },
    "zone-patch-fetch": {
        "entrypoint": _DIR + "common/fetch",
        "rollup": "es5",
    },
    "jasmine-patch": {
        "entrypoint": _DIR + "jasmine/jasmine",
        "rollup": "es5",
    },
    "zone-patch-jsonp": {
        "entrypoint": _DIR + "extra/jsonp",
        "rollup": "es5",
    },
    "webapis-media-query": {
        "entrypoint": _DIR + "browser/webapis-media-query",
        "rollup": "es5",
    },
    "mocha-patch": {
        "entrypoint": _DIR + "mocha/mocha",
        "rollup": "es5",
    },
    "webapis-notification": {
        "entrypoint": _DIR + "browser/webapis-notification",
        "rollup": "es5",
    },
    "zone-patch-promise-test": {
        "entrypoint": _DIR + "testing/promise-testing",
        "rollup": "es5",
    },
    "zone-patch-resize-observer": {
        "entrypoint": _DIR + "browser/webapis-resize-observer",
        "rollup": "es5",
    },
    "webapis-rtc-peer-connection": {
        "entrypoint": _DIR + "browser/webapis-rtc-peer-connection",
        "rollup": "es5",
    },
    "zone-patch-rxjs": {
        "entrypoint": _DIR + "rxjs/rxjs",
        "rollup": "es5",
    },
    "webapis-shadydom": {
        "entrypoint": _DIR + "browser/shadydom",
        "rollup": "es5",
    },
    "zone-patch-socket-io": {
        "entrypoint": _DIR + "extra/socket-io",
        "rollup": "es5",
    },
    "zone-patch-message-port": {
        "entrypoint": _DIR + "browser/message-port",
        "rollup": "es5",
    },
    "zone-patch-user-media": {
        "entrypoint": _DIR + "browser/webapis-user-media",
        "rollup": "es5",
    },
    "zone-testing": {
        "entrypoint": _DIR + "testing/zone-testing",
        "rollup": "es5",
    },
    "zone-testing-bundle": {
        "es5": _DIR + "browser/rollup-legacy-test-main",
        "es2015": _DIR + "browser/rollup-test-main",
        "rollup": "global-es2015",
    },
    "zone-testing-node-bundle": {
        "entrypoint": _DIR + "node/rollup-test-main",
        "rollup": "global-es2015",
    },
}
