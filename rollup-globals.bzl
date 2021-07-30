load("//src/cdk:config.bzl", "CDK_ENTRYPOINTS")
load("//src/cdk-experimental:config.bzl", "CDK_EXPERIMENTAL_ENTRYPOINTS")
load("//src/material:config.bzl", "MATERIAL_ENTRYPOINTS", "MATERIAL_TESTING_ENTRYPOINTS")
load(
    "//src/material-experimental:config.bzl",
    "MATERIAL_EXPERIMENTAL_ENTRYPOINTS",
    "MATERIAL_EXPERIMENTAL_TESTING_ENTRYPOINTS",
)
load("//:packages.bzl", "MDC_PACKAGE_UMD_BUNDLES")

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
    "@angular/material-luxon-adapter": "ng.materialLuxonAdapter",
    "@angular/material-date-fns-adapter": "ng.materialDateFnsAdapter",
    "@angular/youtube-player": "ng.youtubePlayer",

    # This UMD module name would not match with anything that MDC provides, but we just
    # add this to make the linter happy. This module resolves to a type-only file anyways.
    "@material/base/types": "mdc.base.types",

    # Third-party libraries.
    "kagekiri": "kagekiri",
    "moment": "moment",
    "moment/locale/fr": "moment.locale.fr",
    "moment/locale/ja": "moment.locale.ja",
    "luxon": "luxon",
    "date-fns": "dateFns",
    "protractor": "protractor",
    "rxjs": "rxjs",
    "rxjs/operators": "rxjs.operators",
    "selenium-webdriver": "selenium-webdriver",
}

# Converts a string from dash-case to lower camel case.
def to_lower_camel_case(input):
    segments = input.split("-")
    return segments[0] + "".join([x.title() for x in segments[1:]])

# Configures the rollup globals for all MDC packages.
def setup_mdc_globals():
    for pkg_name in MDC_PACKAGE_UMD_BUNDLES:
        entry_point_name = pkg_name[len("@material/"):]
        pkg_umd_name = "mdc.%s" % to_lower_camel_case(entry_point_name)

        ROLLUP_GLOBALS.update({pkg_name: pkg_umd_name})

# Converts an entry-point name to a UMD module name.
# e.g. "snack-bar/testing" will become "snackBar.testing".
def to_umd_name(name):
    segments = name.split("/")
    return ".".join([to_lower_camel_case(x) for x in segments])

# Creates globals for a given package and its entry-points.
def create_globals(packageName, entryPoints):
    ROLLUP_GLOBALS.update({
        "@angular/%s/%s" % (packageName, ep): "ng.%s.%s" % (to_umd_name(packageName), to_umd_name(ep))
        for ep in entryPoints
    })

setup_mdc_globals()

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
create_globals("components-examples/cdk", CDK_ENTRYPOINTS)
create_globals("components-examples/cdk-experimental", CDK_EXPERIMENTAL_ENTRYPOINTS)
create_globals(
    "components-examples/material",
    MATERIAL_ENTRYPOINTS + MATERIAL_TESTING_ENTRYPOINTS,
)
create_globals(
    "components-examples/material-experimental",
    MATERIAL_EXPERIMENTAL_ENTRYPOINTS + MATERIAL_EXPERIMENTAL_TESTING_ENTRYPOINTS,
)
