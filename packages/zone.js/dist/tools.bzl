ES5_BUNDLES = [
    "zone",
    "zone-mix",
    "zone-node",
    "zone-testing-node-bundle",
    "async-test",
    "fake-async-test",
    "long-stack-trace-zone",
    "proxy",
    "zone-patch-rxjs-fake-async",
    "sync-test",
    "task-tracking",
    "wtf",
    "zone-error",
    "zone-legacy",
    "zone-bluebird",
    "zone-patch-canvas",
    "zone-patch-cordova",
    "zone-patch-electron",
    "zone-patch-fetch",
    "jasmine-patch",
    "zone-patch-jsonp",
    "webapis-media-query",
    "mocha-patch",
    "webapis-notification",
    "zone-patch-promise-test",
    "zone-patch-resize-observer",
    "webapis-rtc-peer-connection",
    "zone-patch-rxjs",
    "webapis-shadydom",
    "zone-patch-socket-io",
    "zone-patch-user-media",
    "zone-patch-message-port",
    "zone-testing",
    "zone-testing-bundle",
]

ES2015_BUNDLES = {
    "zone-evergreen": "//packages/zone.js/fesm2015:zone",
    "zone-evergreen-testing-bundle": "//packages/zone.js/fesm2015:zone-testing-bundle",
}

def copy_es5_to_dist():
    for b in ES5_BUNDLES:
        native.genrule(
            name = "zone_copy_" + b,
            srcs = ["//packages/zone.js/bundles:" + b + ".umd.js"],
            outs = [b + ".js"],
            cmd = "cp $< $@",
        )
        native.genrule(
            name = "zone_copy_min_" + b,
            srcs = ["//packages/zone.js/bundles:" + b + ".umd.min.js"],
            outs = [b + ".min.js"],
            cmd = "cp $< $@",
        )

def copy_es2015_to_dist():
    for b in ES2015_BUNDLES.items():
        native.genrule(
            name = "zone_copy_" + b[0],
            srcs = [b[1] + ".js"],
            outs = [b[0] + ".js"],
            cmd = "cp $< $@",
        )
        native.genrule(
            name = "zone_copy_min_" + b[0],
            srcs = [b[1] + ".min.js"],
            outs = [b[0] + ".min.js"],
            cmd = "cp $< $@",
        )
