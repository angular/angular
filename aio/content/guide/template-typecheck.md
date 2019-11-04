# Template type checking

## Overview of template type checking

Just as TypeScript catches type errors in your code, Angular checks the expressions and bindings within the templates of your application and can report any type errors it finds.
Angular currently has three modes of doing this, depending on the value of the `fullTemplateTypeCheck` and `strictTemplates` flags in the [TypeScript configuration file](guide/typescript-configuration), `tsconfig.json`.

### Basic mode

In the most basic type-checking mode, with the `fullTemplateTypeCheck` flag set to `false`, Angular validates only top-level expressions in a template.

If you write `<map [city]="user.address.city">`, the compiler verifies the following:

* `user` is a property on the component class.
* `user` is an object with an address property.
* `user.address` is an object with a city property.

The compiler does not verify that the value of `user.address.city` is assignable to the city input of the `<map>` component.

The compiler also has some major limitations in this mode:

* Importantly, it doesn't check embedded views, such as `*ngIf`, `*ngFor`, other `<ng-template>` embedded view.
* It doesn't figure out the types of `#refs`, the results of pipes, the type of `$event` in event bindings, and so on.

In many cases, these things end up as type `any`, which can cause subsequent parts of the expression to go unchecked.



### Full mode

If the `fullTemplateTypeCheck` flag is set to `true`, Angular is more aggressive in its type-checking within templates.
In particular:

* Embedded views (such as those within an `*ngIf` or `*ngFor`) are checked.
* Pipes have the correct return type.
* Local references to directives and pipes have the correct type (except for any generic parameters, which will be `any`).

The following still have type `any`.

* Local references to DOM elements.
* The `$event` object.
* Safe navigation expressions.

{@a strict-mode}

### Strict mode

Angular version 9 maintains the behavior of the `fullTemplateTypeCheck` flag, and introduces a third "strict mode".
Strict mode is accessed by setting both `fullTemplateTypeCheck` and the `strictTemplates` flag to `true`.
In strict mode, Angular version 9 adds checks that go beyond the version 8 type-checker.
Note that strict mode is only available if using Ivy.

In addition to the full mode behavior, Angular version 9:

* Verifies that component/directive bindings are assignable to their `@Input()`s.
* Obeys TypeScript's `strictNullChecks` flag when validating the above.
* Infers the correct type of components/directives, including generics.
* Infers template context types where configured (for example, allowing correct type-checking of `NgFor`).
* Infers the correct type of `$event` in component/directive, DOM, and animation event bindings.
* Infers the correct type of local references to DOM elements, based on the tag name (for example, the type that `document.createElement` would return for that tag).


## Checking of `*ngFor`

The three modes of type-checking treat embedded views differently. Consider the following example.


<code-example language="ts" header="User interface">

interface User {
  name: string;
  address: {
    city: string;
    state: string;
  }
}

</code-example>


```html
  <div *ngFor="let user of users">
    <h2>{{config.title}}</h2>
    <span>City: {{user.address.city}}</span>
  </div>
```

The `<h2>` and the `<span>` are in the `*ngFor` embedded view.
In basic mode, Angular doesn't check either of them.
However, in full mode, Angular checks that `config` and `user` exist and assumes a type of `any`.
In strict mode, Angular knows that the `user` in the `<span>` has a type of `User`, and that `address` is an object with a `city` property of type `string`.

{@a troubleshooting-template-errors}

## Troubleshooting template errors

When enabling the new strict mode in version 9, you might encounter template errors that didn't arise in either of the previous modes.
These errors often represent genuine type mismatches in the templates that were not caught by the previous tooling.
If this is the case, the error message should make it clear where in the template the problem occurs.

There can also be false positives when the typings of an Angular library are either incomplete or incorrect, or when the typings don't quite line up with expectations as in the following cases.

* When a library's typings are wrong or incomplete (for example, missing `null | undefined` if the library was not written with `strictNullChecks` in mind).
* When a library's input types are too narrow and the library hasn't added appropriate metadata for Angular to figure this out. This usually occurs with disabled or other common Boolean inputs used as attributes, for example, `<input disabled>`.
* When using `$event.target` for DOM events (because of the possibility of event bubbling, `$event.target` in the DOM typings doesn't have the type you might expect).

In case of a false positive like these, there are a few options:

* Use the [`$any()` type-cast function](guide/template-syntax#any-type-cast-function) in certain contexts to opt out of type-checking for a part of the expression.
* You can disable strict checks entirely by setting `strictTemplates: false` in the application's TypeScript configuration file, `tsconfig.json`.
* You can disable certain type-checking operations individually, while maintaining strictness in other aspects, by setting a _strictness flag_ to `false`.

|Strictness flag|Effect|
|-|-|
|`strictInputTypes`|Whether the assignability of a binding expression to the `@Input()` field is checked. Also affects the inference of directive generic types. |
|`strictNullInputTypes`|Whether `strictNullChecks` is honored when checking `@Input()` bindings (per `strictInputTypes`). Turning this off can be useful when using a library that was not built with `strictNullChecks` in mind.|
|`strictAttributeTypes`|Whether to check `@Input()` bindings that are made using text attributes (for example, `<mat-tab label="Step 1">` vs `<mat-tab [label]="'Step 1'">`).
|`strictSafeNavigationTypes`|Whether the return type of safe navigation operations (for example, `user?.name`) will be correctly inferred based on the type of `user`). If disabled, `user?.name` will be of type `any`.
|`strictDomLocalRefTypes`|Whether local references to DOM elements will have the correct type. If disabled `ref` will be of type `any` for `<input #ref>`.|
|`strictOutputEventTypes`|Whether `$event` will have the correct type for event bindings to component/directive an `@Output()`, or to animation events. If disabled, it will be `any`.|
|`strictDomEventTypes`|Whether `$event` will have the correct type for event bindings to DOM events. If disabled, it will be `any`.|


If you still have issues after troubleshooting with these flags, you can fall back to full mode by disabling `strictTemplates`.

If that doesn't work, an option of last resort is to turn off full mode entirely with `fullTemplateTypeCheck: false`, as we've made a special effort to make Angular version 9 backwards compatible in this case.

A type-checking error that you cannot resolve with any of the recommended methods can be the result of a bug in the template type-checker itself.
If you get errors that require falling back to basic mode, it is likely to be such a bug.
If this happens, please [file an issue](https://github.com/angular/angular/issues) so the team can address it.
