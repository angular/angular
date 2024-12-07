# Re-export of Bazel rules with devtools-wide defaults

load("//tools:defaults.bzl", _karma_web_test_suite = "karma_web_test_suite")

def karma_web_test_suite(name, **kwargs):
    # Set up default browsers if no explicit `browsers` have been specified.
    if not hasattr(kwargs, "browsers"):
        kwargs["tags"] = ["native"] + kwargs.get("tags", [])
        kwargs["browsers"] = [
            "@npm//@angular/build-tooling/bazel/browsers/chromium:chromium",

            # todo(aleksanderbodurri): enable when firefox support is done
            # "@npm//@angular/build-tooling/bazel/browsers/firefox:firefox",
        ]

    # Default test suite with all configured browsers.
    _karma_web_test_suite(
        name = name,
        **kwargs
    )
