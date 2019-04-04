# Updating Angular Lazy Routes

When we first introduced lazy routes, there wasn't browser support for dynamically loading additional JavaScript.
Angular created our own scheme using the syntax `loadChildren: './lazy/lazy.module#LazyModule'` and built complex tooling to support it.
Now that EcmaScript dynamic import is a standard and is supported in many browsers, it's time for Angular applications to use this new syntax.

> Updating your lazy routes to dynamic import is *required* in order to use Angular Ivy.
> See /guide/ivy for full instructions for opting-in to Ivy.

Angular community member Craig Spence created an automated migrator tool, which he writes about at https://blog.angularindepth.com/automatically-upgrade-lazy-loaded-angular-modules-for-ivy-e760872e6084.

We recommend that all Angular developers run this migration, after successfully updating to Angular 8.

## Performing the migration

1. Update to Angular 8. This version includes support for the new dynamic import syntax.

1. Make sure your application is working, and that you are in a clean checkout of your project.
   In case the migration causes problems for your application, you maybe want to revert these changes.

1. Install the migrator:

    ```sh
    $ npm install @phenomnomnominal/angular-lazy-routes-fix -D
    ```

    or for yarn users,

    ```sh
    $ yarn add -D @phenomnomnominal/angular-lazy-routes-fix
    ```

1. Replace your `tslint.json` file with:

    ```json
    {
        "extends": [
            "@phenomnomnominal/angular-lazy-routes-fix"
        ],
        "no-lazy-module-paths": [true],
    }
    ```

1. Run `ng lint --fix`

1. Revert the changes to the `tslint.json` file.

1. Make sure your `tsconfig.json` has `module: "esnext"`.
   Otherwise you'll get a type-check error from TypeScript that the `import()` syntax is not supported.

1. You can un-install the migrator tool now.

    ```sh
    $ npm uninstall @phenomnomnominal/angular-lazy-routes-fix
    ```

    or for yarn users,

    ```sh
    $ yarn remove @phenomnomnominal/angular-lazy-routes-fix
    ```

## FAQ

1. Why isn't this migration run automatically by `ng update`?

    This migration is optional in Angular 8.
    Since we expect the majority of users will not opt-into Ivy, we don't want to introduce the risk of breaking your application in case your code or a library you use depends on the current string-based syntax in some way.
