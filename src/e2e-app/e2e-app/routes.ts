import {Routes} from '@angular/router';
import {Home} from './e2e-app';
import {ButtonE2E} from '../button/button-e2e';
import {BasicTabs} from '../tabs/tabs-e2e';
import {IconE2E} from '../icon/icon-e2e';
import {MenuE2E} from '../menu/menu-e2e';
import {SimpleRadioButtons} from '../radio/radio-e2e';
import {SimpleCheckboxes} from '../checkbox/checkbox-e2e';
import {DialogE2E} from '../dialog/dialog-e2e';
import {GridListE2E} from '../grid-list/grid-list-e2e';
import {ListE2E} from '../list/list-e2e';
import {ProgressBarE2E} from '../progress-bar/progress-bar-e2e';
import {ProgressSpinnerE2E} from '../progress-spinner/progress-spinner-e2e';
import {SlideToggleE2E} from '../slide-toggle/slide-toggle-e2e';
import {FullscreenE2E} from '../fullscreen/fullscreen-e2e';

export const E2E_APP_ROUTES: Routes = [
  {path: '', component: Home},
  {path: 'button', component: ButtonE2E},
  {path: 'checkbox', component: SimpleCheckboxes},
  {path: 'menu', component: MenuE2E},
  {path: 'icon', component: IconE2E},
  {path: 'radio', component: SimpleRadioButtons},
  {path: 'tabs', component: BasicTabs},
  {path: 'dialog', component: DialogE2E},
  {path: 'grid-list', component: GridListE2E},
  {path: 'list', component: ListE2E},
  {path: 'progress-bar', component: ProgressBarE2E},
  {path: 'progress-spinner', component: ProgressSpinnerE2E},
  {path: 'slide-toggle', component: SlideToggleE2E},
  {path: 'fullscreen', component: FullscreenE2E}
];
