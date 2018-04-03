# List of all components / subpackages.

CDK_PACKAGES = [
  "coercion",
  "keycodes",
  "scrolling",
  "accordion",
  "observers",
  "a11y",
  "overlay",
  "platform",
  "bidi",
  "table",
  "tree",
  "portal",
  "layout",
  "stepper",
  "text-field",
  "collections",
]

CDK_TARGETS = ["//src/cdk"] + ["//src/cdk/%s" % p for p in CDK_PACKAGES]

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

MATERIAL_TARGETS = ["//src/lib:material"] + ["//src/lib/%s" % p for p in MATERIAL_PACKAGES]

# Base rollup globals for everything in the repo.
ROLLUP_GLOBALS = {
  'tslib': 'tslib',
  'moment': 'moment',
  '@angular/cdk': 'ng.cdk',
  '@angular/cdk-experimental': 'ng.cdkExperimental',
  '@angular/material': 'ng.material',
  '@angular/material-experimental': 'ng.materialExperimental',
}

# Rollup globals for cdk subpackages in the form of, e.g., {"@angular/cdk/table": "ng.cdk.table"}
ROLLUP_GLOBALS.update({
  "@angular/cdk/%s" % p: "ng.cdk.%s" % p for p in CDK_PACKAGES
})

# Rollup globals for material subpackages, e.g., {"@angular/material/list": "ng.material.list"}
ROLLUP_GLOBALS.update({
  "@angular/material/%s" % p: "ng.material.%s" % p for p in MATERIAL_PACKAGES
})
