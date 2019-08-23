# Opting out of Angular Ivy

Ivy is the code name for Angular's [next-generation compilation and rendering pipeline](https://blog.angular.io/a-plan-for-version-8-0-and-ivy-b3318dfc19f7). 
Starting with Angular version 9, Ivy is the default compiler.
The previous rendering and compilation pipeline, View Engine, is deprecated in version 9, and will be removed at a later date.
You can choose to opt out of Ivy and continue using View Engine while making the transition.

To opt out of Ivy and continue using View Engine for an existing project, set the `enableIvy` option in the `angularCompilerOptions` in your project's `tsconfig.json` to `false`.
```json
{
  "compilerOptions": { ... },
  "angularCompilerOptions": {
    "enableIvy": false
  }
}
```

AOT compilation with Ivy is faster than with View Engine, and can be used for development. 
If you opt out of Ivy, AOT compilation will be slower, and should not be used for development in large projects. 
When Ivy is disabled for a large project, make sure that the `aot` build option in that project configuration is 
set to `false` and it's only set to `true` in the `production` configuration.

```json
{
  "projects": {
    "my-existing-project": {
      "architect": {
        "build": {
          "options": {
            ...
            "aot": false,
          },
          "configurations": {
            "production": {
              ...
              "aot": true
            }
          }
        }
      }
    }
  }
}
```
