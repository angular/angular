# Strict mode

When you create a new workspace or an application you have an option to create them in a strict mode using the `--strict` flag.

Enabling this flag initializes your new workspace or application with a few new settings that improve maintainability, help you catch bugs ahead of time.
Additionally, applications that use these stricter settings are easier to statically analyze, which can help the `ng update` command refactor code more safely and precisely when you are updating to future versions of Angular.

Specifically, the `strict` flag does the following:

* Enables [`strict` mode in TypeScript](https://www.staging-typescript.org/tsconfig#strict), as well as other strictness flags recommended by the TypeScript team. Specifically, `forceConsistentCasingInFileNames`, `noImplicitReturns`,  `noFallthroughCasesInSwitch`.
* Turns on strict Angular compiler flags [`strictTemplates`](guide/angular-compiler-options#stricttemplates), [`strictInjectionParameters`](guide/angular-compiler-options#strictinjectionparameters) and [`strictInputAccessModifiers`](guide/template-typecheck#troubleshooting-template-errors).
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

#### Enabling strict mode for an existing project

Edit your `angular.json` and add `@schematics/angular:application` with `"strict": true` to the `schematics` property:

```
  ...
  "projects": {
    "app": {
      "projectType": "application",
      "schematics": {
        "@schematics/angular:application": {
          "strict": true
        }
      }
   ...
 ```

Add the following to `compilerOptions` in `tsconfig.json`.

<code-example header="tsconfig.json">
    "forceConsistentCasingInFileNames": true,
    "strict": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true,
</code-example>

Add a new property `angularCompilerOptions` to `tsconfig.json`:
```
  "angularCompilerOptions": {
    "strictInjectionParameters": true,
    "strictInputAccessModifiers": true,
    "strictTemplates": true
  }
```

Finally add `"no-any": true` to `rules` in `tslint.json`.
