import { Injectable } from '@angular/core';
import * as angular from 'angular';

@Injectable({
  providedIn: 'root'
})
export class LazyLoaderService {
  private app: angular.auto.IInjectorService | undefined;

  load(el: HTMLElement): void {
    import('./angularjs-app').then(app => {
      try {
        this.app = app.bootstrap(el);
      } catch (e) {
        console.error(e);
      }
    });
  }

  destroy() {
    if (this.app) {
      this.app.get('$rootScope').$destroy();
    }
  }
}
