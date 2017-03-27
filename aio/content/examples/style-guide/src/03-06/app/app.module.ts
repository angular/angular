import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouterModule } from '@angular/router';

import { AppComponent } from './app.component';

@NgModule({
  imports: [
    BrowserModule,
    RouterModule.forChild([{ path: '03-06', component: AppComponent }])
  ],
  declarations: [
    AppComponent
  ],
  exports: [ AppComponent ]
})
export class AppModule {}
