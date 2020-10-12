# Strict mode

Stricter type checking and other similar constraints often enable more optimizations and correctness verification at build time. For more information about this theory, see [Power in Constraints](https://www.youtube.com/watch?v=X-Dn5ZBUZH0). At the same time, constraints may impact the development experience.

In Angular, we want to enable the strictest flags to encourage best practices, without significantly impacting the learning curve when getting started with the framework, nor DX.

As an experiment that will allow us to understand the limits we can push, we implemented strict mode. We are using the strict mode to encourage the adoption of best practices and understand the strict options developers will feel comfortable with while still enabling most compile-time correctness checks and optimizations. You can learn more about the strict flags we've been experimenting with and their implications [here](https://blog.angular.io/angular-cli-strict-mode-c94ba5965f63).

When you create a new workspace or an application you have an option to create them in a strict mode using the `--strict` flag.

Enabling this flag initializes your new workspace or application with a few new settings that improve maintainability, help you catch bugs ahead of time.
Additionally, applications that use these stricter settings are easier to statically analyze, which can help the `ng update` command refactor code more safely and precisely when you are updating to future versions of Angular.

Specifically, the `strict` flag does the following:

* Enables [`strict` mode in TypeScript](https://www.staging-typescript.org/tsconfig#strict), as well as other strictness flags recommended by the TypeScript team. Specifically, `forceConsistentCasingInFileNames`, `noImplicitReturns`,  `noFallthroughCasesInSwitch`.
* Turns on strict Angular compiler flags [`strictTemplates`](guide/angular-compiler-options#stricttemplates), [`strictInjectionParameters`](guide/angular-compiler-options#strictinjectionparameters) and [`strictTemplates`](guide/angular-compiler-options#stricttemplates).
* [Bundle size budgets](guide/build#configuring-size-budgets) have been reduced by ~75%.

You can apply these settings at the workspace and project level.

To create a new workspace and application using the strict mode, run the following command:

<code-example language="sh" class="code-shell">

ng new [project-name] --strict

</code-example>

To create a new application in the strict mode within an existing non-strict workspace, run the following command:

<code-example language="sh" class="code-shell">

ng generate application [project-name] --strict

</code-example>
