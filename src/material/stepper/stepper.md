Angular Material's stepper provides a wizard-like workflow by dividing content into logical steps.

Material stepper builds on the foundation of the CDK stepper that is responsible for the logic
that drives a stepped workflow. Material stepper extends the CDK stepper and has Material Design
styling.

### Stepper variants
There are two stepper variants: `horizontal` and `vertical`. You can switch between the two using
the `orientation` attribute.

<!-- example(stepper-overview) -->

<!-- example(stepper-vertical) -->

### Labels
If a step's label is only text, then the `label` attribute can be used.
<!-- example({"example": "stepper-overview",
              "file": "stepper-overview-example.html",
              "region": "label"}) -->

For more complex labels, add a template with the `matStepLabel` directive inside the
`mat-step`.
<!-- example({"example": "stepper-editable",
              "file": "stepper-editable-example.html",
              "region": "step-label"}) -->

#### Label position
For a horizontal `mat-stepper` it's possible to define the position of the label. `end` is the
default value, while `bottom` will place it under the step icon instead of at its side.
This behaviour is controlled by `labelPosition` property.

<!-- example({"example": "stepper-label-position-bottom",
              "file": "stepper-label-position-bottom-example.html",
              "region": "label-position"}) -->

#### Header position
If you're using a horizontal stepper, you can control where the stepper's content is positioned
using the `headerPosition` input. By default it's on top of the content, but it can also be placed
under it.

<!-- example(stepper-header-position) -->

### Stepper buttons
There are two button directives to support navigation between different steps:
`matStepperPrevious` and `matStepperNext`.
<!-- example({"example": "stepper-label-position-bottom",
              "file": "stepper-label-position-bottom-example.html",
              "region": "buttons"}) -->

### Linear stepper
The `linear` attribute can be set on `mat-stepper` to create a linear stepper that requires the
user to complete previous steps before proceeding to following steps. For each `mat-step`, the
`stepControl` attribute can be set to the top level `AbstractControl` that is used to check the
validity of the step.

There are two possible approaches. One is using a single form for stepper, and the other is
using a different form for each step.

Alternatively, if you don't want to use the Angular forms, you can pass in the `completed` property
to each of the steps which won't allow the user to continue until it becomes `true`. Note that if
both `completed` and `stepControl` are set, the `stepControl` will take precedence.

#### Using a single form
When using a single form for the stepper, `matStepperPrevious` and `matStepperNext` have to be
set to `type="button"` in order to prevent submission of the form before all steps
are completed.

```html
<form [formGroup]="formGroup">
  <mat-stepper formArrayName="formArray" linear>
    <mat-step formGroupName="0" [stepControl]="formArray.get([0])">
      ...
      <div>
        <button mat-button matStepperNext type="button">Next</button>
      </div>
    </mat-step>
    <mat-step formGroupName="1" [stepControl]="formArray.get([1])">
      ...
      <div>
        <button mat-button matStepperPrevious type="button">Back</button>
        <button mat-button matStepperNext type="button">Next</button>
      </div>
    </mat-step>
    ...
  </mat-stepper>
</form>
```

#### Using a different form for each step
```html
<mat-stepper orientation="vertical" linear>
  <mat-step [stepControl]="formGroup1">
    <form [formGroup]="formGroup1">
      ...
    </form>
  </mat-step>
  <mat-step [stepControl]="formGroup2">
    <form [formGroup]="formGroup2">
      ...
    </form>
  </mat-step>
</mat-stepper>
```
### Types of steps

#### Optional step
If completion of a step in linear stepper is not required, then the `optional` attribute can be set
on `mat-step`.

<!-- example({"example": "stepper-optional",
              "file": "stepper-optional-example.html",
              "region": "optional"}) -->


#### Editable step
By default, steps are editable, which means users can return to previously completed steps and
edit their responses. `editable="false"` can be set on `mat-step` to change the default.

<!-- example({"example": "stepper-editable",
              "file": "stepper-editable-example.html",
              "region": "editable"}) -->

#### Completed step
By default, the `completed` attribute of a step returns `true` if the step is valid (in case of
linear stepper) and the user has interacted with the step. The user, however, can also override
this default `completed` behavior by setting the `completed` attribute as needed.

