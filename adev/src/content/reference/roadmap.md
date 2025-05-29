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

### Available to experiment with

* [Zoneless change detection](/guide/zoneless)
* [Resource API](/guide/signals/resource)

### Production ready

* [Explore Angular Signals](/guide/signals)
* [Event replay with SSR](/api/platform-browser/withEventReplay)
* [Deferrable views](/guide/defer)
* [Built-in control flow](/guide/templates/control-flow)
* [Local variable declaration](/guide/templates/variables)
* [Signal inputs](/guide/signals/inputs)
* [Model inputs](/guide/signals/model)
* [Signal queries](/guide/signals/queries)
* [Function-based outputs](/guide/components/outputs)
* [Route-level render mode](/guide/ssr)

## Improving the Angular developer experience

### Developer velocity

<docs-card-container>
  <docs-card title="Deliver Angular Signals" href="https://github.com/angular/angular/discussions/49685">
  This project rethinks the Angular reactivity model by introducing Signals as a reactivity primitive. The initial planning resulted in hundreds of discussions, conversations with developers, feedback sessions, user experience studies, and a series of RFCs, which received over 1,000 comments.

  As part of the v17 release, we graduated the Angular Signals library from developer preview. In v19 we moved signal-based queries, inputs, and model inputs to stable. Next, we'll need to finalize effects before we complete this project.
  </docs-card>
  <docs-card title="Zoneless Angular" href="">
  In v18 we shipped experimental zoneless support in Angular. It enables developers to use the framework without including zone.js in their bundle, which improves performance, debugging experience, and interoperability. As part of the initial release we also introduced zoneless support to the Angular CDK and Angular Material.

  In v19 we introduced zoneless support in server-side rendering, addressed some edge cases, and created a schematic to scaffold zoneless projects. We transitioned <a href="https://fonts.google.com/">Google Fonts</a> to zoneless which improved performance, developer experience, and allowed us to identify gaps that we need to address before moving this feature to developer preview. Stay tuned for more updates in the next months.
  </docs-card>
  <docs-card title="Signal integrations" href="">
  We're working towards improving the integration of fundamental Angular packages, such as forms, HTTP, and router, with Signals. As part of this project, we'll seek opportunities to introduce convenient signal-based APIs or wrappers to improve the holistic developer experience.
  </docs-card>
  <docs-card title="Signal debugging in Angular DevTools" href="">
  With the evolution of Signals in Angular, we are working on a better tooling for debugging them. High on the priority list is a UI for inspecting and debugging signals.
  </docs-card>
  <docs-card title="Improve HMR (Hot Module Reload)" href="https://github.com/angular/angular/issues/39367#issuecomment-1439537306">
  We're working towards faster edit/refresh cycle by enabling hot module replacement.

  In Angular v19 we shipped initial support for CSS and template HMR. We'll continue collecting feedback to make sure we're addressing developers' needs before we mark this project as complete.
  </docs-card>
</docs-card-container>

### Improve Angular Material and the CDK

