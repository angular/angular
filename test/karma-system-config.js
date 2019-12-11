// Configure the base path and map the different node packages.
System.config({
  baseURL: '/base',
  paths: {'node:*': 'node_modules/*'},
  map: {
    'rxjs': 'node:rxjs',
    'tslib': 'node:tslib/tslib.js',
    'moment': 'node:moment/min/moment-with-locales.min.js',

    // MDC Web
    '@material/animation': 'node:@material/animation/dist/mdc.animation.js',
    '@material/auto-init': 'node:@material/auto-init/dist/mdc.autoInit.js',
    '@material/base': 'node:@material/base/dist/mdc.base.js',
    '@material/checkbox': 'node:@material/checkbox/dist/mdc.checkbox.js',
    '@material/chips': 'node:@material/chips/dist/mdc.chips.js',
    '@material/dialog': 'node:@material/dialog/dist/mdc.dialog.js',
    '@material/dom': 'node:@material/dom/dist/mdc.dom.js',
    '@material/drawer': 'node:@material/drawer/dist/mdc.drawer.js',
    '@material/floating-label': 'node:@material/floating-label/dist/mdc.floatingLabel.js',
    '@material/form-field': 'node:@material/form-field/dist/mdc.formField.js',
    '@material/grid-list': 'node:@material/grid-list/dist/mdc.gridList.js',
    '@material/icon-button': 'node:@material/icon-button/dist/mdc.iconButton.js',
    '@material/line-ripple': 'node:@material/line-ripple/dist/mdc.lineRipple.js',
    '@material/linear-progress': 'node:@material/linear-progress/dist/mdc.linearProgress.js',
    '@material/list': 'node:@material/list/dist/mdc.list.js',
    '@material/menu': 'node:@material/menu/dist/mdc.menu.js',
    '@material/menu-surface': 'node:@material/menu-surface/dist/mdc.menuSurface.js',
    '@material/notched-outline': 'node:@material/notched-outline/dist/mdc.notchedOutline.js',
    '@material/radio': 'node:@material/radio/dist/mdc.radio.js',
    '@material/ripple': 'node:@material/ripple/dist/mdc.ripple.js',
    '@material/select': 'node:@material/select/dist/mdc.select.js',
    '@material/slider': 'node:@material/slider/dist/mdc.slider.js',
    '@material/snackbar': 'node:@material/snackbar/dist/mdc.snackbar.js',
    '@material/switch': 'node:@material/switch/dist/mdc.switch.js',
    '@material/tab': 'node:@material/tab/dist/mdc.tab.js',
    '@material/tab-bar': 'node:@material/tab-bar/dist/mdc.tabBar.js',
    '@material/tab-indicator': 'node:@material/tab-indicator/dist/mdc.tabIndicator.js',
    '@material/tab-scroller': 'node:@material/tab-scroller/dist/mdc.tabScroller.js',
    '@material/text-field': 'node:@material/textfield/dist/mdc.textField.js',
    '@material/top-app-bar': 'node:@material/top-app-bar/dist/mdc.topAppBar.js',

    // Angular specific mappings.
    '@angular/core': 'node:@angular/core/__ivy_ngcc__/bundles/core.umd.js',
    '@angular/core/testing': 'node:@angular/core/__ivy_ngcc__/bundles/core-testing.umd.js',
    '@angular/common': 'node:@angular/common/__ivy_ngcc__/bundles/common.umd.js',
    '@angular/common/testing': 'node:@angular/common/__ivy_ngcc__/bundles/common-testing.umd.js',
    '@angular/common/http': 'node:@angular/common/__ivy_ngcc__/bundles/common-http.umd.js',
    '@angular/common/http/testing': 'node:@angular/common/__ivy_ngcc__/bundles/common-http-testing.umd.js',
    '@angular/compiler': 'node:@angular/compiler/bundles/compiler.umd.js',
    '@angular/compiler/testing': 'node:@angular/compiler/__ivy_ngcc__/bundles/compiler-testing.umd.js',
    '@angular/forms': 'node:@angular/forms/__ivy_ngcc__/bundles/forms.umd.js',
    '@angular/forms/testing': 'node:@angular/forms/__ivy_ngcc__/bundles/forms-testing.umd.js',
    '@angular/animations': 'node:@angular/animations/__ivy_ngcc__/bundles/animations.umd.js',
    '@angular/animations/browser':
        'node:@angular/animations/__ivy_ngcc__/bundles/animations-browser.umd.js',
    '@angular/platform-browser/animations':
        'node:@angular/platform-browser/__ivy_ngcc__/bundles/platform-browser-animations.umd.js',
    '@angular/platform-browser':
        'node:@angular/platform-browser/__ivy_ngcc__/bundles/platform-browser.umd.js',
    '@angular/platform-browser/testing':
        'node:@angular/platform-browser/__ivy_ngcc__/bundles/platform-browser-testing.umd.js',
    '@angular/platform-browser-dynamic':
        'node:@angular/platform-browser-dynamic/__ivy_ngcc__/bundles/platform-browser-dynamic.umd.js',
    '@angular/platform-browser-dynamic/testing':
        'node:@angular/platform-browser-dynamic/__ivy_ngcc__/bundles/platform-browser-dynamic-testing.umd.js',

    // Path mappings for local packages that can be imported inside of tests.
    '@angular/material': 'dist/packages/material/index.js',
    '@angular/material-experimental': 'dist/packages/material-experimental/index.js',
    '@angular/cdk-experimental': 'dist/packages/cdk-experimental/index.js',

    '@angular/cdk': 'dist/packages/cdk/index.js',
    '@angular/cdk/a11y': 'dist/packages/cdk/a11y/index.js',
    '@angular/cdk/accordion': 'dist/packages/cdk/accordion/index.js',
    '@angular/cdk/bidi': 'dist/packages/cdk/bidi/index.js',
    '@angular/cdk/cliboard': 'dist/packages/cdk/cliboard/index.js',
    '@angular/cdk/coercion': 'dist/packages/cdk/coercion/index.js',
    '@angular/cdk/collections': 'dist/packages/cdk/collections/index.js',
    '@angular/cdk/drag-drop': 'dist/packages/cdk/drag-drop/index.js',
    '@angular/cdk/testing/private': 'dist/packages/cdk/testing/private/index.js',
    '@angular/cdk/keycodes': 'dist/packages/cdk/keycodes/index.js',
    '@angular/cdk/layout': 'dist/packages/cdk/layout/index.js',
    '@angular/cdk/observers': 'dist/packages/cdk/observers/index.js',
    '@angular/cdk/overlay': 'dist/packages/cdk/overlay/index.js',
    '@angular/cdk/platform': 'dist/packages/cdk/platform/index.js',
    '@angular/cdk/portal': 'dist/packages/cdk/portal/index.js',
    '@angular/cdk/scrolling': 'dist/packages/cdk/scrolling/index.js',
    '@angular/cdk/stepper': 'dist/packages/cdk/stepper/index.js',
    '@angular/cdk/table': 'dist/packages/cdk/table/index.js',
    '@angular/cdk/testing': 'dist/packages/cdk/testing/index.js',
    '@angular/cdk/testing/testbed': 'dist/packages/cdk/testing/testbed/index.js',
    '@angular/cdk/testing/protractor': 'dist/packages/cdk/testing/protractor/index.js',
    '@angular/cdk/text-field': 'dist/packages/cdk/text-field/index.js',
    '@angular/cdk/tree': 'dist/packages/cdk/tree/index.js',

    '@angular/cdk-experimental/dialog': 'dist/packages/cdk-experimental/dialog/index.js',
    '@angular/cdk-experimental/popover-edit': 'dist/packages/cdk-experimental/popover-edit/index.js',
    '@angular/cdk-experimental/scrolling': 'dist/packages/cdk-experimental/scrolling/index.js',

    '@angular/material/autocomplete': 'dist/packages/material/autocomplete/index.js',
    '@angular/material/autocomplete/testing': 'dist/packages/material/autocomplete/testing/index.js',
    '@angular/material/autocomplete/testing/shared.spec': 'dist/packages/material/autocomplete/testing/shared.spec.js',
    '@angular/material/badge': 'dist/packages/material/badge/index.js',
    '@angular/material/badge/testing': 'dist/packages/material/badge/testing/index.js',
    '@angular/material/badge/testing/shared.spec': 'dist/packages/material/badge/testing/shared.spec.js',
    '@angular/material/bottom-sheet': 'dist/packages/material/bottom-sheet/index.js',
    '@angular/material/bottom-sheet/testing': 'dist/packages/material/bottom-sheet/testing/index.js',
    '@angular/material/bottom-sheet/testing/shared.spec': 'dist/packages/material/bottom-sheet/testing/shared.spec.js',
    '@angular/material/button': 'dist/packages/material/button/index.js',
    '@angular/material/button/testing': 'dist/packages/material/button/testing/index.js',
    '@angular/material/button/testing/shared.spec': 'dist/packages/material/button/testing/shared.spec.js',
    '@angular/material/button-toggle': 'dist/packages/material/button-toggle/index.js',
    '@angular/material/card': 'dist/packages/material/card/index.js',
    '@angular/material/checkbox': 'dist/packages/material/checkbox/index.js',
    '@angular/material/checkbox/testing': 'dist/packages/material/checkbox/testing/index.js',
    '@angular/material/checkbox/testing/shared.spec': 'dist/packages/material/checkbox/testing/shared.spec.js',
    '@angular/material/chips': 'dist/packages/material/chips/index.js',
    '@angular/material/core': 'dist/packages/material/core/index.js',
    '@angular/material/datepicker': 'dist/packages/material/datepicker/index.js',
    '@angular/material/dialog': 'dist/packages/material/dialog/index.js',
    '@angular/material/dialog/testing': 'dist/packages/material/dialog/testing/index.js',
    '@angular/material/dialog/testing/shared.spec': 'dist/packages/material/dialog/testing/shared.spec.js',
    '@angular/material/divider': 'dist/packages/material/divider/index.js',
    '@angular/material/divider/testing': 'dist/packages/material/divider/testing/index.js',
    '@angular/material/expansion': 'dist/packages/material/expansion/index.js',
    '@angular/material/form-field': 'dist/packages/material/form-field/index.js',
    '@angular/material/grid-list': 'dist/packages/material/grid-list/index.js',
    '@angular/material/icon': 'dist/packages/material/icon/index.js',
    '@angular/material/input': 'dist/packages/material/input/index.js',
    '@angular/material/list': 'dist/packages/material/list/index.js',
    '@angular/material/list/testing': 'dist/packages/material/list/testing/index.js',
    '@angular/material/menu': 'dist/packages/material/menu/index.js',
    '@angular/material/menu/testing': 'dist/packages/material/menu/testing/index.js',
    '@angular/material/menu/testing/shared.spec': 'dist/packages/material/menu/testing/shared.spec.js',
    '@angular/material/paginator': 'dist/packages/material/paginator/index.js',
    '@angular/material/progress-bar': 'dist/packages/material/progress-bar/index.js',
    '@angular/material/progress-bar/testing': 'dist/packages/material/progress-bar/testing/index.js',
    '@angular/material/progress-bar/testing/shared.spec': 'dist/packages/material/progress-bar/testing/shared.spec.js',
    '@angular/material/progress-spinner': 'dist/packages/material/progress-spinner/index.js',
    '@angular/material/progress-spinner/testing': 'dist/packages/material/progress-spinner/testing/index.js',
    '@angular/material/progress-spinner/testing/shared.spec': 'dist/packages/material/progress-spinner/testing/shared.spec.js',
    '@angular/material/radio': 'dist/packages/material/radio/index.js',
    '@angular/material/radio/testing': 'dist/packages/material/radio/testing/index.js',
    '@angular/material/radio/testing/shared.spec': 'dist/packages/material/radio/testing/shared.spec.js',
    '@angular/material/select': 'dist/packages/material/select/index.js',
    '@angular/material/sidenav': 'dist/packages/material/sidenav/index.js',
    '@angular/material/sidenav/testing': 'dist/packages/material/sidenav/testing/index.js',
    '@angular/material/sidenav/testing/shared.spec': 'dist/packages/material/sidenav/testing/shared.spec.js',
    '@angular/material/slide-toggle': 'dist/packages/material/slide-toggle/index.js',
    '@angular/material/slide-toggle/testing': 'dist/packages/material/slide-toggle/testing/index.js',
    '@angular/material/slide-toggle/testing/shared.spec': 'dist/packages/material/slide-toggle/testing/shared.spec.js',
    '@angular/material/slider': 'dist/packages/material/slider/index.js',
    '@angular/material/slider/testing': 'dist/packages/material/slider/testing/index.js',
    '@angular/material/slider/testing/shared.spec': 'dist/packages/material/slider/testing/shared.spec.js',
    '@angular/material/snack-bar': 'dist/packages/material/snack-bar/index.js',
    '@angular/material/snack-bar/testing': 'dist/packages/material/snack-bar/testing/index.js',
    '@angular/material/snack-bar/testing/shared.spec': 'dist/packages/material/snack-bar/testing/shared.spec.js',
    '@angular/material/sort': 'dist/packages/material/sort/index.js',
    '@angular/material/sort/testing': 'dist/packages/material/sort/testing/index.js',
    '@angular/material/sort/testing/shared.spec': 'dist/packages/material/sort/testing/shared.spec.js',
    '@angular/material/stepper': 'dist/packages/material/stepper/index.js',
    '@angular/material/table': 'dist/packages/material/table/index.js',
    '@angular/material/tabs': 'dist/packages/material/tabs/index.js',
    '@angular/material/tabs/testing': 'dist/packages/material/tabs/testing/index.js',
    '@angular/material/tabs/testing/shared.spec': 'dist/packages/material/tabs/testing/shared.spec.js',
    '@angular/material/testing': 'dist/packages/material/testing/index.js',
    '@angular/material/toolbar': 'dist/packages/material/toolbar/index.js',
    '@angular/material/tooltip': 'dist/packages/material/tooltip/index.js',
    '@angular/material/tree': 'dist/packages/material/tree/index.js',

    '@angular/material/form-field/testing':
      'dist/packages/material/form-field/testing/index.js',
    '@angular/material/form-field/testing/control':
      'dist/packages/material/form-field/testing/control/index.js',
    '@angular/material/form-field/testing/shared.spec':
      'dist/packages/material/form-field/testing/shared.spec.js',
    '@angular/material/input/testing':
        'dist/packages/material/input/testing/index.js',
    '@angular/material-experimental/mdc-autocomplete':
        'dist/packages/material-experimental/mdc-autocomplete/index.js',
    '@angular/material-experimental/mdc-button':
        'dist/packages/material-experimental/mdc-button/index.js',
    '@angular/material-experimental/mdc-card':
        'dist/packages/material-experimental/mdc-card/index.js',
    '@angular/material-experimental/mdc-checkbox':
        'dist/packages/material-experimental/mdc-checkbox/index.js',
    '@angular/material-experimental/mdc-chips':
        'dist/packages/material-experimental/mdc-chips/index.js',
    '@angular/material-experimental/mdc-helpers':
        'dist/packages/material-experimental/mdc-helpers/index.js',
    '@angular/material-experimental/mdc-list':
        'dist/packages/material-experimental/mdc-list/index.js',
    '@angular/material-experimental/mdc-menu':
        'dist/packages/material-experimental/mdc-menu/index.js',
    '@angular/material-experimental/mdc-radio':
        'dist/packages/material-experimental/mdc-radio/index.js',
    '@angular/material-experimental/mdc-snackbar':
        'dist/packages/material-experimental/mdc-snackbar/index.js',
    '@angular/material-experimental/mdc-slide-toggle':
        'dist/packages/material-experimental/mdc-slide-toggle/index.js',
    '@angular/material-experimental/mdc-slider':
      'dist/packages/material-experimental/mdc-slider/index.js',
    '@angular/material-experimental/mdc-tabs':
        'dist/packages/material-experimental/mdc-tabs/index.js',
    '@angular/material-experimental/mdc-progress-bar':
        'dist/packages/material-experimental/mdc-progress-bar/index.js',
    '@angular/material-experimental/popover-edit':
        'dist/packages/material-experimental/popover-edit/index.js',
    '@angular/material/select/testing':
      'dist/packages/material/select/testing/index.js',
    '@angular/material/select/testing/shared.spec':
      'dist/packages/material/select/testing/shared.spec.js',
  },
  packages: {
    // Thirdparty barrels.
    'rxjs': {main: 'index'},
    'rxjs/operators': {main: 'index'},

    // Needed for relative imports inside the testing package to work.
    'dist/packages/cdk/testing/testbed/fake-events': {main: 'index'},

    // Set the default extension for the root package, because otherwise the tests can't
    // be built within the production mode. Due to missing file extensions.
    '.': {defaultExtension: 'js'}
  }
});
