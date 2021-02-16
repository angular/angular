load("//dev-infra/benchmark/ng_rollup_bundle:ng_rollup_bundle.bzl", "ng_rollup_bundle")
load("//tools:defaults.bzl", "ng_module")
load("@npm//@bazel/typescript:index.bzl", "ts_library")
load("@npm//@bazel/concatjs:index.bzl", "concatjs_devserver")
load(":benchmark_test.bzl", "benchmark_test")

def copy_default_file(origin, destination):
    """
    Copies a file from ./defaults to the destination.

    Args:
        origin: The name of a file in ./defaults to be copied.
        destination: Where the original file will be clopied to.
    """
    native.genrule(
        name = "copy_default_" + origin + "_file_genrule",
        srcs = ["//dev-infra/benchmark/component_benchmark/defaults:" + origin],
        outs = [destination],
        cmd = "cat $(SRCS) >> $@",
    )

def component_benchmark(
        name,
        prefix,
        driver,
        driver_deps,
        ng_srcs,
        ng_deps,
        ng_assets = [],
        assets = None,
        styles = None,
        entry_point = None,
        entry_point_deps = [
            "//packages/core",
            "//packages/platform-browser",
        ]):
    """
    Runs a benchmark test against the given angular app using the given driver.

    This rule was created with the intention of reducing the amount of
    duplicate/boilderplate code, while also allowing you to be as verbose with
    your app as you'd like. The goal being that if you just want to test a
    simple component, the only thing you'd need to provide are the component
    (via ng_srcs) and driver.

    ** USAGE NOTES **

    (assets/styles): The default index.html imports a stylesheet named
    "styles.css". This allows the use of the default index.html with a custom
    stylesheet through the styles arg by providing either a styles.css in the
    prefix directory or by providing a css binary named styles.css.

    (assets): The default index.html expects that the root selector for
    the benchmark app is "app-root".

    (entry_point): The default entry_point expects a file named "app.module" to export
    the root NgModule for the benchmark application. It also expects that the
    root NgModule is named "AppModule".

    TIP: The server is named `name + "_server"` so that you can view/debug the
    app.

    Args:
      name: The name of the benchmark_test to be run
      prefix: The relative path to the root directory of the benchmark app
      driver: The ts driver for running the benchmark
      driver_deps: Driver's dependencies
      ng_srcs: All of the ts srcs for the angular app
      ng_deps: Dependencies for the angular app
      ng_assets: The static assets for the angular app
      assets: Static files
      styles: Stylesheets
      entry_point: Main entry point for the angular app
      entry_point_deps: Entry point's dependencies
    """
    app_lib = name + "_app_lib"
    app_main = name + "_app_main"
    benchmark_driver = name + "_driver"
    server = name + "_server"

    # If the user doesn't provide assets, entry_point, or styles, we use a
    # default version.
    # Note that we copy the default files to the same directory as what is used
    # by the app for three reasons:
    # 1. To avoid having the entry point be defined in a different package from
    # where this macro is called.
    # 2. So that we can use relative paths for imports in entry point.
    # 3. To make using default static files as seamless as possible.

    if not entry_point:
        entry_point = prefix + "default_index.ts"
        ng_srcs.append(entry_point)
        copy_default_file("index.ts", entry_point)

    if not assets:
        html = prefix + "index.html"
        assets = [html]
        copy_default_file("index.html", html)

    if not styles:
        css = prefix + "styles.css"
        styles = [css]
        copy_default_file("styles.css", css)

    # Bootstraps the application and creates
    # additional files to be imported by the entry_point file.
    ng_module(
        name = app_lib,
        srcs = ng_srcs,
        assets = ng_assets,
        # Creates ngFactory and ngSummary to be imported by the app's entry point.
        generate_ve_shims = True,
        deps = ng_deps,
        tsconfig = "//dev-infra/benchmark/component_benchmark:tsconfig-e2e.json",
    )

    # Bundle the application (needed by concatjs_devserver).
    ng_rollup_bundle(
        name = app_main,
        entry_point = entry_point,
        deps = [":" + app_lib] + entry_point_deps,
    )

    # The ts_library for the driver that runs tests against the benchmark app.
    ts_library(
        name = benchmark_driver,
        tsconfig = "//dev-infra/benchmark/component_benchmark:tsconfig-e2e.json",
        testonly = True,
        srcs = [driver],
        deps = driver_deps,
    )

    # The server for our application.
    concatjs_devserver(
        name = server,
        bootstrap = ["//packages/zone.js/bundles:zone.umd.js"],
        port = 4200,
        static_files = assets + styles,
        deps = [":" + app_main + ".min_debug.js"],
        additional_root_paths = ["//dev-infra/benchmark/component_benchmark/defaults"],
        serving_path = "/app_bundle.js",
    )

    # Runs a protractor test that's set up to use @angular/benchpress.
    benchmark_test(
        name = name,
        server = ":" + server,
        deps = [":" + benchmark_driver],
    )
