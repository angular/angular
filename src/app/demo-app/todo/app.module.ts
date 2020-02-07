import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { AppComponent } from './app.component';
import { RouterModule } from '@angular/router';

@NgModule({
  declarations: [AppComponent],
  imports: [
    CommonModule,
    RouterModule.forChild([
      {
        path: 'todos',
        component: AppComponent,
        children: [
          {
            path: 'app',
            loadChildren: () => import('./home/home.module').then(m => m.HomeModule),
          },
          {
            path: 'about',
            loadChildren: () => import('./about/about.module').then(m => m.AboutModule),
          },
          {
            path: '**',
            redirectTo: 'app',
          },
        ],
      },
      {
        path: '**',
        redirectTo: 'todos',
      },
    ]),
  ],
  exports: [AppComponent],
  bootstrap: [AppComponent],
})
export class AppModule {}
