# Opting out of Angular Ivy

Ivy is the code name for Angular's [next-generation compilation and rendering pipeline](https://blog.angular.io/a-plan-for-version-8-0-and-ivy-b3318dfc19f7). 
Starting with Angular version 9, Ivy compilation and rendering pipeline is enabled by default.
The previous compilation and rendering pipeline, View Engine, is deprecated in version 9, and will be removed at a later date.
You can choose to opt out of Ivy and continue using View Engine while making the transition.

To opt out of Ivy and continue using View Engine for an existing project, set the `enableIvy` option in the `angularCompilerOptions` in your project's `tsconfig.json` to `false`.
<code-example language="json" header="tsconfig.json">
{
  "compilerOptions": { ... },
  "angularCompilerOptions": {
    "enableIvy": false
  }
}
</code-example>

AOT compilation with Ivy is faster than with View Engine, and can be used for development. 
If you opt out of Ivy, AOT compilation will be slower, and should not be used for development in large projects. 
When Ivy is disabled for a large project, make sure that the `aot` build option in that project configuration is 
set to `false` and it's only set to `true` in the `production` configuration.

<code-example language="json" header="angular.json">
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
</code-example>

Ivy projects usually contain a `postinstall` script in the `scripts` section of `package.json` that converts packages in `node_modules` to use Ivy as well.
When you opt out of Ivy, remove this script. Remove the following line in package.json.

<code-example language="json" header="package.json">
{
  "scripts": {
    "postinstall": "ngcc --properties es2015 browser module main --first-only --create-ivy-entry-points"
  }
}
</code-example>
