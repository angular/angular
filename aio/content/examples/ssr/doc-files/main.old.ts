// #region Dummy components to satisfy the router
import { Component } from '@angular/core';

@Component({ standalone: true, selector: 'app-dashboard', template: '' })

class DashboardComponent {}
@Component({ standalone: true, selector: 'app-dashboard', template: '' })
class HeroDetailComponent {}

@Component({ standalone: true, selector: 'app-dashboard', template: '' })
class HeroesComponent {}

// #endregion Dummy components to satisfy the router

// #docregion

import { bootstrapApplication } from '@angular/platform-browser';
import { provideRouter, Routes} from '@angular/router';
import { provideHttpClient } from '@angular/common/http';

import { AppComponent } from './app/app.component';

// ... more imports ...

export const routes: Routes = [
  { path: '', redirectTo: '/dashboard', pathMatch: 'full' },
  { path: 'dashboard', component: DashboardComponent },
  { path: 'detail/:id', component: HeroDetailComponent },
  { path: 'heroes', component: HeroesComponent }
];

bootstrapApplication(AppComponent, {
  providers: [
    provideRouter(routes),
    provideHttpClient(),
  ]
}).catch(err => console.error(err));

// #enddocregion
