import { InjectionToken, Type } from '@angular/core';

export type LoadComponent = () => Promise<Type<unknown>>;

// Components that should be mapped to custom elements must be set up as lazy-loaded routes
// (`loadComponent`).
export const ELEMENT_COMPONENT_LOAD_CALLBACKS_AS_ROUTES: {selector: string, loadComponent: LoadComponent}[] = [
  {
    selector: 'aio-announcement-bar',
    loadComponent: () => import('./announcement-bar/announcement-bar.component').then(m => m.AnnouncementBarComponent)
  },
  {
    selector: 'aio-api-list',
    loadComponent: () => import('./api/api-list.component').then(m => m.ApiListComponent)
  },
  {
    selector: 'aio-contributor-list',
    loadComponent: () => import('./contributor/contributor-list.component').then(m => m.ContributorListComponent)
  },
  {
    selector: 'aio-file-not-found-search',
    loadComponent: () => import('./search/file-not-found-search.component').then(m => m.FileNotFoundSearchComponent)
  },
  {
    selector: 'aio-angular-dist-tag',
    loadComponent: () => import('./dist-tag/dist-tag.component').then(m => m.DistTagComponent)
  },
  {
    selector: 'aio-resource-list',
    loadComponent: () => import('./resource/resource-list.component').then(m => m.ResourceListComponent)
  },
  {
    selector: 'aio-toc',
    loadComponent: () => import('./toc/toc.component').then(m => m.TocComponent)
  },
  {
    selector: 'code-example',
    loadComponent: () => import('./code/code-example.component').then(m => m.CodeExampleComponent)
  },
  {
    selector: 'code-tabs',
    loadComponent: () => import('./code/code-tabs.component').then(m => m.CodeTabsComponent)
  },
  {
    selector: 'live-example',
    loadComponent: () => import('./live-example/live-example.component').then(m => m.LiveExampleComponent)
  },
  {
    selector: 'aio-events',
    loadComponent: () => import('./events/events.component').then(m => m.EventsComponent)
  }
];

/** Injection token to provide the custom element components paths. */
export const ELEMENT_COMPONENT_LOAD_CALLBACKS_TOKEN = new InjectionToken<
  Map<string, LoadComponent>
>('aio/elements-map');

/** Map of possible custom element selectors to their lazy-loadable component paths. */
export const ELEMENT_COMPONENT_LOAD_CALLBACKS = new Map<string, LoadComponent>();
ELEMENT_COMPONENT_LOAD_CALLBACKS_AS_ROUTES.forEach(route => {
  ELEMENT_COMPONENT_LOAD_CALLBACKS.set(route.selector, route.loadComponent);
});
