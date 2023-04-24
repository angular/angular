# Copyright Google LLC All Rights Reserved.
#
# Use of this source code is governed by an MIT-style license that can be
# found in the LICENSE file at https://angular.io/license
"""Packages published to npm"""

def to_package_label(package_name):
    """Get a label corresponding to the npm_package target for the package name"""
    if package_name == "angular-in-memory-web-api":
        return "//packages/misc/angular-in-memory-web-api:npm_package"

    return "//packages/{package_name}:npm_package".format(package_name = package_name.replace("@angular/", ""))

def _exclude_pkgs(packages, *args):
    modified_packages = packages[:]
    for pkg in args:
        modified_packages.remove(pkg)
    return modified_packages

# All framework packages published to NPM.
ALL_PACKAGES = [
    "@angular/animations",
    "@angular/benchpress",
    "@angular/common",
    "@angular/compiler",
    "@angular/compiler-cli",
    "@angular/core",
    "@angular/elements",
    "@angular/forms",
    "@angular/language-service",
    "@angular/localize",
    "@angular/platform-browser",
    "@angular/platform-browser-dynamic",
    "@angular/platform-server",
    "@angular/router",
    "@angular/service-worker",
    "@angular/upgrade",
    "angular-in-memory-web-api",
    "zone.js",
]

# Packages used by integration tests
INTEGRATION_PACKAGES = _exclude_pkgs(ALL_PACKAGES, "angular-in-memory-web-api")

# Packages used by example e2e tests
AIO_EXAMPLE_PACKAGES = _exclude_pkgs(ALL_PACKAGES, "@angular/benchpress")

# Package names under //packages that have `files_for_docgen` targets
# including files needed for AIO doc generation.
DOCS_ENTRYPOINTS = [
    "animations",
    "animations/browser",
    "animations/browser/testing",
    "common",
    "common/http",
    "common/http/testing",
    "common/testing",
    "common/upgrade",
    "compiler",
    "core",
    "core/src/compiler",
    "core/src/di/interface",
    "core/src/interface",
    "core/src/reflection",
    "core/src/util",
    "core/testing",
    "elements",
    "examples/common",
    "examples/core",
    "examples/core/di/ts/forward_ref",
    "examples/core/testing/ts",
    "examples/forms",
    "examples/platform-browser",
    "examples/router/activated-route",
    "examples/router/testing",
    "examples/router",
    "examples/service-worker/push",
    "examples/service-worker/registration-options",
    "examples/test-utils",
    "examples/testing",
    "examples/upgrade/static/ts/full",
    "examples/upgrade/static/ts/lite",
    "examples/upgrade/static/ts/lite-multi",
    "examples/upgrade/static/ts/lite-multi-shared",
    "forms",
    "localize",
    "localize/init",
    "localize/src/localize",
    "localize/src/utils",
    "platform-browser",
    "platform-browser-dynamic",
    "platform-browser-dynamic/testing",
    "platform-browser/animations",
    "platform-browser/testing",
    "platform-server",
    "platform-server/init",
    "platform-server/testing",
    "router",
    "router/testing",
    "router/upgrade",
    "service-worker",
    "upgrade",
    "upgrade/src/common",
    "upgrade/static",
    "upgrade/static/testing",
]
