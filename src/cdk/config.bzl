# List of all entry-points of the Angular CDK package.
CDK_ENTRYPOINTS = [
    "a11y",
    "accordion",
    "bidi",
    "coercion",
    "collections",
    "drag-drop",
    "keycodes",
    "layout",
    "observers",
    "overlay",
    "platform",
    "portal",
    "scrolling",
    "stepper",
    "table",
    "text-field",
    "tree",

    # NOTE: "testing" should not be listed here as it will be treated as its own
    # package that will be included manually in the "ng_package".
]

# List of all entry-point targets of the Angular Material package.
CDK_TARGETS = ["//src/cdk"] + ["//src/cdk/%s" % ep for ep in CDK_ENTRYPOINTS]

# Within the CDK, only a few targets have sass libraries which need to be
# part of the release package. This list declares all CDK targets with sass
# libraries that need to be included and re-exported at the package root.
CDK_ENTRYPOINTS_WITH_STYLES = [
    "a11y",
    "overlay",
    "text-field",
]

CDK_SCSS_LIBS = [
    "//src/cdk/%s:%s_scss_lib" % (p, p.replace("-", "_"))
    for p in CDK_ENTRYPOINTS_WITH_STYLES
]
