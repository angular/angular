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
version ranges in their dependencies. To support producing factories from
compiled source (already translated by TypeScript into JavaScript)
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
compiler that is not provided by the decorator, is serialized, discovered and
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
| `providers`         | `ngInjectableDef`     |
| `viewProviders`     | `ngInjectableDef`     |
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
this module has the advantage that there is no magic introduced by the
compiler as it treats classes annotated by `@Component` identically to those
produced manually.

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
Angular definitions identically. The allows flexibility not only in the future
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