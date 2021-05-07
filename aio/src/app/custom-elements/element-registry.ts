import { InjectionToken, Type } from '@angular/core';
import { LoadChildrenCallback } from '@angular/router';

// Modules containing custom elements must be set up as lazy-loaded routes (loadChildren)
// TODO(andrewjs): This is a hack, Angular should have first-class support for preparing a module
// that contains custom elements.
export const ELEMENT_MODULE_LOAD_CALLBACKS_AS_ROUTES = [
  {
    selector: 'aio-announcement-bar',
    loadChildren: () => import('./announcement-bar/announcement-bar.module').then(m => m.AnnouncementBarModule)
  },
  {
    selector: 'aio-api-list',
    loadChildren: () => import('./api/api-list.module').then(m => m.ApiListModule)
  },
  {
    selector: 'aio-contributor-list',
    loadChildren: () => import('./contributor/contributor-list.module').then(m => m.ContributorListModule)
  },
  {
    selector: 'aio-file-not-found-search',
    loadChildren: () => import('./search/file-not-found-search.module').then(m => m.FileNotFoundSearchModule)
  },
  {
    selector: 'aio-angular-dist-tag',
    loadChildren: () => import('./dist-tag/dist-tag.module').then(m => m.DistTagModule)
  },
  {
    selector: 'aio-resource-list',
    loadChildren: () => import('./resource/resource-list.module').then(m => m.ResourceListModule)
  },
  {
    selector: 'aio-toc',
    loadChildren: () => import('./toc/toc.module').then(m => m.TocModule)
  },
  {
    selector: 'code-example',
    loadChildren: () => import('./code/code-example.module').then(m => m.CodeExampleModule)
  },
  {
    selector: 'code-tabs',
    loadChildren: () => import('./code/code-tabs.module').then(m => m.CodeTabsModule)
  },
  {
    selector: 'live-example',
    loadChildren: () => import('./live-example/live-example.module').then(m => m.LiveExampleModule)
  },
  {
    selector: 'aio-events',
    loadChildren: () => import('./events/events.module').then(m => m.EventsModule)
  }
];

/**
 * Interface expected to be implemented by all modules that declare a component that can be used as
 * a custom element.
 */
export interface WithCustomElementComponent {
  customElementComponent: Type<any>;
}

/** Injection token to provide the element path modules. */
export const ELEMENT_MODULE_LOAD_CALLBACKS_TOKEN = new InjectionToken<Map<string, LoadChildrenCallback>>('aio/elements-map');

/** Map of possible custom element selectors to their lazy-loadable module paths. */
export const ELEMENT_MODULE_LOAD_CALLBACKS = new Map<string, LoadChildrenCallback>();
ELEMENT_MODULE_LOAD_CALLBACKS_AS_ROUTES.forEach(route => {
  ELEMENT_MODULE_LOAD_CALLBACKS.set(route.selector, route.loadChildren);
});
