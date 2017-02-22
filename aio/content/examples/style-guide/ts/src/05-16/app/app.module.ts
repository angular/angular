import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouterModule } from '@angular/router';

import { AppComponent } from './app.component';
import { HeroComponent } from './heroes';

@NgModule({
  imports: [
    BrowserModule,
    RouterModule.forChild([{ path: '05-16', component: AppComponent }])
  ],
  declarations: [
    AppComponent,
    HeroComponent
  ],
  exports: [ AppComponent ]
})
export class AppModule {}
