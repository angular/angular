/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import {Route} from '@angular/router';

/**
 * This file contains the redirections we keep to prevent breakages on existing links
 * that may exist on the internet and over which we have no control.
 */

export const REDIRECT_ROUTES: Route[] = [
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
