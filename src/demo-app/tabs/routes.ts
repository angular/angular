import {Routes} from '@angular/router';

import {SunnyTabContent, RainyTabContent, FoggyTabContent} from '../tabs/tabs-demo';

export const TABS_DEMO_ROUTES: Routes = [
  {path: '', redirectTo: 'sunny-tab', pathMatch: 'full'},
  {path: 'sunny-tab', component: SunnyTabContent},
  {path: 'rainy-tab', component: RainyTabContent},
  {path: 'foggy-tab', component: FoggyTabContent},
];
