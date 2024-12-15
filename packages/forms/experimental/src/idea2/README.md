## Notes

- Main idea: have a directive `ngField` that sets a field as the current field for all controls
  beneath it. controls can then inject the current field and register themselves to control its
  value and/or use some of the field's values in its bindings. To facilitate binding all of the
  relevant properties/attributes, another directive `ngBindField` binds all applicable bindings for
  common native controls.
- Directive support using it as either a normal directive or structural directive. When used as a
  structural directive it can automatically hide/show its contents based on the hidden status from
  the field.
- Allows creating separate pieces for things like labels, errors, etc. that don't control the value
  of the field, but implement bits of reusable UI based on it.
- Big danger here seems like multiple controls fighting over the field. e.g. if you have a phone
  input made up of individual text inputs, those individual inputs will try to register themsevles
  to control the field. Is there a safe way to decide who gets control?
- Interesting observation: in the example, I have 2 UI inputs that share the same underlying field -
  this means that they also share the touched status, so when I touch one of them they both become
  touched (and potentially both start showing errors).
  - There are real use cases that use such a configuration (e.g. date input that has an additional
    input inside the popup dialog bound to the same field.)
  - Does this imply that the touched status should be owned by the UI control, not the `FormField`?
    Is there any other state this applies to besides tocuhed? dirty?
