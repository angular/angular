# Copyright Google LLC All Rights Reserved.
#
# Use of this source code is governed by an MIT-style license that can be
# found in the LICENSE file at https://angular.dev/license
"""Packages published to npm"""

def to_package_label(package_name):
    """Get a label corresponding to the npm_package target for the package name"""
    if package_name == "angular-in-memory-web-api":
        return "//packages/misc/angular-in-memory-web-api:npm_package"

    if package_name == "@angular/docs":
        return "//adev/shared-docs:pkg"

    return "//packages/{package_name}:npm_package".format(package_name = package_name.replace("@angular/", ""))

def _exclude_pkgs(packages, *args):
    modified_packages = packages[:]
    for pkg in args:
        modified_packages.remove(pkg)
    return modified_packages

# All framework packages published to NPM.
PUBLISHED_PACKAGES = [
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

# All packages in the repository which are not published to NPM
UNPUBLISHED_PACKAGES = [
    "@angular/docs",
]

ALL_PACKAGES = PUBLISHED_PACKAGES + UNPUBLISHED_PACKAGES

# Packages used by integration tests
INTEGRATION_PACKAGES = _exclude_pkgs(PUBLISHED_PACKAGES, "angular-in-memory-web-api")

# Package names under //packages that have `files_for_docgen` targets
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
    "core/rxjs-interop",
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
    "platform-browser/animations/async",
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
