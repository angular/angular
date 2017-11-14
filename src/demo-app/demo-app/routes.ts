/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Routes} from '@angular/router';
import {AccessibilityDemo} from '../a11y/a11y';
import {ACCESSIBILITY_DEMO_ROUTES} from '../a11y/routes';
import {AutocompleteDemo} from '../autocomplete/autocomplete-demo';
import {BaselineDemo} from '../baseline/baseline-demo';
import {ButtonToggleDemo} from '../button-toggle/button-toggle-demo';
import {ButtonDemo} from '../button/button-demo';
import {CardDemo} from '../card/card-demo';
import {CheckboxDemo} from '../checkbox/checkbox-demo';
import {ChipsDemo} from '../chips/chips-demo';
import {DatepickerDemo} from '../datepicker/datepicker-demo';
import {DialogDemo} from '../dialog/dialog-demo';
import {DrawerDemo} from '../drawer/drawer-demo';
import {ExpansionDemo} from '../expansion/expansion-demo';
import {FocusOriginDemo} from '../focus-origin/focus-origin-demo';
import {GesturesDemo} from '../gestures/gestures-demo';
import {GridListDemo} from '../grid-list/grid-list-demo';
import {IconDemo} from '../icon/icon-demo';
import {InputDemo} from '../input/input-demo';
import {ListDemo} from '../list/list-demo';
import {LiveAnnouncerDemo} from '../live-announcer/live-announcer-demo';
import {MenuDemo} from '../menu/menu-demo';
import {OverlayDemo} from '../overlay/overlay-demo';
import {PlatformDemo} from '../platform/platform-demo';
import {PortalDemo} from '../portal/portal-demo';
import {ProgressBarDemo} from '../progress-bar/progress-bar-demo';
import {ProgressSpinnerDemo} from '../progress-spinner/progress-spinner-demo';
import {RadioDemo} from '../radio/radio-demo';
import {RippleDemo} from '../ripple/ripple-demo';
import {ScreenTypeDemo} from '../screen-type/screen-type-demo';
import {SelectDemo} from '../select/select-demo';
import {SidenavDemo} from '../sidenav/sidenav-demo';
import {SlideToggleDemo} from '../slide-toggle/slide-toggle-demo';
import {SliderDemo} from '../slider/slider-demo';
import {SnackBarDemo} from '../snack-bar/snack-bar-demo';
import {StepperDemo} from '../stepper/stepper-demo';
import {TableDemo} from '../table/table-demo';
import {TABS_DEMO_ROUTES} from '../tabs/routes';
import {TabsDemo} from '../tabs/tabs-demo';
import {ToolbarDemo} from '../toolbar/toolbar-demo';
import {TooltipDemo} from '../tooltip/tooltip-demo';
import {TypographyDemo} from '../typography/typography-demo';
import {DemoApp, Home} from './demo-app';

export const DEMO_APP_ROUTES: Routes = [
  {path: '', component: DemoApp, children: [
    {path: '', component: Home},
    {path: 'autocomplete', component: AutocompleteDemo},
    {path: 'baseline', component: BaselineDemo},
    {path: 'button', component: ButtonDemo},
    {path: 'button-toggle', component: ButtonToggleDemo},
    {path: 'card', component: CardDemo},
    {path: 'checkbox', component: CheckboxDemo},
    {path: 'chips', component: ChipsDemo},
    {path: 'datepicker', component: DatepickerDemo},
    {path: 'dialog', component: DialogDemo},
    {path: 'drawer', component: DrawerDemo},
    {path: 'expansion', component: ExpansionDemo},
    {path: 'focus-origin', component: FocusOriginDemo},
    {path: 'gestures', component: GesturesDemo},
    {path: 'grid-list', component: GridListDemo},
    {path: 'icon', component: IconDemo},
    {path: 'input', component: InputDemo},
    {path: 'list', component: ListDemo},
    {path: 'live-announcer', component: LiveAnnouncerDemo},
    {path: 'menu', component: MenuDemo},
    {path: 'overlay', component: OverlayDemo},
    {path: 'platform', component: PlatformDemo},
    {path: 'portal', component: PortalDemo},
    {path: 'progress-bar', component: ProgressBarDemo},
    {path: 'progress-spinner', component: ProgressSpinnerDemo},
    {path: 'radio', component: RadioDemo},
    {path: 'ripple', component: RippleDemo},
    {path: 'select', component: SelectDemo},
    {path: 'sidenav', component: SidenavDemo},
    {path: 'slide-toggle', component: SlideToggleDemo},
    {path: 'slider', component: SliderDemo},
    {path: 'snack-bar', component: SnackBarDemo},
    {path: 'stepper', component: StepperDemo},
    {path: 'table', component: TableDemo},
    {path: 'tabs', component: TabsDemo, children: TABS_DEMO_ROUTES},
    {path: 'toolbar', component: ToolbarDemo},
    {path: 'tooltip', component: TooltipDemo},
    {path: 'typography', component: TypographyDemo},
    {path: 'expansion', component: ExpansionDemo},
    {path: 'stepper', component: StepperDemo},
    {path: 'screen-type', component: ScreenTypeDemo},
  ]}
];

export const ALL_ROUTES: Routes = [
  {path: '',  component: DemoApp, children: DEMO_APP_ROUTES},
  {path: 'accessibility', component: AccessibilityDemo, children: ACCESSIBILITY_DEMO_ROUTES},
];
