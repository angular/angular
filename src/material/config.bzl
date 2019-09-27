entryPoints = [
    "autocomplete",
    "autocomplete/testing",
    "badge",
    "bottom-sheet",
    "button",
    "button/testing",
    "button-toggle",
    "card",
    "checkbox",
    "checkbox/testing",
    "chips",
    "core",
    "datepicker",
    "dialog",
    "dialog/testing",
    "divider",
    "expansion",
    "form-field",
    "grid-list",
    "icon",
    "input",
    "list",
    "menu",
    "menu/testing",
    "paginator",
    "progress-bar",
    "progress-bar/testing",
    "progress-spinner",
    "progress-spinner/testing",
    "radio",
    "radio/testing",
    "select",
    "sidenav",
    "sidenav/testing",
    "slide-toggle",
    "slide-toggle/testing",
    "slider",
    "slider/testing",
    "snack-bar",
    "snack-bar/testing",
    "sort",
    "stepper",
    "table",
    "tabs",
    "tabs/testing",
    "toolbar",
    "tooltip",
    "tree",
]

# List of all non-testing entry-points of the Angular Material package.
MATERIAL_ENTRYPOINTS = [
    ep
    for ep in entryPoints
    if not ep.endswith("/testing")
]

# List of all testing entry-points of the Angular Material package.
MATERIAL_TESTING_ENTRYPOINTS = [
    ep
    for ep in entryPoints
    if not ep in MATERIAL_ENTRYPOINTS
]

# List of all non-testing entry-point targets of the Angular Material package.
MATERIAL_TARGETS = ["//src/material"] + \
                   ["//src/material/%s" % ep for ep in MATERIAL_ENTRYPOINTS]

# List of all testing entry-point targets of the Angular Material package.
MATERIAL_TESTING_TARGETS = ["//src/material/%s" % ep for ep in MATERIAL_TESTING_ENTRYPOINTS]

# List that references the sass libraries for each Material non-testing entry-point. This
# can be used to specify dependencies for the "all-theme.scss" file in core.
MATERIAL_SCSS_LIBS = [
    "//src/material/%s:%s_scss_lib" % (ep, ep.replace("-", "_"))
    for ep in MATERIAL_ENTRYPOINTS
]
