import { NgModule }      from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouterModule }  from '@angular/router';

import { AppComponent }    from './app.component';
import { HeroesComponent } from './heroes';
import { HeroService }     from './heroes/shared';

@NgModule({
  imports: [
    BrowserModule,
    RouterModule.forChild([{ path: '05-04', component: AppComponent }])
  ],
  declarations: [
    AppComponent,
    HeroesComponent
  ],
  exports: [ AppComponent ],
  providers: [ HeroService ]
})
export class AppModule {}
