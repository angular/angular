# Angular compiler options

When you use [ahead-of-time compilation (AOT)](tools/cli/aot-compiler), you can control how your application is compiled by specifying Angular compiler options in the [TypeScript configuration file](https://www.typescriptlang.org/docs/handbook/tsconfig-json.html).

The Angular options object, `angularCompilerOptions`, is a sibling to the `compilerOptions` object that supplies standard options to the TypeScript compiler.

<docs-code header="tsconfig.json" path="adev/src/content/examples/angular-compiler-options/tsconfig.json" region="angular-compiler-options"/>

## Configuration inheritance with `extends`

Like the TypeScript compiler, the Angular AOT compiler also supports `extends` in the `angularCompilerOptions` section of the TypeScript configuration file.
The `extends` property is at the top level, parallel to `compilerOptions` and `angularCompilerOptions`.

A TypeScript configuration can inherit settings from another file using the `extends` property.
The configuration options from the base file are loaded first, then overridden by those in the inheriting configuration file.

For example:

<docs-code header="tsconfig.app.json" path="adev/src/content/examples/angular-compiler-options/tsconfig.app.json" region="angular-compiler-options-app"/>

For more information, see the [TypeScript Handbook](https://www.typescriptlang.org/docs/handbook/tsconfig-json.html).

## Template options

The following options are available for configuring the Angular AOT compiler.

### `annotationsAs`

Modifies how Angular-specific annotations are emitted to improve tree-shaking.
Non-Angular annotations are not affected.
One of `static fields` or `decorators`. The default value is `static fields`.

- By default, the compiler replaces decorators with a static field in the class, which allows advanced tree-shakers like [Closure compiler](https://github.com/google/closure-compiler) to remove unused classes
- The `decorators` value leaves the decorators in place, which makes compilation faster.
  TypeScript emits calls to the `__decorate` helper.
  Use `--emitDecoratorMetadata` for runtime reflection.

  HELPFUL: That the resulting code cannot tree-shake properly.

### `annotateForClosureCompiler`

<!-- vale Angular.Angular_Spelling = NO -->

When `true`, use [Tsickle](https://github.com/angular/tsickle) to annotate the emitted JavaScript with [JSDoc](https://jsdoc.app) comments needed by the [Closure Compiler](https://github.com/google/closure-compiler).
Default is `false`.

<!-- vale Angular.Angular_Spelling = YES -->

### `compilationMode`

Specifies the compilation mode to use.
The following modes are available:

| Modes       | Details                                                                                             |
| :---------- | :-------------------------------------------------------------------------------------------------- |
| `'full'`    | Generates fully AOT-compiled code according to the version of Angular that is currently being used. |
| `'partial'` | Generates code in a stable, but intermediate form suitable for a published library.                 |

The default value is `'full'`.

For most applications, `'full'` is the correct compilation mode.

Use `'partial'` for independently published libraries, such as npm packages.
`'partial'` compilations output a stable, intermediate format which better supports usage by applications built at different Angular versions from the library.
Libraries built at "HEAD" alongside their applications and using the same version of Angular such as in a mono-repository can use `'full'` since there is no risk of version skew.

### `customElementsManifests`

A list of [Custom Elements Manifest](https://github.com/webcomponents/custom-elements-manifest) \(`custom-elements.json`\) locations describing web components used in templates.

Each entry may be one of the following:

| Entry format                     | Details                                                                                                      |
| :------------------------------- | :----------------------------------------------------------------------------------------------------------- |
| `'./custom-elements.json'`       | A path relative to the project's `tsconfig.json`.                                                            |
| `'@my/lib/custom-elements.json'` | A module specifier of a `.json` file within a package, resolved through the project's module resolution.     |
| `'@my/lib'`                      | A bare package name; the manifest is located via the `customElements` field of the package's `package.json`. |

Elements declared in these manifests are treated as known elements during template type checking:

- They don't produce "is not a known element" diagnostics \(`NG8001`\).
- Their declared members and events are recognized in bindings \(`NG8002`\), while bindings to properties the manifests don't declare are still reported. Members marked `readonly` are excluded, since assigning to them at runtime can never work. Manifest attributes are offered as static-attribute completions, but an attribute-only declaration does not authorize a same-named JavaScript property binding; use `[attr.name]` when binding an attribute directly.
- The Angular Language Service offers their tags, properties, attributes, and events in completions. Attribute declarations offer both static and `[attr.name]` forms. Completion details and hovers include the manifest's type, default value, documentation \(`description`/`summary`\), and deprecation status \(`deprecated`\). Static attributes whose types are string literal unions offer value completions even when strict attribute checking is disabled.

The Language Service treats the manifest's declared type text as descriptive metadata, so it can display that text even when Angular cannot safely use it for template checking. Only the validated type information described below affects diagnostics; otherwise the binding or event remains existence-checked only.

This makes it possible to use a web component library without adding `CUSTOM_ELEMENTS_SCHEMA`, which disables schema checking for every element with a dash in its tag name rather than describing the elements that actually exist.
When both mechanisms are present, a manifest remains authoritative for the tags it declares, while `CUSTOM_ELEMENTS_SCHEMA` continues to allow other hyphenated tags. This supports incremental migration from broad schema suppression to manifest-backed checking.

When [strict template type checking](tools/cli/template-typecheck#strict-mode) is enabled \(`strictTemplates` or `strictInputTypes`\), binding _values_ are also checked against the manifest's type information in two cases:

- The declared type text is self-contained: primitives, literal unions, and arrays or safe generics of those \(for example `boolean`, `'primary' | 'secondary'`, `string[]`\).
- The declared type's named types are located by the manifest's optional `type.references` entries — either through `start`/`end` indices that exactly cover the name in the type text, or index-less when the entire type text is the referenced name. Following the manifest schema, a reference without `package` is local to the manifest's package, a reference without `module` is local to the containing JavaScript module, and platform globals use `package: "global:"`. Explicit package and module references are checked against the package's TypeScript declarations. References that don't resolve to an exported type declaration — for example unpublished source paths, missing exports, value-only exports, or packages without types, which the consuming application cannot fix — produce a configuration _warning_ (`NG4011`) and affected properties, attributes, and events fall back to existence-only checking; they never produce errors on template bindings.

Under the same conditions, `$event` in event bindings is typed from the manifest's event `type` \(gated on `strictDomEventTypes` within strict mode\); events whose type information isn't trustworthy fall back to the standard DOM event type inference.

When `strictAttributeTypes` is enabled, trustworthy static attribute types with one unambiguous primitive serialization category are checked using HTML serialization semantics. String literal unions require an exact declared value, numeric text such as `precision="0.5"` is checked as a number, and boolean attribute presence is checked as `true`. Complex object-valued attributes and types that mix serialization categories, such as `boolean | number`, remain unchecked. Property bindings continue to use JavaScript property types, so `[precision]="value"` checks `value` directly as a number. Interpolation serializes its result to a string before assigning the property, so `precision="{{ value }}"` is not assignable to a numeric property; use `[precision]="value"` to preserve the number.

Bindings written as `[attr.name]` use Angular's general attribute serialization behavior: `null` removes the attribute and other values are converted to text. Their values are not checked against manifest property or attribute types.

Manifest property names are exact JavaScript property names. Angular therefore preserves them during code generation instead of applying native HTML attribute-to-property mappings such as `readonly` to `readOnly`. Standard inherited properties that the manifest does not redeclare continue to use Angular's normal DOM mapping.

Directive host bindings are compiled independently of the consuming component and do not have access to its configured manifests. A directive host binding such as `host: {'[readonly]': 'value'}` therefore continues to use Angular's native DOM mapping (`readonly` to `readOnly`), even when the directive is applied to a manifest-declared custom element. Bind exact custom-element properties in the component template when this distinction matters.

Properties and events whose type information doesn't meet these conditions — including function types, qualified names, and named types without references — are existence-checked only. The input side of a manually written two-way binding is checked against its manifest property type; its event side receives manifest typing only when the manifest declares the exact `<propertyName>Change` event. The language service does not offer two-way binding completions for manifest properties: DOM listeners receive an event object, while Angular two-way binding assigns `$event` directly to the bound value. Use an explicit property binding and event handler (for example `[count]="count" (countChange)="count = $event.detail"`) when a custom event carries the new value. Angular does not infer mappings from web-component event names such as `count-changed` or `countchange`.

For package-based manifests, strict DOM local-reference checking also uses the manifest declaration's class and module information. This gives `#ref` the web component class type when that class resolves to importable TypeScript declarations; path-based manifests, declarations without importable class information, and class references that don't resolve (reported by the same `NG4011` warning) fall back to `HTMLElement`.

Inherited members are recognized only when the manifest lists them on the custom element's own declaration, as manifests produced by the [Custom Elements Manifest analyzer](https://custom-elements-manifest.open-wc.org/) do; `superclass` and `mixins` references are not resolved.

Manifest declarations are validated against the platform's custom element registration rules:

- A declaration whose tag name is not a [valid custom element name](https://html.spec.whatwg.org/multipage/custom-elements.html#valid-custom-element-name) — for example a hyphen-free native tag name like `marquee`, which `customElements.define` would reject — is skipped with a warning \(`NG4009`\). Native elements are never extended.
- When multiple declarations claim the same tag name \(within one manifest or across manifests\), the first declaration wins and later ones are skipped with a warning \(`NG4010`\), mirroring runtime behavior where only the first `customElements.define` call for a name succeeds.

Manifest files are global compilation resources: edits invalidate template checking throughout the program and are reloaded when the compiler host reports them as changed. The Angular language service and project-local `ngc --watch` manifests use this path; whether changes inside ignored dependency directories such as `node_modules` trigger a rebuild depends on the build host's watch configuration.

### `disableExpressionLowering`

When `true`, the default, transforms code that is or could be used in an annotation, to allow it to be imported from template factory modules.
See [metadata rewriting](tools/cli/aot-compiler#metadata-rewriting) for more information.

When `false`, disables this rewriting, requiring the rewriting to be done manually.

### `disableTypeScriptVersionCheck`

When `true`, the compiler does not look at the TypeScript version and does not report an error when an unsupported version of TypeScript is used.
Not recommended, as unsupported versions of TypeScript might have undefined behavior.
Default is `false`.

### `enableI18nLegacyMessageIdFormat`

Instructs the Angular template compiler to create legacy ids for messages that are tagged in templates by the `i18n` attribute.
See [Mark text for translations][GuideI18nCommonPrepareMarkTextInComponentTemplate] for more information about marking messages for localization.

Set this option to `false` unless your project relies upon translations that were created earlier using legacy IDs.
Default is `true`.

The pre-Ivy message extraction tooling created a variety of legacy formats for extracted message IDs.
These message formats have some issues, such as whitespace handling and reliance upon information inside the original HTML of a template.

The new message format is more resilient to whitespace changes, is the same across all translation file formats, and can be created directly from calls to `$localize`.
This allows `$localize` messages in application code to use the same ID as identical `i18n` messages in component templates.

### `enableResourceInlining`

When `true`, replaces the `templateUrl` and `styleUrls` properties in all `@Component` decorators with inline content in the `template` and `styles` properties.

When enabled, the `.js` output of `ngc` does not include any lazy-loaded template or style URLs.

For library projects created with the Angular CLI, the development configuration default is `true`.

### `enableLegacyTemplate`

When `true`, enables the deprecated `<template>` element in place of `<ng-template>`.
Default is `false`.
Might be required by some third-party Angular libraries.

### `flatModuleId`

The module ID to use for importing a flat module \(when `flatModuleOutFile` is `true`\).
References created by the template compiler use this module name when importing symbols from the flat module.
Ignored if `flatModuleOutFile` is `false`.

### `flatModuleOutFile`

When `true`, generates a flat module index of the given filename and the corresponding flat module metadata.
Use to create flat modules that are packaged similarly to `@angular/core` and `@angular/common`.
When this option is used, the `package.json` for the library should refer to the created flat module index instead of the library index file.

Produces only one `.metadata.json` file, which contains all the metadata necessary for symbols exported from the library index.
In the created `.ngfactory.js` files, the flat module index is used to import symbols. Symbols that include both the public API from the library index and shrouded internal symbols.

By default, the `.ts` file supplied in the `files` field is assumed to be the library index.
If more than one `.ts` file is specified, `libraryIndex` is used to select the file to use.
If more than one `.ts` file is supplied without a `libraryIndex`, an error is produced.

A flat module index `.d.ts` and `.js` is created with the given `flatModuleOutFile` name in the same location as the library index `.d.ts` file.

For example, if a library uses the `public_api.ts` file as the library index of the module, the `tsconfig.json` `files` field would be `["public_api.ts"]`.
The `flatModuleOutFile` option could then be set, for example, to `"index.js"`, which produces `index.d.ts` and `index.metadata.json` files.
The `module` field of the library's `package.json` would be `"index.js"` and the `typings` field would be `"index.d.ts"`.

### `generateCodeForLibraries`

When `true`, creates factory files \(`.ngfactory.js` and `.ngstyle.js`\) for `.d.ts` files with a corresponding `.metadata.json` file. The default value is `true`.

When `false`, factory files are created only for `.ts` files.
Do this when using factory summaries.

### `preserveWhitespaces`

When `false`, the default, removes blank text nodes from compiled templates, which results in smaller emitted template factory modules.
Set to `true` to preserve blank text nodes.

HELPFUL: When using hydration, it is recommended that you use `preserveWhitespaces: false`, which is the default value. If you choose to enable preserving whitespaces by adding `preserveWhitespaces: true` to your tsconfig, it is possible you may encounter issues with hydration. This is not yet a fully supported configuration. Ensure this is also consistently set between the server and client tsconfig files. See the [hydration guide](guide/hydration#preserve-whitespaces-configuration) for more details.

### `skipMetadataEmit`

When `true`, does not produce `.metadata.json` files.
Default is `false`.

The `.metadata.json` files contain information needed by the template compiler from a `.ts` file that is not included in the `.d.ts` file produced by the TypeScript compiler.
This information includes, for example, the content of annotations, such as a component's template, which TypeScript emits to the `.js` file but not to the `.d.ts` file.

You can set to `true` when using factory summaries, because the factory summaries include a copy of the information that is in the `.metadata.json` file.

Set to `true` if you are using TypeScript's `--outFile` option, because the metadata files are not valid for this style of TypeScript output.
The Angular community does not recommend using `--outFile` with Angular.
Use a bundler, such as [webpack](https://webpack.js.org), instead.

### `skipTemplateCodegen`

When `true`, does not emit `.ngfactory.js` and `.ngstyle.js` files.
This turns off most of the template compiler and disables the reporting of template diagnostics.

Can be used to instruct the template compiler to produce `.metadata.json` files for distribution with an `npm` package. This avoids the production of `.ngfactory.js` and `.ngstyle.js` files that cannot be distributed to `npm`.

For library projects created with the Angular CLI, the development configuration default is `true`.

### `strictMetadataEmit`

When `true`, reports an error to the `.metadata.json` file if `"skipMetadataEmit"` is `false`.
Default is `false`.
Use only when `"skipMetadataEmit"` is `false` and `"skipTemplateCodegen"` is `true`.

This option is intended to verify the `.metadata.json` files emitted for bundling with an `npm` package.
The validation is strict and can emit errors for metadata that would never produce an error when used by the template compiler.
You can choose to suppress the error emitted by this option for an exported symbol by including `@dynamic` in the comment documenting the symbol.

It is valid for `.metadata.json` files to contain errors.
The template compiler reports these errors if the metadata is used to determine the contents of an annotation.
The metadata collector cannot predict the symbols that are designed for use in an annotation. It preemptively includes error nodes in the metadata for the exported symbols.
The template compiler can then use the error nodes to report an error if these symbols are used.

If the client of a library intends to use a symbol in an annotation, the template compiler does not normally report this. It gets reported after the client actually uses the symbol.
This option allows detection of these errors during the build phase of the library and is used, for example, in producing Angular libraries themselves.

For library projects created with the Angular CLI, the development configuration default is `true`.

### `strictInjectionParameters`

When `true`, reports an error for a supplied parameter whose injection type cannot be determined.
When `false`, constructor parameters of classes marked with `@Injectable` whose type cannot be resolved produce a warning.
The recommended value is `true`, but the default value is `false`.

When you use the Angular CLI command `ng new --strict`, it is set to `true` in the created project's configuration.

### `strictTemplates`

When `true`, enables [strict template type checking](tools/cli/template-typecheck#strict-mode).

The strictness flags that this option enables allow you to turn on and off specific types of strict template type checking.
See [troubleshooting template errors](tools/cli/template-typecheck#troubleshooting-template-errors).

When you use the Angular CLI command `ng new --strict`, it is set to `true` in the new project's configuration.

### `strictStandalone`

When `true`, reports an error if a component, directive, or pipe is not standalone.

### `trace`

When `true`, prints extra information while compiling templates.
Default is `false`.

### `typeCheckHostBindings`

When `true`, enables type checking of expressions in the `host` object literal and `@HostBinding`/`@HostListener` decorators of components and directives.
Default is `true`.

## Command line options

Most of the time, you interact with the Angular Compiler indirectly using [Angular CLI](reference/configs/angular-compiler-options). When debugging certain issues, you might find it useful to invoke the Angular Compiler directly.
You can use the `ngc` command provided by the `@angular/compiler-cli` npm package to call the compiler from the command line.

The `ngc` command is a wrapper around TypeScript's `tsc` compiler command. The Angular Compiler is primarily configured through `tsconfig.json` while Angular CLI is primarily configured through `angular.json`.

Besides the configuration file, you can also use [`tsc` command line options](https://www.typescriptlang.org/docs/handbook/compiler-options.html) to configure `ngc`.

[GuideI18nCommonPrepareMarkTextInComponentTemplate]: guide/i18n/prepare#mark-text-in-component-template 'Mark text in component template - Prepare component for translation | Angular'
