# List of all components / subpackages.

CDK_PACKAGES = [
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
]

CDK_TARGETS = ["//src/cdk"] + ["//src/cdk/%s" % p for p in CDK_PACKAGES]

CDK_EXPERIMENTAL_PACKAGES = [
    "dialog",
    "popover-edit",
    "scrolling",
]

CDK_EXPERIMENTAL_TARGETS = ["//src/cdk-experimental"] + [
    "//src/cdk-experimental/%s" % p
    for p in CDK_EXPERIMENTAL_PACKAGES
]

MATERIAL_PACKAGES = [
    "autocomplete",
    "badge",
    "bottom-sheet",
    "button",
    "button-toggle",
    "card",
    "checkbox",
    "chips",
    "core",
    "datepicker",
    "dialog",
    "divider",
    "expansion",
    "form-field",
    "grid-list",
    "icon",
    "input",
    "list",
    "menu",
    "paginator",
    "progress-bar",
    "progress-spinner",
    "radio",
    "select",
    "sidenav",
    "slide-toggle",
    "slider",
    "snack-bar",
    "sort",
    "stepper",
    "table",
    "tabs",
    "toolbar",
    "tooltip",
    "tree",
]

MATERIAL_TARGETS = ["//src/material:material"] + ["//src/material/%s" % p for p in MATERIAL_PACKAGES]

# List that references the sass libraries for each Material package. This can be used to create
# the theming scss-bundle or to specify dependencies for the all-theme.scss file.
MATERIAL_SCSS_LIBS = [
    "//src/material/%s:%s_scss_lib" % (p, p.replace("-", "_"))
    for p in MATERIAL_PACKAGES
]

MATERIAL_EXPERIMENTAL_PACKAGES = [
    "mdc-button",
    "mdc-card",
    "mdc-checkbox",
    "mdc-chips",
    "mdc-helpers",
    "mdc-menu",
    "mdc-radio",
    "mdc-slide-toggle",
    "popover-edit",
]

MATERIAL_EXPERIMENTAL_TARGETS = ["//src/material-experimental"] + [
    "//src/material-experimental/%s" % p
    for p in MATERIAL_EXPERIMENTAL_PACKAGES
]

MATERIAL_EXPERIMENTAL_SCSS_LIBS = [
    "//src/material-experimental/%s:%s_scss_lib" % (p, p.replace("-", "_"))
    for p in MATERIAL_EXPERIMENTAL_PACKAGES
]

# Each individual package uses a placeholder for the version of Angular to ensure they're
# all in-sync. This map is passed to each ng_package rule to stamp out the appropriate
# version for the placeholders.
ANGULAR_PACKAGE_VERSION = "^8.0.0 || ^9.0.0-0"
MDC_PACKAGE_VERSION = "^1.1.0"
VERSION_PLACEHOLDER_REPLACEMENTS = {
    "0.0.0-NG": ANGULAR_PACKAGE_VERSION,
    "0.0.0-MDC": MDC_PACKAGE_VERSION,
}

# Base rollup globals for everything in the repo.
ROLLUP_GLOBALS = {
    "tslib": "tslib",
    "moment": "moment",
    "@angular/cdk": "ng.cdk",
    "@angular/cdk-experimental": "ng.cdkExperimental",
    "@angular/material": "ng.material",
    "@angular/material-experimental": "ng.materialExperimental",
}

# Rollup globals for cdk subpackages in the form of, e.g., {"@angular/cdk/table": "ng.cdk.table"}
ROLLUP_GLOBALS.update({
    "@angular/cdk/%s" % p: "ng.cdk.%s" % p
    for p in CDK_PACKAGES
})

# Rollup globals for cdk subpackages in the form of, e.g.,
# {"@angular/cdk-experimental/scrolling": "ng.cdkExperimental.scrolling"}
ROLLUP_GLOBALS.update({
    "@angular/cdk-experimental/%s" % p: "ng.cdkExperimental.%s" % p
    for p in CDK_EXPERIMENTAL_PACKAGES
})

# Rollup globals for material subpackages, e.g., {"@angular/material/list": "ng.material.list"}
ROLLUP_GLOBALS.update({
    "@angular/material/%s" % p: "ng.material.%s" % p
    for p in MATERIAL_PACKAGES
})

# Rollup globals for material experiemental subpackages, e.g., {"@angular/material-experimental/list": "ng.materialExperimental.list"}
ROLLUP_GLOBALS.update({
    "@angular/material-experiemntal/%s" % p: "ng.materialExperimental.%s" % p
    for p in MATERIAL_EXPERIMENTAL_PACKAGES
})

# UMD bundles for Angular packages and subpackges we depend on for development and testing.
ANGULAR_LIBRARY_UMDS = [
    "@npm//node_modules/@angular/animations:bundles/animations-browser.umd.js",
    "@npm//node_modules/@angular/animations:bundles/animations.umd.js",
    "@npm//node_modules/@angular/common:bundles/common-http-testing.umd.js",
    "@npm//node_modules/@angular/common:bundles/common-http.umd.js",
    "@npm//node_modules/@angular/common:bundles/common-testing.umd.js",
    "@npm//node_modules/@angular/common:bundles/common.umd.js",
    "@npm//node_modules/@angular/compiler:bundles/compiler-testing.umd.js",
    "@npm//node_modules/@angular/compiler:bundles/compiler.umd.js",
    "@npm//node_modules/@angular/core:bundles/core-testing.umd.js",
    "@npm//node_modules/@angular/core:bundles/core.umd.js",
    "@npm//node_modules/@angular/elements:bundles/elements.umd.js",
    "@npm//node_modules/@angular/forms:bundles/forms.umd.js",
    "@npm//node_modules/@angular/platform-browser-dynamic:bundles/platform-browser-dynamic-testing.umd.js",
    "@npm//node_modules/@angular/platform-browser-dynamic:bundles/platform-browser-dynamic.umd.js",
    "@npm//node_modules/@angular/platform-browser:bundles/platform-browser-animations.umd.js",
    "@npm//node_modules/@angular/platform-browser:bundles/platform-browser-testing.umd.js",
    "@npm//node_modules/@angular/platform-browser:bundles/platform-browser.umd.js",
    "@npm//node_modules/@angular/router:bundles/router.umd.js",
]
