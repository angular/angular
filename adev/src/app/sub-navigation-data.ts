/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {NavigationItem} from '@angular/docs';

// These 2 imports are expected to be red because they are generated a build time
import FIRST_APP_TUTORIAL_NAV_DATA from '../../src/assets/tutorials/first-app/routes.json';
import LEARN_ANGULAR_TUTORIAL_NAV_DATA from '../../src/assets/tutorials/learn-angular/routes.json';
import DEFERRABLE_VIEWS_TUTORIAL_NAV_DATA from '../../src/assets/tutorials/deferrable-views/routes.json';
import ERRORS_NAV_DATA from '../../src/assets/content/reference/errors/routes.json';
import EXT_DIAGNOSTICS_NAV_DATA from '../../src/assets/content/reference/extended-diagnostics/routes.json';

import {DefaultPage} from './core/enums/pages';
import {getApiNavigationItems} from './features/references/helpers/manifest.helper';

interface SubNavigationData {
  docs: NavigationItem[];
  reference: NavigationItem[];
  tutorials: NavigationItem[];
  footer: NavigationItem[];
}

const DOCS_SUB_NAVIGATION_DATA: NavigationItem[] = [
  {
    label: 'Introduction',
    children: [
      {
        label: 'What is Angular?',
        path: 'overview',
        contentPath: 'introduction/what-is-angular',
      },
      {
        label: 'Installation',
        path: 'installation',
        contentPath: 'introduction/installation',
      },
      {
        label: 'Essentials',
        children: [
          {
            label: 'Overview',
            path: 'essentials',
            contentPath: 'introduction/essentials/overview',
          },
          {
            label: 'Composition with components',
            path: 'essentials/components',
            contentPath: 'introduction/essentials/components',
          },
          {
            label: 'Reactivity with signals',
            path: 'essentials/signals',
            contentPath: 'introduction/essentials/signals',
          },
          {
            label: 'Dynamic interfaces with templates',
            path: 'essentials/templates',
            contentPath: 'introduction/essentials/templates',
          },
          {
            label: 'Modular design with dependency injection',
            path: 'essentials/dependency-injection',
            contentPath: 'introduction/essentials/dependency-injection',
          },
          {
            label: 'Next Steps',
            path: 'essentials/next-steps',
            contentPath: 'introduction/essentials/next-steps',
          },
        ],
      },
      {
        label: 'Start coding! 🚀',
        path: 'tutorials/learn-angular',
      },
    ],
  },
  {
    label: 'In-depth Guides',
    children: [
      {
        label: 'Signals',
        children: [
          {
            label: 'Overview',
            path: 'guide/signals',
            contentPath: 'guide/signals/overview',
          },
          {
            label: 'Dependent state with linkedSignal',
            path: 'guide/signals/linked-signal',
            contentPath: 'guide/signals/linked-signal',
          },
          {
            label: 'Async reactivity with resources',
            path: 'guide/signals/resource',
            contentPath: 'guide/signals/resource',
          },
        ],
      },
      {
        label: 'Components',
        children: [
          {
            label: 'Anatomy of components',
            path: 'guide/components',
            contentPath: 'guide/components/anatomy-of-components',
          },
          {
            label: 'Selectors',
            path: 'guide/components/selectors',
            contentPath: 'guide/components/selectors',
          },
          {
            label: 'Styling',
            path: 'guide/components/styling',
            contentPath: 'guide/components/styling',
          },
          {
            label: 'Accepting data with input properties',
            path: 'guide/components/inputs',
            contentPath: 'guide/components/inputs',
          },
          {
            label: 'Custom events with outputs',
            path: 'guide/components/outputs',
            contentPath: 'guide/components/outputs',
          },
          {
            label: 'Content projection with ng-content',
            path: 'guide/components/content-projection',
            contentPath: 'guide/components/content-projection',
          },
          {
            label: 'Host elements',
            path: 'guide/components/host-elements',
            contentPath: 'guide/components/host-elements',
          },
          {
            label: 'Lifecycle',
            path: 'guide/components/lifecycle',
            contentPath: 'guide/components/lifecycle',
          },
          {
            label: 'Referencing component children with queries',
            path: 'guide/components/queries',
            contentPath: 'guide/components/queries',
          },
          {
            label: 'Using DOM APIs',
            path: 'guide/components/dom-apis',
            contentPath: 'guide/components/dom-apis',
          },
          {
            label: 'Inheritance',
            path: 'guide/components/inheritance',
            contentPath: 'guide/components/inheritance',
          },
          {
            label: 'Programmatically rendering components',
            path: 'guide/components/programmatic-rendering',
            contentPath: 'guide/components/programmatic-rendering',
          },
          {
            label: 'Advanced configuration',
            path: 'guide/components/advanced-configuration',
            contentPath: 'guide/components/advanced-configuration',
          },
          {
            label: 'Custom Elements',
            path: 'guide/elements',
            contentPath: 'guide/elements',
          },
        ],
      },
      {
        label: 'Templates',
        children: [
          {
            label: 'Overview',
            path: 'guide/templates',
            contentPath: 'guide/templates/overview',
          },
          {
            label: 'Binding dynamic text, properties and attributes',
            path: 'guide/templates/binding',
            contentPath: 'guide/templates/binding',
          },
          {
            label: 'Adding event listeners',
            path: 'guide/templates/event-listeners',
            contentPath: 'guide/templates/event-listeners',
          },
          {
            label: 'Two-way binding',
            path: 'guide/templates/two-way-binding',
            contentPath: 'guide/templates/two-way-binding',
          },
          {
            label: 'Control flow',
            path: 'guide/templates/control-flow',
            contentPath: 'guide/templates/control-flow',
          },
          {
            label: 'Pipes',
            path: 'guide/templates/pipes',
            contentPath: 'guide/templates/pipes',
          },
          {
            label: 'Slotting child content with ng-content',
            path: 'guide/templates/ng-content',
            contentPath: 'guide/templates/ng-content',
          },
          {
            label: 'Create template fragments with ng-template',
            path: 'guide/templates/ng-template',
            contentPath: 'guide/templates/ng-template',
          },
          {
            label: 'Grouping elements with ng-container',
            path: 'guide/templates/ng-container',
            contentPath: 'guide/templates/ng-container',
          },
          {
            label: 'Variables in templates',
            path: 'guide/templates/variables',
            contentPath: 'guide/templates/variables',
          },
          {
            label: 'Deferred loading with @defer',
            path: 'guide/templates/defer',
            contentPath: 'guide/templates/defer',
          },
          {
            label: 'Expression syntax',
            path: 'guide/templates/expression-syntax',
            contentPath: 'guide/templates/expression-syntax',
          },
          {
            label: 'Whitespace in templates',
            path: 'guide/templates/whitespace',
            contentPath: 'guide/templates/whitespace',
          },
        ],
      },
      {
        label: 'Directives',
        children: [
          {
            label: 'Overview',
            path: 'guide/directives',
            contentPath: 'guide/directives/overview',
          },
          {
            label: 'Attribute directives',
            path: 'guide/directives/attribute-directives',
            contentPath: 'guide/directives/attribute-directives',
          },
          {
            label: 'Structural directives',
            path: 'guide/directives/structural-directives',
            contentPath: 'guide/directives/structural-directives',
          },
          {
            label: 'Directive composition API',
            path: 'guide/directives/directive-composition-api',
            contentPath: 'guide/directives/directive-composition-api',
          },
          {
            label: 'Optimizing images with NgOptimizedImage',
            path: 'guide/image-optimization',
            contentPath: 'guide/image-optimization',
          },
        ],
      },
      {
        label: 'Dependency Injection',
        children: [
          {
            label: 'Overview',
            path: 'guide/di',
            contentPath: 'guide/di/overview',
          },
          {
            label: 'Understanding dependency injection',
            path: 'guide/di/dependency-injection',
            contentPath: 'guide/di/dependency-injection',
          },
          {
            label: 'Creating an injectable service',
            path: 'guide/di/creating-injectable-service',
            contentPath: 'guide/di/creating-injectable-service',
          },
          {
            label: 'Defining dependency providers',
            path: 'guide/di/dependency-injection-providers',
            contentPath: 'guide/di/dependency-injection-providers',
          },
          {
            label: 'Injection context',
            path: 'guide/di/dependency-injection-context',
            contentPath: 'guide/di/dependency-injection-context',
          },
          {
            label: 'Hierarchical injectors',
            path: 'guide/di/hierarchical-dependency-injection',
            contentPath: 'guide/di/hierarchical-dependency-injection',
          },
          {
            label: 'Optimizing injection tokens',
            path: 'guide/di/lightweight-injection-tokens',
            contentPath: 'guide/di/lightweight-injection-tokens',
          },
          {
            label: 'DI in action',
            path: 'guide/di/di-in-action',
            contentPath: 'guide/di/di-in-action',
          },
        ],
      },
      {
        label: 'Routing',
        status: 'updated',
        children: [
          {
            label: 'Overview',
            path: 'guide/routing',
            contentPath: 'guide/routing/overview',
          },
          {
            label: 'Define routes',
            path: 'guide/routing/define-routes',
            contentPath: 'guide/routing/define-routes',
          },
          {
            label: 'Show routes with Outlets',
            path: 'guide/routing/show-routes-with-outlets',
            contentPath: 'guide/routing/show-routes-with-outlets',
          },
          {
            label: 'Navigate to routes',
            path: 'guide/routing/navigate-to-routes',
            contentPath: 'guide/routing/navigate-to-routes',
          },
          {
            label: 'Read route state',
            path: 'guide/routing/read-route-state',
            contentPath: 'guide/routing/read-route-state',
          },
          {
            label: 'Redirecting routes',
            path: 'guide/routing/redirecting-routes',
            contentPath: 'guide/routing/redirecting-routes',
          },
          {
            label: 'Control route access with guards',
            path: 'guide/routing/route-guards',
            contentPath: 'guide/routing/route-guards',
          },
          {
            label: 'Route data resolvers',
            path: 'guide/routing/data-resolvers',
            contentPath: 'guide/routing/data-resolvers',
          },
          {
            label: 'Lifecycle and events',
            path: 'guide/routing/lifecycle-and-events',
            contentPath: 'guide/routing/lifecycle-and-events',
          },
          {
            label: 'Other routing tasks',
            path: 'guide/routing/common-router-tasks',
            contentPath: 'guide/routing/common-router-tasks',
          },
          {
            label: 'Creating custom route matches',
            path: 'guide/routing/routing-with-urlmatcher',
            contentPath: 'guide/routing/routing-with-urlmatcher',
          },
          {
            label: 'Router reference',
            path: 'guide/routing/router-reference',
            contentPath: 'guide/routing/router-reference',
          },
        ],
      },
      {
        label: 'Forms',
        children: [
          {
            label: 'Overview',
            path: 'guide/forms',
            contentPath: 'guide/forms/overview',
          },
          {
            label: 'Reactive forms',
            path: 'guide/forms/reactive-forms',
            contentPath: 'guide/forms/reactive-forms',
          },
          {
            label: 'Strictly typed reactive forms',
            path: 'guide/forms/typed-forms',
            contentPath: 'guide/forms/typed-forms',
          },
          {
            label: 'Template-driven forms',
            path: 'guide/forms/template-driven-forms',
            contentPath: 'guide/forms/template-driven-forms',
          },
          {
            label: 'Validate form input',
            path: 'guide/forms/form-validation',
            contentPath: 'guide/forms/form-validation',
          },
          {
            label: 'Building dynamic forms',
            path: 'guide/forms/dynamic-forms',
            contentPath: 'guide/forms/dynamic-forms',
          },
        ],
      },
      {
        label: 'HTTP Client',
        children: [
          {
            label: 'Overview',
            path: 'guide/http',
            contentPath: 'guide/http/overview',
          },
          {
            label: 'Setting up HttpClient',
            path: 'guide/http/setup',
            contentPath: 'guide/http/setup',
          },
          {
            label: 'Making requests',
            path: 'guide/http/making-requests',
            contentPath: 'guide/http/making-requests',
          },
          {
            label: 'Reactive data fetching with httpResource',
            path: 'guide/http/http-resource',
            contentPath: 'guide/http/http-resource',
          },
          {
            label: 'Intercepting requests and responses',
            path: 'guide/http/interceptors',
            contentPath: 'guide/http/interceptors',
          },
          {
            label: 'Testing',
            path: 'guide/http/testing',
            contentPath: 'guide/http/testing',
          },
        ],
      },
      {
        label: 'Server-side & hybrid-rendering',
        children: [
          {
            label: 'Overview',
            path: 'guide/performance',
            contentPath: 'guide/performance/overview',
          },
          {
            label: 'Server-side and hybrid-rendering',
            path: 'guide/ssr',
            contentPath: 'guide/ssr',
          },
          {
            label: 'Hydration',
            path: 'guide/hydration',
            contentPath: 'guide/hydration',
          },
          {
            label: 'Incremental Hydration',
            path: 'guide/incremental-hydration',
            contentPath: 'guide/incremental-hydration',
          },
        ],
      },
      {
        label: 'Testing',
        children: [
          {
            label: 'Overview',
            path: 'guide/testing',
            contentPath: 'guide/testing/overview',
          },
          {
            label: 'Code coverage',
            path: 'guide/testing/code-coverage',
            contentPath: 'guide/testing/code-coverage',
          },
          {
            label: 'Testing services',
            path: 'guide/testing/services',
            contentPath: 'guide/testing/services',
          },
          {
            label: 'Basics of testing components',
            path: 'guide/testing/components-basics',
            contentPath: 'guide/testing/components-basics',
          },
          {
            label: 'Component testing scenarios',
            path: 'guide/testing/components-scenarios',
            contentPath: 'guide/testing/components-scenarios',
          },
          {
            label: 'Testing attribute directives',
            path: 'guide/testing/attribute-directives',
            contentPath: 'guide/testing/attribute-directives',
          },
          {
            label: 'Testing pipes',
            path: 'guide/testing/pipes',
            contentPath: 'guide/testing/pipes',
          },
          {
            label: 'Debugging tests',
            path: 'guide/testing/debugging',
            contentPath: 'guide/testing/debugging',
          },
          {
            label: 'Testing utility APIs',
            path: 'guide/testing/utility-apis',
            contentPath: 'guide/testing/utility-apis',
          },
          {
            label: 'Experimental unit testing integration',
            path: 'guide/testing/unit-tests',
            contentPath: 'guide/testing/experimental-unit-test',
          },
          {
            label: 'Component harnesses overview',
            path: 'guide/testing/component-harnesses-overview',
            contentPath: 'guide/testing/component-harnesses-overview',
          },
          {
            label: 'Using component harnesses in tests',
            path: 'guide/testing/using-component-harnesses',
            contentPath: 'guide/testing/using-component-harnesses',
          },
          {
            label: 'Creating harnesses for your components',
            path: 'guide/testing/creating-component-harnesses',
            contentPath: 'guide/testing/creating-component-harnesses',
          },
          {
            label: 'Adding harness support for additional testing environments',
            path: 'guide/testing/component-harnesses-testing-environments',
            contentPath: 'guide/testing/component-harnesses-testing-environments',
          },
        ],
      },
      {
        label: 'Internationalization',
        children: [
          {
            label: 'Overview',
            path: 'guide/i18n',
            contentPath: 'guide/i18n/overview',
          },
          {
            label: 'Add the localize package',
            path: 'guide/i18n/add-package',
            contentPath: 'guide/i18n/add-package',
          },
          {
            label: 'Refer to locales by ID',
            path: 'guide/i18n/locale-id',
            contentPath: 'guide/i18n/locale-id',
          },
          {
            label: 'Format data based on locale',
            path: 'guide/i18n/format-data-locale',
            contentPath: 'guide/i18n/format-data-locale',
          },
          {
            label: 'Prepare component for translation',
            path: 'guide/i18n/prepare',
            contentPath: 'guide/i18n/prepare',
          },
          {
            label: 'Work with translation files',
            path: 'guide/i18n/translation-files',
            contentPath: 'guide/i18n/translation-files',
          },
          {
            label: 'Merge translations into the app',
            path: 'guide/i18n/merge',
            contentPath: 'guide/i18n/merge',
          },
          {
            label: 'Deploy multiple locales',
            path: 'guide/i18n/deploy',
            contentPath: 'guide/i18n/deploy',
          },
          {
            label: 'Import global variants of the locale data',
            path: 'guide/i18n/import-global-variants',
            contentPath: 'guide/i18n/import-global-variants',
          },
          {
            label: 'Manage marked text with custom IDs',
            path: 'guide/i18n/manage-marked-text',
            contentPath: 'guide/i18n/manage-marked-text',
          },
          {
            label: 'Example Angular application',
            path: 'guide/i18n/example',
            contentPath: 'guide/i18n/example',
          },
        ],
      },
      {
        label: 'Animations',
        children: [
          {
            label: 'Animating your content',
            path: 'guide/animations/css',
            contentPath: 'guide/animations/css',
          },
          {
            label: 'Route transition animations',
            path: 'guide/animations/route-animations',
            contentPath: 'guide/animations/route-animations',
          },
        ],
      },
      {
        label: 'Drag and drop',
        path: 'guide/drag-drop',
        contentPath: 'guide/drag-drop',
      },
    ],
  },
  {
    label: 'Build with AI',
    status: 'new',
    children: [
      {
        label: 'Get Started',
        path: 'ai',
        contentPath: 'ai/overview',
      },
      {
        label: 'LLM prompts and AI IDE setup',
        path: 'ai/develop-with-ai',
        contentPath: 'ai/develop-with-ai',
      },
    ],
  },
  {
    label: 'Developer Tools',
    children: [
      {
        label: 'Angular CLI',
        children: [
          {
            label: 'Overview',
            path: 'tools/cli',
            contentPath: 'tools/cli/overview',
          },
          {
            label: 'Local set-up',
            path: 'tools/cli/setup-local',
            contentPath: 'tools/cli/setup-local',
          },
          {
            label: 'Building Angular apps',
            path: 'tools/cli/build',
            contentPath: 'tools/cli/build',
          },
          {
            label: 'Serving Angular apps for development',
            path: 'tools/cli/serve',
            contentPath: 'tools/cli/serve',
          },
          {
            label: 'Deployment',
            path: 'tools/cli/deployment',
            contentPath: 'tools/cli/deployment',
          },
          {
            label: 'End-to-End Testing',
            path: 'tools/cli/end-to-end',
            contentPath: 'tools/cli/end-to-end',
          },
          {
            label: 'Migrating to new build system',
            path: 'tools/cli/build-system-migration',
            contentPath: 'tools/cli/build-system-migration',
          },
          {
            label: 'Build environments',
            path: 'tools/cli/environments',
            contentPath: 'tools/cli/environments',
          },
          {
            label: 'Angular CLI builders',
            path: 'tools/cli/cli-builder',
            contentPath: 'tools/cli/cli-builder',
          },
          {
            label: 'Generating code using schematics',
            path: 'tools/cli/schematics',
            contentPath: 'tools/cli/schematics',
          },
          {
            label: 'Authoring schematics',
            path: 'tools/cli/schematics-authoring',
            contentPath: 'tools/cli/schematics-authoring',
          },
          {
            label: 'Schematics for libraries',
            path: 'tools/cli/schematics-for-libraries',
            contentPath: 'tools/cli/schematics-for-libraries',
          },
          {
            label: 'Template type checking',
            path: 'tools/cli/template-typecheck',
            contentPath: 'tools/cli/template-typecheck',
          },
          {
            label: 'Ahead-of-time (AOT) compilation',
            path: 'tools/cli/aot-compiler',
            contentPath: 'tools/cli/aot-compiler',
          },
          {
            label: 'AOT metadata errors',
            path: 'tools/cli/aot-metadata-errors',
            contentPath: 'tools/cli/aot-metadata-errors',
          },
        ],
      },
      {
        label: 'Libraries',
        children: [
          {
            label: 'Overview',
            path: 'tools/libraries',
            contentPath: 'tools/libraries/overview',
          },
          {
            label: 'Creating Libraries',
            path: 'tools/libraries/creating-libraries',
            contentPath: 'tools/libraries/creating-libraries',
          },
          {
            label: 'Using Libraries',
            path: 'tools/libraries/using-libraries',
            contentPath: 'tools/libraries/using-libraries',
          },
          {
            label: 'Angular Package Format',
            path: 'tools/libraries/angular-package-format',
            contentPath: 'tools/libraries/angular-package-format',
          },
        ],
      },
      {
        label: 'DevTools',
        children: [
          {
            label: 'Overview',
            path: 'tools/devtools',
            contentPath: 'tools/devtools/overview',
          },
          {
            label: 'Components',
            path: 'tools/devtools/component',
            contentPath: 'tools/devtools/component',
          },
          {
            label: 'Profiler',
            path: 'tools/devtools/profiler',
            contentPath: 'tools/devtools/profiler',
          },
          // TODO: create those guides
          // The signal debugging docs should also be added to the signal section
          // {
          //   label: 'Signals',
          //   path: 'tools/devtools/signals',
          //   contentPath: 'tools/devtools/signals',
          // },
          // {
          //   label: 'Router',
          //   path: 'tools/devtools/router',
          //   contentPath: 'tools/devtools/router',
          // }
        ],
      },
      {
        label: 'Language Service',
        path: 'tools/language-service',
        contentPath: 'tools/language-service',
      },
    ],
  },
  {
    label: 'Best Practices',
    children: [
      {
        label: 'Style Guide',
        path: 'style-guide',
        contentPath: 'best-practices/style-guide',
        status: 'updated',
      },
      {
        label: 'Security',
        path: 'best-practices/security',
        contentPath: 'guide/security', // Have not refactored due to build issues
      },
      {
        label: 'Accessibility',
        path: 'best-practices/a11y',
        contentPath: 'best-practices/a11y',
      },
      {
        label: 'Unhandled errors in Angular',
        path: 'best-practices/error-handling',
        contentPath: 'best-practices/error-handling',
      },
      {
        label: 'Performance',
        children: [
          {
            label: 'Overview',
            path: 'best-practices/runtime-performance',
            contentPath: 'best-practices/runtime-performance/overview',
          },
          {
            label: 'Zone pollution',
            path: 'best-practices/zone-pollution',
            contentPath: 'best-practices/runtime-performance/zone-pollution',
          },
          {
            label: 'Slow computations',
            path: 'best-practices/slow-computations',
            contentPath: 'best-practices/runtime-performance/slow-computations',
          },
          {
            label: 'Skipping component subtrees',
            path: 'best-practices/skipping-subtrees',
            contentPath: 'best-practices/runtime-performance/skipping-subtrees',
          },
          {
            label: 'Profiling with the Chrome DevTools',
            path: 'best-practices/profiling-with-chrome-devtools',
            contentPath: 'best-practices/runtime-performance/profiling-with-chrome-devtools',
          },
          {label: 'Zoneless', path: 'guide/zoneless', contentPath: 'guide/zoneless'},
        ],
      },
      {
        label: 'Keeping up-to-date',
        path: 'update',
        contentPath: 'best-practices/update',
      },
    ],
  },
  {
    label: 'Extended Ecosystem',
    children: [
      {
        label: 'NgModules',
        path: 'guide/ngmodules/overview',
        contentPath: 'guide/ngmodules/overview',
      },
      {
        label: 'Animations',
        children: [
          {
            label: 'Overview',
            path: 'guide/animations',
            contentPath: 'guide/animations/overview',
          },
          {
            label: 'Transition and Triggers',
            path: 'guide/animations/transition-and-triggers',
            contentPath: 'guide/animations/transition-and-triggers',
          },
          {
            label: 'Complex Sequences',
            path: 'guide/animations/complex-sequences',
            contentPath: 'guide/animations/complex-sequences',
          },
          {
            label: 'Reusable Animations',
            path: 'guide/animations/reusable-animations',
            contentPath: 'guide/animations/reusable-animations',
          },
          {
            label: 'Migrating to Native CSS Animations',
            path: 'guide/animations/migration',
            contentPath: 'guide/animations/migration',
          },
        ],
      },
      {
        label: 'Using RxJS with Angular',
        children: [
          {
            label: 'Signals interop',
            path: 'ecosystem/rxjs-interop',
            contentPath: 'ecosystem/rxjs-interop/signals-interop',
          },
          {
            label: 'Component output interop',
            path: 'ecosystem/rxjs-interop/output-interop',
            contentPath: 'ecosystem/rxjs-interop/output-interop',
          },
        ],
      },
      {
        label: 'Service Workers & PWAs',
        children: [
          {
            label: 'Overview',
            path: 'ecosystem/service-workers',
            contentPath: 'ecosystem/service-workers/overview',
          },
          {
            label: 'Getting started',
            path: 'ecosystem/service-workers/getting-started',
            contentPath: 'ecosystem/service-workers/getting-started',
          },
          {
            label: 'Configuration file',
            path: 'ecosystem/service-workers/config',
            contentPath: 'ecosystem/service-workers/config',
          },
          {
            label: 'Communicating with the service worker',
            path: 'ecosystem/service-workers/communications',
            contentPath: 'ecosystem/service-workers/communications',
          },
          {
            label: 'Push notifications',
            path: 'ecosystem/service-workers/push-notifications',
            contentPath: 'ecosystem/service-workers/push-notifications',
          },
          {
            label: 'Service worker devops',
            path: 'ecosystem/service-workers/devops',
            contentPath: 'ecosystem/service-workers/devops',
          },
          {
            label: 'App shell pattern',
            path: 'ecosystem/service-workers/app-shell',
            contentPath: 'ecosystem/service-workers/app-shell',
          },
        ],
      },
      {
        label: 'Web workers',
        path: 'ecosystem/web-workers',
        contentPath: 'ecosystem/web-workers',
      },
      {
        label: 'Custom build pipeline',
        path: 'ecosystem/custom-build-pipeline',
        contentPath: 'ecosystem/custom-build-pipeline',
      },
      {
        label: 'Angular Fire',
        path: 'https://github.com/angular/angularfire#readme',
      },
      {
        label: 'Google Maps',
        path: 'https://github.com/angular/components/tree/main/src/google-maps#readme',
      },
      {
        label: 'Google Pay',
        path: 'https://github.com/google-pay/google-pay-button#angular',
      },
      {
        label: 'YouTube player',
        path: 'https://github.com/angular/components/blob/main/src/youtube-player/README.md',
      },
      {
        label: 'Angular CDK',
        path: 'https://material.angular.dev/cdk/categories',
      },
      {
        label: 'Angular Material',
        path: 'https://material.angular.dev/',
      },
    ],
  },
];

