/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {contentResolver, flatNavigationData, mapNavigationItemsToRoutes} from '@angular/docs';
import {Route} from '@angular/router';

import {DefaultPage, PagePrefix} from './core/enums/pages';
import {SUB_NAVIGATION_DATA} from './sub-navigation-data';
import {mapApiManifestToRoutes} from './features/references/helpers/manifest.helper';

// Docs navigation data contains routes which navigates to /tutorials pages, in
// that case we should load Tutorial component
export const DOCS_ROUTES = mapNavigationItemsToRoutes(
  flatNavigationData(SUB_NAVIGATION_DATA.docs).filter(
    (route) =>
      !route.path?.startsWith(PagePrefix.TUTORIALS) && route.path !== PagePrefix.PLAYGROUND,
  ),
  {
    loadComponent: () => import('./features/docs/docs.component'),
    data: {
      displaySecondaryNav: true,
    },
  },
);

const referenceNavigationItems = flatNavigationData(SUB_NAVIGATION_DATA.reference);
const commonReferenceRouteData = {
  displaySecondaryNav: true,
};
const referencePageRoutes = mapNavigationItemsToRoutes(
  referenceNavigationItems.filter((r) => r.path === DefaultPage.REFERENCE),
  {
    loadComponent: () =>
      import('./features/references/api-reference-list/api-reference-list.component'),
    data: commonReferenceRouteData,
  },
);

const updateGuidePageRoute: Route = {
  path: referenceNavigationItems.find((r) => r.path === DefaultPage.UPDATE)!.path,
  loadComponent: () => import('./features/update/update.component'),
  data: commonReferenceRouteData,
};

const cliReferencePageRoutes = mapNavigationItemsToRoutes(
  referenceNavigationItems.filter((r) => r.path?.startsWith(`${PagePrefix.CLI}/`)),
  {
    loadComponent: () =>
      import(
        './features/references/cli-reference-details-page/cli-reference-details-page.component'
      ),
    data: commonReferenceRouteData,
  },
).map((route) => ({
  ...route,
  resolve: {
    docContent: contentResolver(`${route.path}.html`),
  },
}));

const docsReferencePageRoutes = mapNavigationItemsToRoutes(
  referenceNavigationItems.filter(
    (r) =>
      r.path !== DefaultPage.REFERENCE &&
      r.path !== DefaultPage.UPDATE &&
      !r.path?.startsWith(`${PagePrefix.API}/`) &&
      !r.path?.startsWith(`${PagePrefix.CLI}/`),
  ),
  {
    loadComponent: () => import('./features/docs/docs.component'),
    data: {
      ...commonReferenceRouteData,
    },
  },
);
export const REFERENCE_ROUTES = [
  ...referencePageRoutes,
  ...docsReferencePageRoutes,
  ...cliReferencePageRoutes,
];

const tutorialsNavigationItems = flatNavigationData(SUB_NAVIGATION_DATA.tutorials);
const commonTutorialRouteData = {
  hideFooter: true,
};
const docsTutorialsRoutes = mapNavigationItemsToRoutes(
  tutorialsNavigationItems.filter((route) => route.path === DefaultPage.TUTORIALS),
  {
    loadComponent: () => import('./features/docs/docs.component'),
    data: {
      ...commonTutorialRouteData,
    },
  },
);
const tutorialComponentRoutes = mapNavigationItemsToRoutes(
  tutorialsNavigationItems.filter((route) => route.path !== DefaultPage.TUTORIALS),
  {
    loadComponent: () => import('./features/tutorial/tutorial.component'),
    data: {...commonTutorialRouteData},
  },
);
export const TUTORIALS_ROUTES = [...docsTutorialsRoutes, ...tutorialComponentRoutes];

// Based on SUB_NAVIGATION_DATA structure, we need to build the routing table
// for content pages.
export const SUB_NAVIGATION_ROUTES: Route[] = [
  ...DOCS_ROUTES,
  ...REFERENCE_ROUTES,
  ...TUTORIALS_ROUTES,
];

const FOOTER_ROUTES: Route[] = mapNavigationItemsToRoutes(
  flatNavigationData(SUB_NAVIGATION_DATA.footer),
  {loadComponent: () => import('./features/docs/docs.component')},
);

const API_REFERENCE_ROUTES: Route[] = mapApiManifestToRoutes();

export const routes: Route[] = [
  {
    path: '',
    children: [
      {
        path: '',
        loadComponent: () => import('./features/home/home.component'),
        data: {label: 'Home'},
      },
      {
        path: PagePrefix.DOCS,
        redirectTo: DefaultPage.DOCS,
      },
      {
        path: PagePrefix.TUTORIALS,
        redirectTo: DefaultPage.TUTORIALS,
      },
      {
        path: PagePrefix.REFERENCE,
        redirectTo: DefaultPage.REFERENCE,
      },
      {
        path: PagePrefix.PLAYGROUND,
        loadComponent: () => import('./features/playground/playground.component'),
        data: {...commonTutorialRouteData, label: 'Playground'},
      },
      ...SUB_NAVIGATION_ROUTES,
      ...API_REFERENCE_ROUTES,
      ...FOOTER_ROUTES,
      updateGuidePageRoute,
    ],
  },
  // Error page
  {
    path: '**',
    loadComponent: () => import('./features/docs/docs.component'),
    resolve: {'docContent': contentResolver('error')},
  },
];
