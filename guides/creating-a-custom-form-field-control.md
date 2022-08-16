# Creating a custom form field control

It is possible to create custom form field controls that can be used inside `<mat-form-field>`. This
can be useful if you need to create a component that shares a lot of common behavior with a form
field, but adds some additional logic.

For example in this guide we'll learn how to create a custom input for inputting US telephone
numbers and hook it up to work with `<mat-form-field>`. Here is what we'll build by the end of this
guide:

<!-- example(form-field-custom-control) -->

In order to learn how to build custom form field controls, let's start with a simple input component
that we want to work inside the form field. For example, a phone number input that segments the
parts of the number into their own inputs. (Note: this is not intended to be a robust component,
just a starting point for us to learn.)

```ts
class MyTel {
  constructor(public area: string, public exchange: string, public subscriber: string) {}
}

@Component({
  selector: 'example-tel-input',
  template: `
    <div role="group" [formGroup]="parts">
      <input class="area" formControlName="area" maxlength="3">
      <span>&ndash;</span>
      <input class="exchange" formControlName="exchange" maxlength="3">
      <span>&ndash;</span>
      <input class="subscriber" formControlName="subscriber" maxlength="4">
    </div>
  `,
  styles: [`
    div {
      display: flex;
    }
    input {
      border: none;
      background: none;
      padding: 0;
      outline: none;
      font: inherit;
      text-align: center;
      color: currentColor;
    }
  `],
})
export class MyTelInput {
  parts: FormGroup;

  @Input()
  get value(): MyTel | null {
    let n = this.parts.value;
    if (n.area.length == 3 && n.exchange.length == 3 && n.subscriber.length == 4) {
      return new MyTel(n.area, n.exchange, n.subscriber);
    }
    return null;
  }
  set value(tel: MyTel | null) {
    tel = tel || new MyTel('', '', '');
    this.parts.setValue({area: tel.area, exchange: tel.exchange, subscriber: tel.subscriber});
  }

  constructor(fb: FormBuilder) {
    this.parts =  fb.group({
      'area': '',
      'exchange': '',
      'subscriber': '',
    });
  }
}
```

## Providing our component as a MatFormFieldControl

The first step is to provide our new component as an implementation of the `MatFormFieldControl`
interface that the `<mat-form-field>` knows how to work with. To do this, we will have our class
implement `MatFormFieldControl`. Since this is a generic interface, we'll need to include a type
parameter indicating the type of data our control will work with, in this case `MyTel`. We then add
a provider to our component so that the form field will be able to inject it as a
`MatFormFieldControl`.

```ts
@Component({
  ...
  providers: [{provide: MatFormFieldControl, useExisting: MyTelInput}],
})
export class MyTelInput implements MatFormFieldControl<MyTel> {
  ...
}
```

