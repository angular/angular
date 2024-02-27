import {HeroListComponent} from './hero-list.component';
import {HeroDetailComponent} from './hero-detail.component';
import {Routes} from '@angular/router';

export default [
  {path: '', component: HeroListComponent},
  {path: ':id', component: HeroDetailComponent},
] as Routes;
