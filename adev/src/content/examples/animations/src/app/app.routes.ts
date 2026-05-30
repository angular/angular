import {Routes} from '@angular/router';
import {OpenClosePage} from './open-close-page';
import {StatusSliderPage} from './status-slider-page';
import {ToggleAnimationsPage} from './toggle-animations-page';
import {HeroListPage} from './hero-list-page';
import {HeroListGroupPage} from './hero-list-group-page';
import {HeroListEnterLeavePage} from './hero-list-enter-leave-page';
import {HeroListAutoCalcPage} from './hero-list-auto-page';
import {InsertRemove} from './insert-remove';
import {Querying} from './querying';
import {Home} from './home';
import {About} from './about';

// #docregion route-animation-data
export const routes: Routes = [
  {path: '', pathMatch: 'full', redirectTo: '/enter-leave'},
  {
    path: 'open-close',
    component: OpenClosePage,
    data: {animation: 'openClosePage'},
  },
  {
    path: 'status',
    component: StatusSliderPage,
    data: {animation: 'statusPage'},
  },
  {
    path: 'toggle',
    component: ToggleAnimationsPage,
    data: {animation: 'togglePage'},
  },
  {
    path: 'heroes',
    component: HeroListPage,
    data: {animation: 'filterPage'},
  },
  {
    path: 'hero-groups',
    component: HeroListGroupPage,
    data: {animation: 'heroGroupPage'},
  },
  {
    path: 'enter-leave',
    component: HeroListEnterLeavePage,
    data: {animation: 'enterLeavePage'},
  },
  {
    path: 'auto',
    component: HeroListAutoCalcPage,
    data: {animation: 'autoPage'},
  },
  {
    path: 'insert-remove',
    component: InsertRemove,
    data: {animation: 'insertRemovePage'},
  },
  {
    path: 'querying',
    component: Querying,
    data: {animation: 'queryingPage'},
  },
  {
    path: 'home',
    component: Home,
    data: {animation: 'HomePage'},
  },
  {
    path: 'about',
    component: About,
    data: {animation: 'AboutPage'},
  },
];
// #enddocregion route-animation-data
