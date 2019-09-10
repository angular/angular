# Undecorated directives (field decorators)

<!-- Removing ngBaseDef by migrating classes -->

## What does this schematic do?

This schematic finds classes that have member decorators (like @Input())
but don't have a class decorator (like `@Directive()`) and adds a `@Directive()`
class decorator.

Angular field decorators include:
- `@Input()`
- `@Output()`
- `@HostBinding()`
- `@HostListener()`
- `@ViewChild()` / `@ViewChildren()`
- `@ContentChild()` / `@ContentChildren()`

It does not include parameter decorators for dependency injection, such as `@Host()`, `@SkipSelf()`, `@Optional()`, and `@Self()`.


**Before:**
```ts
class Base {
  @Output()
  countChanged = new EventEmitter<number>();
}

@Directive({
  selector: '[myDir]'
})
class Dir extends Base {
}
```

**After:**
```ts
@Directive() // schematic adds @Directive()
class Base {
  @Output()
  total: number;
}

@Directive()
class Dir extends Base {
}
```

## Why is this migration necessary?

In Ivy, undecorated base classes require `@Directive()` to compile.

In View Engine JIT and AOT, undecorated base classes, which
have decorated fields such as`@Input()` or `@ViewChild()`, work.
For example:

```ts
class Base {
  @Input()
  foo: string;
}

@Directive()
class Dir extends Base {
  ngOnChanges(): void {
    // notified when bindings to [foo] are updated
  }
}
```

However, in Ivy this model won't compile as there is no
decorator on `Base` which would generate an Ivy definition
to carry the information about inputs, outputs, queries, or
host bindings. Ivy always requires a `@Directive()`
or `@Component()` selector for any class using Angular features.

There were two motivations for extending the requirement for a `@Directive()` decorator to include field decorators:

1. The former distinction was arbitrary. Why does Dependency Injection (DI) require a decorator but other Angular features don't? It's hard to remember which is which. It's easier to just say "If you use any Angular feature, (whether it's a field decorator or DI), you must have a class decorator"
1. This change allows us to reduce the size of the framework code. Making Angular features work in undecorated base classes was complicated and expensive, code-wise. If we ask users to add the required decorators, the framework can be smaller for everyone.

## When should I add a `@Directive()` decorator without a selector?

You can use a `@Directive()` decorator without a selector on
a class that will only ever act as a base class for inheritance.
Additionally, the decorator is only necessary
when this base class would use either dependency injection or an Angular member
decorator such as `@Input()`.

## What does this mean for libraries?

To support Angular version 8, you should use a `@Directive()`
decorator with metadata or move the Angular-specific features
to subclasses.

## What about applications using non-migrated libraries?

In this case, `ngcc` manages running the application.

Note that the migration never adds a definition in the schematic,
it only adds the `@Directive()` selector.
