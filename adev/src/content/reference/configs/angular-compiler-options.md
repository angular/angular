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

| Modes       | Details                                                                                                                                                      |
| :---------- | :----------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `'full'`    | Generates fully AOT-compiled code. The compiler ABI (the internal runtime APIs used by this code) is stable across patch versions of the same minor version. |
| `'partial'` | Generates code in a stable, but intermediate form suitable for independently published libraries.                                                            |

The default value is `'full'`.

For most applications, `'full'` is the correct compilation mode.

Use `'partial'` for independently published libraries, such as NPM packages.
`'partial'` compilations output a stable, intermediate format which better supports usage by applications built at different major or minor Angular versions from the library.
Libraries built at "HEAD" alongside their applications and using the same version of Angular such as in a mono-repository can use `'full'` since there is no risk of version skew across minor versions. Note that the compiler ABI is stable across patch versions of the same minor, allowing for safe sharing of the Angular runtime in microfrontend architectures where different applications might be on different patch levels.

### `customElementsManifests`

A list of [Custom Elements Manifest](https://github.com/webcomponents/custom-elements-manifest) \(CEM\) files, such as `custom-elements.json`, that describe the custom elements used in templates.
Angular uses them to check custom element tags, properties, attributes, events, and local references.
The Angular Language Service uses them for completions and hover information.

Use manifests instead of `CUSTOM_ELEMENTS_SCHEMA`, which allows every tag that contains a dash and any property on it.

```json
{
  "angularCompilerOptions": {
    "strictTemplates": true,
    "customElementsManifests": ["@my/elements", "./custom-elements.json"]
  }
}
```

#### Manifest entries

Each entry is one of the following:

| Entry                            | Details                                                                                |
| :------------------------------- | :------------------------------------------------------------------------------------- |
| `'./custom-elements.json'`       | A file, relative to the project's `tsconfig.json`.                                     |
| `'@my/lib/custom-elements.json'` | A `.json` file in a package, resolved with the project's module resolution.            |
| `'@my/lib'`                      | A package whose `package.json` has a `customElements` field that points to a manifest. |

As with the `extends` field of `tsconfig.json`, only entries that start with `./`, `../`, or an absolute path are files.
Angular resolves any other entry as a module specifier, so write `./custom-elements.json`, not `custom-elements.json`.
When a module specifier does not resolve but a file at that path exists, the `NG4007` error suggests the `./` form.

Relative paths resolve against the directory of the `tsconfig.json` being compiled, including entries inherited through `extends`.
Angular does not rebase inherited `angularCompilerOptions` paths, and the `NG4007` error names the directory it used.

Angular supports manifest `schemaVersion` 1 and 2.
It validates only the records it uses for templates, not the whole file against the CEM JSON schema.
An unrecognized `schemaVersion` produces an `NG4014` warning, and Angular still reads the records it recognizes.

#### What Angular checks

For each element that a configured manifest declares:

- The tag is a known element, so it does not produce `NG8001`.
- Declared properties are known. Binding to an undeclared property or a `readonly` property produces `NG8002`.
- A declared attribute does not create a property. Set it as a static attribute or with `[attr.name]`.

With [strict template type checking](tools/cli/template-typecheck#strict-mode), Angular also checks types.
`strictTemplates` turns on each of these flags:

| Flag                     | What Angular checks                                                                                                     |
| :----------------------- | :---------------------------------------------------------------------------------------------------------------------- |
| `strictInputTypes`       | Property binding values, such as `[count]="value"`, against the property type.                                          |
| `strictAttributeTypes`   | Static attribute values, only when the attribute type is a union of string literals such as `'primary' \| 'secondary'`. |
| `strictDomEventTypes`    | The type of `$event`, from the event's declared `type`.                                                                 |
| `strictDomLocalRefTypes` | Local references, such as `#ref`, typed as the element's class. See [Local references](#local-references).              |

Angular checks a value only when the manifest provides a [supported type](#supported-types).
Without one, property bindings are still checked for the property name, `$event` has the native DOM event type, and static attribute values are not checked.

Static attributes are strings.
Because CEM does not define how attribute strings convert to numbers or booleans, Angular does not check static number or boolean attributes.
To check a number, bind the property: `[precision]="value"`.
Interpolation also produces a string, so `precision="{{ value }}"` is an error when `precision` is a number.
Values bound with `[attr.name]` are not checked against the manifest: `null` removes the attribute and other values become strings.

For events:

- When a manifest event has the same name as a native event, such as `click`, the manifest's type applies on that element.
- An Angular directive output with the same name takes precedence over the manifest.
- Targeted events, such as `(window:click)`, keep their native types.
- When the event type is not supported, `$event` uses the native DOM event type.
- With [`strictUnclaimedEventNames`](tools/cli/template-typecheck#troubleshooting-template-errors), Angular does not report events that a manifest declares, matched by exact name.

A two-way binding such as `[(count)]` checks the bound value against the `count` property.
Its `$event` uses the manifest type only when the manifest declares a `countChange` event.
Angular does not map other event names, such as `count-changed`, to properties, and the Language Service does not suggest two-way bindings for manifest properties.
When an event carries the new value, bind the property and the event separately: `[count]="count" (count-changed)="count = $event.detail"`.

#### Supported types

Angular checks values only when it can safely use the manifest's type text as a TypeScript type:

- Type text without names: primitive keywords, literal unions, object types with identifier keys, and arrays of these.
  For example, `boolean`, `'primary' | 'secondary'`, `{value: string}`, and `string[]`.
- Named types, when `type.references` locates every name in the text:
  - Include references to platform and TypeScript library types. For example, `CustomEvent<{value: string}>` needs a reference to `CustomEvent` with `package: "global:"`.
  - A reference to a name inside a larger type needs `start` and `end` offsets that cover exactly that name.
    A reference without offsets must name the whole type text.
  - A reference without `package` refers to the manifest's package, and a reference without `module` refers to the declaration's module.
    For a module in the manifest's own package, Angular resolves the path from the package root first, then from the manifest's directory.
  - `name` must be the exact exported name. Angular does not treat it as a default export or an alias.

Angular validates references against the package's TypeScript declarations.
When a reference does not resolve, for example because it names an unpublished source file, a missing or value-only export, or a package without types, Angular reports an `NG4011` warning.
Other type text, such as function types, qualified names like `Foo.Bar`, names without references, and malformed text, produces an `NG4013` warning.
CEM allows type text from other type systems, so `NG4013` does not always mean the manifest is invalid.
In both cases Angular falls back as described in [What Angular checks](#what-angular-checks), and these problems never produce template errors.

Angular does not replace rejected type text with a type from `.d.ts` files.
The Language Service still shows the declared type text in completions and hovers.

#### Local references

With `strictDomLocalRefTypes`, a local reference such as `#button` has the element's class type when:

- The manifest entry names a package, such as `'@my/lib'` or `'@my/lib/custom-elements.json'`. File entries have no package to import the class from.
- The class resolves to an exported declaration in the package's TypeScript declarations.

Otherwise the reference is an `HTMLElement`.
An unresolved class produces an `NG4011` warning, and a class that the manifest maps to more than one JavaScript export produces an `NG4013` warning.

When a class's typings do not declare that it extends `HTMLElement`, Angular types the reference as the class combined with `HTMLElement`, so native event checks such as `(click)` still work.
If the class's members conflict with `HTMLElement`, the reference is an `HTMLElement` and Angular reports an `NG4013` warning.

#### Language Service

The Angular Language Service suggests manifest tags, properties, attributes \(as static attributes and `[attr.name]` bindings\), and events.
For attributes whose type is a union of string literals, it also suggests values, even when `strictAttributeTypes` is off.
Completion details and hovers show the manifest's type text, default value, `description` or `summary`, and `deprecated` notice.

#### Using manifests with `CUSTOM_ELEMENTS_SCHEMA`

You can use both.
Manifest declarations take precedence for the tags they declare, so Angular reports misspelled properties and invalid values on those tags even when `CUSTOM_ELEMENTS_SCHEMA` is present.
`CUSTOM_ELEMENTS_SCHEMA` still allows other tags that contain a dash, so you can add manifests one library at a time.

IMPORTANT: Adding a manifest can report errors that `CUSTOM_ELEMENTS_SCHEMA` hid, such as misspelled properties and invalid values.
Fix the errors or remove the manifest entry.
Use `NO_ERRORS_SCHEMA` only when you intend to turn off all schema checks.

Manifests are used only by the AOT compiler.
Components compiled at runtime, including templates in Karma-based `TestBed` tests, templates set with `TestBed.overrideComponent`, and JIT-bootstrapped applications, still need `CUSTOM_ELEMENTS_SCHEMA` for custom elements.
The Angular Vitest builder compiles tests with AOT, so those tests use manifests.

#### Fixing a library's manifest

When a library's manifest is wrong or incomplete:

- To replace it, add a corrected copy to your project and configure that file instead of the package.
- To override some tags, list a manifest with corrected declarations before the package entry.
  The first declaration of a tag wins, and the library's later declarations produce an expected `NG4010` warning that names both entries.

A manifest in your project has no package, so its `type.references` need explicit `package` and `module` fields, or it can use type text without names.
To also type local references with the element class, publish the correction as a workspace package with a `customElements` field and configure the package name.

When the manifest names a declaration that it does not contain, such as one in another package, Angular still recognizes the tag but not its custom properties.
Bindings to them produce `NG8002`, and an `NG4013` warning reports the missing declaration.
Correct the manifest or configure a corrected copy.
`CUSTOM_ELEMENTS_SCHEMA` does not allow properties on tags that a manifest declares.

#### Generated code

Angular sets manifest properties by their exact names.
For example, `[readonly]` sets the element's `readonly` property instead of mapping it to the native `readOnly`.
This also applies to property interpolation translated with `i18n-*`.
Standard properties that the manifest does not declare keep Angular's usual mapping.

Directive host bindings are compiled without the component's manifests, so `host: {'[readonly]': 'value'}` still sets `readOnly`.
Bind the property in the component template when the exact name matters.

When a library compiled with `compilationMode: 'partial'` binds a manifest property that Angular would otherwise rename, such as `readonly`, applications that use the library need Angular 22.3.0 or later.

#### Limitations

- Angular does not follow `superclass` or `mixins`.
  The manifest must list inherited members on each element's declaration, as the [Custom Elements Manifest analyzer](https://custom-elements-manifest.open-wc.org/) does.
- Angular's security checks reject property bindings whose names start with `on` \(ignoring case\), such as `[onDark]`, even when the manifest declares them.
  Use the attribute instead, such as `ondark` or `[attr.ondark]`.
- Manifest diagnostics do not point to a line in the manifest file.

#### Diagnostics

| Code     | Category | Cause                                                                                                                                                                                                | Result                                                                        |
| :------- | :------- | :--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | :---------------------------------------------------------------------------- |
| `NG4007` | Error    | An entry does not resolve to a file, or the file cannot be read.                                                                                                                                     | Angular skips the entry and loads the others.                                 |
| `NG4008` | Error    | The file is not valid JSON, or is not an object with a string `schemaVersion` and a `modules` array.                                                                                                 | Angular skips the file and loads the others.                                  |
| `NG4009` | Warning  | A declaration's tag is not a valid custom element name, such as `marquee`.                                                                                                                           | Angular skips the declaration.                                                |
| `NG4010` | Warning  | Two declarations use the same tag, in one manifest or across manifests.                                                                                                                              | Angular keeps the first, as `customElements.define` does.                     |
| `NG4011` | Warning  | A type reference does not resolve against the project's TypeScript declarations.                                                                                                                     | Affected values are not type-checked, and local references use `HTMLElement`. |
| `NG4012` | Error    | `customElementsManifests` is not an array of non-empty strings, or `customElementsManifestsDiagnostics` is not `'summary'` or `'verbose'`.                                                           | An invalid `customElementsManifests` loads no manifests.                      |
| `NG4013` | Warning  | Type text that Angular cannot safely use, an ambiguous class export, or a `custom-element-definition` export whose declaration is not in the manifest.                                               | Angular keeps the declaration and skips the affected type checks.             |
| `NG4014` | Warning  | Inconsistent records, such as an unrecognized `schemaVersion`, a property whose `attribute` is not in `attributes`, an attribute whose `fieldName` is not a property, or a second tag for one class. | Angular keeps the other records and does not add missing ones.                |

By default, Angular combines warnings of the same kind for each manifest into one warning with a count and up to three examples.
To list each problem separately, set [`customElementsManifestsDiagnostics`](#customelementsmanifestsdiagnostics) to `'verbose'`.

In VS Code, the Angular Language Service reports manifest diagnostics on the project's `tsconfig.json` and updates them when a manifest changes, including unsaved edits.

#### Rebuilds

Manifests are inputs to every template.
When the build tool reports that a manifest changed, Angular reloads it and checks all templates again.
Whether a change inside `node_modules` triggers a rebuild depends on the build tool's file watching.

Validated types also depend on the declarations and global types they reference.
Each incremental build compares them with the previous build and checks all templates again when they differ.

### `customElementsManifestsDiagnostics`

Specifies how the compiler reports warnings about [Custom Elements Manifests](#customelementsmanifests).
When `'summary'`, the default, combines warnings of the same kind for each manifest into one warning with a count and up to three examples.
When `'verbose'`, reports each problem separately, for example while you fix a manifest.
Errors are always reported separately.

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

IMPORTANT: This option is only supported by the `@angular-devkit/build-angular:browser` builder.
When using the `@angular/build:application` builder (esbuild), this option has no effect and the new decimal message ID format is always used regardless of this setting.

### `enableResourceInlining`

When `true`, replaces the `templateUrl` and `styleUrls` properties in all `@Component` decorators with inline content in the `template` and `styles` properties.

When enabled, the `.js` output of `ngc` does not include any lazy-loaded template or style URLs.

For library projects created with the Angular CLI, the development configuration default is `true`.

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
Default is `true`.

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
