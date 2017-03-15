// #docregion
import { NgModule }             from '@angular/core';
import { BrowserModule }        from '@angular/platform-browser';
import { RouterModule, Routes } from '@angular/router';

import { AppComponent }           from './app.component';
import { CrisisListComponent }    from './crisis-list.component';
import { HeroListComponent }      from './hero-list.component';

const appRoutes: Routes = [
  { path: 'crisis-center', component: CrisisListComponent },
  { path: 'heroes',        component: HeroListComponent },

  { path: '', redirectTo: '/heroes', pathMatch: 'full' }
];

@NgModule({
  imports: [
    BrowserModule,
    RouterModule.forRoot(appRoutes)
  ],
  declarations: [
    AppComponent,
    CrisisListComponent,
    HeroListComponent
  ],
  bootstrap: [ AppComponent ]
})
export class AppModule { }
