# DESIGN DOC (Ivy): Separate Compilation

AUTHOR: chuckj@

## Background

### Angular 5

In 5.0 and prior versions of Angular the compiler performs whole program
analysis and generates template and injector definitions that are use
this global knowledge to flatten injector scope definitions, inline
directives into the component, pre-calculate queries, pre-calculate
content projection, etc. This global knowledge requires that module and
component factories are generated as a final global step when compiling
a module. If any of the transitive information changed then all factories
need to be regenerated.

Separate component and module compilation is supported only at the module
definition level and only from source. That is, npm packages must contain
the metadata necessary to generate the factories, they cannot contain,
themselves, the generated factories. This is because, if any of there
dependencies change, their factories would be invalid preventing them from
using version ranges in their dependencies. To support producing factories
from compiled source (already translated by TypeScript into JavaScript)
libraries include metadata that describe the content of the the Angular
decorators.

### Angular Ivy

In Ivy, the runtime is crafted in a way that allows for separate compilation
by preforming at runtime much of what was previously pre-calculated by
compiler. This allows the definition of components to change without
requiring modules and components that depend on them being recompiled.

The mental model of Ivy is that the decorator is the compiler. That is
the decorator can be thought of as parameters to a class transformer that
transforms the information in the decorator into the corresponding
definition. An `@Component` decorator transforms the class by adding
an `ngComponentDef` static variable, `@Directive` adds `ngDirectiveDef`,
`@Pipe` adds `ngPipeDef`, etc. In most cases values supplied to the
decorator is sufficient to generate the definition. However, in the case of
interpreting the template, the compiler needs to know the selector defined for
each component, directive and pipe that are in scope of the template. The
purpose of this document is to define what information is needed by the
compiler that is not provided by the decorator is serialized, discovered and
used.

## Information needed

