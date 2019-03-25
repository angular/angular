# Opting into Angular Ivy with Angular CLI

Ivy is the code name for Angular's [next-generation compilation and rendering pipeline](https://blog.angular.io/a-plan-for-version-8-0-and-ivy-b3318dfc19f7). Starting with Angular version 8, you can choose to opt in to start using Ivy now, and help in its continuing develpment and tuning.


## Starting a new project using Ivy

To start a new project with Ivy enabled, use the `--enable-ivy` flag with the [`ng new`](cli/new) command:

```sh
ng new shiny-ivy-app --enable-ivy
```

The new project is automatically configured for Ivy.
- The `enableIvy` option is set to `true` in `src/tsconfig.app.json`.
- The `"aot": true` option is added to your default build options.
- A `postinstall` script is provided for the [Angular Compatibility Compiler](#ngcc).

{@a updating}
## Updating an existing project to use Ivy

You can update an existing project to use Ivy by making the following configuration changes.

- Add the `enableIvy` option in the `angularCompilerOptions` in your project's `src/tsconfig.app.json`.
To use Ivy before version 8 is final, add the `allowEmptyCodegenFiles`as well.
```json
{
  "compilerOptions": { ... },
  "angularCompilerOptions": {
    "enableIvy": true,
    "allowEmptyCodegenFiles": true,
  }
}
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
- Add a `postinstall` script to the workspace `package.json` file to run the [Angular Compatibility Compiler](#ngcc).
```json
{
  "scripts": {
    ...
    "postinstall": "ivy-ngcc"
  }
}
```
- Reinstall your `package.json` dependencies to run the newly added script.

```
npm install
```

## Switching back to the current compiler

To stop using the Ivy compiler you need to undo the steps taken when [updating to use Ivy](#updating).
- Set `enableIvy` to false in `src/tsconfig.app.json`, or remove it completely.
- Remove `"aot": true` from your default build options if you didn't have it there before.
- Remove the `postinstall` script.
- Delete and reinstall your node modules.


{@a ngcc}
## The Angular Compatibility Compiler

The Angular Compatibility (`ngcc`) compiler helps you compile third-party libraries with Ivy so that you can use them in your Ivy application.
Use a postinstall script in your `package.json` to always run `ngcc` when you install your `package.json` dependencies, so that all projects in the workspace are compiled with Ivy.

<div class="alert is-helpful">

  Using a postinstall hook to run `ngcc` is just a temporary integration.
  We expect `ngcc` to be seamlessly integrated into the Angular CLI build pipeline in the future before the full Ivy rollout.
  Once that's implemented `ngcc` will not be visible to developers.
 
  Note that there are currently some build-time performance issues with `ngcc`. Please bear with us while we improve the tooling and build integration in the Angular CLI.

</div>
