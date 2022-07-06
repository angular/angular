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
    "@angular/bazel",
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