#### Overriding icons
By default, the step headers will use the `create` and `done` icons from the Material design icon
set via `<mat-icon>` elements. If you want to provide a different set of icons, you can do so
by placing a `matStepperIcon` for each of the icons that you want to override. The `index`,
`active`, and `optional` values of the individual steps are available through template variables:

<!-- example({"example": "stepper-states",
              "file": "stepper-states-example.html",
              "region": "override-icons"}) -->

Note that you aren't limited to using the `mat-icon` component when providing custom icons.

### Controlling the stepper animation
You can control the duration of the stepper's animation using the `animationDuration` input. If you
want to disable the animation completely, you can do so by setting the properties to `0ms`.

<!-- example(stepper-animations) -->

#### Step States
You can set the state of a step to whatever you want. The given state by default maps to an icon.
However, it can be overridden the same way as mentioned above.

<!-- example({"example": "stepper-states",
              "file": "stepper-states-example.html",
              "region": "states"}) -->

In order to use the custom step states, you must add the `displayDefaultIndicatorType` option to
the global default stepper options which can be specified by providing a value for
`STEPPER_GLOBAL_OPTIONS` in your application's root module.

```ts
@NgModule({
  providers: [
    {
      provide: STEPPER_GLOBAL_OPTIONS,
      useValue: { displayDefaultIndicatorType: false }
    }
  ]
})
```

<!-- example(stepper-states) -->

### Error State

If you want to show an error when the user moved past a step that hasn't been filled out correctly,
you can set the error message through the `errorMessage` input and configure the stepper to show
errors via the `showError` option in the `STEPPER_GLOBAL_OPTIONS` injection token. Note that since
`linear` steppers prevent a user from advancing past an invalid step to begin with, this setting
will not affect steppers marked as `linear`.

```ts
@NgModule({
  providers: [
    {
      provide: STEPPER_GLOBAL_OPTIONS,
      useValue: { showError: true }
    }
  ]
})
```

<!-- example(stepper-errors) -->

### Lazy rendering
By default, the stepper will render all of it's content when it's initialized. If you have some
content that you want to defer until the particular step is opened, you can put it inside
an `ng-template` with the `matStepContent` attribute.

<!-- example(stepper-lazy-content) -->

### Responsive stepper
If your app supports a wide variety of screens and a stepper's layout doesn't fit a particular
screen size, you can control its `orientation` dynamically to change the layout based on the
viewport.

<!-- example(stepper-responsive) -->

### Keyboard interaction
| Keyboard shortcut      | Action                          |
|------------------------|---------------------------------|
| <kbd>Left Arrow</kbd>  | Focus the previous step header. |
| <kbd>Right Arrow</kbd> | Focus the next step header.     |
| <kbd>Enter</kbd>       | Select the focused step.        |
| <kbd>Space</kbd>       | Select the focused step.        |

### Localizing labels
Labels used by the stepper are provided through `MatStepperIntl`. Localization of these messages
can be done by providing a subclass with translated values in your application root module.

```ts
@NgModule({
  imports: [MatStepperModule],
  providers: [
    {provide: MatStepperIntl, useClass: MyIntl},
  ],
})
export class MyApp {}
```

<!-- example(stepper-intl) -->

### Accessibility
The stepper is treated as a tabbed view for accessibility purposes, so it is given
`role="tablist"` by default. The header of step that can be clicked to select the step
is given `role="tab"`, and the content that can be expanded upon selection is given
`role="tabpanel"`. `aria-selected` attribute of step header is automatically set based on
step selection change.

The stepper and each step should be given a meaningful label via `aria-label` or `aria-labelledby`.

Prefer vertical steppers when building for small screen sizes, as horizontal
steppers typically take up significantly more horizontal space thus introduce
horizontal scrolling. Applications with multiple scrolling dimensions make
content harder to consume for some users. See the [Responsive Stepper section](#responsive-stepper)
above for an example on building a stepper that adjusts its layout based on
viewport size.

#### Forms
Steppers often contain forms and form controls. If validation errors inside of a
stepper's form prevents moving to another step, make sure that your form
controls communicate error messages to assistive technology. This helps the user
know why they can't advance to another step. You can accomplish this by using
`<mat-error>` with `<mat-form-field>`, or by using an ARIA live region.

When a step contains a forms validation error, `MatStepper` will display the
error in the step's header if specified. See the [Error State section](#error-state)
for an example of a stepper with an error message. For non-linear steppers, you
should use an ARIA live region to announce error messages when users navigate
away from a step with an error message.
