import { Route } from '@angular/router';
import { LazyComponent } from './lazy.component';

export default [
  { path: '*', component: LazyComponent },
  // ... more child routes ...
] as Route[];
