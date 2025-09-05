import {AppComponent} from './app/app.component';
import {config} from './app/app.config.server';
import {bootstrapServerApplication} from '@angular/platform-server';

const bootstrap = bootstrapServerApplication(AppComponent, config);

export default bootstrap;
