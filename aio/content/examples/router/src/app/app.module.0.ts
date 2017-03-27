// NEVER USED. For docs only. Should compile though
// #docplaster
import { NgModule }             from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { HeroListComponent }      from './hero-list.component';
import { CrisisListComponent }    from './crisis-list.component';
import { PageNotFoundComponent }  from './not-found.component';
import { PageNotFoundComponent as HeroDetailComponent } from './not-found.component';

// #docregion
const appRoutes: Routes = [
  { path: 'crisis-center', component: CrisisListComponent },
  { path: 'hero/:id',      component: HeroDetailComponent },
  {
    path: 'heroes',
    component: HeroListComponent,
    data: { title: 'Heroes List' }
  },
  { path: '',
    redirectTo: '/heroes',
    pathMatch: 'full'
  },
  { path: '**', component: PageNotFoundComponent }
];

@NgModule({
  imports: [
    RouterModule.forRoot(appRoutes)
    // other imports here
  ],
// #enddocregion
/*
// #docregion
  ...
})
export class AppModule { }
// #enddocregion
*/
})
export class AppModule0 { }
