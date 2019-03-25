# Opting into Angular Ivy with Angular CLI

Ivy is the code name for Angular's [next-generation compilation and rendering pipeline](https://blog.angular.io/a-plan-for-version-8-0-and-ivy-b3318dfc19f7). Starting with Angular version 8, you can choose to opt in to start using Ivy now, and help in its continuing develpment and tuning.


## Starting a new project using Ivy

To start a new project with Ivy enabled, use the `--enable-ivy` flag with the [`ng new`](cli/new) command:

```sh
ng new shiny-ivy-app --enable-ivy
```

The new project is automatically configured for Ivy.
- The `enableIvy` option is set to `true` in `tsconfig.app.json`.
- The `"aot": true` option is added to your default build options.

{@a updating}
## Updating an existing project to use Ivy

You can update an existing project to use Ivy by making the following configuration changes.

- Add the `enableIvy` option in the `angularCompilerOptions` in your project's `tsconfig.app.json`.
```json
{
  "compilerOptions": { ... },
  "angularCompilerOptions": {
    "enableIvy": true
  }
}
```
- Set `"module": "esnext"` inside `compilerOptions` in your `tsconfig.json` to support the [ES `import()` statement](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/import).
```json
{
  "compilerOptions": {
    ...
    "module": "esnext",
  }
}
```
- Update your lazy routes to use the `import()` statement. You can use [angular-lazy-routes-fix](https://github.com/phenomnomnominal/angular-lazy-routes-fix) to automatically transform them.
```typescript
const routes: Routes = [{
  path: 'lazy',
  // The string syntax for loadChildren is not supported in Ivy:
  //   loadChildren: './lazy/lazy.module#LazyModule'
  // Instead use the import statement:
  loadChildren: () => import('./lazy/lazy.module').then(m => m.LazyModule)
}];
```
- In the `angular.json` workspace configuration file, set the default build options for your project to always use AOT compilation.
```json
{
  "projects": {
    "my-existing-project": {
      "architect": {
        "build": {
          "options": {
            ...
            "aot": true,
          }
        }
      }
    }
  }
}
```

## Switching back to the current compiler

To stop using the Ivy compiler you need to undo the steps taken when [updating to use Ivy](#updating).
- Set `enableIvy` to false in `tsconfig.app.json`, or remove it completely.
- Add `"experimentalImportFactories": true` to your default build options in `angular.json` to support the import statement in `loadChildren` outside Ivy.
- Remove `"aot": true` from your default build options if you didn't have it there before.