The information available across compilations in Angular 5 is represented in
the  compiler by a summary description. For example, components and directive
are represented by the [`CompileDirectiveSummary`](https://github.com/angular/angular/blob/d3827a0017fd5ff5ac0f6de8a19692ce47bf91b4/packages/compiler/src/compile_metadata.ts#L257).
The following table shows where this information ends up in an ivy compiled
class:

### `CompileDirectiveSummary`

| field               | ivy                   |
|---------------------|-----------------------|
| `type`              | implicit              |
| `isComponent`       | `ngComponentDef`      |
| `selector`          | `ngModuleScope`       |
| `exportAs`          | `ngDirectiveDef`      |
| `inputs`            | `ngDirectiveDef`      |
| `outputs`           | `ngDirectiveDef`      |
| `hostListeners`     | `ngDirectiveDef`      |
| `hostProperties`    | `ngDirectiveDef`      |
| `hostAttributes`    | `ngDirectiveDef`      |
| `providers`         | `ngInjectorDef`       |
| `viewProviders`     | `ngComponentDef`      |
| `queries`           | `ngDirectiveDef`      |
| `guards`            | not used              |
| `viewQueries`       | `ngComponentDef`      |
| `entryComponents`   | not used              |
| `changeDetection`   | `ngComponentDef`      |
| `template`          | `ngComponentDef`      |
| `componentViewType` | not used              |
| `renderType`        | not used              |
| `componentFactory`  | not used              |

Only one definition is generated per class. All components are directives so a
`ngComponentDef` contains all the `ngDirectiveDef` information. All directives
are injectable so `ngComponentDef` and `ngDirectiveDef` contain `ngInjectableDef`
information.

For `CompilePipeSummary` the table looks like:

#### `CompilePipeSummary`

| field               | ivy                   |
|---------------------|-----------------------|
| `type`              | implicit              |
| `name`              | `ngModuleScope`       |
| `pure`              | `ngPipeDef`           |

The only pieces of information that are not generated into the definition are
the directive selector and the pipe name as they go into the module scope.

The information needed to build a `ngModuleScope` needs to be communicated
from the directive and pipe to the module that declares them.

## Metadata

### Angular 5

Angular 5 uses `.metadata.json` files to store information that is directly
inferred form the `.ts` files and include value information that is not
included in the `.d.ts` file produced by TypeScript. Because only exports for
types are included in `.d.ts` files and might not include the exports necessary
for values, the metadata includes export clauses from the `.ts` file.

When a module is flattened into a FESM (Flat EcmaScript Module), a flat
metadata file is also produced which is the metadata for all symbols exported
from the module index. The metadata represents what the `.metadata.json` file
would look like if all the symbols were declared in the index instead of
reexported from the index.

### Angular Ivy

The metadata for a class in ivy is transformed to be what the metadata of the
transformed .js file produced by the ivy compiler would be. For example, a
component's `@Component` is removed by the compiler and replaced by a `ngComponentDef`.
The `.metadata.json` file is similarly transformed but the content of the
value assigned is elided (e.g. `"ngComponentDef": {}`). The compiler doesn't
record the selector declared for a component but it is needed to produce the
`ngModuleScope` so the information is recorded as if a static field
`ngSelector` was declared on class with the value of the `selector` field
from the `@Component` or `@Directive` decorator.

The following transformations are performed:

#### `@Component`

The metadata for a component is transformed by:

1. Removing the `@Component` directive.
2. Add  `"ngComponentDef": {}` static field.
3. Add `"ngSelector": <selector-value>` static field.

##### Example

*my.component.ts*
```ts
@Component({
  selector: 'my-comp',
  template: `<h1>Hello, {{name}}!`
})
export class MyComponent {
  @Input() name: string;
}
```

*my.component.ts*
```js
export class MyComponent {
  name: string;
  static ngComponentDef = defineComponent({...});
}
```

*my.component.metadata.json*
```json
{
  "__symbolic": "module",
  "version": 4,
  "metadata": {
    "MyComponent": {
      "__symbolic": "class",
      "statics": {
        "ngComponentDef": {},
        "ngSelector": "my-comp"
      }
    }
  }
}
```

Note that this is exactly what is produced if the transform had been done
manually or by some other compiler before `ngc` compiler is invoked. That is
this model has the advantage that there is no magic introduced by the compiler
as it treats classes annotated by `@Component` identically to those produced
manually.

#### `@Directive`

The metadata for a directive is transformed by:

1. Removing the `@Directive` directive.
2. Add  `"ngDirectiveDef": {}` static field.
3. Add `"ngSelector": <selector-value>` static field.

##### example

*my.directive.ts*

```ts
@Directive({selector: '[my-dir]'})
export class MyDirective {
  @HostBinding('id') dirId = 'some id';
}
```

*my.directive.js*
```js
export class MyDirective {
  constructor() {
    this.dirId = 'some id';
  }
  static ngDirectiveDef = defineDirective({...});
}
```

*my.directive.metadata.json*
```json
{
  "__symbolic": "module",
  "version": 4,
  "metadata": {
    "MyDirective": {
      "__symbolic": "class",
      "statics": {
        "ngDirectiveDef": {},
        "ngSelector": "[my-dir]"
      }
    }
  }
}
```

#### `@Pipe`

The metadata for a pipe is transformed by:

1. Removing the `@Pipe` directive.
2. Add  `"ngPipeDef": {}` static field.
3. Add `"ngSelector": <name-value>` static field.

##### example

*my.pipe.ts*
```ts
@Pipe({name: 'myPipe'})
export class MyPipe implements PipeTransform {
  transform(...) ...
}
```

*my.pipe.js*
```js
export class MyPipe {
  transform(...) ...
  static ngPipeDef = definePipe({...});
  static ngSelector = 'myPipe';
}
```

*my.pipe.metadata.json*
```json
{
  "__symbolic": "module",
  "version": 4,
  "metadata": {
    "MyPipe": {
      "__symbolic": "class",
      "statics": {
        "ngPipeDef": {},
        "ngSelector": "myPipe"
      }
    }
  }
}
```

#### `@NgModule`

The metadata for a module is transformed by:

1. Remove the `@NgModule` directive.
2. Add  `"ngPipeDef": {}` static field.
3. Add `"ngModuleScope": <module-scope>` static field.

The scope value is an array the following type:

```ts
export type ModuleScope = ModuleScopeEntry[];

export interface ModuleDirectiveEntry {
  type: Type;
  selector: string;
}

export interface ModulePipeEntry {
  type: Type;
  name: string;
  isPipe: true;
}

export interface ModuleExportEntry {
  type: Type;
  isModule: true;
}

type ModuleScopeEntry = ModuleDirectiveEntry | ModulePipeEntry | ModuleExportEntry;
```

where the `type` values are generated as references.

##### example

*my.module.ts*
```ts
@NgModule({
  imports: [CommonModule, UtilityModule],
  declarations: [MyComponent, MyDirective, MyComponent],
  exports: [MyComponent, MyDirective, MyComponent, UtilityModule],
  providers: [{
    provide: Service, useClass: ServiceImpl
  }]
})
export class MyModule {}
```

*my.module.js*
```js
export class MyModule {
  static ngInjectorDef = defineInjector(...);
}
```

*my.module.metadata.json*
```json
{
  "__symbolic": "module",
  "version": 4,
  "metadata": {
    "MyModule": {
      "__symbolic": "class",
      "statics": {
        "ngInjectorDef": {},
        "ngModuleScope": [
          {
            "type": {
              "__symbolic": "reference",
              "module": "./my.component",
              "name": "MyComponent"
            },
            "selector": "my-comp"
          },
          {
            "type": {
              "__symbolic": "reference",
              "module": "./my.directive",
              "name": "MyDirective"
            },
            "selector": "[my-dir]"
          },
          {
            "type": {
              "__symbolic": "reference",
              "module": "./my.pipe",
              "name": "MyPipe"
            },
            "name": "myPipe",
            "isPipe": true
          },
          {
            "type": {
              "__symbolic": "reference",
              "module": "./utility.module",
              "name": "UtilityModule"
            },
            "isModule": true
          }
        ]
      }
    }
  }
}
```

Note that this is identical to what would have been generated if the this was
manually written as:

```ts
export class MyModule {
  static ngInjectorDef = defineInjector({
    providers: [{
      provide: Service, useClass: ServiceImpl
    }],
    imports: [CommonModule, UtilityModule]
  });
  static ngModuleScope = [{
    type: MyComponent,
    selector: 'my-comp'
  }, {
    type: MyDirective,
    selector: '[my-dir]'
  }, {
    type: MyPipe,
    name: 'myPipe'
  }, {
    type: UtilityModule,
    isModule: true
  }];
}
```

except for the call to `defineInjector` would generate a `{ __symbolic: 'error' }`
value which is ignored by the ivy compiler. This allows the system to ignore
the difference between manually and mechanically created module definitions.


## Manual Considerations

With this proposal, the compiler treats manually and mechanically generated
Angular definitions identically. This allows flexibility not only in the future
for how the declarations are mechanically produced it also allows alternative
mechanism to generate declarations be easily explored without altering the
compiler or dependent tool chain. It also allows third-party code generators
with possibly different component syntaxes to generate a component fully
understood by the compiler.

Unfortunately, however, manually generated module contain references to
classes that might not be necessary at runtime. Manually or third-party
components can get the same payload properties of an Angular generated
component by annotating the `ngSelector` and `ngModuleScope` properties with
`// @__BUILD_OPTIMIZER_REMOVE_` comment which will cause the build optimizer
to remove the declaration.

##### example

For example the above manually created module would have better payload
properties by including a `// @__BUILD_OPTIMIZER_REMOVE_` comment:

```ts
export class MyModule {
  static ngInjectorDef = defineInjector({
    providers: [{
      provide: Service, useClass: ServiceImpl
    }],
    imports: [CommonModule, UtilityModule]
  });

  // @__BUILD_OPTIMIZER_REMOVE_
  static ngModuleScope = [{
    type: MyComponent,
    selector: 'my-comp'
  }, {
    type: MyDirective,
    selector: '[my-dir]'
  }, {
    type: MyPipe,
    name: 'myPipe'
  }, {
    type: UtilityModule,
    isModule: true
  }];
}
```

## `ngc` output (non-Bazel)

The cases that `ngc` handle are producing an application and producing a
reusable library used in an application.

### Application output

The output of the ivy compiler only optionally generates the factories
generated by the Render2 style output of Angular 5.0. In Ivy, the information
that was generated in factories is now generated in Angular a definition that
is generated as a static field on the Angular decorated class.

Render2 requires that, when building the final application, all factories for
all libraries also be generated. In ivy, the definitions are generated when
the library is compiled.

The ivy compile can adapt Render2 target libraries by generating the factories
for them and back-patching, at runtime, the static method into the class.

#### Back-patching file (`"render2BackPatching"`)

When an application contains Render2 target libraries (libraries compiled with
Angular 5.0 or non-ivy 6.0), the ivy definitions need to be back-patch onto the
component, directive, module, pipe, and injectable classes.

If the Angular compiler option `"render2BackPatching"` is enabled, the compiler
will generate an `angular.back-patch` module generated to root output
directory of the project. If `"generateRender2Factories"` is `true` this
option, described below, is assumed to be `true`, if unspecified, and it is
and error for it to be `false`. `"render2BackPatching"` is ignored if `"enableIvy"`
is `false`.

`angular.back-patch` exports a function per `@NgModule` for the entire
application, including previously compiled libraries. The name of the function
is determined by name of the imported module with all non alphanumeric
character, including '`/`' and '`.`', replaced by '`_`'.

The back-patch functions will call the back-patch function of any module they
import. This means that only the application's module and lazy loaded modules
back-patching functions needs to be called. If using the Render2 module factory
instances, this is performed automatically when the first application module
instance is created.

#### Render2 Factories (`"generateRender2Factories"`)

`ngc` can generate an implementation of `NgModuleFactory` in the same location
that Angular 5.0 would generate it. This implementation of `NgModuleFactory`
will back-patch the Render2 style classes when the first module instance is
created by calling the correct back-patching function generated in the`angular.back-patch`
module.

Render2 style factories are created when the `"generateRender2Factories"`
Angular compiler option is `true`. Setting `"generateRender2Factories"` implies
`"render2BackPatching"` is also `true` and it is an error to explicitly set it
to `false`. `"generateRender2Factories"` is ignored if `"enableIvy"` is
`false`.

When this option is `true` a factory module is created with the same public API
at the same location as Angular 5.0 whenever Angular 5.0 would have generated a
factory.

### Recommended options

The recommended options for producing a ivy application are

| option                       | value    |             |
|------------------------------|----------|-------------|
| `"enableIvy"`                | `true`   | required    |
| `"generateRender2Factories"` | `true`   | implied     |
| `"render2BackPatching"`      | `true`   | implied     |
| `"generateCodeForLibraries"` | `true`   | default     |
| `"annotationsAs"`            | `remove` | implied     |
| `"enableLegacyTemplate"`     | `false`  | default     |
| `"preserveWhitespaces"`      | `false`  |             |
| `"skipMetadataEmit"`         | `true`   | default     |
| `"strictMetadataEmit"`       | `false`  | implied     |
| `"skipTemplateCodegen"`      |          | ignored     |

The options marked "implied" are implied by other options having the
recommended value and do not need to be explicitly set. Options marked
"default" also do not need to be set explicitly.

## Library output

Building an ivy library with `ngc` differs from Render2 in that the
declarations are included in the generated output and should be included in the
package published to `npm`. The `.metadata.json` files still need to be
included but they are transformed as described below.

### Transforming metadata

As described above, when the compiler adds the declaration to the class it will
also transform the `.metadata.json` file to reflect the new static fields added
to the class.

Once the static fields are added to the metadata, the ivy compiler no longer
needs the the information in the decorator. When `"enableIvy"` is `true` this
information is removed from the `.metadata.json` file.

### Recommended options

The recommended options for producing a ivy library are:

| option                       | value    |             |
|------------------------------|----------|-------------|
| `"enableIvy"`                | `true`   | required    |
| `"generateRender2Factories"` | `false`  |             |
| `"render2BackPatching"`      | `false`  | default     |
| `"generateCodeForLibraries"` | `false`  |             |
| `"annotationsAs"`            | `remove` | implied     |
| `"enableLegacyTemplate"`     | `false`  | default     |
| `"preserveWhitespaces"`      | `false`  |             |
| `"skipMetadataEmit"`         | `false`  |             |
| `"strictMetadataEmit"`       | `true `  |             |
| `"skipTemplateCodegen"`      |          | ignored     |

The options marked "implied" are implied by other options having the
recommended value and do not need to be explicitly set. Options marked
"default" also do not need to be set explicitly.

## Simplified options

The default Angular Compiler options default to, mostly, the recommended set of
options but the options necessary to set for specific targets are not clear and
mixing them can produce nonsensical results. The `"target"` option can be used
to simplify the setting of the compiler options to the recommended values
depending on the target:

| target            | option                       | value        |             |
|-------------------|------------------------------|--------------|-------------|
| `"application"`   | `"generateRender2Factories"` | `true`       | enforced    |
|                   | `"render2BackPatching"`      | `true`       | enforced    |
|                   | `"generateCodeForLibraries"` | `true`       |             |
|                   | `"annotationsAs"`            | `remove`     |             |
|                   | `"enableLegacyTemplate"`     | `false`      |             |
|                   | `"preserveWhitespaces"`      | `false`      |             |
|                   | `"skipMetadataEmit"`         | `false`      |             |
|                   | `"strictMetadataEmit"`       | `true`       |             |
|                   | `"skipTemplateCodegen"`      | `false`      |             |
|                   | `"fullTemplateTypeCheck"`    | `true`       |             |
|                   | `"enableLegacyTemplate"`     | `false`      |             |
|                   |                              |              |             |
| `"library"`       | `"generateRender2Factories"` | `false`      | enforced    |
|                   | `"render2BackPatching"`      | `false`      | enforced    |
|                   | `"generateCodeForLibraries"` | `false`      | enforced    |
|                   | `"annotationsAs"`            | `decorators` |             |
|                   | `"enableLegacyTemplate"`     | `false`      |             |
|                   | `"preserveWhitespaces"`      | `false`      |             |
|                   | `"skipMetadataEmit"`         | `false`      | enforced    |
|                   | `"strictMetadataEmit"`       | `true`       |             |
|                   | `"skipTemplateCodegen"`      | `false`      | enforced    |
|                   | `"fullTemplateTypeCheck"`    | `true`       |             |
|                   | `"enableLegacyTemplate"`     | `false`      |             |
|                   |                              |              |             |
| `"package"`       | `"flatModuleOutFile"`        |              | required    |
|                   | `"flatModuleId"`             |              | required    |
|                   | `"enableIvy"`                | `false`      | enforced    |
|                   | `"generateRender2Factories"` | `false`      | enforced    |
|                   | `"render2BackPatching"`      | `false`      | enforced    |
|                   | `"generateCodeForLibraries"` | `false`      | enforced    |
|                   | `"annotationsAs"`            | `remove`     |             |
|                   | `"enableLegacyTemplate"`     | `false`      |             |
|                   | `"preserveWhitespaces"`      | `false`      |             |
|                   | `"skipMetadataEmit"`         | `false`      | enforced    |
|                   | `"strictMetadataEmit"`       | `true`       |             |
|                   | `"skipTemplateCodegen"`      | `false`      | enforced    |
|                   | `"fullTemplateTypeCheck"`    | `true`       |             |
|                   | `"enableLegacyTemplate"`     | `false`      |             |

Options that are marked "enforced" are reported as an error if they are
explicitly set to a value different from what is specified here. The options
marked "required" are required to be set and an error message is displayed if
no value is supplied but no default is provided.

The purpose of the "application" target is for the options used when the `ngc`
invocation contains the root application module. Lazy loaded modules should
also be considered "application" targets.

The purpose of the "library" target is for are all `ngc` invocations that do
not contain the root application module or a lazy loaded module.

The purpose of the "package" target is to produce a library package that will
be an entry point for an npm package. Each entry point should be separately
compiled using a "package" target. Note that this makes explicit the limitation
that a module from a package cannot be directly lazily loaded. It must be
imported into a module compiled as an "application" target and then that
module can be lazily loaded.

##### example - application

To produce a Render2 application the options would look like,

```json
{
  "compileOptions": {
    ...
  },
  "angularCompilerOptions": {
    "target": "application"
  }
}
```

alternately, since the recommended `"application"` options are the default
values, the `"angularCompilerOptions"` can be out.

##### example - library

To produce a Render2 library the options would look like,

```json
{
  "compileOptions": {
    ...
  },
  "angularCompilerOptions": {
    "target": "library"
  }
}
```

##### example - package

To produce a Render2 package the options would look like,

```json
{
  "compileOptions": {
    ...
  },
  "angularCompilerOptions": {
    "target": "package"
  }
}
```

##### example - ivy application

To produce an ivy application the options would look like,

```json
{
  "compileOptions": {
    ...
  },
  "angularCompilerOptions": {
    "target": "application",
    "enableIvy": true
  }
}
```

##### example - ivy library

To produce an ivy application the options would look like,

```json
{
  "compileOptions": {
    ...
  },
  "angularCompilerOptions": {
    "target": "library",
    "enableIvy": true
  }
}
```

##### example - ivy package

Ivy packages are not supported in Angular 6.0 as they are not recommended as
in npm packages as they would only be usable if in ivy application where an
ivy application supports Render2 libraries so npm packages should all be
Render2 libraries.

## `ng_module` output (Bazel)

The `ng_module` rule describes the source necessary to produce a Angular
library that is reusable and composable into an application.

### Angular 5.0

The `ng_module` rule invokes `ngc`[<sup>1<sup>](#ngc_wrapped) to produce
the Angular output. However, `ng_module` uses a feature, the `.ngsummary.json`
file, not normally used and is often difficult to configure correctly.

The `.ngsummary.json` describes all the information that is necessary for
the compiler to use a generated factory. It is produced by actions defined
in the `ng_module` rule and is consumed by actions defined by `ng_module`
rules that depend on other `ng_module` rules.

### Angular Ivy

The `ng_module` rule will still use `ngc` to produce the Angular output but,
when producing ivy output, it no longer will need the `.ngsummary.json` file.

#### `ivy_sources`

The `ivy_sources` can be used as use to cause the ivy versions of files to be
generated and is intended to be the direct dependency of an `ts_library` rule
that contains the application bootstrap code. In the case of an ivy
application, it contains call to the application module back-patch function
and the `renderComponent()` of the application component. Alternately, it can
import the root module's module factory and call the Render2 bootstrap.

The bootstrap `ts_library` is then the dependencies of the `ts_dev_sources`
rule.

#### `ng_module` ivy output

The `ng_module` is able to provide the ivy version of the `.js` files which
will be generated with as `.ivy.js` for the development sources and `.ivy.closure.js`
for the production sources.

The `ng_module` rule will also generate a `angular.back_patch.js` and `.closure.js`
files and a `module_scope.json` file. The type of the `module_scope.json` file will
be:

```ts
interface ModuleScopeSummary {
  [moduleName: string]: ModuleScopeEntry[];
}
```

where `moduleName` is the name of the as it would appear in an import statement
in a `.ts` file at the same relative location in the source tree. All the
references in this file are also relative this location.

<a name="myfootnote1"><sup>1</sup></a> More correctly, it calls `performCompilation`
from the `@angular/compiler-cli` which is what `ngc` does too.
