import { InjectionToken, Type } from '@angular/core';

// Modules containing custom elements must be set up as lazy-loaded routes (loadChildren)
// TODO(andrewjs): This is a hack, Angular should have first-class support for preparing a module
// that contains custom elements.
export const ELEMENT_MODULE_PATHS_AS_ROUTES = [
  {
    selector: 'aio-announcement-bar',
    loadChildren: './announcement-bar/announcement-bar.module#AnnouncementBarModule'
  },
  {
    selector: 'aio-api-list',
    loadChildren: './api/api-list.module#ApiListModule'
  },
  {
    selector: 'live-example',
    loadChildren: './live-example/live-example.module#LiveExampleModule'
  },
  {
    selector: 'aio-file-not-found-search',
    loadChildren: './search/file-not-found-search.module#FileNotFoundSearchModule'
  },
  {
    selector: 'aio-resource-list',
    loadChildren: './resource/resource-list.module#ResourceListModule'
  },
  {
    selector: 'current-location',
    loadChildren: './current-location/current-location.module#CurrentLocationModule'
  },
  {
    selector: 'aio-contributor-list',
    loadChildren: './contributor/contributor-list.module#ContributorListModule'
  },
  {
    selector: 'code-tabs',
    loadChildren: './code/code-tabs.module#CodeTabsModule'
  },
  {
    selector: 'code-example',
    loadChildren: './code/code-example.module#CodeExampleModule'
  },
  {
    selector: 'expandable-section',
    loadChildren: './expandable-section/expandable-section.module#ExpandableSectionModule'
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
export const ELEMENT_MODULE_PATHS_TOKEN = new InjectionToken('aio/elements-map');

/** Map of possible custom element selectors to their lazy-loadable module paths. */
export const ELEMENT_MODULE_PATHS = new Map<string, string>();
ELEMENT_MODULE_PATHS_AS_ROUTES.forEach(route => {
  ELEMENT_MODULE_PATHS.set(route.selector, route.loadChildren);
});
