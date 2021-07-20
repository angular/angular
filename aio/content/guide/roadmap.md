# Angular Roadmap

<p class="roadmap-last-updated">Last updated: 2021-05-19</p>

Angular receives a large number of feature requests, both from inside Google and from the broader open-source community. At the same time, our list of projects contains plenty of maintenance tasks, code refactorings, and potential performance improvements. We bring together representatives from developer relations, product management, and engineering to prioritize this list. As new projects come into the queue, we regularly position them based on relative priority to other projects. As work gets done, projects will move up in the queue.

The projects below are not associated with a particular Angular version. We'll release them on completion, and they will be part of a specific version based on our release schedule, following semantic versioning. For example, features are released in the next minor after they are complete, or the next major if they include breaking changes.

## In progress

### Improve test times and debugging with automatic test environment tear down

To improve test time and create better isolation across tests, we want to change <code>[TestBed](https://angular.io/api/core/testing/TestBed)</code> to automatically clean up and tear down the test environment after each test run.

### Deprecate and remove IE11 support

IE11 has been preventing Angular from taking advantage of some of the modern features of the Web platform. As part of this project we are going to deprecate and remove IE11 support to open the path for modern features that evergreen browsers provide. We ran an [RFC](https://github.com/angular/angular/issues/41840) to collected feedback from the community and decide on next steps to move forward.

### Leverage ES2017+ as the default output language

Supporting modern browsers will allow us to leverage the more compact, expressive, and performant new syntax of JavaScript. As part of this project we’ll investigate what are the blockers to move forward with this effort and take the steps forward to enable it.

### Revamp performance dashboards to detect regressions

We have a set of benchmarks that we run against every code change to ensure Angular aligns with our performance standards. To ensure the framework’s runtime does not regress after a code change, we need to refine some of the existing infrastructure the dashboards step on.

### Enhanced Angular Material components by integrating [MDC Web](https://material.io/develop/web/)

MDC Web is a library created by Google's Material Design team that provides reusable primitives for building Material Design components. The Angular team is incorporating these primitives into Angular Material. Using MDC Web will align Angular Material more closely with the Material Design specification, expand accessibility, improve component quality, and improve our team's velocity.

### Angular component accessibility

We're evaluating components in Angular Material against accessibility standards such as WCAG and working to fix any issues that arise from this process.

### Remove legacy [View Engine](https://angular.io/guide/ivy)

After the transition of all our internal tooling to Ivy is completed, we will remove the legacy View Engine for reduced Angular conceptual overhead, smaller package size, lower maintenance cost, and lower codebase complexity.

### Publish guides on advanced concepts

Develop and publish an in-depth guide on change detection. Develop content for performance profiling of Angular applications. Cover how change detection interacts with Zone.js and explain when it gets triggered, how to profile its duration, as well as common practices for performance optimization.

### Update our e2e testing strategy

To ensure we provide a future-proof e2e testing strategy, we want to evaluate the state of Protractor, community innovations, e2e best practices, and explore novel opportunities. As first steps of the effort, we shared an [RFC](https://github.com/angular/protractor/issues/5502) and worked with partners to ensure smooth integration between the Angular CLI and state of the art tooling for e2e testing. As the next step, we need to finalize the recommendations and compile a list of resources for the transition.

### Angular libraries use Ivy

Earlier in 2020, we shared an [RFC](https://github.com/angular/angular/issues/38366) for Ivy library distribution. After invaluable feedback from the community, we developed a design of the project. We are now investing in the development of Ivy library distribution, including an update of the library package format to use Ivy compilation, unblock the deprecation of the View Engine library format, and [ngcc](https://angular.io/guide/glossary#ngcc).

### Ensure smooth adoption for future RxJS changes (v7 and beyond)

We want to ensure Angular developers are taking advantage of the latest capabilities of RxJS and have a smooth transition to the next major releases of the framework. For this purpose, we will explore and document the scope of the changes in v7 and beyond RxJS and plan an update strategy.

### Simplified Angular mental model with optional NgModules

To simplify the Angular mental model and learning journey, we’ll be working on making NgModules optional. This work will allow developers to develop standalone components and implement an alternative API for declaring the component’s compilation scope.

## Future

### Investigate micro frontend architecture for scalable development processes

Look into independent deployability and development of large-scale applications to improve efficiency and productivity. The Angular community has an established story for micro frontend support. As part of this effort, we’d investigate what would be the correct abstractions to provide better support.

### Better developer ergonomics with strict typing for `@angular/forms`

We will work on implementing stricter type checking for reactive forms. This way, we will allow developers to catch more issues during development time, enable better text editor and IDE support, and improve the type checking for reactive forms.

### Leverage full framework capabilities with Zone.js opt-out

We are going to design and implement a plan to make Zone.js optional from Angular applications. This way, we will simplify the framework, improve debugging, and reduce application bundle size. Additionally, this will allow us to take advantage of native async/await syntax, which currently Zone.js does not support.

### Improved build performance with ngc as a tsc plugin distribution

Distributing the Angular compiler as a plugin of the TypeScript compiler will substantially improve developers' build performance and reduce maintenance costs.

### Support adding directives to host elements

A long-standing feature request is to add the ability to add directives to host elements. The feature will allow developers to augment their own components with additional behaviors without using inheritance. The project will require substantial effort in terms of the definition of APIs, semantics, and implementation.

### Ergonomic component level code-splitting APIs

A common problem with web applications is their slow initial load time. A way to improve it is to apply more granular code-splitting on a component level. To encourage this practice, we’ll be working on more ergonomic code-splitting APIs.

<details class="completed-details" open="true">
<summary>
  <h2>Completed</h2>
  <span class="actions">
    <span class="action-expand">Show all</span>
    <span class="action-collapse">Hide all</span>
    <i class="material-icons expand">expand_more</i>
  </span>
</summary>
<div class="details-content">

### Accelerated debugging and performance profiling with Angular DevTools

_Completed Q2 2021_

We are working on development tooling for Angular that will provide utilities for debugging and performance profiling. This project aims to help developers understand the component structure and the change detection in an Angular application.

### Streamline releases with consolidated Angular versioning & branching

_Completed Q2 2021_

We want to consolidate release management tooling between Angular's multiple GitHub repositories ([angular/angular](https://github.com/angular/angular), [angular/angular-cli](https://github.com/angular/angular-cli), and [angular/components](https://github.com/angular/components)). This effort will allow us to reuse infrastructure, unify and simplify processes, and improve our release process's reliability.

### Higher developer consistency with commit message standardization

_Completed Q2 2021_

We want to unify commit message requirements and conformance across Angular repositories ([angular/angular](https://github.com/angular/angular), [angular/components](https://github.com/angular/components), [angular/angular-cli](https://github.com/angular/angular-cli)) to bring consistency to our development process and reuse infrastructure tooling.

### Transition the Angular language service to Ivy

_Completed Q2 2021_

The goal of this project is to improve the experience and remove legacy dependency by transitioning the language service to Ivy. Today the language service still uses the View Engine compiler and type checking, even for Ivy applications. We want to use the Ivy template parser and improved type checking for the Angular Language service to match application behavior. This migration will also be a step towards unblocking the removal of View Engine, which will simplify Angular, reduce the npm package size, and improve the framework's maintainability.

### Increased security with native [Trusted Types](https://web.dev/trusted-types/) in Angular

_Completed Q2 2021_

In collaboration with Google's security team, we're adding support for the new Trusted Types API. This web platform API will help developers build more secure web applications.

### Optimized build speed and bundle sizes with Angular CLI webpack 5

_Completed Q2 2021_

As part of the v11 release, we introduced an opt-in preview of webpack 5 in the Angular CLI. To ensure stability, we’ll continue iterating on the implementation to enable build speed and bundle size improvements.

### Faster apps by inlining critical styles in Universal applications

_Completed Q1 2021_

Loading external stylesheets is a blocking operation, which means that the browser can’t start rendering your application until it loads all the referenced CSS. Having render-blocking resources in the header of a page can significantly impact its load performance, for example, its [first contentful paint](https://web.dev/first-contentful-paint/). To make apps faster, we’ve been collaborating with the Google Chrome team on inlining critical CSS and loading the rest of the styles asynchronously.

### Improve debugging with better Angular error messages

_Completed Q1 2021_

Error messages often bring limited actionable information to help developers resolve them. We’ve been working on making error messages more discoverable by adding associated codes, developing guides, and other materials to ensure a smoother debugging experience.

### Improved developer onboarding with refreshed introductory documentation

_Completed Q1 2021_

We will redefine the user learning journeys and refresh the introductory documentation. We will clearly state the benefits of Angular, how to explore its capabilities and provide guidance so developers can become proficient with the framework in as little time as possible.

### Expand component harnesses best practices

_Completed Q1 2021_

Angular CDK introduced the concept of [component test harnesses](https://material.angular.io/cdk/test-harnesses) to Angular in version 9. Test harnesses allow component authors to create supported APIs for testing component interactions. We're continuing to improve this harness infrastructure and clarifying the best practices around using harnesses. We're also working to drive more harness adoption inside of Google.

### Author a guide for content projection

_Completed Q2 2021_

Content projection is a core Angular concept that does not have the presence it deserves in the documentation. As part of this project we want to identify the core use cases and concepts for content projection and document them.

### Migrate to ESLint

_Completed Q4 2020_

With the deprecation of TSLint we will be moving to ESLint. As part of the process, we will work on ensuring backward compatibility with our current recommended TSLint configuration, implement a migration strategy for existing Angular applications and introduce new tooling to the Angular CLI toolchain.

### Operation Bye Bye Backlog (aka Operation Byelog)

_Completed Q4 2020_

We are actively investing up to 50% of our engineering capacity on triaging issues and PRs until we have a clear understanding of broader community needs. After that, we'll commit up to 20% of our engineering capacity to keep up with new submissions promptly.

</div>
</details>
