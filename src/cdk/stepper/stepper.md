CDK stepper provides a foundation upon which more concrete stepper varities can be built. A
stepper is a wizard-like workflow that divides content into logical steps

### Behavior captured by CdkStepper
The base CDK version of the stepper primarily manages which step is active. This includes handling
keyboard interactions and exposing an API for advancing or rewinding through the workflow.

#### Linear stepper
A stepper marked as `linear` requires the user to complete previous steps before proceeding.
For each step, the `stepControl` attribute can be set to the top level `AbstractControl` that
is used to check the validity of the step.

There are two possible approaches. One is using a single form for stepper, and the other is
using a different form for each step.

Alternatively, if you don't want to use the Angular forms, you can pass in the `completed` property
to each of the steps which won't allow the user to continue until it becomes `true`. Note that if
both `completed` and `stepControl` are set, the `stepControl` will take precedence.

#### Using a single form for the entire stepper
When using a single form for the stepper, any intermediate next/previous buttons within the steps
must be set to `type="button"` in order to prevent submission of the form before all steps are
complete.

#### Using a form for each individual step
When using a form for each step, the workflow is advanced whenever one of the forms is submitted.

### Types of steps

#### Optional step
If completion of a step in linear stepper is not required, then the `optional` attribute can be set
on `CdkStep` in a `linear` stepper.

#### Editable step
By default, steps are editable, which means users can return to previously completed steps and
edit their responses. `editable="true"` can be set on `CdkStep` to change the default.

#### Completed step
By default, the `completed` attribute of a step returns `true` if the step is valid (in case of
linear stepper) and the user has interacted with the step. The user, however, can also override
this default `completed` behavior by setting the `completed` attribute as needed.

### Stepper buttons
There are two button directives to support navigation between different steps:
`CdkStepperNext` and `CdkStepperPrevious`. When placed inside of a step, these will automatically
add click handlers to advance or rewind the workflow, respectively.

### Keyboard interaction
- <kbd>LEFT_ARROW</kbd>: Focuses the previous step header
- <kbd>RIGHT_ARROW</kbd>: Focuses the next step header
- <kbd>ENTER</kbd>, <kbd>SPACE</kbd>: Selects the step that the focus is currently on
- <kbd>TAB</kbd>: Focuses the next tabbable element
- <kbd>TAB</kbd>+<kbd>SHIFT</kbd>: Focuses the previous tabbable element

### Accessibility
The CDK stepper is treated as a tabbed view for accessibility purposes, so it is given
`role="tablist"` by default. The header of step that can be clicked to select the step
is given `role="tab"`, and the content that can be expanded upon selection is given
`role="tabpanel"`. `aria-selected` attribute of step header and `aria-expanded` attribute of
step content is automatically set based on step selection change.

The stepper and each step should be given a meaningful label via `aria-label` or `aria-labelledby`.

