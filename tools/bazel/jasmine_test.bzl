load("@devinfra//bazel/jasmine:jasmine.bzl", _jasmine_test = "jasmine_test")
load("@devinfra//bazel/spec-bundling:index.bzl", "spec_bundle")

def angular_jasmine_test(name, data = [], fixed_args = [], **kwargs):
    jasmine_test(
        name = name,
        data = data + ["//tools/testing:node", "//tools/testing:node_tests.init.mjs"],
        fixed_args = fixed_args + ["--require=$$JS_BINARY__RUNFILES/$(rlocationpath //tools/testing:node_tests.init.mjs)"],
        **kwargs
    )

def zoneless_jasmine_test(name, data = [], fixed_args = [], **kwargs):
    jasmine_test(
        name = name,
        data = data + ["//tools/testing:node_zoneless", "//tools/testing:node_zoneless_tests.init.mjs"],
        fixed_args = fixed_args + ["--require=$$JS_BINARY__RUNFILES/$(rlocationpath //tools/testing:node_zoneless_tests.init.mjs)"],
        **kwargs
    )

def zone_compatible_jasmine_test(name, external = [], data = [], bootstrap = [], **kwargs):
    spec_bundle(
        name = "%s_bundle" % name,
        # Specs from this attribute are filtered and will be executed. We
        # add bootstrap here for discovery of the module mappings aspect.
        deps = data + bootstrap,
        bootstrap = bootstrap,
        external = external + ["domino", "typescript"],
        platform = "node",
        config = {
            "banner": {
                "js": """import {createRequire as __cjsCompatRequire} from 'module';
                     const require = __cjsCompatRequire(import.meta.url);""",
            },
            "target": ["ES2022"],
            "format": "esm",
        },
    )

    jasmine_test(
        name = name,
        data = [":%s_bundle" % name],
        **kwargs
    )

def jasmine_test(name, tsconfig = "//packages:tsconfig_build", fixed_args = [], **kwargs):
    # Create relative path to root, from current package dir. Necessary as
    # we change the `chdir` below to the package directory.
    relative_to_root = "/".join([".."] * len(native.package_name().split("/")))

    all_fixed_args = [
        # Escape so that the `js_binary` launcher triggers Bash expansion.
        "'**/*+(.|_)spec.js'",
        "'**/*+(.|_)spec.mjs'",
        "'**/*+(.|_)spec.cjs'",
    ] + fixed_args

    all_fixed_args = [arg.format(root = relative_to_root) for arg in all_fixed_args]

    size = kwargs.pop("size", "medium")

    _jasmine_test(
        name = name,
        node_modules = "//:node_modules",
        chdir = native.package_name(),
        fixed_args = all_fixed_args,
        tsconfig = tsconfig,
        size = size,
        **kwargs
    )
