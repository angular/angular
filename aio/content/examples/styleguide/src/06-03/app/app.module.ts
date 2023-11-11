import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';

import { AppComponent } from './app.component';
import { ValidatorDirective } from './shared';

@NgModule({
  imports: [
    RouterModule.forChild([{ path: '06-03', component: AppComponent }])
  ],
  declarations: [
    AppComponent,
    ValidatorDirective
  ],
  exports: [ AppComponent ]
})
export class AppModule {}
