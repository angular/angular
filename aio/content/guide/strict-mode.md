# Strict mode

When you create a new workspace or a project you have an option to create them in a strict mode using the `--strict` flag.

Enabling this flag initializes your new workspace or project with a few new settings that improve maintainability, help you catch bugs ahead of time, and allow the CLI to perform advanced optimizations on your application.
Additionally, applications that use these stricter settings are easier to statically analyze, which can help the `ng update` command refactor code more safely and precisely when you are updating to future versions of Angular.

Specifically, the `strict` flag does the following:

* Enables [`strict` mode in TypeScript](https://www.staging-typescript.org/tsconfig#strict), as well as other strictness flags recommended by the TypeScript team. Specifically, `forceConsistentCasingInFileNames`, `noImplicitReturns`,  `noFallthroughCasesInSwitch`.
* Turns on strict Angular compiler flags [`strictTemplates`](guide/angular-compiler-options#stricttemplates) and [`strictInjectionParameters`](guide/angular-compiler-options#strictinjectionparameters)
* [Bundle size budgets](guide/build#configuring-size-budgets) have been reduced by ~75%
* Turns on [`no-any` tslint rule](https://palantir.github.io/tslint/rules/no-any/) to prevent declarations of type `any`
* [Marks your application as side-effect free](https://webpack.js.org/guides/tree-shaking/#mark-the-file-as-side-effect-free) to enable more advanced tree-shaking

You can apply these settings at the workspace and project level.

To create a new workspace and application using the strict mode, run the following command:

<code-example language="sh" class="code-shell">

ng new [project-name] --strict

</code-example>

To create a new application in the strict mode within an existing non-strict workspace, run the following command:

<code-example language="sh" class="code-shell">

ng generate application [project-name] --strict

</code-example>

{@a side-effect}

### Non-local side effects in applications

When you create projects and workspaces using the `strict` mode, you'll notice an additional `package.json` file, located in `src/app/` directory.
This file informs tools and bundlers that the code under this directory is free of non-local side effects. Non-local side effects in the application code are not common and using them is not considered a good coding pattern.
More importantly, code with these types of side effects cannot be optimized, resulting in increased bundle sizes and applications that load more slowly.

If you need more information, the following links may be helpful.

* [Tree-shaking](https://webpack.js.org/guides/tree-shaking/)
* [Dealing with side effects and pure functions in JavaScript](https://dev.to/vonheikemen/dealing-with-side-effects-and-pure-functions-in-javascript-16mg)
* [How to deal with dirty side effects in your pure function JavaScript](https://jrsinclair.com/articles/2018/how-to-deal-with-dirty-side-effects-in-your-pure-functional-javascript/)