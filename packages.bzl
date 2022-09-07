# Each individual package uses a placeholder for the version of Angular to ensure they're
# all in-sync. This map is passed to each ng_package rule to stamp out the appropriate
# version for the placeholders.
ANGULAR_PACKAGE_VERSION = "^15.0.0-0 || ^16.0.0"
MDC_PACKAGE_VERSION = "15.0.0-canary.10196647d.0"
TSLIB_PACKAGE_VERSION = "^2.3.0"
RXJS_PACKAGE_VERSION = "^6.5.3 || ^7.4.0"

# Each placeholder is used to stamp versions during the build process, replacing the key with it's
# value pair. These replacements occur during building of `npm_package` and `ng_package` stamping in
# the peer dependencies and versions, primarily in `package.json`s.
NPM_PACKAGE_SUBSTITUTIONS = {
    # Version of `material-components-web`
    "0.0.0-MDC": MDC_PACKAGE_VERSION,
    # Version of `@angular/core`
    "0.0.0-NG": ANGULAR_PACKAGE_VERSION,
    # Version of `tslib`
    "0.0.0-TSLIB": TSLIB_PACKAGE_VERSION,
    # Version of the local package being built, generated via the `--workspace_status_command` flag.
    "0.0.0-PLACEHOLDER": "{BUILD_SCM_VERSION}",
    # Version of `rxjs`
    "0.0.0-RXJS": RXJS_PACKAGE_VERSION,
}

NO_STAMP_NPM_PACKAGE_SUBSTITUTIONS = dict(NPM_PACKAGE_SUBSTITUTIONS, **{
    # When building NPM packages for tests (where stamping is disabled),
    # we use `0.0.0` for the version placeholder.
    "0.0.0-PLACEHOLDER": "0.0.0",
})

# List of MDC packages (used for package externals and for Sass target deps)
# *Note*: Keep in sync with `/package.json`.
MDC_PACKAGES = [
    "@material/animation",
    "@material/auto-init",
    "@material/banner",
    "@material/base",
    "@material/button",
    "@material/card",
    "@material/checkbox",
    "@material/chips",
    "@material/circular-progress",
    "@material/data-table",
    "@material/density",
    "@material/dialog",
    "@material/dom",
    "@material/drawer",
    "@material/elevation",
    "@material/fab",
    "@material/feature-targeting",
    "@material/floating-label",
    "@material/form-field",
    "@material/icon-button",
    "@material/image-list",
    "@material/layout-grid",
    "@material/line-ripple",
    "@material/linear-progress",
    "@material/list",
    "@material/menu",
    "@material/menu-surface",
    "@material/notched-outline",
    "@material/radio",
    "@material/ripple",
    "@material/rtl",
    "@material/segmented-button",
    "@material/select",
    "@material/shape",
    "@material/slider",
    "@material/snackbar",
    "@material/switch",
    "@material/tab",
    "@material/tab-bar",
    "@material/tab-indicator",
    "@material/tab-scroller",
    "@material/textfield",
    "@material/theme",
    "@material/tooltip",
    "@material/top-app-bar",
    "@material/touch-target",
    "@material/typography",
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
