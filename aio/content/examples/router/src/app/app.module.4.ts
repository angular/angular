// #docplaster
// #docregion
// #docregion crisis-center-module, admin-module
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { AppComponent } from './app.component';
import { PageNotFoundComponent } from './page-not-found/page-not-found.component';
import { ComposeMessageComponent } from './compose-message/compose-message.component';

import { AppRoutingModule } from './app-routing.module';
import { HeroesModule } from './heroes/heroes.module';
import { CrisisCenterModule } from './crisis-center/crisis-center.module';
// #enddocregion crisis-center-module

import { AdminModule } from './admin/admin.module';
// #docregion crisis-center-module

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    HeroesModule,
    CrisisCenterModule,
// #enddocregion crisis-center-module
    AdminModule,
// #docregion crisis-center-module
    AppRoutingModule
  ],
  declarations: [
    AppComponent,
// #enddocregion crisis-center-module
    ComposeMessageComponent,
// #docregion crisis-center-module
    PageNotFoundComponent
  ],
  bootstrap: [ AppComponent ]
})
export class AppModule { }
// #enddocregion
