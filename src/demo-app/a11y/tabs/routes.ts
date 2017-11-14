/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Routes} from '@angular/router';

import {SunnyTabContent, RainyTabContent, FoggyTabContent} from './tabs-a11y';

export const TABS_DEMO_ROUTES: Routes = [
  {path: '', redirectTo: 'sunny-tab', pathMatch: 'full'},
  {path: 'sunny-tab', component: SunnyTabContent},
  {path: 'rainy-tab', component: RainyTabContent},
  {path: 'foggy-tab', component: FoggyTabContent},
];
