// We need to configure AMD modules which are not named because otherwise "require.js" is not
// able to resolve AMD imports to such modules.
require.config({
  paths: {
    'moment': 'moment/min/moment.min',

    // MDC Web
    '@material/animation': '@material/animation/dist/mdc.animation',
    '@material/auto-init': '@material/auto-init/dist/mdc.autoInit',
    '@material/base': '@material/base/dist/mdc.base',
    '@material/checkbox': '@material/checkbox/dist/mdc.checkbox',
    '@material/chips': '@material/chips/dist/mdc.chips',
    '@material/dialog': '@material/dialog/dist/mdc.dialog',
    '@material/dom': '@material/dom/dist/mdc.dom',
    '@material/drawer': '@material/drawer/dist/mdc.drawer',
    '@material/floating-label': '@material/floating-label/dist/mdc.floatingLabel',
    '@material/form-field': '@material/form-field/dist/mdc.formField',
    '@material/grid-list': '@material/grid-list/dist/mdc.gridList',
    '@material/icon-button': '@material/icon-button/dist/mdc.iconButton',
    '@material/line-ripple': '@material/line-ripple/dist/mdc.lineRipple',
    '@material/linear-progress': '@material/linear-progress/dist/mdc.linearProgress',
    '@material/list': '@material/list/dist/mdc.list',
    '@material/menu': '@material/menu/dist/mdc.menu',
    '@material/menu-surface': '@material/menu-surface/dist/mdc.menuSurface',
    '@material/notched-outline': '@material/notched-outline/dist/mdc.notchedOutline',
    '@material/radio': '@material/radio/dist/mdc.radio',
    '@material/ripple': '@material/ripple/dist/mdc.ripple',
    '@material/select': '@material/select/dist/mdc.select',
    '@material/slider': '@material/slider/dist/mdc.slider',
    '@material/snackbar': '@material/snackbar/dist/mdc.snackbar',
    '@material/switch': '@material/switch/dist/mdc.switch',
    '@material/tab': '@material/tab/dist/mdc.tab',
    '@material/tab-bar': '@material/tab-bar/dist/mdc.tabBar',
    '@material/tab-indicator': '@material/tab-indicator/dist/mdc.tabIndicator',
    '@material/tab-scroller': '@material/tab-scroller/dist/mdc.tabScroller',
    '@material/text-field': '@material/textfield/dist/mdc.textField',
    '@material/toolbar': '@material/toolbar/dist/mdc.toolbar',
    '@material/top-app-bar': '@material/top-app-bar/dist/mdc.topAppBar',
  }
});

// Workaround until https://github.com/angular/components/issues/13883 has been addressed.
var module = {id: ''};
