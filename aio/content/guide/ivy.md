# Angular Ivy

Ivy is the code name for Angular's [next-generation compilation and rendering pipeline](https://blog.angular.io/a-plan-for-version-8-0-and-ivy-b3318dfc19f7).
With the version 9 release of Angular, the new compiler and runtime instructions are used by default instead of the older compiler and runtime, known as View Engine.

<div class="alert is-helpful">

Learn more about the [Compiler](https://www.youtube.com/watch?v=anphffaCZrQ) and [Runtime](https://www.youtube.com/watch?v=S0o-4yc2n-8) in these videos from our team.


</div>

{@a aot-and-ivy}
## AOT and Ivy

AOT compilation with Ivy is faster and should be used by default.
In the `angular.json` workspace configuration file, set the default build options for your project to always use AOT compilation.

<code-example language="json" header="angular.json">

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
</code-example>

## Ivy and libraries

Ivy applications can be built with libraries that were created with the View Engine compiler.
This compatibility is provided by a tool known as the Angular compatibility compiler (`ngcc`).
CLI commands run `ngcc` as needed, either after npm installation of dependencies or when performing an Angular build.

If you are a library author, you should keep using the View Engine compiler as of version 9.
By having all libraries continue to use View Engine, you will maintain compatibility with default v9 applications that use Ivy, as well as with applications that have opted to continue using View Engine.

See the [Creating Libraries](guide/creating-libraries) guide for more on how to compile or bundle your Angular library.
When you use the tools integrated into the Angular CLI or `ng-packagr`, your library will always be built the right way automatically.

{@a opting-out-of-angular-ivy}
## Opting out of Ivy in version 9

In version 9, Ivy is the default.
For compatibility with current workflows during the update process, you can choose to opt out of Ivy and continue using the previous compiler, View Engine.

<div class="alert is-helpful">

Before disabling Ivy, check out the debugging recommendations in the [Ivy Compatibility Guide](guide/ivy-compatibility#debugging).

</div>

To opt out of Ivy, change the `angularCompilerOptions` in your project's TypeScript configuration, most commonly located at `tsconfig.app.json` at the root of the workspace.

The value of the `enableIvy`  flag is set to `true` by default, as of version 9.
The following example shows how to set the `enableIvy` option to `false` in order to opt out of Ivy.

<code-example language="json" header="tsconfig.app.json">
{
  "extends": "./tsconfig.json",
  "compilerOptions": {
    "outDir": "./out-tsc/app",
    "types": []
  },
  "include": [
    "src/**/*.ts"
  ],
  "exclude": [
    "src/test.ts",
    "src/**/*.spec.ts"
  ],
"angularCompilerOptions": {
 "enableIvy": false
 }
}
</code-example>

If you disable Ivy, you might also want to reconsider whether to make AOT compilation the default for your application development, as described [above](#aot-and-ivy). To revert the compiler default, set the build option `aot: false` in the `angular.json` configuration file.