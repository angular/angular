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
    loadComponent: () => import('./autocomplete/autocomplete-demo').then(m => m.AutocompleteDemo),
  },
  {
    path: 'badge',
    loadComponent: () => import('./badge/badge-demo').then(m => m.BadgeDemo),
  },
  {
    path: 'bottom-sheet',
    loadComponent: () => import('./bottom-sheet/bottom-sheet-demo').then(m => m.BottomSheetDemo),
  },
  {
    path: 'baseline',
    loadComponent: () => import('./baseline/baseline-demo').then(m => m.BaselineDemo),
  },
  {
    path: 'button',
    loadComponent: () => import('./button/button-demo').then(m => m.ButtonDemo),
  },
  {
    path: 'button-toggle',
    loadComponent: () => import('./button-toggle/button-toggle-demo').then(m => m.ButtonToggleDemo),
  },
  {
    path: 'card',
    loadComponent: () => import('./card/card-demo').then(m => m.CardDemo),
  },
  {
    path: 'cdk-experimental-combobox',
    loadComponent: () =>
      import('./cdk-experimental-combobox/cdk-combobox-demo').then(m => m.CdkComboboxDemo),
  },
  {
    path: 'cdk-dialog',
    loadComponent: () => import('./cdk-dialog/dialog-demo').then(m => m.DialogDemo),
  },
  {
    path: 'cdk-listbox',
    loadComponent: () => import('./cdk-listbox/cdk-listbox-demo').then(m => m.CdkListboxDemo),
  },
  {
    path: 'cdk-menu',
    loadComponent: () => import('./cdk-menu/cdk-menu-demo').then(m => m.CdkMenuDemo),
  },
  {
    path: 'checkbox',
    loadComponent: () => import('./checkbox/checkbox-demo').then(m => m.CheckboxDemo),
  },
  {
    path: 'chips',
    loadComponent: () => import('./chips/chips-demo').then(m => m.ChipsDemo),
  },
  {
    path: 'clipboard',
    loadComponent: () => import('./clipboard/clipboard-demo').then(m => m.ClipboardDemo),
  },
  {
    path: 'column-resize',
    loadComponent: () => import('./column-resize/column-resize-home').then(m => m.ColumnResizeHome),
  },
  {
    path: 'datepicker',
    loadComponent: () => import('./datepicker/datepicker-demo').then(m => m.DatepickerDemo),
  },
  {
    path: 'dialog',
    loadComponent: () => import('./dialog/dialog-demo').then(m => m.DialogDemo),
  },
  {
    path: 'drawer',
    loadComponent: () => import('./drawer/drawer-demo').then(m => m.DrawerDemo),
  },
  {
    path: 'drag-drop',
    loadComponent: () => import('./drag-drop/drag-drop-demo').then(m => m.DragAndDropDemo),
  },
  {
    path: 'expansion',
    loadComponent: () => import('./expansion/expansion-demo').then(m => m.ExpansionDemo),
  },
  {
    path: 'focus-origin',
    loadComponent: () => import('./focus-origin/focus-origin-demo').then(m => m.FocusOriginDemo),
  },
  {
    path: 'focus-trap',
    loadComponent: () => import('./focus-trap/focus-trap-demo').then(m => m.FocusTrapDemo),
  },
  {
    path: 'google-map',
    loadComponent: () => import('./google-map/google-map-demo').then(m => m.GoogleMapDemo),
  },
  {
    path: 'grid-list',
    loadComponent: () => import('./grid-list/grid-list-demo').then(m => m.GridListDemo),
  },
  {
    path: 'icon',
    loadComponent: () => import('./icon/icon-demo').then(m => m.IconDemo),
  },
  {
    path: 'legacy-input',
    loadComponent: () => import('./legacy-input/legacy-input-demo').then(m => m.LegacyInputDemo),
  },
  {
    path: 'layout',
    loadComponent: () => import('./layout/layout-demo').then(m => m.LayoutDemo),
  },
  {
    path: 'input-modality',
    loadComponent: () =>
      import('./input-modality/input-modality-detector-demo').then(
        m => m.InputModalityDetectorDemo,
      ),
  },
  {
    path: 'list',
    loadComponent: () => import('./list/list-demo').then(m => m.ListDemo),
  },
  {
    path: 'live-announcer',
    loadComponent: () =>
      import('./live-announcer/live-announcer-demo').then(m => m.LiveAnnouncerDemo),
  },
  {
    path: 'menubar',
    loadComponent: () => import('./menubar/mat-menubar-demo').then(m => m.MatMenuBarDemo),
  },
  {
    path: 'mdc-autocomplete',
    loadComponent: () =>
      import('./mdc-autocomplete/mdc-autocomplete-demo').then(m => m.MdcAutocompleteDemo),
  },
  {
    path: 'mdc-button',
    loadComponent: () => import('./mdc-button/mdc-button-demo').then(m => m.MdcButtonDemo),
  },
  {
    path: 'mdc-card',
    loadComponent: () => import('./mdc-card/mdc-card-demo').then(m => m.MdcCardDemo),
  },
  {
    path: 'mdc-checkbox',
    loadComponent: () => import('./mdc-checkbox/mdc-checkbox-demo').then(m => m.MdcCheckboxDemo),
  },
  {
    path: 'mdc-progress-bar',
    loadComponent: () =>
      import('./mdc-progress-bar/mdc-progress-bar-demo').then(m => m.MdcProgressBarDemo),
  },
  {
    path: 'mdc-chips',
    loadComponent: () => import('./mdc-chips/mdc-chips-demo').then(m => m.MdcChipsDemo),
  },
  {
    path: 'mdc-dialog',
    loadComponent: () => import('./mdc-dialog/mdc-dialog-demo').then(m => m.DialogDemo),
  },
  {
    path: 'input',
    loadComponent: () => import('./input/input-demo').then(m => m.InputDemo),
  },
  {
    path: 'mdc-list',
    loadComponent: () => import('./mdc-list/mdc-list-demo').then(m => m.MdcListDemo),
  },
  {
    path: 'mdc-menu',
    loadComponent: () => import('./mdc-menu/mdc-menu-demo').then(m => m.MdcMenuDemo),
  },
  {
    path: 'legacy-paginator',
    loadComponent: () =>
      import('./legacy-paginator/paginator-demo').then(m => m.LegacyPaginatorDemo),
  },
  {
    path: 'mdc-progress-spinner',
    loadComponent: () =>
      import('./mdc-progress-spinner/mdc-progress-spinner-demo').then(
        m => m.MdcProgressSpinnerDemo,
      ),
  },
  {
    path: 'mdc-radio',
    loadComponent: () => import('./mdc-radio/mdc-radio-demo').then(m => m.MdcRadioDemo),
  },
  {
    path: 'mdc-select',
    loadComponent: () => import('./mdc-select/mdc-select-demo').then(m => m.MdcSelectDemo),
  },
  {
    path: 'mdc-snack-bar',
    loadComponent: () => import('./mdc-snack-bar/mdc-snack-bar-demo').then(m => m.MdcSnackBarDemo),
  },
  {
    path: 'mdc-slide-toggle',
    loadComponent: () =>
      import('./mdc-slide-toggle/mdc-slide-toggle-demo').then(m => m.MdcSlideToggleDemo),
  },
  {
    path: 'mdc-slider',
    loadComponent: () => import('./mdc-slider/mdc-slider-demo').then(m => m.MdcSliderDemo),
  },
  {
    path: 'legacy-table',
    loadComponent: () => import('./legacy-table/table-demo').then(m => m.TableDemo),
  },
  {
    path: 'mdc-tabs',
    loadComponent: () => import('./mdc-tabs/mdc-tabs-demo').then(m => m.MdcTabsDemo),
  },
  {
    path: 'legacy-tooltip',
    loadComponent: () => import('./legacy-tooltip/tooltip-demo').then(m => m.TooltipDemo),
  },
  {
    path: 'menu',
    loadComponent: () => import('./menu/menu-demo').then(m => m.MenuDemo),
  },
  {
    path: 'paginator',
    loadComponent: () => import('./paginator/paginator-demo').then(m => m.PaginatorDemo),
  },
  {
    path: 'platform',
    loadComponent: () => import('./platform/platform-demo').then(m => m.PlatformDemo),
  },
  {
    path: 'popover-edit',
    loadComponent: () => import('./popover-edit/popover-edit-demo').then(m => m.PopoverEditDemo),
  },
  {
    path: 'portal',
    loadComponent: () => import('./portal/portal-demo').then(m => m.PortalDemo),
  },
  {
    path: 'progress-bar',
    loadComponent: () => import('./progress-bar/progress-bar-demo').then(m => m.ProgressBarDemo),
  },
  {
    path: 'progress-spinner',
    loadComponent: () =>
      import('./progress-spinner/progress-spinner-demo').then(m => m.ProgressSpinnerDemo),
  },
  {
    path: 'radio',
    loadComponent: () => import('./radio/radio-demo').then(m => m.RadioDemo),
  },
  {
    path: 'ripple',
    loadComponent: () => import('./ripple/ripple-demo').then(m => m.RippleDemo),
  },
  {
    path: 'select',
    loadComponent: () => import('./select/select-demo').then(m => m.SelectDemo),
  },
  {
    path: 'sidenav',
    loadComponent: () => import('./sidenav/sidenav-demo').then(m => m.SidenavDemo),
  },
  {
    path: 'slide-toggle',
    loadComponent: () => import('./slide-toggle/slide-toggle-demo').then(m => m.SlideToggleDemo),
  },
  {
    path: 'slider',
    loadComponent: () => import('./slider/slider-demo').then(m => m.SliderDemo),
  },
  {
    path: 'snack-bar',
    loadComponent: () => import('./snack-bar/snack-bar-demo').then(m => m.SnackBarDemo),
  },
  {
    path: 'stepper',
    loadComponent: () => import('./stepper/stepper-demo').then(m => m.StepperDemo),
  },
  {
    path: 'table',
    loadComponent: () => import('./table/table-demo').then(m => m.TableDemo),
  },
  {
    path: 'table-scroll-container',
    loadComponent: () =>
      import('./table-scroll-container/table-scroll-container-demo').then(
        m => m.TableScrollContainerDemo,
      ),
  },
  {
    path: 'tabs',
    loadComponent: () => import('./tabs/tabs-demo').then(m => m.TabsDemo),
  },
  {
    path: 'toolbar',
    loadComponent: () => import('./toolbar/toolbar-demo').then(m => m.ToolbarDemo),
  },
  {
    path: 'tooltip',
    loadComponent: () => import('./tooltip/tooltip-demo').then(m => m.TooltipDemo),
  },
  {
    path: 'tree',
    loadComponent: () => import('./tree/tree-demo').then(m => m.TreeDemo),
  },
  {
    path: 'typography',
    loadComponent: () => import('./typography/typography-demo').then(m => m.TypographyDemo),
  },
  {
    path: 'screen-type',
    loadComponent: () => import('./screen-type/screen-type-demo').then(m => m.ScreenTypeDemo),
  },
  {
    path: 'connected-overlay',
    loadComponent: () =>
      import('./connected-overlay/connected-overlay-demo').then(m => m.ConnectedOverlayDemo),
  },
  {
    path: 'virtual-scroll',
    loadComponent: () =>
      import('./virtual-scroll/virtual-scroll-demo').then(m => m.VirtualScrollDemo),
  },
  {
    path: 'youtube-player',
    loadComponent: () =>
      import('./youtube-player/youtube-player-demo').then(m => m.YouTubePlayerDemo),
  },
  {
    path: 'selection',
    loadComponent: () => import('./selection/selection-demo').then(m => m.SelectionDemo),
  },
  {
    path: 'examples',
    loadComponent: () => import('./examples-page/examples-page').then(m => m.ExamplesPage),
  },
  {path: '**', component: DevApp404},
];
