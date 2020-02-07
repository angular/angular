import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { AboutComponent } from './about.component';

@NgModule({
  imports: [
    RouterModule.forChild([
      {
        path: '',
        pathMatch: 'full',
        component: AboutComponent,
      },
    ]),
  ],
  declarations: [AboutComponent],
  exports: [AboutComponent],
})
export class AboutModule {}
