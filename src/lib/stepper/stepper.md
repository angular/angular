Angular Material's stepper provides a wizard-like workflow by dividing content into logical steps.

<!-- example(stepper-overview) -->

Material stepper builds on the foundation of the CDK stepper that is responsible for the logic
that drives a stepped workflow. Material stepper extends the CDK stepper and has Material Design
styling.

### Stepper variants
There are two stepper components: `md-horizontal-stepper` and `md-vertical-stepper`. They 
can be used the same way. The only difference is the orientation of stepper. 
`md-horizontal-stepper` selector can be used to create a horizontal stepper, and
`md-vertical-stepper` can be used to create a vertical stepper. `md-step` components need to be
placed inside either one of the two stepper components.

### Labels
If a step's label is only text, then the `label` attribute can be used.
```html
<md-vertical-stepper>
  <md-step label="Step 1">
    Content 1
  </md-step>
  <md-step label="Step 1">
    Content 2
  </md-step>
</md-vertical-stepper>
```

For more complex labels, add a template with the `mdStepLabel` directive inside the 
`md-step`.
```html
<md-vertical-stepper>
  <md-step>
    <ng-template mdStepLabel>...</ng-template>
    ...
  </md-step>
</md-vertical-stepper>
```

### Stepper buttons
There are two button directives to support navigation between different steps:
`mdStepperPrevious` and `mdStepperNext`.
```html
<md-horizontal-stepper>
  <md-step>
    ...
    <div>
      <button md-button mdStepperPrevious>Back</button>
      <button md-button mdStepperNext>Next</button>
    </div>
  </md-step>
</md-horizontal-stepper>  
```

### Linear stepper
The `linear` attribute can be set on `md-horizontal-stepper` and `md-vertical-stepper` to create
a linear stepper that requires the user to complete previous steps before proceeding
to following steps. For each `md-step`, the `stepControl` attribute can be set to the top level
`AbstractControl` that is used to check the validity of the step. 

There are two possible approaches. One is using a single form for stepper, and the other is
using a different form for each step.

#### Using a single form
When using a single form for the stepper, `mdStepperPrevious` and `mdStepperNext` have to be
set to `type="button"` in order to prevent submission of the form before all steps
are completed. 

```html
<form [formGroup]="formGroup">
  <md-horizontal-stepper formArrayName="formArray" linear>
    <md-step formGroupName="0" [stepControl]="formArray.get([0])">
      ...
      <div>
        <button md-button mdStepperNext type="button">Next</button>
      </div>
    </md-step>
    <md-step formGroupName="1" [stepControl]="formArray.get([1])">
      ...
      <div>
        <button md-button mdStepperPrevious type="button">Back</button>
        <button md-button mdStepperNext type="button">Next</button>
      </div>
    </md-step>
    ...
  </md-horizontal-stepper> 
</form>
```

#### Using a different form for each step
```html
<md-vertical-stepper linear>
  <md-step [stepControl]="formGroup1">
    <form [formGroup]="formGroup1">
      ...
    </form>
  </md-step>
  <md-step [stepControl]="formGroup2">
    <form [formGroup]="formGroup2">
      ...
    </form>
  </md-step>
</md-vertical-stepper>
```
### Types of steps

#### Optional step
If completion of a step in linear stepper is not required, then the `optional` attribute can be set
on `md-step`. 

#### Editable step
By default, steps are editable, which means users can return to previously completed steps and
edit their responses. `editable="true"` can be set on `md-step` to change the default. 

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

### Accessibility
The stepper is treated as a tabbed view for accessibility purposes, so it is given
`role="tablist"` by default. The header of step that can be clicked to select the step
is given `role="tab"`, and the content that can be expanded upon selection is given
`role="tabpanel"`. `aria-selected` attribute of step header and `aria-expanded` attribute of
step content is automatically set based on step selection change.

The stepper and each step should be given a meaningful label via `aria-label` or `aria-labelledby`.