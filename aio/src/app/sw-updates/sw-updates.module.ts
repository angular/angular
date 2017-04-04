import { NgModule } from '@angular/core';
import { MdSnackBarModule } from '@angular/material';
import { ServiceWorkerModule } from '@angular/service-worker';

import { noopNgServiceWorkerProviders } from './noop-ng-service-worker';
import { SwUpdateNotificationsService } from './sw-update-notifications.service';
import { SwUpdatesService } from './sw-updates.service';

@NgModule({
  imports: [
    MdSnackBarModule,
    ServiceWorkerModule
  ],
  providers: [
    noopNgServiceWorkerProviders,
    SwUpdateNotificationsService,
    SwUpdatesService
  ]
})
export class SwUpdatesModule {}
