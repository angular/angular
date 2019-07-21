load("//tools:defaults.bzl", "ts_library")
load("@build_bazel_rules_nodejs//:defs.bzl", "rollup_bundle")
load("@npm_bazel_karma//:index.bzl", "karma_web_test_suite")

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
        entry_point = env_entry_point,
        deps = [
            ":" + name + "_env",
        ],
    )
    native.filegroup(
        name = name + "_env_rollup.es5",
        testonly = True,
        srcs = [":" + name + "_env_rollup"],
        output_group = "umd",
    )
    native.genrule(
        name = name + "_env_trim_map",
        testonly = True,
        srcs = [
            ":" + name + "_env_rollup.es5",
        ],
        outs = [
            name + "_env_rollup_trim_map.js",
        ],
        cmd = " && ".join([
            "cp $(@D)/" + name + "_env_rollup.umd.js $@",
        ]),
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
        entry_point = test_entry_point,
        globals = {
            "electron": "electron",
        },
        deps = [
            ":" + name + "_test",
        ],
    )
    native.filegroup(
        name = name + "_rollup.es5",
        testonly = True,
        srcs = [":" + name + "_rollup"],
        output_group = "umd",
    )
    native.genrule(
        name = name + "_trim_map",
        testonly = True,
        srcs = [
            ":" + name + "_rollup.es5",
        ],
        outs = [
            name + "_rollup_trim_map.js",
        ],
        cmd = " && ".join([
            "cp $(@D)/" + name + "_rollup.umd.js $@",
        ]),
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
            "//packages/zone.js/dist:task-tracking-dist-dev-test",
            "//packages/zone.js/dist:wtf-dist-dev-test",
            "//packages/zone.js/dist:webapis-notification-dist-dev-test",
            "//packages/zone.js/dist:webapis-media-query-dist-dev-test",
            "//packages/zone.js/dist:zone-patch-canvas-dist-dev-test",
            "//packages/zone.js/dist:zone-patch-fetch-dist-dev-test",
            "//packages/zone.js/dist:zone-patch-resize-observer-dist-dev-test",
            "//packages/zone.js/dist:zone-patch-user-media-dist-dev-test",
            ":" + name + "_trim_map",
        ]

        karma_web_test_suite(
            name = subname + "_karma_jasmine_test",
            srcs = [
                "fake_entry.js",
            ],
            bootstrap = [
                            ":" + name + "_env_trim_map",
                        ] + bootstrap +
                        _karma_test_required_dist_files,
            static_files = [
                ":assets/sample.json",
                ":assets/worker.js",
                ":assets/import.html",
            ],
            tags = ["zone_karma_test"],
            runtime_deps = [
                "@npm//karma-browserstack-launcher",
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
                    ":" + name + "_env_trim_map",
                    "//packages/zone.js/dist:zone-testing-bundle-dist-test",
                ] + _karma_test_required_dist_files,
                config_file = "//:karma-js.conf.js",
                configuration_env_vars = ["KARMA_WEB_TEST_MODE"],
                data = [
                    "//:browser-providers.conf.js",
                    "//tools:jasmine-seed-generator.js",
                ],
                static_files = [
                    ":assets/sample.json",
                    ":assets/worker.js",
                    ":assets/import.html",
                ],
                tags = ["zone_karma_test"],
                # Visible to //:test_web_all target
                visibility = ["//:__pkg__"],
                runtime_deps = [
                    "@npm//karma-browserstack-launcher",
                ],
            )
