The `text-field` package provides useful utilities for working with text input fields such as
`<input>` and `<textarea>`.

## Automatically resizing a `<textarea>`

The `cdkTextareaAutosize` directive can be applied to any `<textarea>` to make it automatically
resize to fit its content. The minimum and maximum number of rows to expand to can be set via the
`cdkAutosizeMinRows` and `cdkAutosizeMaxRows` properties respectively.

The resize logic can be triggered programmatically by calling `resizeToFitContent`. This method
takes an optional boolean parameter `force` that defaults to `false`. Passing true will force the
`<textarea>` to resize even if its text content has not changed, this can be useful if the styles
affecting the `<textarea>` have changed.

<!-- example(text-field-autosize-textarea) -->

## Monitoring the autofill state of an `<input>`

The `AutofillMonitor` is an injectable service that allows the user to monitor the autofill state of
an `<input>`. It has a `monitor` method that takes an element to monitor and returns an
`Observable` of autofill event objects with a `target` and `isAutofilled` property. The observable
emits every time the autofill state of the given `<input>` changes. Any element you monitor should
eventually be unmonitored by calling `stopMonitoring` with the same element.

<!-- example(text-field-autofill-monitor) -->

To simplify this process, there is also a `cdkAutofill` directive that automatically handles
monitoring and unmonitoring and doubles as an `@Output` binding that emits when the autofill state
changes.

<!-- example(text-field-autofill-directive) -->

Note: This service requires some CSS to install animation hooks when the autofill statechanges. If
you are using Angular Material, this CSS is included as part of the `mat-core` mixin. If you are not
using Angular Material, you should include this CSS with the `cdk-text-field` mixin.

```scss
@import '~@angular/cdk/text-field/text-field'; 

@include cdk-text-field();
```

## Styling the autofill state of an `<input>`

It can be difficult to override the browser default `background` and `color` properties on an
autofilled `<input>`. To make this simpler, the CDK includes a mixin `cdk-text-field-autofill-color`
which can be used to set these properties. It takes a `background` value as the first parameter and
an optional `color` value as the second parameter.

```scss
@import '~@angular/cdk/text-field/text-field'; 

// Set custom-autofill inputs to have no background and red text.
input.custom-autofill {
  @include cdk-text-field-autofill-color(transparent, red);
}
```
