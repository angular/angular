# Opting into Angular Ivy with Angular CLI

Ivy is the code name for Angular's [next-generation compilation and rendering pipeline](https://blog.angular.io/a-plan-for-version-8-0-and-ivy-b3318dfc19f7). Starting with Angular version 8, you can choose to opt in to start using Ivy now, and help in its continuing develpment and tuning.


## Starting a new project using Ivy

To start a new project with Ivy enabled, use the `--enable-ivy` flag with the [`ng new`](cli/new) command:

```sh
ng new shiny-ivy-app --enable-ivy
```

The new project is automatically configured for Ivy.
- The `enableIvy` option is set to `true` in `tsconfig.app.json`.

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

## Switching back to the current compiler

To stop using the Ivy compiler you need to undo the steps taken when [updating to use Ivy](#updating).
- Set `enableIvy` to `false` in `tsconfig.app.json`, or remove it completely.