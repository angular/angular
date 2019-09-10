# Migration to Add Missing `@Injectable()` Decorators

## What does this schematic do?

This schematic adds an `@Injectable()` decorator to a class
if the class has been added as a provider anywhere in the application.

An example diff might look like the following:

**Before:**

```ts
export class TypeCase {...}
```

**After:**

```ts
@Injectable()
export class TypeCase {...}
```


There are a few cases where the decorator won't be added. For example:

  - It already has another decorator such as `@Component()`, `@Directive()` or `@Pipe()`. These decorators already cause the compiler to generate the necessary information.
  - The provider definition has `useValue`, `useFactory`, or `useExisting`. In
  these cases, the framework doesn't need the `@Injectable()` decorator to create the class because
  because it can just use the value,
  factory function, or existing instance that was provided.

  For example, for the following module definition, the schematic will check
  `TypeCase`, `ProvideCase`, `ExistingClass`, and `SomeClass` to ensure they
  are marked with the `@Injectable()` decorator and add one if not.


  ```ts
    @NgModule({
      providers: [
        // TypeCase needs @Injectable()
        TypeCase,
        // ProvideCase needs @Injectable()
        {provide: ProvideCase},
        // No @Injectable() needed because the value will be used
        {provide: ValueCase, useValue: 0},
        // No @Injectable() needed because factory will be used
        {provide: FactoryCase, useFactory: ()=> null},
        // ExistingClass needs @Injectable()
        {provide: ExistingToken, useExisting: ExistingClass},
        // SomeClass needs @Injectable()
        {provide: ClassToken, useClass: SomeClass},
        // No @Injectable() needed because it has a @Pipe() decorator
        PipeCase,

      ]
    })

  ```


## Why is this migration necessary?

In our docs, we've always recommended adding `@Injectable()`
decorators to any class that is provided or injected in your application.
However, older versions of Angular did allow injection of a class
without the decorator in certain cases, such as AOT mode.
This means if you accidentally omitted the decorator, your application
may have continued to work despite missing `@Injectable()` decorators in some places.
This is problematic for future versions of Angular. Eventually, we plan
to strictly require the decorator because doing so enables further
optimization of both the compiler and the runtime. This schematic
adds any `@Injectable()` decorators that may be missing to future-proof your app.



## When should I be adding `@Injectable()` decorators to classes?

Any class that is provided or injected somewhere must have an `@Injectable()` decorator. The decorator is necessary for the framework to properly create an instance of that class through DI.

However, as noted above, classes that already have another class decorator like `@Pipe` do not need both decorators. The existing class decorator will cause the compiler to generate the proper information.


## Should I update my library?

Yes, if your library has any tokens that are meant to be injected, they should be updated with the `@Injectable()` decorator.  In a future version of Angular, a missing `@Injectable()` decorator will always throw an error.

