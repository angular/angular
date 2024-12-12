## Notes

- Main idea: schema logic functions define pieces of the computation functions used to build the
  final signal graph representing the form. The input to these functions is the final form itself,
  which allows a user to define any of the form properties as computations of other form properties.
  - A danger with this approach is that a user could create cyclical deps in their signal graph,
    would need good errors to explain what's wrong.
- Composition model:
  - When nesting calls to group / field, the logic functions in the child fields receive the full
    `Form` starting from the root. This allows definig logic based on other parent or sibling
    fields.
  - The `include` function can be used to include another fully self-contained schema by passing it
    a `Form` rooted at the current field rather than the current field's root `Form`. We can also
    specify an additional schema when doing this that _is_ rooted at the current field's root `Form`
    and allows us to augment the schema we're including. (e.g. if we're including a generic date
    group to use as a birth date in a larger form, we may want to put additional restrictions on
    what constitues a valid year).
    - Need to figure out exactly what it means to augment the schema. e.g. for validators maybe we
      combine the lists and run all of them, but for initial value we override the original schema
      with the augmented value. What rules make sense here?
- Current typing assumes something like Alex's signal proxy, though other designs could fit here as
  well.
- A drawback to this approach is that the user must specify the shape of the data as a generic on
  the top-level `group`/`field` calls, and must not specify it on any of the child ones
  - Alternative idea from Alex: we could separate out the initial values from the rest of schema.
    Would have to explore how this affects the composability / if it's worth it
- Another idea from Alex: the schema/form have a class/instance-like relationship, could explore
  making the schema a class.
- What should be included in the schema? Other fws & libraries I've looked at so far seem to use the
  schema for just the validation, but we could include more. Which of these would be useful?
  - Validation
  - Disabled/readonly
  - Hidden/shown
  - Initial value
  - Label
  - Placeholder
  - Options (e.g. for select / chips)
- We need to know what kind of validators a field has, not just the errors that result from running
  them. For example, we may want to show a `*` on a field with a required validator, or set the
  `min` attribute for a field with a min validator. To support this we can use a base `Validator`
  class and `instanceof` checks to check for specific types of interest, e.g. `RequiredValidator`.
  - It's hard to `instanceof RequiredValidator` style checks in the template, so for convenience for
    all of the native html validation attributes we can automatically extract them to separate
    properties on the field, e.g. `required: Signal<boolean>`, `min: Signal<number | undefined>`
  - Should users be able to extract thier own things onto the field? Could probably support this by
    accepting a function when creating the form that maps a `FormField` to a record of additional
    properties to add to it.
