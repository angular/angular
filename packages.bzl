# Each individual package uses a placeholder for the version of Angular to ensure they're
# all in-sync. This map is passed to each ng_package rule to stamp out the appropriate
# version for the placeholders.
ANGULAR_PACKAGE_VERSION = "^9.0.0-0 || ^10.0.0-0"
MDC_PACKAGE_VERSION = "^4.0.0-canary.062ade5c0.0"
VERSION_PLACEHOLDER_REPLACEMENTS = {
    "0.0.0-MDC": MDC_PACKAGE_VERSION,
    "0.0.0-NG": ANGULAR_PACKAGE_VERSION,
}

# List of default Angular library UMD bundles which are not processed by ngcc.
ANGULAR_NO_NGCC_BUNDLES = [
    "@npm//:node_modules/@angular/compiler/bundles/compiler.umd.js",
]

# List of Angular library UMD bundles which will are processed by ngcc.
ANGULAR_NGCC_BUNDLES = [
    ("@angular/animations", ["animations-browser.umd.js", "animations.umd.js"]),
    ("@angular/common", ["common-http-testing.umd.js", "common-http.umd.js", "common-testing.umd.js", "common.umd.js"]),
    ("@angular/compiler", ["compiler-testing.umd.js"]),
    ("@angular/core", ["core-testing.umd.js", "core.umd.js"]),
    ("@angular/elements", ["elements.umd.js"]),
    ("@angular/forms", ["forms.umd.js"]),
    ("@angular/platform-browser-dynamic", ["platform-browser-dynamic-testing.umd.js", "platform-browser-dynamic.umd.js"]),
    ("@angular/platform-browser", ["platform-browser.umd.js", "platform-browser-testing.umd.js", "platform-browser-animations.umd.js"]),
    ("@angular/router", ["router.umd.js"]),
]

ANGULAR_LIBRARY_VIEW_ENGINE_UMDS = ANGULAR_NO_NGCC_BUNDLES + [
    "@npm//:node_modules/%s/bundles/%s" % (pkgName, bundleName)
    for pkgName, bundleNames in ANGULAR_NGCC_BUNDLES
    for bundleName in bundleNames
]
ANGULAR_LIBRARY_IVY_UMDS = ANGULAR_NO_NGCC_BUNDLES + [
    "@npm//:node_modules/%s/__ivy_ngcc__/bundles/%s" % (pkgName, bundleName)
    for pkgName, bundleNames in ANGULAR_NGCC_BUNDLES
    for bundleName in bundleNames
]

"""
  Gets the list of targets for the Angular library UMD bundles. Conditionally
  switches between View Engine or Ivy UMD bundles based on the "--define=compile" flag.
"""

def getAngularUmdTargets():
    return select({
        "//tools:view_engine_mode": ANGULAR_LIBRARY_VIEW_ENGINE_UMDS,
        "//conditions:default": ANGULAR_LIBRARY_IVY_UMDS,
    })
