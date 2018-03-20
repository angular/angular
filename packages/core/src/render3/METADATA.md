# Metadata storage in `.d.ts` files

Currently angular stores metadata in `.metadata.json` files. This is problematic for several reasons:
- Error prone (tools have to know how to work with them.)
- Metadata does not follow import/exports.
- Complicated to explain, maintain.
- Hard for 3rd party contributors to add value.

For Ivy we will be storing the metadata directly in `.d.ts` in the form of type information. This has several advantages:
- TypeScript does most of the work of resolution
- 3rd party developers already understand `.d.ts` as well as TypeScript type system.

The key information which Ivy needs is the selector information. That is what pipe, component or directive has to be inserted at which location. These selector maps are declared in `@NgModule` annotations. Therefore the goal is to store: selectors and `@NgModule` import/exports rules.

Let's assume that we have a file such as:
```javascript
@Pipe({ name: 'myPipe' })
export class MyPipe { }

@Component({ selector: `my-component` }) 
export class MyComponent { }


@Component({ selector: `[myDirective]` })
export class MyDirective { }

@NgModule({
  declarations: [MyDirective, MyPipe],
  exports: [MyDirective, MyPipe]
})
export class MyModule { }

@NgModule({
  declarations: [MyComponent],
  imports: [MyModule],
  exports: [MyComponent],
})
export class MyAppModule { }
```

Then we can encode the selector information into the types as shown in this `.d.ts` file:
```javascript
export class MyPipe {
  static ngPipeDef: PipeDef<{type: MyPipe, selector: 'myPipe'}>;
}

export class MyComponent {
  static ngComponentDef: ComponentDef<{type: MyComponent, selector: 'my-component'}>;
}

export class MyDirective {
  static ngDirectiveDef: DirectiveDef<{type: MyDirective, selector: '[myDirective]'}>;
}

export class MyModule {
  static ngInjectorDef: InjectorDef<MyAppModule>;
  static ngModule = {
    type: MyModule,
    imports: [],
    exports: [MyDirective, MyPipe]
  };
}

export class MyAppModule {
  static ngModule = {
    type: MyAppModule,
    imports: [MyModule],
    exports: [MyComponent]
  };
}
```

This means that `ngtsc` can extract selector information from `Program` by having TypeScript resolving the types and then doing walking the resolved AST. This would be equivalent to something like this in code:
```javascript
const MyComponent_selector /* inferred type: 'my-component' */ = getSelector(MyComponent);
const MyDirective_selector /* inferred type: '[myDirective]' */ = getSelector(MyDirective);
const MyPipe_selector /* inferred type: 'myPipe' */ = getSelector(MyPipe);

const MyModule_exports /* inferred type: typeof MyDirective | typeof MyPipe */ =
    getNgModuleExports(MyModule);
const MyAppModule_imports /* inferred type: typeof MyModule */ = getNgModuleImports(MyAppModule);
const MyAppModule_transitive_imports /* inferred type: typeof MyDirective | typeof MyPipe */ =
    getNgModuleExports(MyAppModule_imports);

declare function getNgModuleExports<T>(module: {ngModule: {exports: T[]}}): T;
declare function getNgModuleImports<T>(module: {ngModule: {imports: T[]}}): T;
declare function getSelector<T>(componentType: {
  ngComponentDef?: ComponentDef<{selector: T}>,
  ngDirectiveDef?: DirectiveDef<{selector: T}>,
  ngPipeDef?: PipeDef<{selector: T}>,
}): T;
````