/**
 * Application Routes
 *
 * Chapter 8 (Router) - 라우트 설정과 Lazy Loading
 */

import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    redirectTo: '/tasks',
    pathMatch: 'full'
  },
  {
    path: 'tasks',
    loadComponent: () =>
      import('./features/tasks/task-list.component').then(m => m.TaskListComponent),
    title: 'TaskMaster - 작업 목록'
  },
  {
    path: 'analytics',
    loadComponent: () =>
      import('./features/analytics/dashboard.component').then(m => m.DashboardComponent),
    title: 'TaskMaster - 분석'
  },
  {
    path: 'settings',
    loadComponent: () =>
      import('./features/settings/settings.component').then(m => m.SettingsComponent),
    title: 'TaskMaster - 설정'
  },
  {
    path: '**',
    redirectTo: '/tasks'
  }
];
