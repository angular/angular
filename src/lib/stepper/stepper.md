Angular Material's stepper provides a wizard-like workflow by dividing content into logical steps.

<!-- example(stepper-overview) -->

Material stepper builds on the foundation of the CDK stepper that is responsible for the logic
that drives a stepped workflow. Material stepper extends the CDK stepper and has Material Design
styling.

### Stepper variants
There are two stepper components: `mat-horizontal-stepper` and `mat-vertical-stepper`. They
can be used the same way. The only difference is the orientation of stepper.
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
a linear stepper that requires the user to complete previous steps before proceeding
to following steps. For each `mat-step`, the `stepControl` attribute can be set to the top level
`AbstractControl` that is used to check the validity of the step.

There are two possible approaches. One is using a single form for stepper, and the other is
using a different form for each step.

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

#### Editable step
By default, steps are editable, which means users can return to previously completed steps and
edit their responses. `editable="true"` can be set on `mat-step` to change the default.

#### Completed step
By default, the `completed` attribute of a step returns `true` if the step is valid (in case of
linear stepper) and the user has interacted with the step. The user, however, can also override
this default `completed` behavior by setting the `completed` attribute as needed.

### Keyboard interaction
- <kbd>LEFT_ARROW</kbd>: Focuses the previous step header
- <kbd>RIGHT_ARROW</kbd>: Focuses the next step header
- <kbd>ENTER</kbd>, <kbd>SPACE</kbd>: Selects the step that the focus is currently on
- <kbd>TAB</kbd>: Focuses the next tabbable element
- <kbd>TAB</kbd>+<kbd>SHIFT</kbd>: Focuses the previous tabbable element

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
