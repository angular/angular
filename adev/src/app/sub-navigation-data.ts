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
            label: 'linkedSignal',
            path: 'guide/signals/linked-signal',
            contentPath: 'guide/signals/linked-signal',
          },
          {
            label: 'Resource',
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
        children: [
          {
            label: 'Overview',
            path: 'guide/routing',
            contentPath: 'guide/routing/overview',
          },
          {
            label: 'Common routing tasks',
            path: 'guide/routing/common-router-tasks',
            contentPath: 'guide/routing/common-router-tasks',
          },
          {
            label: 'Routing in single-page applications',
            path: 'guide/routing/router-tutorial',
            contentPath: 'guide/routing/router-tutorial',
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
            label: 'Server-side rendering',
            path: 'guide/ssr',
            contentPath: 'guide/ssr',
          },
          {
            label: 'Build-time prerendering',
            path: 'guide/prerendering',
            contentPath: 'guide/prerendering',
          },
          {
            label: 'Hybrid rendering with server routing',
            path: 'guide/hybrid-rendering',
            contentPath: 'guide/hybrid-rendering',
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
        label: 'Experimental features',
        children: [
          {label: 'Zoneless', path: 'guide/experimental/zoneless', contentPath: 'guide/zoneless'},
        ],
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
        path: 'tools/devtools',
        contentPath: 'tools/devtools',
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
            label: 'Route transition animations',
            path: 'guide/animations/route-animations',
            contentPath: 'guide/animations/route-animations',
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
        path: 'https://material.angular.io/cdk/categories',
      },
      {
        label: 'Angular Material',
        path: 'https://material.angular.io/',
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
      {
        label: 'NG0100: Expression Changed After Checked',
        path: 'errors/NG0100',
        contentPath: 'reference/errors/NG0100',
      },
      {
        label: 'NG01101: Wrong Async Validator Return Type',
        path: 'errors/NG01101',
        contentPath: 'reference/errors/NG01101',
      },
      {
        label: 'NG01203: Missing value accessor',
        path: 'errors/NG01203',
        contentPath: 'reference/errors/NG01203',
      },
      {
        label: 'NG0200: Circular Dependency in DI',
        path: 'errors/NG0200',
        contentPath: 'reference/errors/NG0200',
      },
      {
        label: 'NG0201: No Provider Found',
        path: 'errors/NG0201',
        contentPath: 'reference/errors/NG0201',
      },
      {
        label: 'NG0203: `inject()` must be called from an injection context',
        path: 'errors/NG0203',
        contentPath: 'reference/errors/NG0203',
      },
      {
        label: 'NG0209: Invalid multi provider',
        path: 'errors/NG0209',
        contentPath: 'reference/errors/NG0209',
      },
      {
        label: 'NG02200: Missing Iterable Differ',
        path: 'errors/NG02200',
        contentPath: 'reference/errors/NG02200',
      },
      {
        label: 'NG02800: JSONP support in HttpClient configuration',
        path: 'errors/NG02800',
        contentPath: 'reference/errors/NG02800',
      },
      {
        label: 'NG0300: Selector Collision',
        path: 'errors/NG0300',
        contentPath: 'reference/errors/NG0300',
      },
      {
        label: 'NG0301: Export Not Found',
        path: 'errors/NG0301',
        contentPath: 'reference/errors/NG0301',
      },
      {
        label: 'NG0302: Pipe Not Found',
        path: 'errors/NG0302',
        contentPath: 'reference/errors/NG0302',
      },
      {
        label: `NG0403: Bootstrapped NgModule doesn't specify which component to initialize`,
        path: 'errors/NG0403',
        contentPath: 'reference/errors/NG0403',
      },
      {
        label: 'NG0500: Hydration Node Mismatch',
        path: 'errors/NG0500',
        contentPath: 'reference/errors/NG0500',
      },
      {
        label: 'NG0501: Hydration Missing Siblings',
        path: 'errors/NG0501',
        contentPath: 'reference/errors/NG0501',
      },
      {
        label: 'NG0502: Hydration Missing Node',
        path: 'errors/NG0502',
        contentPath: 'reference/errors/NG0502',
      },
      {
        label: 'NG0503: Hydration Unsupported Projection of DOM Nodes',
        path: 'errors/NG0503',
        contentPath: 'reference/errors/NG0503',
      },
      {
        label: 'NG0504: Skip hydration flag is applied to an invalid node',
        path: 'errors/NG0504',
        contentPath: 'reference/errors/NG0504',
      },
      {
        label: 'NG0505: No hydration info in server response',
        path: 'errors/NG0505',
        contentPath: 'reference/errors/NG0505',
      },
      {
        label: 'NG0506: NgZone remains unstable',
        path: 'errors/NG0506',
        contentPath: 'reference/errors/NG0506',
      },
      {
        label: 'NG0507: HTML content was altered after server-side rendering',
        path: 'errors/NG0507',
        contentPath: 'reference/errors/NG0507',
      },
      {
        label: 'NG0602: Disallowed function call inside reactive context',
        path: 'errors/NG0602',
        contentPath: 'reference/errors/NG0602',
      },
      {
        label: 'NG05104: Root element was not found',
        path: 'errors/NG05104',
        contentPath: 'reference/errors/NG05104',
      },
      {
        label: 'NG0910: Unsafe bindings on an iframe element',
        path: 'errors/NG0910',
        contentPath: 'reference/errors/NG0910',
      },
      {
        label: 'NG0912: Component ID generation collision',
        path: 'errors/NG0912',
        contentPath: 'reference/errors/NG0912',
      },
      {
        label: 'NG0913: Runtime Performance Warnings',
        path: 'errors/NG0913',
        contentPath: 'reference/errors/NG0913',
      },
      {
        label: 'NG0950: Required input is accessed before a value is set.',
        path: 'errors/NG0950',
        contentPath: 'reference/errors/NG0950',
      },
      {
        label: 'NG0951: Child query result is required but no value is available.',
        path: 'errors/NG0951',
        contentPath: 'reference/errors/NG0951',
      },
      {
        label: 'NG0955: Track expression resulted in duplicated keys for a given collection',
        path: 'errors/NG0955',
        contentPath: 'reference/errors/NG0955',
      },
      {
        label: 'NG0956: Tracking expression caused re-creation of the DOM structure',
        path: 'errors/NG0956',
        contentPath: 'reference/errors/NG0956',
      },
      {
        label: 'NG1001: Argument Not Literal',
        path: 'errors/NG1001',
        contentPath: 'reference/errors/NG1001',
      },
      {
        label: 'NG2003: Missing Token',
        path: 'errors/NG2003',
        contentPath: 'reference/errors/NG2003',
      },
      {
        label: 'NG2009: Invalid Shadow DOM selector',
        path: 'errors/NG2009',
        contentPath: 'reference/errors/NG2009',
      },
      {
        label: 'NG3003: Import Cycle Detected',
        path: 'errors/NG3003',
        contentPath: 'reference/errors/NG3003',
      },
      {
        label: 'NG05000: Hydration with unsupported Zone.js instance.',
        path: 'errors/NG05000',
        contentPath: 'reference/errors/NG05000',
      },
      {
        label: 'NG6100: NgModule.id Set to module.id anti-pattern',
        path: 'errors/NG6100',
        contentPath: 'reference/errors/NG6100',
      },
      {
        label: 'NG8001: Invalid Element',
        path: 'errors/NG8001',
        contentPath: 'reference/errors/NG8001',
      },
      {
        label: 'NG8002: Invalid Attribute',
        path: 'errors/NG8002',
        contentPath: 'reference/errors/NG8002',
      },
      {
        label: 'NG8003: Missing Reference Target',
        path: 'errors/NG8003',
        contentPath: 'reference/errors/NG8003',
      },
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
      {
        label: 'NG8101: Invalid Banana-in-Box',
        path: 'extended-diagnostics/NG8101',
        contentPath: 'reference/extended-diagnostics/NG8101',
      },
      {
        label: 'NG8102: Nullish coalescing not nullable',
        path: 'extended-diagnostics/NG8102',
        contentPath: 'reference/extended-diagnostics/NG8102',
      },
      {
        label: 'NG8103: Missing control flow directive',
        path: 'extended-diagnostics/NG8103',
        contentPath: 'reference/extended-diagnostics/NG8103',
      },
      {
        label: 'NG8104: Text attribute not binding',
        path: 'extended-diagnostics/NG8104',
        contentPath: 'reference/extended-diagnostics/NG8104',
      },
      {
        label: 'NG8105: Missing `let` keyword in an *ngFor expression',
        path: 'extended-diagnostics/NG8105',
        contentPath: 'reference/extended-diagnostics/NG8105',
      },
      {
        label: 'NG8106: Suffix not supported',
        path: 'extended-diagnostics/NG8106',
        contentPath: 'reference/extended-diagnostics/NG8106',
      },
      {
        label: 'NG8107: Optional chain not nullable',
        path: 'extended-diagnostics/NG8107',
        contentPath: 'reference/extended-diagnostics/NG8107',
      },
      {
        label: 'NG8108: ngSkipHydration should be a static attribute',
        path: 'extended-diagnostics/NG8108',
        contentPath: 'reference/extended-diagnostics/NG8108',
      },
      {
        label: 'NG8109: Signals must be invoked in template interpolations',
        path: 'extended-diagnostics/NG8109',
        contentPath: 'reference/extended-diagnostics/NG8109',
      },
      {
        label: 'NG8111: Functions must be invoked in event bindings',
        path: 'extended-diagnostics/NG8111',
        contentPath: 'reference/extended-diagnostics/NG8111',
      },
      {
        label: 'NG8113: Unused Standalone Imports',
        path: 'extended-diagnostics/NG8113',
        contentPath: 'reference/extended-diagnostics/NG8113',
      },
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
        label: 'Signal queries',
        path: 'reference/migrations/signal-queries',
        contentPath: 'reference/migrations/signal-queries',
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
