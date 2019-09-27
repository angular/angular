# Each individual package uses a placeholder for the version of Angular to ensure they're
# all in-sync. This map is passed to each ng_package rule to stamp out the appropriate
# version for the placeholders.
ANGULAR_PACKAGE_VERSION = "^8.0.0 || ^9.0.0-0"
MDC_PACKAGE_VERSION = "^4.0.0-alpha.0"
VERSION_PLACEHOLDER_REPLACEMENTS = {
    "0.0.0-MDC": MDC_PACKAGE_VERSION,
    "0.0.0-NG": ANGULAR_PACKAGE_VERSION,
}

# UMD bundles for Angular packages and subpackages we depend on for development and testing.
ANGULAR_LIBRARY_UMDS = [
    "@npm//:node_modules/@angular/animations/bundles/animations-browser.umd.js",
    "@npm//:node_modules/@angular/animations/bundles/animations.umd.js",
    "@npm//:node_modules/@angular/common/bundles/common-http-testing.umd.js",
    "@npm//:node_modules/@angular/common/bundles/common-http.umd.js",
    "@npm//:node_modules/@angular/common/bundles/common-testing.umd.js",
    "@npm//:node_modules/@angular/common/bundles/common.umd.js",
    "@npm//:node_modules/@angular/compiler/bundles/compiler-testing.umd.js",
    "@npm//:node_modules/@angular/compiler/bundles/compiler.umd.js",
    "@npm//:node_modules/@angular/core/bundles/core-testing.umd.js",
    "@npm//:node_modules/@angular/core/bundles/core.umd.js",
    "@npm//:node_modules/@angular/elements/bundles/elements.umd.js",
    "@npm//:node_modules/@angular/forms/bundles/forms.umd.js",
    "@npm//:node_modules/@angular/platform-browser-dynamic/bundles/platform-browser-dynamic-testing.umd.js",
    "@npm//:node_modules/@angular/platform-browser-dynamic/bundles/platform-browser-dynamic.umd.js",
    "@npm//:node_modules/@angular/platform-browser/bundles/platform-browser-animations.umd.js",
    "@npm//:node_modules/@angular/platform-browser/bundles/platform-browser-testing.umd.js",
    "@npm//:node_modules/@angular/platform-browser/bundles/platform-browser.umd.js",
    "@npm//:node_modules/@angular/router/bundles/router.umd.js",
]
