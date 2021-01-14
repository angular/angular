@name Argument Not Literal
@category compiler
@shortDescription Decorator argument is not an object literal

@description
To make the metadata extraction in the Angular compiler faster, the decorators `@NgModule`, `@Pipe`, `@Component`, `@Directive`, and `@Injectable` accept only object literals as arguments.

This is an [intentional change in Ivy](https://github.com/angular/angular/issues/30840#issuecomment-498869540), which enforces stricter argument requirements for decorators than View Engine. Ivy requires this approach because it compiles decorators by moving the expressions into other locations in the class output.

@debugging
Move all declarations:

```typescript
const moduleDefinition = {...}

@NgModule(moduleDefinition)
export class AppModule {
    constructor() {}
}
```

into the decorator:

```typescript
@NgModule({...})
export class AppModule {
    constructor() {}
}
```
