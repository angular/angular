import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class LazyLoaderService {
  bootstrapped = false;

  load(el: HTMLElement): void {
    if (this.bootstrapped) {
      return;
    }

    import('./angularjs-app').then(app => {
      try {
        app.bootstrap(el);
        this.bootstrapped = true;
      } catch (e) {
        console.error(e);
      }
    });
  }
}
