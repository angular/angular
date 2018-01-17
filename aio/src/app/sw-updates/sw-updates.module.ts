import { NgModule } from '@angular/core';
import { ServiceWorkerModule } from '@angular/service-worker';

import { SwUpdatesService } from './sw-updates.service';


@NgModule({
  imports: [
    ServiceWorkerModule
  ],
  providers: [
    SwUpdatesService
  ]
})
export class SwUpdatesModule {}
