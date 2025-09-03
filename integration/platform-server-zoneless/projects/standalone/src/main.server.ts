import {bootstrapServerApplication} from '@angular/platform-server';
import {AppComponent} from './app/app.component';
import {config} from './app/app.config.server';

const bootstrap = bootstrapServerApplication(AppComponent, config);

export default bootstrap;
