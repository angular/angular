import {provideRouter, RouterConfig} from '@angular/router';
import {Home} from './e2e-app';
import {ButtonE2E} from '../button/button-e2e';
import {BasicTabs} from '../tabs/tabs-e2e';


export const routes: RouterConfig = [
  {path: '', component: Home},
  {path: 'button', component: ButtonE2E},
  {path: 'tabs', component: BasicTabs},
];

export const E2E_APP_ROUTE_PROVIDER = provideRouter(routes);
