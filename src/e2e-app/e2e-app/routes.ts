import {Routes} from '@angular/router';
import {Home} from './e2e-app';
import {ButtonE2E} from '../button/button-e2e';
import {BasicTabs} from '../tabs/tabs-e2e';
import {IconE2E} from '../icon/icon-e2e';
import {MenuE2E} from '../menu/menu-e2e';

export const E2E_APP_ROUTES: Routes = [
  {path: '', component: Home},
  {path: 'button', component: ButtonE2E},
  {path: 'menu', component: MenuE2E},
  {path: 'icon', component: IconE2E},
  {path: 'tabs', component: BasicTabs}
];
