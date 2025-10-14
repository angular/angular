import {AboutComponent} from './about/about.component';
import {DashboardComponent} from './dashboard/dashboard.component';
export const routes = [
  {path: '', redirectTo: 'dashboard', pathMatch: 'full'},
  {path: 'about', component: AboutComponent},
  {path: 'dashboard', component: DashboardComponent},
  {path: 'heroes', loadChildren: () => import('./hero/hero.routes')},
];
//# sourceMappingURL=app.routes.js.map
