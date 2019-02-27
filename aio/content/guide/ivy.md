# Opting into Angular Ivy with Angular CLI

[Starting with Angular version 8](https://blog.angular.io/a-plan-for-version-8-0-and-ivy-b3318dfc19f7) you can opt-in to the new [Angular Ivy compilation and rendering pipeline].


## Starting a new project using Ivy

To start a new project with Ivy enabled, use the `--enable-ivy` flag with the [`ng new`](cli/new) command:

```sh
ng new shiny-ivy-app --enable-ivy
```

Everything will be configured for you:
- `enableIvy` set to `true` in `src/tsconfig.app.json`.
- `"aot": true` added to your default build options.
- `postinstall` script for the [Angular Compatibility Compiler](#ngcc).

{@a updating}
## Updating an existing project to use Ivy

By configuring a few key files, you can also update your existing project(s) to use Ivy.

- Add the `allowEmptyCodegenFiles` (needed only before version 8 final) and `enableIvy` options in the `angularCompilerOptions` in your project's `src/tsconfig.app.json`:
```json
{
  "compilerOptions": { ... },
  "angularCompilerOptions": {
    "enableIvy": true,
    "allowEmptyCodegenFiles": true,
  }
}
```
- Set the default build options for your project to always use AOT compilation if it isn't already:
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
- Add a `postinstall` script to the workspace `package.json` file to run the [Angular Compatibility Compiler](#ngcc):
```json
{
  "scripts": {
    ...
    "postinstall": "ivy-ngcc"
  }
}
```
- Reinstall your `package.json` dependencies to run the newly added script:

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

Your third party libraries also need to be compiled with Ivy for you to use them in your Ivy application.
That's where the Angular Compatibility (`ngcc`) compiler comes into play.

We set it as a postinstall script in your `package.json` so that it always runs when you install
your `package.json` dependencies.

Using a postinstall hook to run `ngcc` is just a temporary integration. 
We expect `ngcc` to be seamlessly integrated into the Angular CLI build pipeline in the future before the full Ivy rollout. 
Once that's implemented `ngcc` will not be visible to developers.

Until that happens, opting into Ivy means that all projects in a single CLI workspace will be compiled with Ivy.

Note: we are aware of build-time performance issues with ngcc. Please bear with us while we improve the tooling and build integration in the Angular CLI.
