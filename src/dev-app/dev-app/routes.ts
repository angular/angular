/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Routes} from '@angular/router';
import {DevApp404} from './dev-app-404';
import {DevAppHome} from './dev-app-home';

export const DEV_APP_ROUTES: Routes = [
  {path: '', component: DevAppHome},
  {
    path: 'autocomplete',
    loadChildren: 'autocomplete/autocomplete-demo-module#AutocompleteDemoModule'
  },
  {path: 'badge', loadChildren: 'badge/badge-demo-module#BadgeDemoModule'},
  {
    path: 'bottom-sheet',
    loadChildren: 'bottom-sheet/bottom-sheet-demo-module#BottomSheetDemoModule'
  },
  {path: 'baseline', loadChildren: 'baseline/baseline-demo-module#BaselineDemoModule'},
  {path: 'button', loadChildren: 'button/button-demo-module#ButtonDemoModule'},
  {
    path: 'button-toggle',
    loadChildren: 'button-toggle/button-toggle-demo-module#ButtonToggleDemoModule'
  },
  {path: 'card', loadChildren: 'card/card-demo-module#CardDemoModule'},
  {path: 'checkbox', loadChildren: 'checkbox/checkbox-demo-module#CheckboxDemoModule'},
  {path: 'chips', loadChildren: 'chips/chips-demo-module#ChipsDemoModule'},
  {path: 'datepicker', loadChildren: 'datepicker/datepicker-demo-module#DatepickerDemoModule'},
  {path: 'dialog', loadChildren: 'dialog/dialog-demo-module#DialogDemoModule'},
  {path: 'drawer', loadChildren: 'drawer/drawer-demo-module#DrawerDemoModule'},
  {path: 'drag-drop', loadChildren: 'drag-drop/drag-drop-demo-module#DragDropDemoModule'},
  {path: 'expansion', loadChildren: 'expansion/expansion-demo-module#ExpansionDemoModule'},
  {
    path: 'focus-origin',
    loadChildren: 'focus-origin/focus-origin-demo-module#FocusOriginDemoModule'
  },
  {path: 'gestures', loadChildren: 'gestures/gestures-demo-module#GesturesDemoModule'},
  {path: 'grid-list', loadChildren: 'grid-list/grid-list-demo-module#GridListDemoModule'},
  {path: 'icon', loadChildren: 'icon/icon-demo-module#IconDemoModule'},
  {path: 'input', loadChildren: 'input/input-demo-module#InputDemoModule'},
  {path: 'list', loadChildren: 'list/list-demo-module#ListDemoModule'},
  {
    path: 'live-announcer',
    loadChildren: 'live-announcer/live-announcer-demo-module#LiveAnnouncerDemoModule'
  },
  {path: 'mdc-button', loadChildren: 'mdc-button/mdc-button-demo-module#MdcButtonDemoModule'},
  {path: 'mdc-card', loadChildren: 'mdc-card/mdc-card-demo-module#MdcCardDemoModule'},
  {
    path: 'mdc-checkbox',
    loadChildren: 'mdc-checkbox/mdc-checkbox-demo-module#MdcCheckboxDemoModule'
  },
  {path: 'mdc-chips', loadChildren: 'mdc-chips/mdc-chips-demo-module#MdcChipsDemoModule'},
  {path: 'mdc-menu', loadChildren: 'mdc-menu/mdc-menu-demo-module#MdcMenuDemoModule'},
  {path: 'mdc-radio', loadChildren: 'mdc-radio/mdc-radio-demo-module#MdcRadioDemoModule'},
  {
    path: 'mdc-slide-toggle',
    loadChildren: 'mdc-slide-toggle/mdc-slide-toggle-demo-module#MdcSlideToggleDemoModule'
  },
  {path: 'mdc-tabs', loadChildren: 'mdc-tabs/mdc-tabs-demo-module#MdcTabsDemoModule'},
  {path: 'menu', loadChildren: 'menu/menu-demo-module#MenuDemoModule'},
  {path: 'paginator', loadChildren: 'paginator/paginator-demo-module#PaginatorDemoModule'},
  {path: 'platform', loadChildren: 'platform/platform-demo-module#PlatformDemoModule'},
  {
    path: 'popover-edit',
    loadChildren: 'popover-edit/popover-edit-demo-module#PopoverEditDemoModule'
  },
  {path: 'portal', loadChildren: 'portal/portal-demo-module#PortalDemoModule'},
  {
    path: 'progress-bar',
    loadChildren: 'progress-bar/progress-bar-demo-module#ProgressBarDemoModule'
  },
  {
    path: 'progress-spinner',
    loadChildren: 'progress-spinner/progress-spinner-demo-module#ProgressSpinnerDemoModule'
  },
  {path: 'radio', loadChildren: 'radio/radio-demo-module#RadioDemoModule'},
  {path: 'ripple', loadChildren: 'ripple/ripple-demo-module#RippleDemoModule'},
  {path: 'select', loadChildren: 'select/select-demo-module#SelectDemoModule'},
  {path: 'sidenav', loadChildren: 'sidenav/sidenav-demo-module#SidenavDemoModule'},
  {
    path: 'slide-toggle',
    loadChildren: 'slide-toggle/slide-toggle-demo-module#SlideToggleDemoModule'
  },
  {path: 'slider', loadChildren: 'slider/slider-demo-module#SliderDemoModule'},
  {path: 'snack-bar', loadChildren: 'snack-bar/snack-bar-demo-module#SnackBarDemoModule'},
  {path: 'stepper', loadChildren: 'stepper/stepper-demo-module#StepperDemoModule'},
  {path: 'table', loadChildren: 'table/table-demo-module#TableDemoModule'},
  {path: 'tabs', loadChildren: 'tabs/tabs-demo-module#TabsDemoModule'},
  {path: 'toolbar', loadChildren: 'toolbar/toolbar-demo-module#ToolbarDemoModule'},
  {path: 'tooltip', loadChildren: 'tooltip/tooltip-demo-module#TooltipDemoModule'},
  {path: 'tree', loadChildren: 'tree/tree-demo-module#TreeDemoModule'},
  {path: 'typography', loadChildren: 'typography/typography-demo-module#TypographyDemoModule'},
  {path: 'screen-type', loadChildren: 'screen-type/screen-type-demo-module#ScreenTypeDemoModule'},
  {
    path: 'connected-overlay',
    loadChildren: 'connected-overlay/connected-overlay-demo-module#ConnectedOverlayDemoModule'
  },
  {
    path: 'virtual-scroll',
    loadChildren: 'virtual-scroll/virtual-scroll-demo-module#VirtualScrollDemoModule'
  },
  {path: 'examples', loadChildren: 'examples-page/examples-page-module#ExamplesPageModule'},
  {path: '**', component: DevApp404},
];
