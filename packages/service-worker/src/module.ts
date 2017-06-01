import {NgModule} from '@angular/core';
import {NgServiceWorker} from './service';

/**
 * @experimental
 */
@NgModule({
  providers: [NgServiceWorker],
})
export class ServiceWorkerModule {
}
