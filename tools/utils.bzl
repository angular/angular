"""Simple utility bazel macros for convenience usage."""

load("@npm//typescript:index.bzl", "tsc")

def transpile_js_to_es5(name, js_file):
    """Transpiles a provided javascript target to es5.

    For testing on IE, shims must be served in es5, this macro can be used to
    transpile es2015 JS shims to es5 for usage in IE testing.

    Example usage:

    transpile_js_to_es5(
        name = "my-file",
        js_file = "@npm//some_package/shim_files/es6_shim_file.js",
    )

    filegroup(
        name = "some_shims_for_tests",
        testonly = True,
        srcs = [
            ":my-file",
            ...
        ]
    )
    """
    tsc(
        name = name,
        outs = [
            "%s.js" % name,
        ],
        args = [
            # Allow JS files to be used for transpiling
            "--allowJs",
            # Skip lib check as pure local javascript transpiling should be done
            "--skipLibCheck",
            # Transpile to ES5
            "--target ES5",
            # Output the transpiled file to the location provided by the name
            "--outFile $(execpath :%s.js)" % name,
            # Transpile the provided js_file
            "$(execpath %s)" % js_file,
        ],
        data = [
            js_file,
        ],
    )