export const TUTORIALS_SUB_NAVIGATION_DATA: NavigationItem[] = [
  FIRST_APP_TUTORIAL_NAV_DATA,
  LEARN_ANGULAR_TUTORIAL_NAV_DATA,
  DEFERRABLE_VIEWS_TUTORIAL_NAV_DATA,
  {
    path: DefaultPage.TUTORIALS,
    contentPath: 'tutorials/home',
    label: 'Tutorials',
  },
];

const REFERENCE_SUB_NAVIGATION_DATA: NavigationItem[] = [
  {
    label: 'Roadmap',
    path: 'roadmap',
    contentPath: 'reference/roadmap',
  },
  {
    label: 'Get involved',
    path: 'https://github.com/angular/angular/blob/main/CONTRIBUTING.md',
  },
  {
    label: 'API Reference',
    children: [
      {
        label: 'Overview',
        path: 'api',
      },
      ...getApiNavigationItems(),
    ],
  },
  {
    label: 'CLI Reference',
    children: [
      {
        label: 'Overview',
        path: 'cli',
        contentPath: 'reference/cli',
      },
      {
        label: 'ng add',
        path: 'cli/add',
      },
      {
        label: 'ng analytics',
        children: [
          {
            label: 'Overview',
            path: 'cli/analytics',
          },
          {
            label: 'disable',
            path: 'cli/analytics/disable',
          },
          {
            label: 'enable',
            path: 'cli/analytics/enable',
          },
          {
            label: 'info',
            path: 'cli/analytics/info',
          },
          {
            label: 'prompt',
            path: 'cli/analytics/prompt',
          },
        ],
      },
      {
        label: 'ng build',
        path: 'cli/build',
      },
      {
        label: 'ng cache',
        children: [
          {
            label: 'Overview',
            path: 'cli/cache',
          },
          {
            label: 'clean',
            path: 'cli/cache/clean',
          },
          {
            label: 'disable',
            path: 'cli/cache/disable',
          },
          {
            label: 'enable',
            path: 'cli/cache/enable',
          },
          {
            label: 'info',
            path: 'cli/cache/info',
          },
        ],
      },
      {
        label: 'ng completion',
        children: [
          {
            label: 'Overview',
            path: 'cli/completion',
          },
          {
            label: 'script',
            path: 'cli/completion/script',
          },
        ],
      },
      {
        label: 'ng config',
        path: 'cli/config',
      },
      {
        label: 'ng deploy',
        path: 'cli/deploy',
      },
      {
        label: 'ng e2e',
        path: 'cli/e2e',
      },
      {
        label: 'ng extract-i18n',
        path: 'cli/extract-i18n',
      },
      {
        label: 'ng generate',
        children: [
          {
            label: 'Overview',
            path: 'cli/generate',
          },
          {
            label: 'app-shell',
            path: 'cli/generate/app-shell',
          },
          {
            label: 'application',
            path: 'cli/generate/application',
          },
          {
            label: 'class',
            path: 'cli/generate/class',
          },
          {
            label: 'component',
            path: 'cli/generate/component',
          },
          {
            label: 'config',
            path: 'cli/generate/config',
          },
          {
            label: 'directive',
            path: 'cli/generate/directive',
          },
          {
            label: 'enum',
            path: 'cli/generate/enum',
          },
          {
            label: 'environments',
            path: 'cli/generate/environments',
          },
          {
            label: 'guard',
            path: 'cli/generate/guard',
          },
          {
            label: 'interceptor',
            path: 'cli/generate/interceptor',
          },
          {
            label: 'interface',
            path: 'cli/generate/interface',
          },
          {
            label: 'library',
            path: 'cli/generate/library',
          },
          {
            label: 'module',
            path: 'cli/generate/module',
          },
          {
            label: 'pipe',
            path: 'cli/generate/pipe',
          },
          {
            label: 'resolver',
            path: 'cli/generate/resolver',
          },
          {
            label: 'service-worker',
            path: 'cli/generate/service-worker',
          },
          {
            label: 'service',
            path: 'cli/generate/service',
          },
          {
            label: 'web-worker',
            path: 'cli/generate/web-worker',
          },
        ],
      },
      {
        label: 'ng lint',
        path: 'cli/lint',
      },
      {
        label: 'ng new',
        path: 'cli/new',
      },
      {
        label: 'ng run',
        path: 'cli/run',
      },
      {
        label: 'ng serve',
        path: 'cli/serve',
      },
      {
        label: 'ng test',
        path: 'cli/test',
      },
      {
        label: 'ng update',
        path: 'cli/update',
      },
      {
        label: 'ng version',
        path: 'cli/version',
      },
    ],
  },
  {
    label: 'Error Encyclopedia',
    children: [
      {
        label: 'Overview',
        path: 'errors',
        contentPath: 'reference/errors/overview',
      },
      ...ERRORS_NAV_DATA,
    ],
  },
  {
    label: 'Extended Diagnostics',
    children: [
      {
        label: 'Overview',
        path: 'extended-diagnostics',
        contentPath: 'reference/extended-diagnostics/overview',
      },
      ...EXT_DIAGNOSTICS_NAV_DATA,
    ],
  },
  {
    label: 'Versioning and releases',
    path: 'reference/releases',
    contentPath: 'reference/releases',
  },
  {
    label: 'Version compatibility',
    path: 'reference/versions',
    contentPath: 'reference/versions',
  },
  {
    label: 'Update guide',
    path: 'update-guide',
  },
  {
    label: 'Configurations',
    children: [
      {
        label: 'File structure',
        path: 'reference/configs/file-structure',
        contentPath: 'reference/configs/file-structure',
      },
      {
        label: 'Workspace configuration',
        path: 'reference/configs/workspace-config',
        contentPath: 'reference/configs/workspace-config',
      },
      {
        label: 'Angular compiler options',
        path: 'reference/configs/angular-compiler-options',
        contentPath: 'reference/configs/angular-compiler-options',
      },
      {
        label: 'npm dependencies',
        path: 'reference/configs/npm-packages',
        contentPath: 'reference/configs/npm-packages',
      },
    ],
  },
  {
    label: 'Migrations',
    children: [
      {
        label: 'Overview',
        path: 'reference/migrations',
        contentPath: 'reference/migrations/overview',
      },
      {
        label: 'Standalone',
        path: 'reference/migrations/standalone',
        contentPath: 'reference/migrations/standalone',
      },
      {
        label: 'Control Flow Syntax',
        path: 'reference/migrations/control-flow',
        contentPath: 'reference/migrations/control-flow',
      },
      {
        label: 'inject() Function',
        path: 'reference/migrations/inject-function',
        contentPath: 'reference/migrations/inject-function',
      },
      {
        label: 'Lazy-loaded routes',
        path: 'reference/migrations/route-lazy-loading',
        contentPath: 'reference/migrations/route-lazy-loading',
      },
      {
        label: 'Signal inputs',
        path: 'reference/migrations/signal-inputs',
        contentPath: 'reference/migrations/signal-inputs',
      },
      {
        label: 'Outputs',
        path: 'reference/migrations/outputs',
        contentPath: 'reference/migrations/outputs',
      },
      {
        label: 'Signal queries',
        path: 'reference/migrations/signal-queries',
        contentPath: 'reference/migrations/signal-queries',
      },
      {
        label: 'Clean up unused imports',
        path: 'reference/migrations/cleanup-unused-imports',
        contentPath: 'reference/migrations/cleanup-unused-imports',
      },
      {
        label: 'Self-closing tags',
        path: 'reference/migrations/self-closing-tags',
        contentPath: 'reference/migrations/self-closing-tags',
      },
    ],
  },
];

const FOOTER_NAVIGATION_DATA: NavigationItem[] = [
  {
    label: 'Press Kit',
    path: 'press-kit',
    contentPath: 'reference/press-kit',
  },
  {
    label: 'License',
    path: 'license',
    contentPath: 'reference/license',
  },
];

// Docs navigation data structure, it's used to display structure in
// navigation-list component And build the routing table for content pages.
export const SUB_NAVIGATION_DATA: SubNavigationData = {
  docs: DOCS_SUB_NAVIGATION_DATA,
  reference: REFERENCE_SUB_NAVIGATION_DATA,
  tutorials: TUTORIALS_SUB_NAVIGATION_DATA,
  footer: FOOTER_NAVIGATION_DATA,
};
