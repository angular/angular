# Argument Not Literal

To make the metadata extraction in the Angular compiler faster, the decorators `@NgModule`, `@Pipe`, `@Component`, `@Directive`, and `@Injectable` accept only object literals as arguments.

This is an [intentional change in Ivy](https://github.com/angular/angular/issues/30840#issuecomment-498869540), which enforces stricter argument requirements for decorators than View Engine.
Ivy requires this approach because it compiles decorators by moving the expressions into other locations in the class output.

## Debugging the error

Move all declarations:

<docs-code language="typescript">

const moduleDefinition = {…}

@NgModule(moduleDefinition)
export class AppModule {
    constructor() {}
}

</docs-code>

into the decorator:

<docs-code language="typescript">

@NgModule({…})
export class AppModule {
    constructor() {}
}

</docs-code>
