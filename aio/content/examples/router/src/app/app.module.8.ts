// #docregion
import { NgModule }             from '@angular/core';
import { BrowserModule }        from '@angular/platform-browser';
import { FormsModule }          from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';

import { AppComponent }          from './app.component';
import { PageNotFoundComponent } from './not-found.component';

const routes: Routes = [

];

@NgModule({
  imports: [
    BrowserModule,
    FormsModule,
    RouterModule.forRoot(routes, { useHash: true })  // .../#/crisis-center/
  ],
  declarations: [
    AppComponent,
    PageNotFoundComponent
  ],
  providers: [
    {provide: APP_BASE_HREF, useValue: '!'}  // .../#!/crisis-center/
  ],
  bootstrap: [ AppComponent ]
})
export class AppModule { }
