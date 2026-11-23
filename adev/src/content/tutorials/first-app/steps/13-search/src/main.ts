import {bootstrapApplication} from '@angular/platform-browser';
import {App} from './app/app';
import {provideRouter} from '@angular/router';
import routeConfig from './app/routes';

bootstrapApplication(App, {
  providers: [provideRouter(routeConfig)],
}).catch((err) => console.error(err));
