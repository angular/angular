# Strict mode

Angular CLI creates all new workspaces and projects with **strict mode** enabled.

Strict mode improves maintainability and helps you catch bugs ahead of time.
Additionally, strict mode applications are easier to statically analyze and can help the `ng update` command refactor code more safely and precisely when you are updating to future versions of Angular.

Specifically, strict mode affects newly generated applications in the following way:

*   Enables [`strict` mode in TypeScript](https://www.typescriptlang.org/tsconfig#strict), as well as other strictness flags recommended by the TypeScript team.
    Specifically, `forceConsistentCasingInFileNames`, `noImplicitReturns`, and `noFallthroughCasesInSwitch`.
*   Turns on strict Angular compiler flags [`strictTemplates`](guide/angular-compiler-options#stricttemplates), [`strictInjectionParameters`](guide/angular-compiler-options#strictinjectionparameters), and [`strictInputAccessModifiers`](guide/template-typecheck#troubleshooting-template-errors).
*   Reduces the [bundle size budgets](guide/build#configuring-size-budgets) for the `initial` and `anyComponentStyle` budget types by 75% compared to the previous defaults.

You can apply these settings at the workspace and project level.

Using the basic `ng new` command to create a new workspace and application automatically uses strict mode, as in the following command:

<code-example format="shell" language="shell">

ng new [project-name]

</code-example>

To create a new application in the strict mode within an existing non-strict workspace, run the following command:

<code-example format="shell" language="shell">

ng generate application [project-name] --strict

</code-example>

<!-- links -->

<!-- external links -->

<!-- end links -->

@reviewed 2022-02-28
