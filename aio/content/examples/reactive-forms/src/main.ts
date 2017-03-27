// tslint:disable:no-unused-variable
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import { AppModule }  from './app/app.module';  // just the final version
import { DemoModule } from './app/demo.module'; // demo picker

platformBrowserDynamic().bootstrapModule(DemoModule); // (AppModule);
