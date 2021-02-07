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
  {
    path: 'cdk-experimental-combobox',
    loadChildren: 'cdk-experimental-combobox/cdk-combobox-demo-module#CdkComboboxDemoModule'
  },
  {
    path: 'cdk-experimental-listbox',
    loadChildren: 'cdk-experimental-listbox/cdk-listbox-demo-module#CdkListboxDemoModule'
  },
  {
    path: 'cdk-experimental-menu',
    loadChildren: 'cdk-experimental-menu/cdk-menu-demo-module#CdkMenuDemoModule'
  },
  {path: 'checkbox', loadChildren: 'checkbox/checkbox-demo-module#CheckboxDemoModule'},
  {path: 'chips', loadChildren: 'chips/chips-demo-module#ChipsDemoModule'},
  {path: 'clipboard', loadChildren: 'clipboard/clipboard-demo-module#ClipboardDemoModule'},
  {
    path: 'column-resize',
    loadChildren: 'column-resize/column-resize-demo-module#ColumnResizeDemoModule'
  },
  {path: 'datepicker', loadChildren: 'datepicker/datepicker-demo-module#DatepickerDemoModule'},
  {path: 'dialog', loadChildren: 'dialog/dialog-demo-module#DialogDemoModule'},
  {path: 'drawer', loadChildren: 'drawer/drawer-demo-module#DrawerDemoModule'},
  {path: 'drag-drop', loadChildren: 'drag-drop/drag-drop-demo-module#DragDropDemoModule'},
  {path: 'expansion', loadChildren: 'expansion/expansion-demo-module#ExpansionDemoModule'},
  {
    path: 'focus-origin',
    loadChildren: 'focus-origin/focus-origin-demo-module#FocusOriginDemoModule'
  },
  {path: 'focus-trap', loadChildren: 'focus-trap/focus-trap-demo-module#FocusTrapDemoModule'},
  {path: 'google-map', loadChildren: 'google-map/google-map-demo-module#GoogleMapDemoModule'},
  {path: 'grid-list', loadChildren: 'grid-list/grid-list-demo-module#GridListDemoModule'},
  {path: 'icon', loadChildren: 'icon/icon-demo-module#IconDemoModule'},
  {path: 'input', loadChildren: 'input/input-demo-module#InputDemoModule'},
  {path: 'list', loadChildren: 'list/list-demo-module#ListDemoModule'},
  {
    path: 'live-announcer',
    loadChildren: 'live-announcer/live-announcer-demo-module#LiveAnnouncerDemoModule'
  },
  {
    path: 'menubar',
    loadChildren: 'menubar/mat-menubar-demo-module#MatMenuBarDemoModule'
  },
  {
    path: 'mdc-autocomplete',
    loadChildren: 'mdc-autocomplete/mdc-autocomplete-demo-module#MdcAutocompleteDemoModule'
  },
  {path: 'mdc-button', loadChildren: 'mdc-button/mdc-button-demo-module#MdcButtonDemoModule'},
  {path: 'mdc-card', loadChildren: 'mdc-card/mdc-card-demo-module#MdcCardDemoModule'},
  {
    path: 'mdc-checkbox',
    loadChildren: 'mdc-checkbox/mdc-checkbox-demo-module#MdcCheckboxDemoModule'
  },
  {
    path: 'mdc-progress-bar',
    loadChildren: 'mdc-progress-bar/mdc-progress-bar-demo-module#MdcProgressBarDemoModule'
  },
  {path: 'mdc-chips', loadChildren: 'mdc-chips/mdc-chips-demo-module#MdcChipsDemoModule'},
  {path: 'mdc-dialog', loadChildren: 'mdc-dialog/mdc-dialog-demo-module#MdcDialogDemoModule'},
  {path: 'mdc-input', loadChildren: 'mdc-input/mdc-input-demo-module#MdcInputDemoModule'},
  {path: 'mdc-list', loadChildren: 'mdc-list/mdc-list-demo-module#MdcListDemoModule'},
  {path: 'mdc-menu', loadChildren: 'mdc-menu/mdc-menu-demo-module#MdcMenuDemoModule'},
  {
    path: 'mdc-paginator',
    loadChildren: 'mdc-paginator/mdc-paginator-demo-module#MdcPaginatorDemoModule'
  },
  {
    path: 'mdc-progress-spinner',
    loadChildren:
      'mdc-progress-spinner/mdc-progress-spinner-demo-module#MdcProgressSpinnerDemoModule'
  },
  {path: 'mdc-radio', loadChildren: 'mdc-radio/mdc-radio-demo-module#MdcRadioDemoModule'},
  {path: 'mdc-select', loadChildren: 'mdc-select/mdc-select-demo-module#MdcSelectDemoModule'},
  {path: 'mdc-sidenav', loadChildren: 'mdc-sidenav/mdc-sidenav-demo-module#MdcSidenavDemoModule'},
  {
    path: 'mdc-snack-bar',
    loadChildren: 'mdc-snack-bar/mdc-snack-bar-demo-module#MdcSnackBarDemoModule'
  },
  {
    path: 'mdc-slide-toggle',
    loadChildren: 'mdc-slide-toggle/mdc-slide-toggle-demo-module#MdcSlideToggleDemoModule'
  },
  {path: 'mdc-slider', loadChildren: 'mdc-slider/mdc-slider-demo-module#MdcSliderDemoModule'},
  {path: 'mdc-table', loadChildren: 'mdc-table/mdc-table-demo-module#MdcTableDemoModule'},
  {path: 'mdc-tabs', loadChildren: 'mdc-tabs/mdc-tabs-demo-module#MdcTabsDemoModule'},
  {path: 'mdc-tooltip', loadChildren: 'mdc-tooltip/mdc-tooltip-demo-module#MdcTooltipDemoModule'},
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
  {
    path: 'table-scroll-container',
    loadChildren:
        'table-scroll-container/table-scroll-container-demo-module#TableScrollContainerDemoModule',
  },
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
  {
    path: 'youtube-player',
    loadChildren: 'youtube-player/youtube-player-demo-module#YouTubePlayerDemoModule',
  },
  {path: 'selection', loadChildren: 'selection/selection-demo-module#SelectionDemoModule'},
  {path: 'examples', loadChildren: 'examples-page/examples-page-module#ExamplesPageModule'},
  {path: '**', component: DevApp404},
];
