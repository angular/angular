_CDK_ENTRY_POINTS = [
    "scrolling",
    "tree",
    "keycodes",
    "collections",
    "overlay",
    "table",
    "text-field",
    "accordion",
    "drag-drop",
    "a11y",
    "platform",
]

_MATERIAL_ENTRY_POINTS = [
    "dialog",
    "menu",
    "slide-toggle",
    "grid-list",
    "tree",
    "expansion",
    "checkbox",
    "select",
    "input",
    "button",
    "core",
    "progress-bar",
    "snack-bar",
    "icon",
    "progress-spinner",
    "tabs",
    "card",
    "form-field",
    "tooltip",
    "toolbar",
]

ANGULAR_PACKAGES_CONFIG = [
    ("@angular/cdk", struct(entry_points = _CDK_ENTRY_POINTS)),
    ("@angular/material", struct(entry_points = _MATERIAL_ENTRY_POINTS)),
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
