import {bootstrapApplication} from '@angular/platform-browser';
import {provideAnimations} from '@angular/platform-browser/animations';
import {provideRouter} from '@angular/router';

import {AppComponent} from './app/app.component';

bootstrapApplication(AppComponent, {
  providers: [
    provideAnimations(),
    provideRouter([
      {
        path: '',
        loadComponent: () => import('./app/open-close.component').then((m) => m.OpenCloseComponent),
      },
    ]),
  ],
}).catch((err) => console.error(err));
