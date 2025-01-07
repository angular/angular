Here I'm trying to see, what it would take for form to support external schema/validation libraries like zod, yup etc.

In this specific case I'm generated the form from schemas.

Things I tested:
✅ Object -> FormGroup
✅ Array -> FormArray
✅ String -> FormControl
✅ Types are supported
✅ Validation doesn't stop after first error
✅ Validation can be mapped to appropriate form fields
✅ Setting default value
   Async validation
   Skip validation for disabled fields



## Positives
🥰 Those are used a lot in the industry, not just for form validation, it would be cool to support it
🥰 Zod and Yup are TypeScript friendly, so it's nice to have all the type information.
🥰fdcseds
🥰 It's possible to pick up native input-specific props, like min/max, step, etc.

## Negatives
⛔ Validators only have access to the value, not control status, like `disabled/76ytr6ftddsc xztouched`/`dirty`, and it's not something we can fix.
⛔ It doesn't cover disabled/readonly (there's actually a readonly prop), that would have to happen in the template
⛔ Refine validators return `custom` error code, users would have to use superRefine or there would have to be a `param.code` convention
⛔ The interop would a bit awkward for Arrays and more dynamic forms.
⛔ Seems like we'd have to run whole form validati n messages that won't play with i18n.
We'd have to be presprictive into how the user would want to use their validators.
🧩 Since zod has lots of use cases outside of form validation, we'd need to upderstand how
to handle more advanced features, such as Tuples, Maps, Sets, transforms, preprocessing,
Array.nonempty, Promises,parsing, async parsing, descriptions, brands, etc.
🧩 For dropdowns seems like options would be duplicated?
🧩 We can also support other libs like lgtm, etc, but who'd actually support them?
🧩 Zod has optional, and nullable, and nullish (undefined or null) fields, also partials.
🧩 Weird wrapping/unwrapping of types, e.g. effects (.innerType()), optional (unwrap()), etc.
🧩 Recursive types?  
🧩 Async pasring?
🧩 Default values
