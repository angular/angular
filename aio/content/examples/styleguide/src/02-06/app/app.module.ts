import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';

import { AppComponent } from './app.component';
import { HeroButtonComponent } from './heroes';

@NgModule({
  imports: [
    RouterModule.forChild([{ path: '02-06', component: AppComponent }])
  ],
  declarations: [
    AppComponent,
    HeroButtonComponent
  ],
  exports: [ AppComponent ]
})
export class AppModule {}
