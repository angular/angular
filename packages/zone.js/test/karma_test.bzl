load("//tools:defaults2.bzl", "esbuild", "ts_project", "web_test")

def karma_test_prepare(name, env_srcs, env_deps, env_entry_point, test_srcs, test_deps, test_entry_point):
    ts_project(
        name = name + "_env_lib",
        testonly = True,
        srcs = env_srcs,
        deps = env_deps,
    )
    esbuild(
        name = name + "_env",
        entry_point = env_entry_point,
        testonly = True,
        output = name + "_env.js",
        config = "//tools/bazel/esbuild/zone-config:umd",
        deps = [
            ":" + name + "_env_lib",
        ],
    )

    ts_project(
        name = name + "_env_spec_lib",
        testonly = True,
        srcs = test_srcs,
        deps = test_deps,
    )

    esbuild(
        name = name + "_env_spec",
        entry_point = test_entry_point,
        testonly = True,
        output = name + "_env.spec.js",
        config = "//tools/bazel/esbuild/zone-config:umd",
        deps = [
            ":" + name + "_env_spec_lib",
        ],
    )

def karma_test(name, env_srcs, env_deps, env_entry_point, test_srcs, test_deps, test_entry_point, bootstraps):
    karma_test_prepare(name, env_srcs, env_deps, env_entry_point, test_srcs, test_deps, test_entry_point)
    for subname in bootstraps:
        bootstrap = bootstraps[subname]

        web_test(
            name = subname,
            firefox = False,
            chromium = True,
            testonly = True,
            tsconfig = "//packages/zone.js:tsconfig_build",
            # The test bundle for the karma test
            deps = [":" + name + "_env_spec"],
            bootstrap =
                # The environment setup bundle for the karma test
                [":" + name + "_env"] +
                # The specific zone.js bundle files necessary for the specific test set
                bootstrap +
                # The zone.js bundle files necessary for all test sets
                [
                    "//packages/zone.js/bundles:task-tracking.umd.js",
                    "//packages/zone.js/bundles:wtf.umd.js",
                    "//packages/zone.js/bundles:webapis-notification.umd.js",
                    "//packages/zone.js/bundles:webapis-media-query.umd.js",
                    "//packages/zone.js/bundles:zone-patch-canvas.umd.js",
                    "//packages/zone.js/bundles:zone-patch-fetch.umd.js",
                    "//packages/zone.js/bundles:zone-patch-resize-observer.umd.js",
                    "//packages/zone.js/bundles:zone-patch-message-port.umd.js",
                    "//packages/zone.js/bundles:zone-patch-user-media.umd.js",
                ],
            # Run time data available during the tests via http.
            data = [
                "fake_entry.js",
                ":assets/sample.json",
                ":assets/worker.js",
                ":assets/empty-worker.js",
                ":assets/import.html",
            ],
        )
