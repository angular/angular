# List of MDC packages.
MDC_PACKAGES = [
    "@material/animation",
    "@material/auto-init",
    "@material/base",
    "@material/checkbox",
    "@material/chips",
    "@material/circular-progress",
    "@material/data-table",
    "@material/dialog",
    "@material/dom",
    "@material/drawer",
    "@material/floating-label",
    "@material/form-field",
    "@material/icon-button",
    "@material/line-ripple",
    "@material/linear-progress",
    "@material/list",
    "@material/menu-surface",
    "@material/menu",
    "@material/notched-outline",
    "@material/radio",
    "@material/ripple",
    "@material/select",
    "@material/slider",
    "@material/snackbar",
    "@material/switch",
    "@material/tab-bar",
    "@material/tab-indicator",
    "@material/tab-scroller",
    "@material/tab",
    "@material/textfield",
    "@material/tooltip",
    "@material/top-app-bar",
]

ANGULAR_PACKAGES_CONFIG = [
    ("@angular/animations", struct(entry_points = ["browser"])),
    ("@angular/common", struct(entry_points = ["http/testing", "http", "testing"])),
    ("@angular/compiler", struct(entry_points = ["testing"])),
    ("@angular/core", struct(entry_points = ["testing"])),
    ("@angular/forms", struct(entry_points = [])),
    ("@angular/platform-browser", struct(entry_points = ["testing", "animations"])),
    ("@angular/platform-server", struct(entry_points = [], platform = "node")),
    ("@angular/platform-browser-dynamic", struct(entry_points = ["testing"])),
    ("@angular/router", struct(entry_points = [])),
    ("@angular/localize", struct(entry_points = ["init"])),
]

ANGULAR_PACKAGES = [
    struct(
        name = name[len("@angular/"):],
        entry_points = config.entry_points,
        platform = config.platform if hasattr(config, "platform") else "browser",
        module_name = name,
    )
    for name, config in ANGULAR_PACKAGES_CONFIG
]
