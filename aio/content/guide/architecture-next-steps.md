# Next steps: tools and techniques

<!--todo: rework this content to remove focus on tutorial -->

After you understand the basic Angular building blocks, you can learn more
about the features and tools that can help you develop and deliver Angular applications.

*   To get a feel for how to fit the basic building blocks together to create a well-designed application, see [Tour of Heroes app and tutorial][AioTutorial]
*   To understand Angular-specific terms and usage, see [Glossary][AioGuideGlossary]
*   Use the documentation to learn about key features in more depth, according to your stage of development and areas of interest

## Application architecture

*   The **Main Concepts** section located in the table of contents contains several topics that explain how to connect the application data in your [components][AioGuideGlossaryComponent] to your page-display [templates][AioGuideGlossaryTemplate], to create a complete interactive application
*   The [NgModules][AioGuideNgmodules] guide provides in-depth information on the modular structure of an Angular application
*   The [Routing and navigation][AioGuideRouter] guide provides in-depth information on how to construct applications that allow a user to navigate to different [views][AioGuideGlossaryView] within your single-page application
*   The [Dependency injection][AioGuideDependencyInjection] guide provides in-depth information on how to construct an application such that each component class can acquire the services and objects it needs to perform its function

## Responsive programming

The [template syntax][AioGuideTemplateSyntax] and related topics contain details about how to display your component data when and where you want it within a view, and how to collect input from users that you can respond to.

Additional pages and sections describe some basic programming techniques for Angular applications.

| Topics                                                  | Details |
|:---                                                     |:---     |
| [Lifecycle hooks][AioGuideComponentLifecycle]           | Tap into key moments in the lifetime of a component, from its creation to its destruction, by implementing the lifecycle hook interfaces.                                 |
| [Observables and event processing][AioGuideObservables] | How to use observables with components and services to publish and subscribe to messages of any type, such as user-interaction events and asynchronous operation results. |
| [Angular web component][AioGuideComponentWeb]           | How to package components as *custom elements* using Web Components, a web standard for defining new HTML elements in a framework-agnostic way.                           |
| [Forms][AioGuideFormsOverview]                          | Support complex data entry scenarios with HTML-based input validation.                                                                                                    |
| [Animations][AioGuideAnimations]                        | Use the animation library in Angular to animate component behavior without deep knowledge of animation techniques or CSS.                                                      |

## Client-server interaction

Angular provides a framework for single-page applications, where most of the logic and data resides on the client.
Most applications still need to access a server using the `HttpClient` to access and save data.
For some platforms and applications, you might also want to use the Progressive Web App \(PWA\) model to improve the user experience.

| Interactions                                          | Details |
|:---                                                   |:---     |
| [HTTP][AioGuideHttp]                                  | Communicate with a server to get data, save data, and invoke server-side actions with an HTTP client.                                                                                                                                                                                                        |
| [Server-side rendering][AioGuideUniversal]            | Angular Universal generates static application pages on the server through server-side rendering \(SSR\). This allows you to run your Angular application on the server in order to improve performance and show the first page quickly on mobile and low-powered devices, and also facilitate web crawlers. |
| [Service workers and PWA][AioGuideServiceWorkerIntro] | Use a service worker to reduce dependency on the network and significantly improve the user experience.                                                                                                                                                                                                      |
| [Web workers][AioGuideWebWorker]                      | Learn how to run CPU-intensive computations in a background thread.                                                                                                                                                                                                                                          |

## Support for the development cycle

| Topics                                       | Details |
|:---                                          |:---     |
| [CLI Command Reference][AioCli]              | The Angular CLI is a command-line tool that you use to create projects, generate application and library code, and perform a variety of ongoing development tasks such as testing, bundling, and deployment. |
| [Compilation][AioGuideAotCompiler]           | Angular provides just-in-time \(JIT\) compilation for the development environment, and ahead-of-time \(AOT\) compilation for the production environment.                                                       |
| [Testing platform][AioGuideTesting]          | Run unit tests on your application parts as they interact with the Angular framework.                                                                                                                        |
| [Deployment][AioGuideDeployment]             | Learn techniques for deploying your Angular application to a remote server.                                                                                                                                  |
| [Security guidelines][AioGuideSecurity]      | Learn about the built-in protections in Angular against common web-application vulnerabilities and attacks such as cross-site scripting attacks.                                                                  |
| [Internationalization][AioGuideI18nOverview] | Make your application available in multiple languages with the internationalization \(i18n\) tools in Angular.                                                                                                      |
| [Accessibility][AioGuideAccessibility]       | Make your application accessible to all users.                                                                                                                                                               |

