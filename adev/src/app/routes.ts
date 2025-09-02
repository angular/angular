/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {contentResolver, flatNavigationData, mapNavigationItemsToRoutes} from '@angular/docs';
import {Route} from '@angular/router';
import {SUB_NAVIGATION_DATA} from './sub-navigation-data';
import {mapApiManifestToRoutes} from './features/references/helpers/manifest.helper';
import MainComponent from './main.component';
import {DEFAULT_PAGES, PAGE_PREFIX} from './core/constants/pages';

// Docs navigation data contains routes which navigates to /tutorials pages, in
// that case we should load Tutorial component
export const DOCS_ROUTES: Route[] = mapNavigationItemsToRoutes(
  flatNavigationData(SUB_NAVIGATION_DATA.docs).filter(
    (route) =>
      !route.path?.startsWith(PAGE_PREFIX.TUTORIALS) && route.path !== PAGE_PREFIX.PLAYGROUND,
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
  referenceNavigationItems.filter((r) => r.path === DEFAULT_PAGES.REFERENCE),
  {
    loadComponent: () =>
      import('./features/references/api-reference-list/api-reference-list.component'),
    data: commonReferenceRouteData,
  },
);

const updateGuidePageRoute: Route = {
  path: referenceNavigationItems.find((r) => r.path === DEFAULT_PAGES.UPDATE)!.path,
  loadComponent: () => import('./features/update/update.component'),
  data: commonReferenceRouteData,
};

const cliReferencePageRoutes = mapNavigationItemsToRoutes(
  referenceNavigationItems.filter((r) => r.path?.startsWith(`${PAGE_PREFIX.CLI}/`)),
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
      r.path !== DEFAULT_PAGES.REFERENCE &&
      r.path !== DEFAULT_PAGES.UPDATE &&
      !r.path?.startsWith(`${PAGE_PREFIX.API}/`) &&
      !r.path?.startsWith(`${PAGE_PREFIX.CLI}/`),
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
  tutorialsNavigationItems.filter((route) => route.path === DEFAULT_PAGES.TUTORIALS),
  {
    loadComponent: () => import('./features/docs/docs.component'),
    data: {
      ...commonTutorialRouteData,
    },
  },
);
const tutorialComponentRoutes = mapNavigationItemsToRoutes(
  tutorialsNavigationItems.filter((route) => route.path !== DEFAULT_PAGES.TUTORIALS),
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

const REDIRECT_ROUTES: Route[] = [
  {
    path: 'guide/drag-drop',
    redirectTo: '/guide/animations/drag-and-drop',
  },
  {
    path: 'guide/defer',
    redirectTo: '/guide/templates/defer',
  },
  {
    path: 'guide/components/importing',
    redirectTo: '/guide/components/anatomy-of-components#using-components',
  },
  {
    path: 'guide/templates/attribute-binding',
    redirectTo: '/guide/templates/binding#binding-dynamic-properties-and-attributes',
  },
  {
    path: 'guide/templates/interpolation',
    redirectTo: '/guide/templates/binding#render-dynamic-text-with-text-interpolation',
  },
  {
    path: 'guide/templates/class-binding',
    redirectTo: '/guide/templates/binding#css-class-and-style-property-bindings',
  },
  {
    path: 'guide/templates/event-binding',
    redirectTo: '/guide/templates/event-listeners',
  },
  {
    path: 'guide/templates/let-template-variables',
    redirectTo: '/guide/templates/variables#local-template-variables-with-let',
  },
  {
    path: 'guide/templates/property-binding',
    redirectTo: '/guide/templates/binding#binding-dynamic-properties-and-attributes',
  },
  {
    path: 'guide/templates/property-binding-best-practices',
    redirectTo: '/guide/templates/binding#binding-dynamic-properties-and-attributes',
  },
  {
    path: 'guide/templates/reference-variables',
    redirectTo: '/guide/templates/variables#template-reference-variables',
  },
  {
    path: 'guide/templates/svg-in-templates',
    redirectTo: '/guide/templates/binding',
  },
  {
    path: 'guide/templates/template-statements',
    redirectTo: '/guide/templates/event-listeners',
  },
  {
    path: 'guide/signals/rxjs-interop',
    redirectTo: '/ecosystem/rxjs-interop',
  },
  {
    path: 'guide/components/output-function',
    redirectTo: '/guide/components/outputs',
  },
  {
    path: 'guide/signals/queries',
    redirectTo: '/guide/components/queries',
  },
  {
    path: 'guide/signals/model',
    redirectTo: '/guide/signals/inputs',
  },
  {
    path: 'guide/signals/inputs',
    redirectTo: '/guide/components/inputs',
  },
  {
    path: 'guide/ngmodules',
    redirectTo: '/guide/ngmodules/overview',
  },
  {
    path: 'guide/ngmodules/providers',
    redirectTo: '/guide/ngmodules/overview',
  },
  {
    path: 'guide/ngmodules/singleton-services',
    redirectTo: '/guide/ngmodules/overview',
  },
  {
    path: 'guide/ngmodules/lazy-loading',
    redirectTo: '/guide/ngmodules/overview',
  },
  {
    path: 'guide/ngmodules/faq',
    redirectTo: '/guide/ngmodules/overview',
  },
  {
    path: 'guide/components/anatomy-of-components',
    redirectTo: '/guide/components',
  },
  {
    path: 'guide/hybrid-rendering',
    redirectTo: '/guide/ssr',
  },
  {
    path: 'guide/prerendering',
    redirectTo: '/guide/ssr',
  },
  {
    path: 'hmr',
    redirectTo: '/tools/cli/build-system-migration#hot-module-replacement',
  },
  {
    path: 'guide',
    children: [
      {
        path: 'pipes',
        redirectTo: '/guide/templates/pipes',
      },
    ],
  },
  {
    path: 'guide/experimental/zoneless',
    redirectTo: '/guide/zoneless',
  },
  {
    path: 'guide/animations/route-animations',
    redirectTo: '/guide/routing/route-transition-animations',
  },
  {
    path: 'guide/animations/enter-and-leave',
    redirectTo: '/guide/animations',
  },
  {
    path: 'guide/animations/transitions-and-triggers',
    redirectTo: '/guide/legacy-animations/transitions-and-triggers',
  },
  {
    path: 'guide/animations/complex-sequences',
    redirectTo: '/guide/legacy-animations/complex-sequences',
  },
  {
    path: 'guide/animations/reusable-animations',
    redirectTo: '/guide/legacy-animations/reusable-animations',
  },
];

export const routes: Route[] = [
  {
    path: '',
    component: MainComponent,
    children: [
      {
        path: '',
        loadComponent: () => import('./features/home/home.component'),
        data: {label: 'Home'},
      },
      {
        path: PAGE_PREFIX.DOCS,
        redirectTo: DEFAULT_PAGES.DOCS,
      },
      {
        path: PAGE_PREFIX.REFERENCE,
        redirectTo: DEFAULT_PAGES.REFERENCE,
      },
      {
        path: PAGE_PREFIX.PLAYGROUND,
        loadComponent: () => import('./features/playground/playground.component'),
        data: {...commonTutorialRouteData, label: 'Playground'},
      },
      ...SUB_NAVIGATION_ROUTES,
      ...API_REFERENCE_ROUTES,
      ...FOOTER_ROUTES,
      updateGuidePageRoute,
      ...REDIRECT_ROUTES,
    ],
  },
  // Error page
  {
    path: '**',
    loadComponent: () => import('./features/docs/docs.component'),
    resolve: {'docContent': contentResolver('error')},
  },
];
