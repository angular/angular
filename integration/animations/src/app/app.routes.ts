import {Routes} from '@angular/router';
import {HomeComponent} from './home.component';
import {NestedComponent} from './nested.component';

export const routes: Routes = [
  {path: '', component: HomeComponent},
  {path: 'nested', component: NestedComponent},
];