## File structure, configuration, and dependencies

| Topics                                                      | Details |
|:---                                                         |:---     |
| [Workspace and file structure][AioGuideFileStructure]       | Understand the structure of Angular workspace and project directories.                                                                                                                                                                                                                                                                                    |
| [Building and serving][AioGuideBuild]                       | Learn to define different build and proxy server configurations for your project, such as development, staging, and production.                                                                                                                                                                                                                       |
| [npm packages][AioGuideNpmPackages]                         | The Angular Framework, Angular CLI, and components used by Angular applications are packaged as [npm][NpmjsDocsMain] packages and distributed using the npm registry. The Angular CLI creates a default `package.json` file, which specifies a starter set of packages that work well together and jointly support many common application scenarios. |
| [TypeScript configuration][AioGuideTypescriptConfiguration] | TypeScript is the primary language for Angular application development.                                                                                                                                                                                                                                                                               |
| [Browser support][AioGuideBrowserSupport]                   | Make your applications compatible across a wide range of browsers.                                                                                                                                                                                                                                                                                    |

## Extending Angular

| Topics                                 | Details |
|:---                                    |:---     |
| [Angular libraries][AioGuideLibraries] | Learn about using and creating re-usable libraries.                                                                                         |
| [Schematics][AioGuideSchematics]       | Learn about customizing and extending the CLI's generation capabilities.                                                                    |
| [CLI builders][AioGuideCliBuilder]     | Learn about customizing and extending the CLI's ability to apply tools to perform complex tasks, such as building and testing applications. |

<!-- links -->

[AioCli]: cli "CLI Overview and Command Reference | Angular"

[AioGuideAccessibility]: guide/accessibility "Accessibility in Angular | Angular"

[AioGuideAnimations]: guide/animations "Introduction to Angular animations | Angular"

[AioGuideAotCompiler]: guide/aot-compiler "Ahead-of-time (AOT) compilation | Angular"

[AioGuideBrowserSupport]: guide/browser-support "Browser support | Angular"

[AioGuideBuild]: guide/build "Building and serving Angular apps | Angular"

[AioGuideCliBuilder]: guide/cli-builder "Angular CLI builders | Angular"

[AioGuideComponentLifecycle]: guide/component/component-lifecycle "Comonent lifecycle | Angular"

[AioGuideComponentWeb]: guide/component/component-web "Web component | Angular"

[AioGuideDependencyInjection]: guide/dependency-injection "Dependency injection in Angular | Angular"

[AioGuideDeployment]: guide/deployment "Deployment | Angular"

[AioGuideFileStructure]: guide/file-structure "Workspace and project file structure | Angular"

[AioGuideFormsOverview]: guide/forms-overview "Introduction to forms in Angular | Angular"

[AioGuideGlossary]: guide/glossary "Glossary | Angular"
[AioGuideGlossaryComponent]: guide/glossary#component "component - Glossary | Angular"
[AioGuideGlossaryTemplate]: guide/glossary#template "template - Glossary | Angular"
[AioGuideGlossaryView]: guide/glossary#view "view - Glossary | Angular"

[AioGuideHttp]: guide/http "Communicating with backend services using HTTP | Angular"

[AioGuideI18nOverview]: guide/i18n-overview "Angular Internationalization | Angular"

[AioGuideLibraries]: guide/libraries "Overview of Angular libraries | Angular"

[AioGuideNgmodules]: guide/ngmodules "NgModules | Angular"

[AioGuideObservables]: guide/observables "Using observables to pass values | Angular"

[AioGuideNpmPackages]: guide/npm-packages "Workspace npm dependencies | Angular"

[AioGuideRouter]: guide/router "Common Routing Tasks | Angular"

[AioGuideSchematics]: guide/schematics "Generating code using schematics | Angular"

[AioGuideSecurity]: guide/security "Security | Angular"

[AioGuideServiceWorkerIntro]: guide/service-worker-intro "Angular service worker introduction | Angular"

[AioGuideTemplateSyntax]: guide/template-syntax "Template syntax | Angular"

[AioGuideTesting]: guide/testing "Testing | Angular"

[AioGuideTypescriptConfiguration]: guide/typescript-configuration "TypeScript configuration | Angular"

[AioGuideUniversal]: guide/universal "Server-side rendering (SSR) with Angular Universal | Angular"

[AioGuideWebWorker]: guide/web-worker "Background processing using web workers | Angular"

[AioTutorial]: tutorial "Tour of Heroes app and tutorial | Angular"

<!-- external links -->

[NpmjsDocsMain]: https://docs.npmjs.com "npm Docs"

<!-- end links -->

@reviewed 2022-04-13
