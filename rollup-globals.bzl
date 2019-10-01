load("//src/cdk:config.bzl", "CDK_ENTRYPOINTS")
load("//src/cdk-experimental:config.bzl", "CDK_EXPERIMENTAL_ENTRYPOINTS")
load("//src/material:config.bzl", "MATERIAL_ENTRYPOINTS", "MATERIAL_TESTING_ENTRYPOINTS")
load(
    "//src/material-experimental:config.bzl",
    "MATERIAL_EXPERIMENTAL_ENTRYPOINTS",
    "MATERIAL_EXPERIMENTAL_TESTING_ENTRYPOINTS",
)

# Base rollup globals for everything in the repo. Note that we want to disable
# sorting of the globals as we manually group dict entries.
# buildifier: disable=unsorted-dict-items
ROLLUP_GLOBALS = {
    # Framework packages.
    "@angular/animations": "ng.animations",
    "@angular/common": "ng.common",
    "@angular/common/http": "ng.common.http",
    "@angular/common/http/testing": "ng.common.http.testing",
    "@angular/common/testing": "ng.common.testing",
    "@angular/core": "ng.core",
    "@angular/core/testing": "ng.core.testing",
    "@angular/forms": "ng.forms",
    "@angular/platform-browser": "ng.platformBrowser",
    "@angular/platform-browser-dynamic": "ng.platformBrowserDynamic",
    "@angular/platform-browser-dynamic/testing": "ng.platformBrowserDynamic.testing",
    "@angular/platform-browser/animations": "ng.platformBrowser.animations",
    "@angular/platform-server": "ng.platformServer",
    "@angular/router": "ng.router",

    # Primary entry-points in the project.
    "@angular/cdk": "ng.cdk",
    "@angular/cdk-experimental": "ng.cdkExperimental",
    "@angular/google-maps": "ng.googleMaps",
    "@angular/material": "ng.material",
    "@angular/material-experimental": "ng.materialExperimental",
    "@angular/material-moment-adapter": "ng.materialMomentAdapter",
    "@angular/youtube-player": "ng.youtubePlayer",

    # MDC Web
    "@material/animation": "mdc.animation",
    "@material/auto-init": "mdc.autoInit",
    "@material/base": "mdc.base",
    "@material/checkbox": "mdc.checkbox",
    "@material/chips": "mdc.chips",
    "@material/dialog": "mdc.dialog",
    "@material/dom": "mdc.dom",
    "@material/drawer": "mdc.drawer",
    "@material/floating-label": "mdc.floatingLabel",
    "@material/form-field": "mdc.formField",
    "@material/grid-list": "mdc.gridList",
    "@material/icon-button": "mdc.iconButton",
    "@material/line-ripple": "mdc.lineRipple",
    "@material/linear-progress": "mdc.linearProgress",
    "@material/list": "mdc.list",
    "@material/menu": "mdc.menu",
    "@material/menu-surface": "mdc.menuSurface",
    "@material/notched-outline": "mdc.notchedOutline",
    "@material/radio": "mdc.radio",
    "@material/ripple": "mdc.ripple",
    "@material/select": "mdc.select",
    "@material/slider": "mdc.slider",
    "@material/snackbar": "mdc.snackbar",
    "@material/switch": "mdc.switch",
    "@material/tab": "mdc.tab",
    "@material/tab-bar": "mdc.tabBar",
    "@material/tab-indicator": "mdc.tabIndicator",
    "@material/tab-scroller": "mdc.tabScroller",
    "@material/text-field": "mdc.textField",
    "@material/top-app-bar": "mdc.topAppBar",

    # Third-party libraries.
    "moment": "moment",
    "protractor": "protractor",
    "rxjs": "rxjs",
    "rxjs/operators": "rxjs.operators",
    "tslib": "tslib",
}

# Converts a string from dash-case to lower camel case.
def to_camel_case(input):
    segments = input.split("-")
    return segments[0] + "".join([x.title() for x in segments[1:]])

# Converts an entry-point name to a UMD module name.
# e.g. "snack-bar/testing" will become "snackBar.testing".
def to_umd_name(name):
    segments = name.split("/")
    return ".".join([to_camel_case(x) for x in segments])

# Creates globals for a given package and its entry-points.
def create_globals(packageName, entryPoints):
    ROLLUP_GLOBALS.update({
        "@angular/%s/%s" % (packageName, ep): "ng.%s.%s" % (to_umd_name(packageName), to_umd_name(ep))
        for ep in entryPoints
    })

create_globals("cdk", CDK_ENTRYPOINTS)
create_globals("cdk-experimental", CDK_EXPERIMENTAL_ENTRYPOINTS)
create_globals("material", MATERIAL_ENTRYPOINTS + MATERIAL_TESTING_ENTRYPOINTS)
create_globals(
    "material-experimental",
    MATERIAL_EXPERIMENTAL_ENTRYPOINTS + MATERIAL_EXPERIMENTAL_TESTING_ENTRYPOINTS,
)

# Rollup globals the examples package. Since individual examples are
# grouped by package and component, the primary entry-point imports
# from entry-points which should be treated as external imports.
create_globals("material-examples/cdk", CDK_ENTRYPOINTS)
create_globals("material-examples/cdk-experimental", CDK_EXPERIMENTAL_ENTRYPOINTS)
create_globals(
    "material-examples/material",
    MATERIAL_ENTRYPOINTS + MATERIAL_TESTING_ENTRYPOINTS,
)
create_globals(
    "material-examples/material-experimental",
    MATERIAL_EXPERIMENTAL_ENTRYPOINTS + MATERIAL_EXPERIMENTAL_TESTING_ENTRYPOINTS,
)