<docs-card-container>
  <docs-card title="New CDK primitives" href="">
  We are working on new CDK primitives to facilitate creating custom components based on the WAI-ARIA design patterns for [Combobox](https://www.w3.org/TR/wai-aria-practices-1.1/#combobox). Angular v14 introduced stable [menu and dialog primitives](https://material.angular.dev/cdk/categories) as part of this project, and in v15 Listbox.
  </docs-card>
  <docs-card title="Angular component accessibility" href="">
  We are evaluating components in Angular Material against accessibility standards such as WCAG and working to fix any issues that arise from this process.
  </docs-card>
</docs-card-container>

### Improve tooling

<docs-card-container>
  <docs-card title="Modernize unit testing tooling with ng test" href="">
  In v12, we revisited the Angular end-to-end testing experience by replacing Protractor with modern alternatives such as Cypress, Nightwatch, Puppeteer, Playwright, and Webdriver.io. Next, we'd like to tackle `ng test` to modernize Angular's unit testing experience.

  We're currently evaluating Web Test Runner, Vitest, and Jest as candidates for a new test runner for Angular projects while preserving Jasmine as assertion library to not break existing tests.
  </docs-card>
  <docs-card title="Evaluating Nitro support in the Angular CLI" href="https://nitro.unjs.io/">
  We're excited about the set of features that Nitro offers such as more deployment options, improved compatibility of server-side rendering with different runtimes and file-based routing. In 2025 we'll evaluate how it fits in the Angular server-side rendering model.

  We'll share updates as we make progress in this investigation.
  </docs-card>
</docs-card-container>

## Fast by default

<docs-card-container>
  <docs-card title="Enable incremental hydration" href="">
  In v17 we graduated hydration from developer preview and we've been consistently observing 40-50% improvements in LCP. Since then we started prototyping incremental hydration and shared a demo on stage at ng-conf.

  In v19 we shipped the incremental hydration in developer preview mode, powered by `@defer` blocks. Give it a try and <a href="https://github.com/angular/angular/issues">share your feedback</a> with us!
  </docs-card>
  <docs-card title="Server route configuration" href="">
  We're working towards enabling a more ergonomic route configuration on the server. We want to make it trivial to declare which routes should be server-side rendered, prerendered or client-side rendered.

  In Angular v19 we shipped developer preview of route-level render mode which allows you to granularly configure which routes you want Angular to prerender, server-side render or client-side render.
  </docs-card>
</docs-card-container>

## Future work, explorations, and prototyping

This section represents explorations and prototyping of potential future projects. A reasonable outcome is to decide that our current solutions are the best options. Other projects may result in RFCs, graduating to in-progress projects, or being deprioritized as the web continues to innovate along with our framework.

<docs-card-container>
  <docs-card title="Signal Forms" href="">
  We plan to analyze existing feedback about Angular forms and design a solution which addresses developers' requirements and uses Signals for management of reactive state.
  </docs-card>
  <docs-card title="Selectorless" href="">
  To reduce boilerplate and improve the ergonomics of standalone components we are now designing a solution that will make selectors optional. To use a component or directive you'll be able to import it and directly use it in a component's template.

  We're still in early stages of planning selectorless. We'll share a request for comments when we have an early design and we're ready for next steps.
  </docs-card>
  <docs-card title="Exploration of streamed server-side rendering" href="">
  Over the past few releases we've been working on making Angular's server-side rendering story more robust. On our priority list is to explore streamed server-side rendering for zoneless application.
  </docs-card>
  <docs-card title="Investigation for authoring format improvements" href="">
  Based on our developer surveys' results we saw there are opportunities for improving the ergonomics of the component authoring format. The first step of the process will be to gather requirements and understand the problem space in advanced to an RFC. We'll share updates as we make progress. High priority in the future work will be backward compatibility and interoperability.
  </docs-card>
  <docs-card title="Improve TestBed" href="">
  Based on feedback over the years and the recent updates in Angular's runtime, we'll evaluate TestBed to identify opportunities to improve developer experience and reduce boilerplate when developing unit tests.
  </docs-card>
  <docs-card title="Incremental adoption" href="">
  Angular has been lacking the tools and the flexibility to add interactivity to a multi-page app or embed an Angular component inside of an existing app built with a different framework.

  As part of this project, we'll explore the requirement space of cross framework interop and our build tooling offering to make this use case possible.
  </docs-card>
</docs-card-container>

## Completed projects

<docs-card-container>
  <docs-card title="Support two-dimensional drag-and-drop" link="Completed in Q2 2024" href="https://github.com/angular/components/issues/13372">
  As part of this project, we implemented mixed orientation support for the Angular CDK drag and drop. This is one of the repository's most highly requested features.
  </docs-card>
  <docs-card title="Event replay with SSR and prerendering" link="Completed in Q4 2024" href="https://angular.dev/api/platform-browser/withEventReplay">
  In v18 we introduced an event replay functionality when using server-side rendering or prerendering. For this feature we depend on the event dispatch primitive (previously known as jsaction) that is running on Google.com.

  In Angular v19 we graduated event replay to stable and enabled it by default for all new projects.
  </docs-card>
  <docs-card title="Integrate Angular Language Service with Schematics" link="Completed in Q4 2024" href="">
  To make it easier for developers to use modern Angular APIs, we enabled integration between the Angular language service and schematics which allows you to refactor your app with a single click.
  </docs-card>
  <docs-card title="Streamline standalone imports with Language Service" link="Completed in Q4 2024" href="">
  As part of this initiative, the language service automatically imports components and pipes in standalone and NgModule-based apps. Additionally, we've added a template diagnostic to highlight unused imports in standalone components, which should help make application bundles smaller.
  </docs-card>
  <docs-card title="Local template variables" link="Completed in Q3 2024">
  We've released the support for local template variables in Angular, see [`@let` docs](https://angular.dev/api/core/@let) for additional information.
  </docs-card>
  <docs-card title="Expand the customizability of Angular Material" link="Completed in Q2 2024" href="https://material.angular.dev/guide/theming">
  To provide better customization of our Angular Material components and enable Material 3 capabilities, we'll be collaborating with Google's Material Design team on defining token-based theming APIs.

  In v17.2 we shared experimental support for Angular Material 3 and in v18 we graduated it to stable.
  </docs-card>
  <docs-card title="Introduce deferred loading" link="Completed in Q2 2024" href="https://next.angular.dev/guide/defer">
  In v17 we shipped deferrable views in developer preview, which provide an ergonomic API for deferred code loading. In v18 we enabled deferrable views for library developers and graduated the API to stable.
  </docs-card>
  <docs-card title="iframe support in Angular DevTools" link="Completed in Q2 2024" href="">
  We enabled debugging and profiling of Angular apps embedded within an iframe on the page.
  </docs-card>
  <docs-card title="Automation for transition of existing hybrid rendering projects to esbuild and vite" link="Completed in Q2 2024" href="tools/cli/build-system-migration">
  In v17 we shipped a vite and esbuild-based application builder and enabled it for new projects by default. It improves build time for projects using hybrid rendering with up to 87%. As part of v18 we shipped schematics and a guide that migrate existing projects using hybrid rendering to the new build pipeline.
  </docs-card>
  <docs-card title="Make Angular.dev the official home for Angular developers" link="Completed in Q2 2024" href="https://goo.gle/angular-dot-dev">
  Angular.dev is the new site, domain and home for Angular development. The new site contains updated documentation, tutorials and guidance that will help developers build with Angular’s latest features.
  </docs-card>
  <docs-card title="Introduce built-in control flow" link="Completed in Q2 2024" href="https://next.angular.dev/essentials/conditionals-and-loops">
  In v17 we shipped a developer preview version of a new control flow. It brings significant performance improvements and better ergonomics for template authoring. We also provided a migration of existing `*ngIf`, `*ngFor`, and `*ngSwitch` which you can run to move your project to the new implementation. As of v18 the built-in control flow is now stable.
  </docs-card>
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
  In v16, we released a developer preview of non-destructive full hydration, see the [hydration guide](guide/hydration) and the [blog post](https://blog.angular.dev/whats-next-for-server-side-rendering-in-angular-2a6f27662b67) for additional information. We're already seeing significant improvements to Core Web Vitals, including [LCP](https://web.dev/lcp) and [CLS](https://web.dev/cls). In lab tests, we consistently observed 45% better LCP of a real-world app.

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
  <docs-card title="Modern CSS" link="Completed Q4 2022" href="https://blog.angular.dev/modern-css-in-angular-layouts-4a259dca9127">
  The Web ecosystem evolves constantly and we want to reflect the latest modern standards in Angular. In this project we aim to provide guidelines on using modern CSS features in Angular to ensure developers follow best practices for layout, styling, etc. We shared official guidelines for layout and as part of the initiative stopped publishing flex layout.
  </docs-card>
  <docs-card title="Support adding directives to host elements" link="Completed Q4 2022" href="guide/directives/directive-composition-api">
  A long-standing feature request is to add the ability to add directives to host elements. The feature lets developers augment their own components with additional behaviors without using inheritance. In v15 we shipped our directive composition API, which enables enhancing host elements with directives.
  </docs-card>
  <docs-card title="Better stack traces" link="Completed Q4 2022" href="https://developer.chrome.com/blog/devtools-better-angular-debugging/">
  The Angular and the Chrome DevTools are working together to enable more readable stack traces for error messages. In v15 we released improved relevant and linked stack traces. As a lower priority initiative, we'll be exploring how to make the stack traces friendlier by providing more accurate call frame names for templates.
  </docs-card>
  <docs-card title="Enhanced Angular Material components by integrating MDC Web" link="Completed Q4 2022" href="https://material.angular.dev/guide/mdc-migration">
  MDC Web is a library created by the Google Material Design team that provides reusable primitives for building Material Design components. The Angular team is incorporating these primitives into Angular Material. Using MDC Web aligns Angular Material more closely with the Material Design specification, expands accessibility, improves component quality, and improves the velocity of our team.
  </docs-card>
  <docs-card title="Implement APIs for optional NgModules" link="Completed Q4 2022" href="https://blog.angular.dev/angular-v15-is-now-available-df7be7f2f4c8">
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
  <docs-card title="Remove legacy View Engine" link="Completed Q1 2022" href="https://blog.angular.dev/angular-v15-is-now-available-df7be7f2f4c8">
  After the transition of all our internal tooling to Ivy is completed, we will remove the legacy View Engine for reduced Angular conceptual overhead, smaller package size, lower maintenance cost, and lower codebase complexity.
  </docs-card>
  <docs-card title="Simplified Angular mental model with optional NgModules" link="Completed Q1 2022" href="https://blog.angular.dev/angular-v15-is-now-available-df7be7f2f4c8">
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
  <docs-card title="Increased security with native Trusted Types in Angular" link="Completed Q2 2021" href="best-practices/security">
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
  <docs-card title="Expand component harnesses best practices" link="Completed Q1 2021" href="https://material.angular.dev/guide/using-component-harnesses">
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
