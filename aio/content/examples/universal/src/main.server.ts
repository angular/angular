import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './app/app.component';
import { config } from './app/app.config.server';

// #docregion bootstrap
// Parallels the client-side bootstrapping call in `main.ts`
const bootstrap = () => bootstrapApplication(AppComponent, config);
export default bootstrap;
// #enddocregion bootstrap
