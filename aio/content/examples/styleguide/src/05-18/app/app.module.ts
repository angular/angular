import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouterModule } from '@angular/router';

import { AppComponent } from './app.component';
import { HeroComponent, HeroListComponent } from './heroes';

@NgModule({
  imports: [
    BrowserModule,
    RouterModule.forChild([{ path: '05-18', component: AppComponent }])
  ],
  declarations: [
    AppComponent,
    HeroComponent,
    HeroListComponent
  ],
  exports: [AppComponent]
})
export class AppModule {}
