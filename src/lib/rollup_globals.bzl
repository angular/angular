load("//:packages.bzl", "MATERIAL_PACKAGES")

# Base rollup globals for dependencies and the root entry-point.
MATERIAL_ROLLUP_GLOBALS = {
  'tslib': 'tslib',
  '@angular/material': 'ng.material',
}

# Rollup globals for subpackages, e.g., {"@angular/material/list": "ng.material.list"}
MATERIAL_ROLLUP_GLOBALS.update({
  "@angular/material/%s" % p: "ng.material.%s" % p for p in MATERIAL_PACKAGES
})
