import {Routes} from '@angular/router';
import {OpenClosePageComponent} from './open-close-page.component';
import {StatusSliderPageComponent} from './status-slider-page.component';
import {ToggleAnimationsPageComponent} from './toggle-animations-page.component';
import {HeroListPageComponent} from './hero-list-page.component';
import {HeroListGroupPageComponent} from './hero-list-group-page.component';
import {HeroListEnterLeavePageComponent} from './hero-list-enter-leave-page.component';
import {HeroListAutoCalcPageComponent} from './hero-list-auto-page.component';
import {InsertRemoveComponent} from './insert-remove.component';
import {QueryingComponent} from './querying.component';
import {HomeComponent} from './home.component';
import {AboutComponent} from './about.component';

// #docregion route-animation-data
export const routes: Routes = [
  {path: '', pathMatch: 'full', redirectTo: '/enter-leave'},
  {
    path: 'open-close',
    component: OpenClosePageComponent,
    data: {animation: 'openClosePage'},
  },
  {
    path: 'status',
    component: StatusSliderPageComponent,
    data: {animation: 'statusPage'},
  },
  {
    path: 'toggle',
    component: ToggleAnimationsPageComponent,
    data: {animation: 'togglePage'},
  },
  {
    path: 'heroes',
    component: HeroListPageComponent,
    data: {animation: 'filterPage'},
  },
  {
    path: 'hero-groups',
    component: HeroListGroupPageComponent,
    data: {animation: 'heroGroupPage'},
  },
  {
    path: 'enter-leave',
    component: HeroListEnterLeavePageComponent,
    data: {animation: 'enterLeavePage'},
  },
  {
    path: 'auto',
    component: HeroListAutoCalcPageComponent,
    data: {animation: 'autoPage'},
  },
  {
    path: 'insert-remove',
    component: InsertRemoveComponent,
    data: {animation: 'insertRemovePage'},
  },
  {
    path: 'querying',
    component: QueryingComponent,
    data: {animation: 'queryingPage'},
  },
  {
    path: 'home',
    component: HomeComponent,
    data: {animation: 'HomePage'},
  },
  {
    path: 'about',
    component: AboutComponent,
    data: {animation: 'AboutPage'},
  },
];
// #enddocregion route-animation-data
