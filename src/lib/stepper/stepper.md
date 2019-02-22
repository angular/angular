Angular Material's stepper provides a wizard-like workflow by dividing content into logical steps.

<!-- example(stepper-overview) -->

Material stepper builds on the foundation of the CDK stepper that is responsible for the logic
that drives a stepped workflow. Material stepper extends the CDK stepper and has Material Design
styling.

### Stepper variants
There are two stepper components: `mat-horizontal-stepper` and `mat-vertical-stepper`. They
can be used the same way. The only difference is the orientation of stepper.

<!-- example(stepper-vertical) -->

`mat-horizontal-stepper` selector can be used to create a horizontal stepper, and
`mat-vertical-stepper` can be used to create a vertical stepper. `mat-step` components need to be
placed inside either one of the two stepper components.

### Labels
If a step's label is only text, then the `label` attribute can be used.
```html
<mat-vertical-stepper>
  <mat-step label="Step 1">
    Content 1
  </mat-step>
  <mat-step label="Step 1">
    Content 2
  </mat-step>
</mat-vertical-stepper>
```

For more complex labels, add a template with the `matStepLabel` directive inside the
`mat-step`.
```html
<mat-vertical-stepper>
  <mat-step>
    <ng-template matStepLabel>...</ng-template>
    ...
  </mat-step>
</mat-vertical-stepper>
```

#### Label position
For `mat-horizontal-stepper` it's possible to define the position of the label. `end` is the
default value, while `bottom` will place it under the step icon instead of at its side.
This behaviour is controlled by `labelPosition` property.

<!-- example(stepper-label-position-bottom) -->

### Stepper buttons
There are two button directives to support navigation between different steps:
`matStepperPrevious` and `matStepperNext`.
```html
<mat-horizontal-stepper>
  <mat-step>
    ...
    <div>
      <button mat-button matStepperPrevious>Back</button>
      <button mat-button matStepperNext>Next</button>
    </div>
  </mat-step>
</mat-horizontal-stepper>
```

### Linear stepper
The `linear` attribute can be set on `mat-horizontal-stepper` and `mat-vertical-stepper` to create
a linear stepper that requires the user to complete previous steps before proceeding to following
steps. For each `mat-step`, the `stepControl` attribute can be set to the top level
`AbstractControl` that is used to check the validity of the step.

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
  <mat-horizontal-stepper formArrayName="formArray" linear>
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
  </mat-horizontal-stepper>
</form>
```

#### Using a different form for each step
```html
<mat-vertical-stepper linear>
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
</mat-vertical-stepper>
```
### Types of steps

#### Optional step
If completion of a step in linear stepper is not required, then the `optional` attribute can be set
on `mat-step`.

<!-- example(stepper-optional) -->


#### Editable step
By default, steps are editable, which means users can return to previously completed steps and
edit their responses. `editable="false"` can be set on `mat-step` to change the default.

<!-- example(stepper-editable) -->

#### Completed step
By default, the `completed` attribute of a step returns `true` if the step is valid (in case of
linear stepper) and the user has interacted with the step. The user, however, can also override
this default `completed` behavior by setting the `completed` attribute as needed.

#### Overriding icons
By default, the step headers will use the `create` and `done` icons from the Material design icon
set via `<mat-icon>` elements. If you want to provide a different set of icons, you can do so
by placing a `matStepperIcon` for each of the icons that you want to override. The `index`,
`active`, and `optional` values of the individual steps are available through template variables:

```html
<mat-vertical-stepper>
  <ng-template matStepperIcon="edit">
    <mat-icon>insert_drive_file</mat-icon>
  </ng-template>

  <ng-template matStepperIcon="done">
    <mat-icon>done_all</mat-icon>
  </ng-template>

  <!-- Custom icon with a context variable. -->
  <ng-template matStepperIcon="number" let-index="index">
    {{index + 10}}
  </ng-template>

  <!-- Stepper steps go here -->
</mat-vertical-stepper>
```

Note that you aren't limited to using the `mat-icon` component when providing custom icons.

#### Step States
You can set the state of a step to whatever you want. The given state by default maps to an icon.
However, it can be overridden the same way as mentioned above.

```html
<mat-horizontal-stepper>
  <mat-step label="Step 1" state="phone">
    <p>Put down your phones.</p>
    <div>
      <button mat-button matStepperNext>Next</button>
    </div>
  </mat-step>
  <mat-step label="Step 2" state="chat">
    <p>Socialize with each other.</p>
    <div>
      <button mat-button matStepperPrevious>Back</button>
      <button mat-button matStepperNext>Next</button>
    </div>
  </mat-step>
  <mat-step label="Step 3">
    <p>You're welcome.</p>
  </mat-step>

  <!-- Icon overrides. -->
  <ng-template matStepperIcon="phone">
    <mat-icon>call_end</mat-icon>
  </ng-template>
  <ng-template matStepperIcon="chat">
    <mat-icon>forum</mat-icon>
  </ng-template>
</mat-horizontal-stepper>
```

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

The stepper can now show error states by simply providing the `showError` option to the
`STEPPER_GLOBAL_OPTIONS` in your application's root module as mentioned above.

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

### Keyboard interaction
- <kbd>LEFT_ARROW</kbd>: Focuses the previous step header
- <kbd>RIGHT_ARROW</kbd>: Focuses the next step header
- <kbd>HOME</kbd>: Focuses the first step header
- <kbd>END</kbd>: Focuses the last step header
- <kbd>ENTER</kbd>, <kbd>SPACE</kbd>: Selects the step that the focus is currently on
- <kbd>TAB</kbd>: Focuses the next tabbable element
- <kbd>SHIFT</kbd>+<kbd>TAB</kbd>: Focuses the previous tabbable element

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

### Accessibility
The stepper is treated as a tabbed view for accessibility purposes, so it is given
`role="tablist"` by default. The header of step that can be clicked to select the step
is given `role="tab"`, and the content that can be expanded upon selection is given
`role="tabpanel"`. `aria-selected` attribute of step header and `aria-expanded` attribute of
step content is automatically set based on step selection change.

The stepper and each step should be given a meaningful label via `aria-label` or `aria-labelledby`.
