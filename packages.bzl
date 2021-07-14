# Each individual package uses a placeholder for the version of Angular to ensure they're
# all in-sync. This map is passed to each ng_package rule to stamp out the appropriate
# version for the placeholders.
ANGULAR_PACKAGE_VERSION = "^12.0.0 || ^13.0.0-0"
MDC_PACKAGE_VERSION = "12.0.0-canary.22d29cbb4.0"
TSLIB_PACKAGE_VERSION = "^2.2.0"
RXJS_PACKAGE_VERSION = "^6.5.3"

# Each placer holder is used to stamp versions during the build process, replacing the key with it's
# value pair. These replacements occur during building of `npm_package` and `ng_package` stamping in
# the peer dependencies and versions, primarily in `package.json`s.
VERSION_PLACEHOLDER_REPLACEMENTS = {
    # Version of `material-components-web`
    "0.0.0-MDC": MDC_PACKAGE_VERSION,
    # Version of `@angular/core`
    "0.0.0-NG": ANGULAR_PACKAGE_VERSION,
    # Version of `tslib`
    "0.0.0-TSLIB": TSLIB_PACKAGE_VERSION,
    # Version of the local package being built, generated via the `--workspace_status_command` flag.
    "0.0.0-PLACEHOLDER": "{BUILD_SCM_VERSION}",
    # Version of `rxjs`
    "0.0.0-RXJS": RXJS_PACKAGE_VERSION,
}

# List of default Angular library UMD bundles which are not processed by ngcc.
ANGULAR_NO_NGCC_BUNDLES = [
    ("@angular/compiler", ["compiler.umd.js"]),
    ("@angular/localize", ["localize.umd.js", "localize-init.umd.js"]),
]

# List of Angular library UMD bundles which will are processed by ngcc.
ANGULAR_NGCC_BUNDLES = [
    ("@angular/animations", ["animations-browser.umd.js", "animations.umd.js"]),
    ("@angular/common", ["common-http-testing.umd.js", "common-http.umd.js", "common-testing.umd.js", "common.umd.js"]),
    ("@angular/compiler", ["compiler-testing.umd.js"]),
    ("@angular/core", ["core-testing.umd.js", "core.umd.js"]),
    ("@angular/forms", ["forms.umd.js"]),
    ("@angular/platform-browser-dynamic", ["platform-browser-dynamic-testing.umd.js", "platform-browser-dynamic.umd.js"]),
    ("@angular/platform-browser", ["platform-browser.umd.js", "platform-browser-testing.umd.js", "platform-browser-animations.umd.js"]),
    ("@angular/router", ["router.umd.js"]),
]

"""
  Gets a dictionary of all packages and their bundle names.
"""

def getFrameworkPackageBundles():
    res = {}
    for pkgName, bundleNames in ANGULAR_NGCC_BUNDLES + ANGULAR_NO_NGCC_BUNDLES:
        res[pkgName] = res.get(pkgName, []) + bundleNames
    return res

"""
  Gets a list of labels which resolve to the UMD bundles of the given packages.
"""

def getUmdFilePaths(packages, ngcc_artifacts):
    tmpl = "@npm//:node_modules/%s" + ("/__ivy_ngcc__" if ngcc_artifacts else "") + "/bundles/%s"
    return [
        tmpl % (pkgName, bundleName)
        for pkgName, bundleNames in packages
        for bundleName in bundleNames
    ]

ANGULAR_PACKAGE_BUNDLES = getFrameworkPackageBundles()

ANGULAR_LIBRARY_VIEW_ENGINE_UMDS = getUmdFilePaths(ANGULAR_NO_NGCC_BUNDLES, False) + \
                                   getUmdFilePaths(ANGULAR_NGCC_BUNDLES, False)

ANGULAR_LIBRARY_IVY_UMDS = getUmdFilePaths(ANGULAR_NO_NGCC_BUNDLES, False) + \
                           getUmdFilePaths(ANGULAR_NGCC_BUNDLES, True)

"""
  Gets the list of targets for the Angular library UMD bundles. Conditionally
  switches between View Engine or Ivy UMD bundles based on the
  "--config={ivy,view-engine}" flag.
"""

def getAngularUmdTargets():
    return select({
        "//tools:view_engine_mode": ANGULAR_LIBRARY_VIEW_ENGINE_UMDS,
        "//conditions:default": ANGULAR_LIBRARY_IVY_UMDS,
    })
