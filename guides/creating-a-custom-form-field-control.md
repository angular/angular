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
  selector: 'my-tel-input',
  template: `
    <div [formGroup]="parts">
      <input class="area" formControlName="area" size="3">
      <span>&ndash;</span>
      <input class="exchange" formControlName="exchange" size="3">
      <span>&ndash;</span>
      <input class="subscriber" formControlName="subscriber" size="4">
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
    }
  `],
})
class MyTelInput {
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

### Providing our component as a MatFormFieldControl
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
class MyTelInput implements MatFormFieldControl<MyTel> {
  ...
}
```

This sets up our component so it can work with `<mat-form-field>`, but now we need to implement the
various methods and properties declared by the interface we just implemented. To learn more about
the `MatFormFieldControl` interface, see its
[definition](https://github.com/angular/material2/blob/master/src/lib/form-field/form-field-control.ts).
(Unfortunately generated API docs are not available yet, but we'll go through the methods and
properties in this guide.) 

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

@HostBinding() id = `my-tel-input-${MyTelInput.nextId++}`;
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
This property allows the form field control to specify the `@angular/forms` control that is bound to
this component. Since we haven't set up our component to act as a `ControlValueAccessor`, we'll just
set this to `null` in our component. In any real component, you would probably want to implement
`ControlValueAccessor` so that your component can work with `formControl` and `ngModel`.

```ts
ngControl = null;
```

If you did implement `ControlValueAccessor`, you could simply inject the `NgControl` and make it
publicly available. (For additional information about `ControlValueAccessor` see the
[API docs](https://angular.io/api/forms/ControlValueAccessor).)

```ts
constructor(..., @Optional() @Self() public ngControl: NgControl) { ... }
```

#### `focused`
This property indicates whether or not the form field control should be considered to be in a
focused state. When it is in a focused state, the form field is displayed with a solid color
underline. For the purposes of our component, we want to consider it focused if any of the part
inputs are focused. We can use the `FocusMonitor` from `@angular/cdk` to easily check this. We also
need to remember to emit on the `stateChanges` stream so change detection can happen.

```ts
focused = false;

constructor(fb: FormBuilder, private fm: FocusMonitor, private elRef: ElementRef,
            renderer: Renderer2) {
  ...
  fm.monitor(elRef.nativeElement, renderer, true).subscribe(origin => {
    this.focused = !!origin;
    this.stateChanges.next();
  });
}

ngOnDestroy() {
  ...
  this.fm.stopMonitoring(this.elRef.nativeElement);
}
```

#### `empty`
This property indicates whether the form field control is empty. For our control, we'll consider it
empty if all of the parts are empty.

```ts
get empty() {
  let n = this.parts.value;
  return !n.area && !n.exchange && !n.subscriber;
}
```

#### `shouldPlaceholderFloat`
This property is used to indicate whether the placeholder should be in the floating position. We'll
use the same logic as `matInput` and float the placeholder when the input is focused or non-empty.
Since the placeholder will be overlapping our control when when it's not floating, we should hide
the `–` characters when it's not floating.

```ts
@HostBinding('class.floating')
get shouldPlaceholderFloat() {
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
get disabled() {
  return this._disabled;
}
set disabled(dis) {
  this._disabled = coerceBooleanProperty(dis);
  this.stateChanges.next();
}
private _disabled = false;
```
```html
<input class="area" formControlName="area" size="3" [disabled]="disabled">
<span>&ndash;</span>
<input class="exchange" formControlName="exchange" size="3" [disabled]="disabled">
<span>&ndash;</span>
<input class="subscriber" formControlName="subscriber" size="4" [disabled]="disabled">
```

#### `errorState`
This property indicates whether the associated `NgControl` is in an error state. Since we're not
using an `NgControl` in this example, we don't need to do anything other than just set it to `false`.

```ts
errorState = false;
```

#### `controlType`
This property allows us to specify a unique string for the type of control in form field. The
`<mat-form-field>` will add an additional class based on this type that can be used to easily apply
special styles to a `<mat-form-field>` that contains a specific type of control. In this example
we'll use `my-tel-input` as our control type which will result in the form field adding the class
`mat-form-field-my-tel-input`.

```ts
controlType = 'my-tel-input';
```

#### `setAriaDescribedByIds(ids: string[])`
This method is used by the `<mat-form-field>` to specify the IDs that should be used for the
`aria-describedby` attribute of your component. The method has one parameter, the list of IDs, we
just need to apply the given IDs to our host element.

```ts
@HostBinding('attr.aria-describedby') describedBy = '';
  
setDescribedByIds(ids: string[]) {
  this.describedBy = ids.join(' ');
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
    this.elRef.nativeElement.querySelector('input').focus();
  }
}
```

### Trying it out
Now that we've fully implemented the interface, we're ready to try our component out! All we need to
do is place it inside of a `<mat-form-field>`

```html
<mat-form-field>
  <my-tel-input></my-tel-input>
</mat-form-field>
```

We also get all of the features that come with `<mat-form-field>` such as floating placeholder,
prefix, suffix, hints, and errors (if we've given the form field an `NgControl` and correctly report
the error state).

```html
<mat-form-field>
  <my-tel-input placeholder="Phone number" required></my-tel-input>
  <mat-icon matPrefix>phone</mat-icon>
  <mat-hint>Include area code</mat-hint>
</mat-form-field>
```
