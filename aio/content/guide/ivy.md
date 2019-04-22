# Opting into Angular Ivy

Ivy is the code name for Angular's [next-generation compilation and rendering pipeline](https://blog.angular.io/a-plan-for-version-8-0-and-ivy-b3318dfc19f7). Starting with Angular version 8, you can choose to opt in to start using Ivy now, and help in its continuing develpment and tuning.


## Using Ivy in a new project

To start a new project with Ivy enabled, use the `--enable-ivy` flag with the [`ng new`](cli/new) command:

```sh
ng new shiny-ivy-app --enable-ivy
```

The new project is automatically configured for Ivy. Specifically, the enableIvy option is set to `true` in the project's `tsconfig.app.json` file.


## Using Ivy in an existing project

To update an existing project to use Ivy, set the `enableIvy` option in the `angularCompilerOptions` in your project's `tsconfig.app.json`.
```json
{
  "compilerOptions": { ... },
  "angularCompilerOptions": {
    "enableIvy": true
  }
}
```

To stop using the Ivy compiler, set `enableIvy` to `false` in `tsconfig.app.json`, or remove it completely.
