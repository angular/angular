// #docregion
import { NgModule }       from '@angular/core';
import { BrowserModule }  from '@angular/platform-browser';
import { FormsModule }    from '@angular/forms';

import { AppComponent }     from './app.component';
import { AppRoutingModule } from './app-routing.module';
import { HeroesModule }     from './heroes/heroes.module';

import { CrisisListComponent }   from './crisis-list.component';
import { PageNotFoundComponent } from './not-found.component';

@NgModule({
// #docregion module-imports
  imports: [
    BrowserModule,
    FormsModule,
    HeroesModule,
    AppRoutingModule
  ],
// #enddocregion module-imports
  declarations: [
    AppComponent,
    CrisisListComponent,
    PageNotFoundComponent
  ],
  bootstrap: [ AppComponent ]
})
export class AppModule { }
