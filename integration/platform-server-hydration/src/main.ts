import {bootstrapApplication} from '@angular/platform-browser';
import {appConfig} from './app/app.config';
import {AppComponent} from './app/app.component';

(globalThis as any)['doBootstrap'] = () => {
  bootstrapApplication(AppComponent, appConfig).catch((err) => console.error(err));
};