This sets up our component, so it can work with `<mat-form-field>`, but now we need to implement the
various methods and properties declared by the interface we just implemented. To learn more about
the `MatFormFieldControl` interface, see the
[form field API documentation](https://material.angular.io/components/form-field/api).

### Implementing the methods and properties of MatFormFieldControl

#### `value`

This property allows someone to set or get the value of our control. Its type should be the same
type we used for the type parameter when we implemented `MatFormFieldControl`. Since our component
already has a value property, we don't need to do anything for this one.

#### `stateChanges`

Because the `<mat-form-field>` uses the `OnPush` change detection strategy, we need to let it know
when something happens in the form field control that may require the form field to run change
detection. We do this via the `stateChanges` property. So far the only thing the form field needs to
know about is when the value changes. We'll need to emit on the stateChanges stream when that
happens, and as we continue flushing out these properties we'll likely find more places we need to
emit. We should also make sure to complete `stateChanges` when our component is destroyed.

```ts
stateChanges = new Subject<void>();

set value(tel: MyTel | null) {
  ...
  this.stateChanges.next();
}

ngOnDestroy() {
  this.stateChanges.complete();
}
```

#### `id`

This property should return the ID of an element in the component's template that we want the
`<mat-form-field>` to associate all of its labels and hints with. In this case, we'll use the host
element and just generate a unique ID for it.

```ts
static nextId = 0;

@HostBinding() id = `example-tel-input-${MyTelInput.nextId++}`;
```

#### `placeholder`

This property allows us to tell the `<mat-form-field>` what to use as a placeholder. In this
example, we'll do the same thing as `matInput` and `<mat-select>` and allow the user to specify it
via an `@Input()`. Since the value of the placeholder may change over time, we need to make sure to
trigger change detection in the parent form field by emitting on the `stateChanges` stream when the
placeholder changes.

```ts
@Input()
get placeholder() {
  return this._placeholder;
}
set placeholder(plh) {
  this._placeholder = plh;
  this.stateChanges.next();
}
private _placeholder: string;
```

#### `ngControl`

This property allows the form field control to specify the `@angular/forms` control that is bound
to this component. Since we haven't set up our component to act as a `ControlValueAccessor`, we'll
just set this to `null` in our component.

```ts
ngControl: NgControl = null;
```

It is likely you will want to implement `ControlValueAccessor` so that your component can work with
`formControl` and `ngModel`. If you do implement `ControlValueAccessor` you will need to get a
reference to the `NgControl` associated with your control and make it publicly available.

The easy way is to add it as a public property to your constructor and let dependency injection
handle it:

```ts
constructor(
  ...,
  @Optional() @Self() public ngControl: NgControl,
  ...,
) { }
```

Note that if your component implements `ControlValueAccessor`, it may already be set up to provide
`NG_VALUE_ACCESSOR` (in the `providers` part of the component's decorator, or possibly in a module
declaration). If so, you may get a *cannot instantiate cyclic dependency* error.

To resolve this, remove the `NG_VALUE_ACCESSOR` provider and instead set the value accessor directly:

```ts
@Component({
  ...,
  providers: [
    ...,
    // Remove this.
    // {
    //   provide: NG_VALUE_ACCESSOR,
    //   useExisting: forwardRef(() => MatFormFieldControl),
    //   multi: true,
    // },
  ],
})
export class MyTelInput implements MatFormFieldControl<MyTel>, ControlValueAccessor {
  constructor(
    ...,
    @Optional() @Self() public ngControl: NgControl,
    ...,
  ) {

    // Replace the provider from above with this.
    if (this.ngControl != null) {
      // Setting the value accessor directly (instead of using
      // the providers) to avoid running into a circular import.
      this.ngControl.valueAccessor = this;
    }
  }
}
```

For additional information about `ControlValueAccessor` see the [API docs](https://angular.io/api/forms/ControlValueAccessor).


#### `focused`

This property indicates whether the form field control should be considered to be in a
focused state. When it is in a focused state, the form field is displayed with a solid color
underline. For the purposes of our component, we want to consider it focused if any of the part
inputs are focused. We can use the `focusin` and `focusout` events to easily check this. We also
need to remember to emit on the `stateChanges` when the focused stated changes stream so change
detection can happen.

In addition to updating the focused state, we use the `focusin` and `focusout` methods to update the
internal touched state of our component, which we'll use to determine the error state.

```ts
focused = false;

onFocusIn(event: FocusEvent) {
  if (!this.focused) {
    this.focused = true;
    this.stateChanges.next();
  }
}

onFocusOut(event: FocusEvent) {
  if (!this._elementRef.nativeElement.contains(event.relatedTarget as Element)) {
    this.touched = true;
    this.focused = false;
    this.onTouched();
    this.stateChanges.next();
  }
}
```

#### `empty`

This property indicates whether the form field control is empty. For our control, we'll consider it
empty if all the parts are empty.

```ts
get empty() {
  let n = this.parts.value;
  return !n.area && !n.exchange && !n.subscriber;
}
```

#### `shouldLabelFloat`

This property is used to indicate whether the label should be in the floating position. We'll
use the same logic as `matInput` and float the placeholder when the input is focused or non-empty.
Since the placeholder will be overlapping our control when it's not floating, we should hide
the `–` characters when it's not floating.

```ts
@HostBinding('class.floating')
get shouldLabelFloat() {
  return this.focused || !this.empty;
}
```
```css
span {
  opacity: 0;
  transition: opacity 200ms;
}
:host.floating span {
  opacity: 1;
}
```

#### `required`

This property is used to indicate whether the input is required. `<mat-form-field>` uses this
information to add a required indicator to the placeholder. Again, we'll want to make sure we run
change detection if the required state changes.

```ts
@Input()
get required() {
  return this._required;
}
set required(req) {
  this._required = coerceBooleanProperty(req);
  this.stateChanges.next();
}
private _required = false;
```

#### `disabled`

This property tells the form field when it should be in the disabled state. In addition to reporting
the right state to the form field, we need to set the disabled state on the individual inputs that
make up our component.

```ts
@Input()
get disabled(): boolean { return this._disabled; }
set disabled(value: boolean) {
  this._disabled = coerceBooleanProperty(value);
  this._disabled ? this.parts.disable() : this.parts.enable();
  this.stateChanges.next();
}
private _disabled = false;
```

#### `errorState`

This property indicates whether the associated `NgControl` is in an error state. In this example,
we show an error if the input is invalid and our component has been touched.

```ts
get errorState(): boolean {
  return this.parts.invalid && this.touched;
}
```

#### `controlType`

This property allows us to specify a unique string for the type of control in form field. The
`<mat-form-field>` will add a class based on this type that can be used to easily apply
special styles to a `<mat-form-field>` that contains a specific type of control. In this example
we'll use `example-tel-input` as our control type which will result in the form field adding the
class `mat-form-field-type-example-tel-input`.

```ts
controlType = 'example-tel-input';
```

#### `setDescribedByIds(ids: string[])`

This method is used by the `<mat-form-field>` to set element ids that should be used for the
`aria-describedby` attribute of your control. The ids are controlled through the form field
as hints or errors are conditionally displayed and should be reflected in the control's
`aria-describedby` attribute for an improved accessibility experience. 

The `setDescribedByIds` method is invoked whenever the control's state changes. Custom controls
need to implement this method and update the `aria-describedby` attribute based on the specified
element ids. Below is an example that shows how this can be achieved.

Note that the method by default will not respect element ids that have been set manually on the
control element through the `aria-describedby` attribute. To ensure that your control does not
accidentally override existing element ids specified by consumers of your control, create an
input called `userAriaDescribedby`  like followed:

```ts
@Input('aria-describedby') userAriaDescribedBy: string;
```

The form field will then pick up the user specified `aria-describedby` ids and merge
them with ids for hints or errors whenever `setDescribedByIds` is invoked.

```ts
setDescribedByIds(ids: string[]) {
  const controlElement = this._elementRef.nativeElement
    .querySelector('.example-tel-input-container')!;
  controlElement.setAttribute('aria-describedby', ids.join(' '));
}
```

#### `onContainerClick(event: MouseEvent)`

This method will be called when the form field is clicked on. It allows your component to hook in
and handle that click however it wants. The method has one parameter, the `MouseEvent` for the
click. In our case we'll just focus the first `<input>` if the user isn't about to click an
`<input>` anyways.

```ts
onContainerClick(event: MouseEvent) {
  if ((event.target as Element).tagName.toLowerCase() != 'input') {
    this._elementRef.nativeElement.querySelector('input').focus();
  }
}
```

### Improving accessibility

Our custom form field control consists of multiple inputs that describe segments of a phone
number. For accessibility purposes, we put those inputs as part of a `div` element with
`role="group"`. This ensures that screen reader users can tell that all those inputs belong
together.

One significant piece of information is missing for screen reader users though. They won't be able
to tell what this input group represents. To improve this, we should add a label for the group
element using either `aria-label` or `aria-labelledby`.

It's recommended to link the group to the label that is displayed as part of the parent
`<mat-form-field>`. This ensures that explicitly specified labels (using `<mat-label>`) are
actually used for labelling the control.

In our concrete example, we add an attribute binding for `aria-labelledby` and bind it
to the label element id provided by the parent `<mat-form-field>`.

```typescript
export class MyTelInput implements MatFormFieldControl<MyTel> {
  ...

  constructor(...
              @Optional() public parentFormField: MatFormField) {
```

```html
@Component({
  selector: 'example-tel-input',
  template: `
    <div role="group" [formGroup]="parts"
         [attr.aria-describedby]="describedBy"
         [attr.aria-labelledby]="parentFormField?.getLabelId()">
```

### Trying it out

Now that we've fully implemented the interface, we're ready to try our component out! All we need to
do is place it inside a `<mat-form-field>`

```html
<mat-form-field>
  <example-tel-input></example-tel-input>
</mat-form-field>
```

We also get all the features that come with `<mat-form-field>` such as floating placeholder,
prefix, suffix, hints, and errors (if we've given the form field an `NgControl` and correctly report
the error state).

```html
<mat-form-field>
  <example-tel-input placeholder="Phone number" required></example-tel-input>
  <mat-icon matPrefix>phone</mat-icon>
  <mat-hint>Include area code</mat-hint>
</mat-form-field>
```
