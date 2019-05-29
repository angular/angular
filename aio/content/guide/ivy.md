# Opting into Angular Ivy

Ivy is the code name for Angular's [next-generation compilation and rendering pipeline](https://blog.angular.io/a-plan-for-version-8-0-and-ivy-b3318dfc19f7). Starting with Angular version 8, you can choose to opt in to start using a preview version of Ivy and help in its continuing development and tuning.

<div class="alert is-helpful">

   To preview Ivy, use `@angular/core@next` version of Angular (8.1.x), rather than `@angular/core@latest` (8.0.x), as it contains all the latest bug fixes and improvements.

</div>


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

AOT compilation with Ivy is faster and should be used by default. In the `angular.json` workspace configuration file, set the default build options for your project to always use AOT compilation.

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

To stop using the Ivy compiler, set `enableIvy` to `false` in `tsconfig.app.json`, or remove it completely. Also remove `"aot": true` from your default build options if you didn't have it there before.
 
