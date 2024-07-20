"""
Describe all the output bundles in the zone.js npm package
by mapping the bundle name to the source location.
"""

_DIR = "//packages/zone.js/lib:"

BUNDLES_ENTRY_POINTS = {
    "zone": {
        "es5": _DIR + "browser/rollup-main",
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
        "entrypoint": _DIR + "zone-spec/rollup-long-stack-trace",
    },
    "proxy": {
        "entrypoint": _DIR + "zone-spec/rollup-proxy",
    },
    "zone-patch-rxjs-fake-async": {
        "entrypoint": _DIR + "zone-spec/rollup-proxy",
    },
    "sync-test": {
        "entrypoint": _DIR + "zone-spec/rollup-sync-test",
    },
    "task-tracking": {
        "entrypoint": _DIR + "zone-spec/rollup-task-tracking",
    },
    "wtf": {
        "entrypoint": _DIR + "zone-spec/rollup-wtf",
    },
    "zone-error": {
        "entrypoint": _DIR + "common/rollup-error-rewrite",
    },
    "zone-legacy": {
        "entrypoint": _DIR + "browser/rollup-browser-legacy",
    },
    "zone-bluebird": {
        "entrypoint": _DIR + "extra/rollup-bluebird",
    },
    "zone-patch-canvas": {
        "entrypoint": _DIR + "browser/rollup-canvas",
    },
    "zone-patch-cordova": {
        "entrypoint": _DIR + "extra/rollup-cordova",
    },
    "zone-patch-electron": {
        "entrypoint": _DIR + "extra/rollup-electron",
    },
    "zone-patch-fetch": {
        "entrypoint": _DIR + "common/rollup-fetch",
    },
    "jasmine-patch": {
        "entrypoint": _DIR + "jasmine/rollup-jasmine",
    },
    "zone-patch-jsonp": {
        "entrypoint": _DIR + "extra/rollup-jsonp",
    },
    "webapis-media-query": {
        "entrypoint": _DIR + "browser/rollup-webapis-media-query",
    },
    "mocha-patch": {
        "entrypoint": _DIR + "mocha/rollup-mocha",
    },
    "webapis-notification": {
        "entrypoint": _DIR + "browser/rollup-webapis-notification",
    },
    "zone-patch-promise-test": {
        "entrypoint": _DIR + "testing/rollup-promise-testing",
    },
    "zone-patch-resize-observer": {
        "entrypoint": _DIR + "browser/rollup-webapis-resize-observer",
    },
    "webapis-rtc-peer-connection": {
        "entrypoint": _DIR + "browser/rollup-webapis-rtc-peer-connection",
    },
    "zone-patch-rxjs": {
        "entrypoint": _DIR + "rxjs/rollup-rxjs",
    },
    "webapis-shadydom": {
        "entrypoint": _DIR + "browser/rollup-shadydom",
    },
    "zone-patch-socket-io": {
        "entrypoint": _DIR + "extra/rollup-socket-io",
    },
    "zone-patch-message-port": {
        "entrypoint": _DIR + "browser/rollup-message-port",
    },
    "zone-patch-user-media": {
        "entrypoint": _DIR + "browser/rollup-webapis-user-media",
    },
    "zone-testing": {
        "entrypoint": _DIR + "testing/rollup-zone-testing",
    },
}
