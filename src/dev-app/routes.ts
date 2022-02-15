/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Routes} from '@angular/router';
import {DevApp404} from './dev-app/dev-app-404';
import {DevAppHome} from './dev-app/dev-app-home';

export const DEV_APP_ROUTES: Routes = [
  {path: '', component: DevAppHome},
  {
    path: 'autocomplete',
    loadChildren: () =>
      import('./autocomplete/autocomplete-demo-module').then(m => m.AutocompleteDemoModule),
  },
  {
    path: 'badge',
    loadChildren: () => import('./badge/badge-demo-module').then(m => m.BadgeDemoModule),
  },
  {
    path: 'bottom-sheet',
    loadChildren: () =>
      import('./bottom-sheet/bottom-sheet-demo-module').then(m => m.BottomSheetDemoModule),
  },
  {
    path: 'baseline',
    loadChildren: () => import('./baseline/baseline-demo-module').then(m => m.BaselineDemoModule),
  },
  {
    path: 'button',
    loadChildren: () => import('./button/button-demo-module').then(m => m.ButtonDemoModule),
  },
  {
    path: 'button-toggle',
    loadChildren: () =>
      import('./button-toggle/button-toggle-demo-module').then(m => m.ButtonToggleDemoModule),
  },
  {
    path: 'card',
    loadChildren: () => import('./card/card-demo-module').then(m => m.CardDemoModule),
  },
  {
    path: 'cdk-experimental-combobox',
    loadChildren: () =>
      import('./cdk-experimental-combobox/cdk-combobox-demo-module').then(
        m => m.CdkComboboxDemoModule,
      ),
  },
  {
    path: 'cdk-experimental-listbox',
    loadChildren: () =>
      import('./cdk-experimental-listbox/cdk-listbox-demo-module').then(
        m => m.CdkListboxDemoModule,
      ),
  },
  {
    path: 'cdk-experimental-menu',
    loadChildren: () =>
      import('./cdk-experimental-menu/cdk-menu-demo-module').then(m => m.CdkMenuDemoModule),
  },
  {
    path: 'checkbox',
    loadChildren: () => import('./checkbox/checkbox-demo-module').then(m => m.CheckboxDemoModule),
  },
  {
    path: 'chips',
    loadChildren: () => import('./chips/chips-demo-module').then(m => m.ChipsDemoModule),
  },
  {
    path: 'clipboard',
    loadChildren: () =>
      import('./clipboard/clipboard-demo-module').then(m => m.ClipboardDemoModule),
  },
  {
    path: 'column-resize',
    loadChildren: () =>
      import('./column-resize/column-resize-demo-module').then(m => m.ColumnResizeDemoModule),
  },
  {
    path: 'datepicker',
    loadChildren: () =>
      import('./datepicker/datepicker-demo-module').then(m => m.DatepickerDemoModule),
  },
  {
    path: 'dialog',
    loadChildren: () => import('./dialog/dialog-demo-module').then(m => m.DialogDemoModule),
  },
  {
    path: 'drawer',
    loadChildren: () => import('./drawer/drawer-demo-module').then(m => m.DrawerDemoModule),
  },
  {
    path: 'drag-drop',
    loadChildren: () => import('./drag-drop/drag-drop-demo-module').then(m => m.DragDropDemoModule),
  },
  {
    path: 'expansion',
    loadChildren: () =>
      import('./expansion/expansion-demo-module').then(m => m.ExpansionDemoModule),
  },
  {
    path: 'focus-origin',
    loadChildren: () =>
      import('./focus-origin/focus-origin-demo-module').then(m => m.FocusOriginDemoModule),
  },
  {
    path: 'focus-trap',
    loadChildren: () =>
      import('./focus-trap/focus-trap-demo-module').then(m => m.FocusTrapDemoModule),
  },
  {
    path: 'google-map',
    loadChildren: () =>
      import('./google-map/google-map-demo-module').then(m => m.GoogleMapDemoModule),
  },
  {
    path: 'grid-list',
    loadChildren: () => import('./grid-list/grid-list-demo-module').then(m => m.GridListDemoModule),
  },
  {
    path: 'icon',
    loadChildren: () => import('./icon/icon-demo-module').then(m => m.IconDemoModule),
  },
  {
    path: 'input',
    loadChildren: () => import('./input/input-demo-module').then(m => m.InputDemoModule),
  },
  {
    path: 'layout',
    loadChildren: () => import('./layout/layout-demo-module').then(m => m.LayoutDemoModule),
  },
  {
    path: 'input-modality',
    loadChildren: () =>
      import('./input-modality/input-modality-detector-demo-module').then(
        m => m.InputModalityDetectorDemoModule,
      ),
  },
  {
    path: 'list',
    loadChildren: () => import('./list/list-demo-module').then(m => m.ListDemoModule),
  },
  {
    path: 'live-announcer',
    loadChildren: () =>
      import('./live-announcer/live-announcer-demo-module').then(m => m.LiveAnnouncerDemoModule),
  },
  {
    path: 'menubar',
    loadChildren: () =>
      import('./menubar/mat-menubar-demo-module').then(m => m.MatMenuBarDemoModule),
  },
  {
    path: 'mdc-autocomplete',
    loadChildren: () =>
      import('./mdc-autocomplete/mdc-autocomplete-demo-module').then(
        m => m.MdcAutocompleteDemoModule,
      ),
  },
  {
    path: 'mdc-button',
    loadChildren: () =>
      import('./mdc-button/mdc-button-demo-module').then(m => m.MdcButtonDemoModule),
  },
  {
    path: 'mdc-card',
    loadChildren: () => import('./mdc-card/mdc-card-demo-module').then(m => m.MdcCardDemoModule),
  },
  {
    path: 'mdc-checkbox',
    loadChildren: () =>
      import('./mdc-checkbox/mdc-checkbox-demo-module').then(m => m.MdcCheckboxDemoModule),
  },
  {
    path: 'mdc-progress-bar',
    loadChildren: () =>
      import('./mdc-progress-bar/mdc-progress-bar-demo-module').then(
        m => m.MdcProgressBarDemoModule,
      ),
  },
  {
    path: 'mdc-chips',
    loadChildren: () => import('./mdc-chips/mdc-chips-demo-module').then(m => m.MdcChipsDemoModule),
  },
  {
    path: 'mdc-dialog',
    loadChildren: () =>
      import('./mdc-dialog/mdc-dialog-demo-module').then(m => m.MdcDialogDemoModule),
  },
  {
    path: 'mdc-input',
    loadChildren: () => import('./mdc-input/mdc-input-demo-module').then(m => m.MdcInputDemoModule),
  },
  {
    path: 'mdc-list',
    loadChildren: () => import('./mdc-list/mdc-list-demo-module').then(m => m.MdcListDemoModule),
  },
  {
    path: 'mdc-menu',
    loadChildren: () => import('./mdc-menu/mdc-menu-demo-module').then(m => m.MdcMenuDemoModule),
  },
  {
    path: 'mdc-paginator',
    loadChildren: () =>
      import('./mdc-paginator/mdc-paginator-demo-module').then(m => m.MdcPaginatorDemoModule),
  },
  {
    path: 'mdc-progress-spinner',
    loadChildren: () =>
      import('./mdc-progress-spinner/mdc-progress-spinner-demo-module').then(
        m => m.MdcProgressSpinnerDemoModule,
      ),
  },
  {
    path: 'mdc-radio',
    loadChildren: () => import('./mdc-radio/mdc-radio-demo-module').then(m => m.MdcRadioDemoModule),
  },
  {
    path: 'mdc-select',
    loadChildren: () =>
      import('./mdc-select/mdc-select-demo-module').then(m => m.MdcSelectDemoModule),
  },
  {
    path: 'mdc-snack-bar',
    loadChildren: () =>
      import('./mdc-snack-bar/mdc-snack-bar-demo-module').then(m => m.MdcSnackBarDemoModule),
  },
  {
    path: 'mdc-slide-toggle',
    loadChildren: () =>
      import('./mdc-slide-toggle/mdc-slide-toggle-demo-module').then(
        m => m.MdcSlideToggleDemoModule,
      ),
  },
  {
    path: 'mdc-slider',
    loadChildren: () =>
      import('./mdc-slider/mdc-slider-demo-module').then(m => m.MdcSliderDemoModule),
  },
  {
    path: 'mdc-table',
    loadChildren: () => import('./mdc-table/mdc-table-demo-module').then(m => m.MdcTableDemoModule),
  },
  {
    path: 'mdc-tabs',
    loadChildren: () => import('./mdc-tabs/mdc-tabs-demo-module').then(m => m.MdcTabsDemoModule),
  },
  {
    path: 'mdc-tooltip',
    loadChildren: () =>
      import('./mdc-tooltip/mdc-tooltip-demo-module').then(m => m.MdcTooltipDemoModule),
  },
  {
    path: 'menu',
    loadChildren: () => import('./menu/menu-demo-module').then(m => m.MenuDemoModule),
  },
  {
    path: 'paginator',
    loadChildren: () =>
      import('./paginator/paginator-demo-module').then(m => m.PaginatorDemoModule),
  },
  {
    path: 'platform',
    loadChildren: () => import('./platform/platform-demo-module').then(m => m.PlatformDemoModule),
  },
  {
    path: 'popover-edit',
    loadChildren: () =>
      import('./popover-edit/popover-edit-demo-module').then(m => m.PopoverEditDemoModule),
  },
  {
    path: 'portal',
    loadChildren: () => import('./portal/portal-demo-module').then(m => m.PortalDemoModule),
  },
  {
    path: 'progress-bar',
    loadChildren: () =>
      import('./progress-bar/progress-bar-demo-module').then(m => m.ProgressBarDemoModule),
  },
  {
    path: 'progress-spinner',
    loadChildren: () =>
      import('./progress-spinner/progress-spinner-demo-module').then(
        m => m.ProgressSpinnerDemoModule,
      ),
  },
  {
    path: 'radio',
    loadChildren: () => import('./radio/radio-demo-module').then(m => m.RadioDemoModule),
  },
  {
    path: 'ripple',
    loadChildren: () => import('./ripple/ripple-demo-module').then(m => m.RippleDemoModule),
  },
  {
    path: 'select',
    loadChildren: () => import('./select/select-demo-module').then(m => m.SelectDemoModule),
  },
  {
    path: 'sidenav',
    loadChildren: () => import('./sidenav/sidenav-demo-module').then(m => m.SidenavDemoModule),
  },
  {
    path: 'slide-toggle',
    loadChildren: () =>
      import('./slide-toggle/slide-toggle-demo-module').then(m => m.SlideToggleDemoModule),
  },
  {
    path: 'slider',
    loadChildren: () => import('./slider/slider-demo-module').then(m => m.SliderDemoModule),
  },
  {
    path: 'snack-bar',
    loadChildren: () => import('./snack-bar/snack-bar-demo-module').then(m => m.SnackBarDemoModule),
  },
  {
    path: 'stepper',
    loadChildren: () => import('./stepper/stepper-demo-module').then(m => m.StepperDemoModule),
  },
  {
    path: 'table',
    loadChildren: () => import('./table/table-demo-module').then(m => m.TableDemoModule),
  },
  {
    path: 'table-scroll-container',
    loadChildren: () =>
      import('./table-scroll-container/table-scroll-container-demo-module').then(
        m => m.TableScrollContainerDemoModule,
      ),
  },
  {
    path: 'tabs',
    loadChildren: () => import('./tabs/tabs-demo-module').then(m => m.TabsDemoModule),
  },
  {
    path: 'toolbar',
    loadChildren: () => import('./toolbar/toolbar-demo-module').then(m => m.ToolbarDemoModule),
  },
  {
    path: 'tooltip',
    loadChildren: () => import('./tooltip/tooltip-demo-module').then(m => m.TooltipDemoModule),
  },
  {
    path: 'tree',
    loadChildren: () => import('./tree/tree-demo-module').then(m => m.TreeDemoModule),
  },
  {
    path: 'typography',
    loadChildren: () =>
      import('./typography/typography-demo-module').then(m => m.TypographyDemoModule),
  },
  {
    path: 'screen-type',
    loadChildren: () =>
      import('./screen-type/screen-type-demo-module').then(m => m.ScreenTypeDemoModule),
  },
  {
    path: 'connected-overlay',
    loadChildren: () =>
      import('./connected-overlay/connected-overlay-demo-module').then(
        m => m.ConnectedOverlayDemoModule,
      ),
  },
  {
    path: 'virtual-scroll',
    loadChildren: () =>
      import('./virtual-scroll/virtual-scroll-demo-module').then(m => m.VirtualScrollDemoModule),
  },
  {
    path: 'youtube-player',
    loadChildren: () =>
      import('./youtube-player/youtube-player-demo-module').then(m => m.YouTubePlayerDemoModule),
  },
  {
    path: 'selection',
    loadChildren: () =>
      import('./selection/selection-demo-module').then(m => m.SelectionDemoModule),
  },
  {
    path: 'examples',
    loadChildren: () =>
      import('./examples-page/examples-page-module').then(m => m.ExamplesPageModule),
  },
  {path: '**', component: DevApp404},
];
