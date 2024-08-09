# Possible reasons why an `@Input` is not migrated

The signal input migration may skip migration of `@Input()` declarations if the automated refactoring isn't possible or safe.
This document explains some of the reasons, or better known "migration incompatibilities".

### `REASON:Accessor`
The input is declared using a getter/setter.
This is non-trivial to migrate without knowing the intent.

### `REASON:WriteAssignment`
Parts of your application write to this input class field.
This blocks the automated migration because signal inputs cannot be modified programmatically.

### `REASON:OverriddenByDerivedClass`
The input is part of a class that is extended by another class which overrides the field.
Migrating the input would then cause type conflicts and break the application build.

```ts
@Component()
class MyComp {
  @Input() myInput = true;
}

class Derived extends MyComp {
  override myInput = false; // <-- this wouldn't be a signal input and break!
}
```

### `REASON:RedeclaredViaDerivedClassInputsArray`
The input is part of a class that is extended by another class which overrides the field via the `inputs` array of `@Component` or `@Directive`.
Migrating the input would cause a mismatch because fields declared via `inputs` cannot be signal inputs.

```ts
@Component()
class MyComp {
  @Input() myInput = true;
}

@Component({
  inputs: ['myInput: aliasedName']
})
class Derived extends MyComp {}
```

### `REASON:TypeConflictWithBaseClass`
The input is overriding a field from a superclass, but the superclass field is not an Angular `@Input` and is not migrated.
This results in a type conflict and would break the build.

```ts
interface Parent {
  disabled: boolean;
}

@Component()
class MyComp implements Parent {
  @Input() disabled = true;
}
```

### `REASON:ParentIsIncompatible`
The input is overriding a field from a superclass, but the superclass field could not be migrated.
This means that migrating the input would break the build.

### `REASON:SpyOnThatOverwritesField`
The input can be migrated, but a Jasmine `spyOn` call for the input field was discovered.
`spyOn` calls are incompatible with signal inputs because they attempt to override the value of the field.
Signal inputs cannot be changed programmatically though— so this breaks.

### `REASON:PotentiallyNarrowedInTemplateButNoSupportYet`
The input is part of an `@if` or `*ngIf`, or template input in general.
This indicates that the input value type may be narrowed.

The migration skips migrating such inputs because support for narrowed signals is not available yet.

### `REASON:RequiredInputButNoGoodExplicitTypeExtractable`
The input is required, but cannot be safely migrated because no good type could be detected.

A required input with initial value doesn't make sense.
The type is inferred with `@Input` via the initial value, but this isn't possible with `input.required<T>`.

```ts
class MyComp {
  @Input({required: true}) bla = someComplexInitialValue();
}
```
