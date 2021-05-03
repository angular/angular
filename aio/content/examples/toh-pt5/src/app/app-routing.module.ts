// #docplaster
// #docregion
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

// #docregion import-dashboard
import { DashboardComponent } from './dashboard/dashboard.component';
// #enddocregion import-dashboard
import { HeroesComponent } from './heroes/heroes.component';
// #docregion import-herodetail
import { HeroDetailComponent } from './hero-detail/hero-detail.component';
// #enddocregion import-herodetail
// #docregion heroes-route

// #docregion routes
const routes: Routes = [
  // #enddocregion heroes-route
  // #docregion redirect-route
  { path: '', redirectTo: '/dashboard', pathMatch: 'full' },
  // #enddocregion redirect-route
  // #docregion dashboard-route
  { path: 'dashboard', component: DashboardComponent },
  // #enddocregion dashboard-route
  // #docregion detail-route
  { path: 'detail/:id', component: HeroDetailComponent },
  // #enddocregion detail-route
  // #docregion heroes-route
  { path: 'heroes', component: HeroesComponent }
];
// #enddocregion routes, heroes-route

@NgModule({
// #docregion ngmodule-imports
  imports: [ RouterModule.forRoot(routes) ],
// #enddocregion ngmodule-imports
// #docregion export-routermodule
  exports: [ RouterModule ]
// #enddocregion export-routermodule
})
export class AppRoutingModule {}
// #enddocregion
