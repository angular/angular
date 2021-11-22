import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

import { DevToolsModule as NgDevToolsModule } from 'ng-devtools';

import { DevToolsComponent } from './devtools-app.component';

@NgModule({
  declarations: [DevToolsComponent],
  imports: [
    NgDevToolsModule,
    CommonModule,
    RouterModule.forChild([
      {
        path: '',
        component: DevToolsComponent,
        pathMatch: 'full',
      },
    ]),
  ],
})
export class DevToolsModule {}
