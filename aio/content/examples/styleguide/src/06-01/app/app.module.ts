import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';

import { AppComponent } from './app.component';
import { HighlightDirective } from './shared';

@NgModule({
  imports: [
    RouterModule.forChild([{ path: '06-01', component: AppComponent }])
  ],
  declarations: [
    AppComponent,
    HighlightDirective
  ],
  exports: [ AppComponent ]
})
export class AppModule {}
