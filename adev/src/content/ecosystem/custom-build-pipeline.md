# Custom build pipeline

When building an Angular app we strongly recommend you to use the Angular CLI to leverage its structure-dependent update functionality and build system abstraction. This way your projects benefit from the latest security, performance, and API improvements and transparent build improvements.

This page explores the **rare use cases** when you need a custom build pipeline that does not use the Angular CLI. All listed tools below are open source build plugins that are maintained by members of the Angular community. To learn more about their support model and maintenance status look at their documentation and GitHub repository URLs.

## When should you use a custom build pipeline?

There are some niche use cases when you may want to maintain a custom build pipeline. For example:

* You have an existing app using a different toolchain and you’d like to add Angular to it
* You’re strongly coupled to [module federation](https://module-federation.io/) and unable to adopt bundler-agnostic [native federation](https://www.npmjs.com/package/@angular-architects/native-federation)
* You’d like to create an short-lived experiment using your favorite build tool

## What are the options?

Currently, there are two well supported community tools that enable you to create a custom build pipeline with a [Vite plugin](https://www.npmjs.com/package/@analogjs/vite-plugin-angular) and [Rspack plugin](https://www.npmjs.com/package/@nx/angular-rspack). Both of them use underlying abstractions that power the Angular CLI. They allow you to create a flexible build pipeline and require manual maintenance and no automated update experience.

### Rspack

Rspack is a Rust-based bundler that aims to provide compatibility with the webpack plugin ecosystem.

If your project is tightly coupled to the webpack ecosystem, heavily relying on a custom webpack configuration you can leverage Rspack to improve your build times.

You can find more about Angular Rspack on the project’s [documentation website](https://nx.dev/recipes/angular/rspack/introduction).

### Vite

Vite is a frontend build tool that aims to provide a faster and leaner development experience for modern web projects. Vite is also extensible through its plugin system that allows ecosystems to build integrations with Vite, such as Vitest for unit and browser testing, Storybook for authoring components in isolation, and more. The Angular CLI also uses Vite as its development server.

The [AnalogJS Vite plugin for Angular](https://www.npmjs.com/package/@analogjs/vite-plugin-angular) enables the adoption of Angular with a project or framework that uses or is built on top of Vite. This can consist of developing and building an Angular project with Vite directly, or adding Angular to an existing project or pipeline. One example is integrating Angular UI components into a documentation website using [Astro and Starlight](https://analogjs.org/docs/packages/astro-angular/overview).

You can learn more about AnalogJS and how to use the plugin through its [documentation page](https://analogjs.org/docs/packages/vite-plugin-angular/overview).
