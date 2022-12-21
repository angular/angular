load("//tools:defaults.bzl", "rollup_bundle", "ts_library")
load("@npm//@bazel/concatjs:index.bzl", "karma_web_test_suite")

def karma_test_prepare(name, env_srcs, env_deps, env_entry_point, test_srcs, test_deps, test_entry_point):
    ts_library(
        name = name + "_env",
        testonly = True,
        srcs = env_srcs,
        deps = env_deps,
    )
    rollup_bundle(
        name = name + "_env_rollup",
        testonly = True,
        sourcemap = "false",
        entry_point = env_entry_point,
        silent = True,
        deps = [
            ":" + name + "_env",
            "@npm//@rollup/plugin-commonjs",
            "@npm//@rollup/plugin-node-resolve",
            "@npm//magic-string",
        ],
    )
    ts_library(
        name = name + "_test",
        testonly = True,
        srcs = test_srcs,
        deps = test_deps,
    )
    rollup_bundle(
        name = name + "_rollup",
        testonly = True,
        silent = True,
        sourcemap = "false",
        entry_point = test_entry_point,
        config_file = "//packages/zone.js:rollup.config.js",
        deps = [
            ":" + name + "_test",
            "@npm//@rollup/plugin-commonjs",
            "@npm//@rollup/plugin-node-resolve",
            "@npm//magic-string",
        ],
    )

def karma_test(name, env_srcs, env_deps, env_entry_point, test_srcs, test_deps, test_entry_point, bootstraps, ci):
    first = True
    for subname in bootstraps:
        bootstrap = bootstraps[subname]
        firstFlag = first
        if first:
            first = False
            karma_test_prepare(name, env_srcs, env_deps, env_entry_point, test_srcs, test_deps, test_entry_point)
        _karma_test_required_dist_files = [
            "//packages/zone.js/bundles:task-tracking.umd.js",
            "//packages/zone.js/bundles:wtf.umd.js",
            "//packages/zone.js/bundles:webapis-notification.umd.js",
            "//packages/zone.js/bundles:webapis-media-query.umd.js",
            "//packages/zone.js/bundles:zone-patch-canvas.umd.js",
            "//packages/zone.js/bundles:zone-patch-fetch.umd.js",
            "//packages/zone.js/bundles:zone-patch-resize-observer.umd.js",
            "//packages/zone.js/bundles:zone-patch-message-port.umd.js",
            "//packages/zone.js/bundles:zone-patch-user-media.umd.js",
            ":" + name + "_rollup.umd",
        ]

        karma_web_test_suite(
            name = subname + "_karma_jasmine_test",
            srcs = [
                "fake_entry.js",
            ],
            bootstrap = [
                            ":" + name + "_env_rollup.umd",
                        ] + bootstrap +
                        _karma_test_required_dist_files,
            browsers = ["@npm//@angular/build-tooling/bazel/browsers/chromium:chromium"],
            static_files = [
                ":assets/sample.json",
                ":assets/worker.js",
                ":assets/import.html",
            ],
            tags = ["zone_karma_test"],
            runtime_deps = [
                "@npm//karma-sauce-launcher",
            ],
        )

        if ci and firstFlag:
            karma_web_test_suite(
                name = "karma_jasmine_test_ci",
                srcs = [
                    "fake_entry.js",
                ],
                bootstrap = [
                    ":saucelabs.js",
                    ":" + name + "_env_rollup.umd",
                    "//packages/zone.js/bundles:zone-testing-bundle.umd.min.js",
                ] + _karma_test_required_dist_files,
                browsers = ["@npm//@angular/build-tooling/bazel/browsers/chromium:chromium"],
                config_file = "//:karma-js.conf.js",
                configuration_env_vars = ["KARMA_WEB_TEST_MODE"],
                data = [
                    "//:browser-providers.conf.js",
                ],
                static_files = [
                    ":assets/sample.json",
                    ":assets/worker.js",
                    ":assets/import.html",
                ],
                tags = ["zone_karma_test"],
                # Visible to //:saucelabs_unit_tests_poc target
                visibility = ["//:__pkg__"],
                runtime_deps = [
                    "@npm//karma-sauce-launcher",
                ],
            )
