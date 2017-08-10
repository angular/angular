// #docregion
import { NgModule }       from '@angular/core';
import { BrowserModule }  from '@angular/platform-browser';
import { FormsModule }    from '@angular/forms';
import { RouterModule }   from '@angular/router';

import { AppComponent }        from './app.component';
import { HeroDetailComponent } from './hero-detail.component';
import { DashboardComponent }  from './dashboard.component';
import { HeroesComponent }     from './heroes.component';
import { HeroService }         from './hero.service';

@NgModule({
  imports: [
    BrowserModule,
    FormsModule,
    RouterModule.forRoot([
      // #docregion redirect
      {
        path: '',
        redirectTo: '/dashboard',
        pathMatch: 'full'
      },
      // #enddocregion redirect
      // #docregion dashboard
      {
        path: 'dashboard',
        component: DashboardComponent
      },
      // #enddocregion dashboard
      // #docregion hero-detail
      {
        path: 'detail/:id',
        component: HeroDetailComponent
      },
      // #enddocregion hero-detail
      // #docregion heroes, routing
      {
        path: 'heroes',
        component: HeroesComponent
      }
      // #enddocregion heroes, routing
    ])
  ],
  declarations: [
    AppComponent,
    DashboardComponent,
    HeroDetailComponent,
    HeroesComponent
  ],
  providers: [
    HeroService
  ],
  bootstrap: [ AppComponent ]
})
export class AppModule {
}
// #enddocregion
