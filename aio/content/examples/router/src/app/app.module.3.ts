// #docplaster
// #docregion
// #docregion remove-heroes
import { NgModule }       from '@angular/core';
import { BrowserModule }  from '@angular/platform-browser';
import { FormsModule }    from '@angular/forms';
// #enddocregion remove-heroes
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

// #docregion remove-heroes
import { AppComponent }     from './app.component';
import { AppRoutingModule } from './app-routing.module';
import { ItemsModule }     from './items/items.module';

import { ClearanceListComponent }   from './clearance-list/clearance-list.component';
import { PageNotFoundComponent } from './page-not-found/page-not-found.component';

@NgModule({
// #docregion module-imports
  imports: [
    BrowserModule,
// #enddocregion module-imports
// #enddocregion remove-heroes
// #docregion animation-import
    BrowserAnimationsModule,
// #enddocregion animation-import
// #docregion remove-heroes
// #docregion module-imports
    FormsModule,
    ItemsModule,
    AppRoutingModule
  ],
// #enddocregion module-imports
  declarations: [
    AppComponent,
    ClearanceListComponent,
    PageNotFoundComponent
  ],
  bootstrap: [ AppComponent ]
})
export class AppModule { }
// #enddocregion remove-heroes
// #enddocregion

/*
// #docregion module-imports-2
  imports: [
    RouterModule.forChild([
      // Heroes Routes
    ]),
    AppRoutingModule
  ],
// #enddocregion module-imports-2
*/
