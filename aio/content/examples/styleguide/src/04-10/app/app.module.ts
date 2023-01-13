import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouterModule } from '@angular/router';

import { AppComponent } from './app.component';
import { HeroesComponent } from './heroes/heroes.component';
import { SharedModule } from './shared/shared.module';

@NgModule({
  imports: [
    BrowserModule,
    SharedModule,
    RouterModule.forChild([{ path: '04-10', component: AppComponent }])
  ],
  declarations: [
    AppComponent,
    HeroesComponent
  ],
  exports: [ AppComponent ]
})
export class AppModule {}
