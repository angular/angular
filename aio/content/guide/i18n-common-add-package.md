# Add the localize package

{@a setting-up-cli}
{@a add-localize}

To take advantage of the localization features of Angular, use the Angular CLI to add the `@angular/localize` package to your project.

<code-example language="sh">
ng add @angular/localize
</code-example>

This command updates the `package.json` and `polyfills.ts` files of your project to import the `@angular/localize` package.

<div class="alert is-helpful">

For more information about `package.json` and polyfill packages, see [Workspace npm dependencies][AioGuideNpmPackages].

</div>

If `@angular/localize` is not installed, the Angular CLI may generate an error when you try to build a localized version of your application.

<!-- links -->

[AioGuideNpmPackages]: guide/npm-packages "Workspace npm dependencies | Angular"

<!-- external links -->

<!-- end links -->

@reviewed 2021-08-23
