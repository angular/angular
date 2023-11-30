<docs-decorative-header title="Angular Roadmap" imgSrc="adev/src/assets/images/roadmap.svg"> <!-- markdownlint-disable-line -->
Learn how the Angular team is building momentum on the web.
</docs-decorative-header>

As an open source project, Angular’s daily commits, PRs and momentum is all trackable on GitHub. To increase transparency into how this daily work connects to the framework’s future, our roadmap brings together the team’s current and future planned vision.

The following projects are not associated with a particular Angular version. We will release them on completion, and they will be part of a specific version based on our release schedule, following semantic versioning. For example, we release features in the next minor after completion or the next major if they include breaking changes.

Currently, Angular has two goals for the framework:

1. Improve the [Angular developer experience](#improving-the-angular-developer-experience) and
2. Improve the [framework’s performance](#fast-by-default).

Continue reading to learn how we plan to deliver these objectives with specific project work.

## Explore modern Angular

Start developing with the latest Angular features from our roadmap. This list represents the current status of new features from our roadmap:

| Ready to experiment with                                                      | Production ready                                                                        |
| :---------------------------------------------------------------------------- | :-------------------------------------------------------------------------------------- |
| [Explore Angular Signals](guide/signals)                                      | [Migrate your Angular Material to MDC](https://material.angular.io/guide/mdc-migration) |
| [Learn about Hydration](guide/hydration)                                      | [Migrate to Standalone APIs](reference/migrations/standalone)                           |
| [Deferrable views](https://github.com/angular/angular/discussions/50716)      | [Improve image performance with NgOptimizedImage](guide/image-optimization)             |
| [Built-in control flow](https://github.com/angular/angular/discussions/50719) | [Try out Inject](tutorials/learn-angular/inject-based-di)                               |
|                                                                               | [New CDK directives](https://material.angular.io/cdk/categories)                        |

## Improving the Angular developer experience

### Improve runtime performance and make Zone.js optional

<docs-card-container>
  <docs-card title="Deliver Angular Signals" href="https://github.com/angular/angular/discussions/49685">
  This project rethinks the Angular reactivity model by introducing Signals as a reactivity primitive. Fully implemented, the project will make Zone.js optional. The initial planning resulted in hundreds of discussions, conversations with developers, feedback sessions, user experience studies, and a series of RFCs, which received over 1,000 comments.

  As part of the v17 release, we graduated the Angular Signals library from developer preview. Next we’ll continue implementing the proposals from the RFC. The first steps will be introducing signal-based inputs and queries.
  </docs-card>
</docs-card-container>

### Make Angular easier to learn

<docs-card-container>
  <docs-card title="Make Angular.dev the official home for Angular developers" href="https://goo.gle/angular-dot-dev">
  Angular.dev will be the new site, domain and home for Angular development. The new site contains updated documentation, tutorials and guidance that will help developers build with Angular’s latest features. v17’s launch includes new and revised documentation on Angular’s core features, tutorials and reference materials. In the coming months, we will continue to collect feedback and improve the site, with a ton of enhancements planned.

  In v18, after collecting feedback and continuing to stabilize Angular.dev, we plan to make Angular.dev the official home for all Angular development.
  </docs-card>
  <docs-card title="Introduce built-in control flow" href="https://github.com/angular/angular/discussions/50719">
  In v17 we shipped a developer preview version of a new control flow. It brings significant performance improvements and better ergonomics for template authoring. We also provided a migration of existing `*ngIf`, `*ngFor`, and `*ngSwitch` which you can run to move your project to the new implementation. As the next steps we'll be working on addressing community feedback before officially completing this project and graduating it from developer preview.
  </docs-card>
</docs-card-container>

### Improve Angular Material and the CDK

<docs-card-container>
  <docs-card title="Expand the customizability of Angular Material" href="">
  To provide better customization of our Angular Material components and enable Material 3 capabilities, we'll be collaborating with Google's Material Design team on defining token-based theming APIs.

  As of Q4 2023, we're refactoring components to use the new API, finalizing the comprehensive set of tokens, and updating the Sass API based on the new tokens.
  </docs-card>
  <docs-card title="New CDK primitives" href="">
  We are working on new CDK primitives to facilitate creating custom components based on the WAI-ARIA design patterns for [Combobox](https://www.w3.org/TR/wai-aria-practices-1.1/#combobox). Angular v14 introduced stable [menu and dialog primitives](https://material.angular.io/cdk/categories) as part of this project, and in v15 Listbox.
  </docs-card>
  <docs-card title="Angular component accessibility" href="">
  We are evaluating components in Angular Material against accessibility standards such as WCAG and working to fix any issues that arise from this process.
  </docs-card>
</docs-card-container>

### Improve tooling

<docs-card-container>
  <docs-card title="Modernize unit testing tooling with ng test" href="">
  In v12, we revisited the Angular end-to-end testing experience by replacing Protractor with modern alternatives such as Cypress, Nightwatch, and Webdriver.io. Next, we'd like to tackle `ng test` to modernize Angular's unit testing experience. In Q2, we introduced experimental [Jest](https://jestjs.io/) support and [announced](https://blog.angular.io/moving-angular-cli-to-jest-and-web-test-runner-ef85ef69ceca) the transition from Karma to the [Web Test Runner](https://modern-web.dev/docs/test-runner/overview/).
  </docs-card>
  <docs-card title="iframe support in Angular DevTools" href="">
  We are working on making it possible to debug and profile Angular apps embedded within an iframe on the page. This feature will allow you to select an iframe and inspect it directly within Angular DevTools.
  </docs-card>
  <docs-card title="Automation for transition of existing hybrid rendering projects to esbuild and vite" href="tools/cli/esbuild">
  In v17 we shipped a vite and esbuild-based application builder and enabled it for new projects by default. It improves build time for projects using hybrid rendering with up to 87%. Next, we'll be working on developing schematics that migrate existing projects using hybrid rendering to the new build pipeline.
  </docs-card>
  <docs-card title="Streamline standalone imports with Language Service" href="">
  As part of this initiative, the language service automatically imports components and pipes in standalone and NgModule-based apps. Additionally, to enable smaller app bundles, we'll work on allowing the language service to propose the automatic removal of unused imports.
  </docs-card>
</docs-card-container>

## Fast by default

<docs-card-container>
  <docs-card title="Enabling hybrid rendering by default (SSR and SSG)" href="">
  We are working on more developer experience improvements which will allow us to enable hybrid (server-side rendering and static site generation) rendering by default for new projects. In particular, we're focused on route-level rendering strategy configuration and improving developer experience for i18n support.
  </docs-card>
  <docs-card title="Introduce deferred loading" href="https://github.com/angular/angular/discussions/50716">
  In v17 we shipped deferrable views in developer preview, which provide an ergonomic API for deferred code loading. As the next step we'll be iterating on community feedback before officially making this feature stable.
  </docs-card>
</docs-card-container>

## Future work, explorations, and prototyping

This section represents explorations and prototyping of potential future projects. A reasonable outcome is to decide that our current solutions are the best options. Other projects may result in RFCs, graduating to in-progress projects, or being deprioritized as the web continues to innovate along with our framework.

<docs-card-container>
  <docs-card title="Signal debugging in Angular DevTools" href="">
  With the evolution of Signals in Angular, we'll be also working on a better tooling for debugging them. High on the priority list is a UI for inspecting and debugging Signal-based components.
  </docs-card>
  <docs-card title="Improve HMR (Hot Module Reload)" href="https://github.com/angular/angular/issues/39367#issuecomment-1439537306">
  Angular CLI currently supports HMR via `ng serve --hmr`. Under the hood, this mostly rerenders the Angular application from scratch, which is better than a full page reload, but can definitely be improved.   Most importantly, our strategy here should be to optimize the turnaround time for any given change scaled with the frequency of that kind of change. In the future, our team will explore a number of opportunities for improving HMR, including:

- Fast track CSS-only changes and apply them to any existing components on the page.
- Fast track Angular template-only changes and apply them to any existing components on the page.
  </docs-card>
  <docs-card title="Exploration of streamed server-side rendering" href="">
  Over the past few releases we've been working on making Angular's server-side rendering story more robust. On our priority list is to explore streamed server-side rendering for zoneless application.
  </docs-card>
  <docs-card title="Exploration of partial hydration" href="">
  In v17 we graduated hydration from developer preview and we've been consistently observing 40-50% improvements in LCP. As the next step, we'll explore how we can partially hydrate applications using deferrable views.

  As part of this effort, we'll be also evaluating the trade-offs of more fine-grained hydration and resumability. We'll share updates as we progress.
  </docs-card>
  <docs-card title="Investigation for authoring format improvements" href="">
  Based on our developer surveys' results we saw there are opportunities for improving the ergonomics of the component authoring format. The first step of the process will be to gather requirements and understand the problem space in advanced to an RFC. We'll share updates as we make progress. High priority in the future work will be backward compatibility and interoperability.
  </docs-card>
  <docs-card title="Support two-dimensional drag-and-drop" href="https://github.com/angular/components/issues/13372">
  As part of this project, we'd like to implement mixed orientation support for the Angular CDK drag and drop. This is one of the repository's most highly requested features.
  </docs-card>
</docs-card-container>

## Completed projects

<docs-card-container>
  <docs-card title="Modernize getting started tutorial" link="Completed Q4 2023" href="">
  Over the past two quarters, we developed a new [video](https://www.youtube.com/watch?v=xAT0lHYhHMY&list=PL1w1q3fL4pmj9k1FrJ3Pe91EPub2_h4jF) and [textual](https://angular.dev/tutorials/learn-angular) tutorial based on standalone components.
  </docs-card>
  <docs-card title="Investigate modern bundlers" link="Completed Q4 2023" href="guide/hydration">
  In Angular v16, we released a developer preview of an esbuild-based builder with support for `ng build` and `ng serve`. The `ng serve` development server uses Vite and a multi-file compilation by esbuild and the Angular compiler. In v17 we graduated the build tooling from developer preview and enabled it by default for new projects.
  </docs-card>
  <docs-card title="Introduce dependency injection debugging APIs" link="Completed Q4 2023" href="tools/devtools">
  To improve the debugging utilities of Angular and Angular DevTools, we'll work on APIs that provide access to the dependency injection runtime. As part of the project, we'll expose debugging methods that allow us to explore the injector hierarchy and the dependencies across their associated providers. As of v17, we shipped a feature that enables us to plug into the dependency injection life-cycle. We also launched a visualization of the injector tree and inspection of the providers declared inside each individual node,
  </docs-card>
  <docs-card title="Improve documentation and schematics for standalone components" link="Completed Q4 2023" href="components">
  We released a developer preview of the `ng new --standalone` schematics collection, allowing you to create apps free of NgModules. In v17 we switched the new application authoring format to standalone APIs and changed the documentation to reflect the recommendation. Additionally, we shipped schematics which support updating existing applications to standalone components, directives, and pipes. Even though NgModules will stick around for foreseeable future, we recommend you to explore the benefits of the new APIs to improve developer experience and benefit from the new features we build for them.
  </docs-card>
  <docs-card title="Explore hydration and server-side rendering improvements" link="Completed Q4 2023">
  In v16, we released a developer preview of non-destructive full hydration, see the [hydration guide](guide/hydration) and the [blog post](https://blog.angular.io/whats-next-for-server-side-rendering-in-angular-2a6f27662b67) for additional information. We're already seeing significant improvements to Core Web Vitals, including [LCP](https://web.dev/lcp) and [CLS](https://web.dev/cls). In lab tests, we consistently observed 45% better LCP of a real-world app.

  In v17 we launched hydration outside developer preview and did a series of improvements in the server-side rendering story, including: route discovery at runtime for SSG, up to 87% faster build times for hybrid rendered applications, prompt that enables hybrid rendering for new projects.
  </docs-card>
  <docs-card title="Non-destructive full app hydration" link="Completed Q1 2023" href="guide/hydration">
  In v16, we released a developer preview of non-destructive full hydration, which allows Angular to reuse existing DOM nodes on a server-side rendered page, instead of re-creating an app from scratch. See additional information in the hydration guide.
  </docs-card>
  <docs-card title="Improvements in the image directive" link="Completed Q1 2023" href="guide/image-optimization">
  We released the Angular image directive as stable in v15. We introduced a new fill mode feature that enables images to fit within their parent container rather than having explicit dimensions. Over the past two months, the Chrome Aurora team backported the directive to v12 and newer.
  </docs-card>
  <docs-card title="Documentation refactoring" link="Completed Q1 2023" href="https://angular.io">
  Ensure all existing documentation fits into a consistent set of content types. Update excessive use of tutorial-style documentation into independent topics. We want to ensure the content outside the main tutorials is self-sufficient without being tightly coupled to a series of guides. In Q2 2022, we refactored the template content and dependency injection. In Q1 2023, we improved the HTTP guides, and with this, we're putting the documentation refactoring project on hold.
  </docs-card>
  <docs-card title="Improve image performance" link="Completed Q4 2022" href="guide/image-optimization">
  The Aurora and the Angular teams are working on the implementation of an image directive that aims to improve Core Web Vitals. We shipped a stable version of the image directive in v15.
  </docs-card>
  <docs-card title="Modern CSS" link="Completed Q4 2022" href="https://blog.angular.io/modern-css-in-angular-layouts-4a259dca9127">
  The Web ecosystem evolves constantly and we want to reflect the latest modern standards in Angular. In this project we aim to provide guidelines on using modern CSS features in Angular to ensure developers follow best practices for layout, styling, etc. We shared official guidelines for layout and as part of the initiative stopped publishing flex layout.
  </docs-card>
  <docs-card title="Support adding directives to host elements" link="Completed Q4 2022" href="guide/directives/directive-composition-api">
  A long-standing feature request is to add the ability to add directives to host elements. The feature lets developers augment their own components with additional behaviors without using inheritance. In v15 we shipped our directive composition API, which enables enhancing host elements with directives.
  </docs-card>
  <docs-card title="Better stack traces" link="Completed Q4 2022" href="https://developer.chrome.com/blog/devtools-better-angular-debugging/">
  The Angular and the Chrome DevTools are working together to enable more readable stack traces for error messages. In v15 we released improved relevant and linked stack traces. As a lower priority initiative, we'll be exploring how to make the stack traces friendlier by providing more accurate call frame names for templates.
  </docs-card>
  <docs-card title="Enhanced Angular Material components by integrating MDC Web" link="Completed Q4 2022" href="https://material.angular.io/guide/mdc-migration">
  MDC Web is a library created by the Google Material Design team that provides reusable primitives for building Material Design components. The Angular team is incorporating these primitives into Angular Material. Using MDC Web aligns Angular Material more closely with the Material Design specification, expands accessibility, improves component quality, and improves the velocity of our team.
  </docs-card>
  <docs-card title="Implement APIs for optional NgModules" link="Completed Q4 2022" href="https://blog.angular.io/angular-v15-is-now-available-df7be7f2f4c8">
  In the process of making Angular simpler, we are working on introducing APIs that allow developers to initialize apps, instantiate components, and use the router without NgModules. Angular v14 introduces developer preview of the APIs for standalone components, directives, and pipes. In the next few quarters we'll collect feedback from developers and finalize the project making the APIs stable. As the next step we will work on improving use cases such as TestBed, Angular elements, etc.
  </docs-card>
  <docs-card title="Allow binding to protected fields in templates" link="Completed Q2 2022" href="guide/templates/binding">
  To improve the encapsulation of Angular components we enabled binding to protected members of the component instance. This way you'll no longer have to expose a field or a method as public to use it inside your templates.
  </docs-card>
  <docs-card title="Publish guides on advanced concepts" link="Completed Q2 2022" href="https://angular.io/guide/change-detection">
  Develop and publish an in-depth guide on change detection. Develop content for performance profiling of Angular apps. Cover how change detection interacts with Zone.js and explain when it gets triggered, how to profile its duration, as well as common practices for performance optimization.
  </docs-card>
  <docs-card title="Rollout strict typings for @angular/forms" link="Completed Q2 2022" href="guide/forms/typed-forms">
  In Q4 2021 we designed a solution for introducing strict typings for forms and in Q1 2022 we concluded the corresponding request for comments. Currently, we are implementing a rollout strategy with an automated migration step that will enable the improvements for existing projects. We are first testing the solution with more than 2,500 projects at Google to ensure a smooth migration path for the external community.
  </docs-card>
  <docs-card title="Remove legacy View Engine" link="Completed Q1 2022" href="https://blog.angular.io/angular-v15-is-now-available-df7be7f2f4c8">
  After the transition of all our internal tooling to Ivy is completed, we will remove the legacy View Engine for reduced Angular conceptual overhead, smaller package size, lower maintenance cost, and lower codebase complexity.
  </docs-card>
  <docs-card title="Simplified Angular mental model with optional NgModules" link="Completed Q1 2022" href="https://blog.angular.io/angular-v15-is-now-available-df7be7f2f4c8">
  To simplify the Angular mental model and learning journey, we will be working on making NgModules optional. This work lets developers develop standalone components and implement an alternative API for declaring the compilation scope of the component. We kicked this project off with high-level design discussions that we captured in an RFC.
  </docs-card>
  <docs-card title="Design strict typing for @angular/forms" link="Completed Q1 2022" href="guide/forms/typed-forms">
  We will work on finding a way to implement stricter type checking for reactive forms with minimal backward incompatible implications. This way, we let developers catch more issues during development time, enable better text editor and IDE support, and improve the type checking for reactive forms.
  </docs-card>
  <docs-card title="Improve integration of Angular DevTools with framework" link="Completed Q1 2022" href="tools/devtools">
  To improve the integration of Angular DevTools with the framework, we are working on moving the codebase to the angular/angular monorepository. This includes transitioning Angular DevTools to Bazel and integrating it into the existing processes and CI pipeline.
  </docs-card>
  <docs-card title="Launch advanced compiler diagnostics" link="Completed Q1 2022" href="reference/extended-diagnostics">
  Extend the diagnostics of the Angular compiler outside type checking. Introduce other correctness and conformance checks to further guarantee correctness and best practices.
  </docs-card>
  <docs-card title="Update our e2e testing strategy" link="Completed Q3 2021" href="guide/testing">
  To ensure we provide a future-proof e2e testing strategy, we want to evaluate the state of Protractor, community innovations, e2e best practices, and explore novel opportunities. As first steps of the effort, we shared an RFC and worked with partners to ensure smooth integration between the Angular CLI and state-of-the-art tooling for e2e testing. As the next step, we need to finalize the recommendations and compile a list of resources for the transition.
  </docs-card>
  <docs-card title="Angular libraries use Ivy" link="Completed Q3 2021" href="tools/libraries">
  Earlier in 2020, we shared an RFC for Ivy library distribution. After invaluable feedback from the community, we developed a design of the project. We are now investing in the development of Ivy library distribution, including an update of the library package format to use Ivy compilation, unblock the deprecation of the View Engine library format, and ngcc.
  </docs-card>
  <docs-card title="Improve test times and debugging with automatic test environment tear down" link="Completed Q3 2021" href="guide/testing">
  To improve test time and create better isolation across tests, we want to change TestBed to automatically clean up and tear down the test environment after each test run.
  </docs-card>
  <docs-card title="Deprecate and remove IE11 support" link="Completed Q3 2021" href="https://github.com/angular/angular/issues/41840">
  Internet Explorer 11 (IE11) has been preventing Angular from taking advantage of some of the modern features of the Web platform. As part of this project we are going to deprecate and remove IE11 support to open the path for modern features that evergreen browsers provide. We ran an RFC to collect feedback from the community and decide on next steps to move forward.
  </docs-card>
  <docs-card title="Leverage ES2017+ as the default output language" link="Completed Q3 2021" href="https://www.typescriptlang.org/docs/handbook/tsconfig-json.html">
  Supporting modern browsers lets us take advantage of the more compact, expressive, and performant new syntax of JavaScript. As part of this project we will investigate what the blockers are to moving forward with this effort, and take the steps to enable it.
  </docs-card>
  <docs-card title="Accelerated debugging and performance profiling with Angular DevTools" link="Completed Q2 2021" href="tools/devtools">
  We are working on development tooling for Angular that provides utilities for debugging and performance profiling. This project aims to help developers understand the component structure and the change detection in an Angular app.
  </docs-card>
  <docs-card title="Streamline releases with consolidated Angular versioning & branching" link="Completed Q2 2021" href="reference/releases">
  We want to consolidate release management tooling between the multiple GitHub repositories for Angular (angular/angular, angular/angular-cli, and angular/components). This effort lets us reuse infrastructure, unify and simplify processes, and improve the reliability of our release process.
  </docs-card>
  <docs-card title="Higher developer consistency with commit message standardization" link="Completed Q2 2021" href="https://github.com/angular/angular">
  We want to unify commit message requirements and conformance across Angular repositories (angular/angular, angular/components, and angular/angular-cli) to bring consistency to our development process and reuse infrastructure tooling.
  </docs-card>
  <docs-card title="Transition the Angular language service to Ivy" link="Completed Q2 2021" href="tools/language-service">
  The goal of this project is to improve the experience and remove legacy dependency by transitioning the language service to Ivy. Today the language service still uses the View Engine compiler and type checking, even for Ivy apps. We want to use the Ivy template parser and improved type checking for the Angular Language service to match app behavior. This migration is also a step towards unblocking the removal of View Engine, which will simplify Angular, reduce the npm package size, and improve the maintainability of the framework.
  </docs-card>
  <docs-card title="Increased security with native Trusted Types in Angular" link="Completed Q2 2021" href="guide/security">
  In collaboration with the Google security team, we are adding support for the new Trusted Types API. This web platform API helps developers build more secure web apps.
  </docs-card>
  <docs-card title="Optimized build speed and bundle sizes with Angular CLI webpack 5" link="Completed Q2 2021" href="tools/cli/build">
  As part of the v11 release, we introduced an opt-in preview of webpack 5 in the Angular CLI. To ensure stability, we will continue iterating on the implementation to enable build speed and bundle size improvements.
  </docs-card>
  <docs-card title="Faster apps by inlining critical styles in Universal apps" link="Completed Q1 2021" href="guide/ssr">
  Loading external stylesheets is a blocking operation, which means that the browser cannot start rendering your app until it loads all the referenced CSS. Having render-blocking resources in the header of a page can significantly impact its load performance, for example, its first contentful paint. To make apps faster, we have been collaborating with the Google Chrome team on inlining critical CSS and loading the rest of the styles asynchronously.
  </docs-card>
  <docs-card title="Improve debugging with better Angular error messages" link="Completed Q1 2021" href="reference/errors">
  Error messages often bring limited actionable information to help developers resolve them. We have been working on making error messages more discoverable by adding associated codes, developing guides, and other materials to ensure a smoother debugging experience.
  </docs-card>
  <docs-card title="Improved developer onboarding with refreshed introductory documentation" link="Completed Q1 2021" href="tutorials">
  We will redefine the user learning journeys and refresh the introductory documentation. We will clearly state the benefits of Angular, how to explore its capabilities and provide guidance so developers can become proficient with the framework in as little time as possible.
  </docs-card>
  <docs-card title="Expand component harnesses best practices" link="Completed Q1 2021" href="https://material.angular.io/guide/using-component-harnesses">
  Angular CDK introduced the concept of component test harnesses to Angular in version 9. Test harnesses let component authors create supported APIs for testing component interactions. We are continuing to improve this harness infrastructure and clarifying the best practices around using harnesses. We are also working to drive more harness adoption inside of Google.
  </docs-card>
  <docs-card title="Author a guide for content projection" link="Completed Q2 2021" href="https://angular.io/docs">
  Content projection is a core Angular concept that does not have the presence it deserves in the documentation. As part of this project we want to identify the core use cases and concepts for content projection and document them.
  </docs-card>
  <docs-card title="Migrate to ESLint" link="Completed Q4 2020" href="tools/cli">
  With the deprecation of TSLint we will be moving to ESLint. As part of the process, we will work on ensuring backward compatibility with our current recommended TSLint configuration, implement a migration strategy for existing Angular apps and introduce new tooling to the Angular CLI toolchain.
  </docs-card>
  <docs-card title="Operation Bye Bye Backlog (also known as Operation Byelog)" link="Completed Q4 2020" href="https://github.com/angular/angular/issues">
  We are actively investing up to 50% of our engineering capacity on triaging issues and PRs until we have a clear understanding of broader community needs. After that, we will commit up to 20% of our engineering capacity to keep up with new submissions promptly.
  </docs-card>
</docs-card-container>
