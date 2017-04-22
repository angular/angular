import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';

import { AppComponent } from './app.component';
import { InputHighlightDirective,
         ValidateDirective } from './shared';

@NgModule({
  imports: [
    RouterModule.forChild([{ path: '02-08', component: AppComponent }])
  ],
  declarations: [
    AppComponent,
    InputHighlightDirective,
    ValidateDirective
  ],
  exports: [ AppComponent ]
})
export class AppModule {}
