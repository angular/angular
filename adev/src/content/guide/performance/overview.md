<docs-decorative-header title="Performance" imgSrc="adev/src/assets/images/overview.svg"> <!-- markdownlint-disable-line -->
Learn about different ways you can optimize the performance of your application.
</docs-decorative-header>

One of the top priorities of any developer is ensuring that their application is as performant as possible. These guides are here to help you follow best practices for building performant applications.

That said, please note that these best practices will only take the performance of your application so far. At the end of the day, we encourage you to measure performance in order to best understand what custom optimizations are best for your application.

| Guides Types                              | Description                                                                                                |
| :---------------------------------------- | :--------------------------------------------------------------------------------------------------------- |
| [Deferrable views](/guide/defer)                | Defer loading of select dependencies within a template by wrapping corresponding parts in a `@defer` block.                                                    |
| [Image optimization](/guide/image-optimization) | Use the `NgOptimizedImage` directive to adopt best practices for loading images.                            |
| [Server-side rendering](/guide/ssr)             | Learn how to leverage rendering pages on the server to improve load times.                                 |
| [Build-time prerendering](/guide/prerendering)  | Also known as static-side generation (SSG), is an alternate rendering method to improve load times.           |
| [Hydration](/guide/hydration)                   | A process to improve application performance by restoring its state after server-side rendering and reusing existing DOM structure as much as possible. |
