# Required input is accessed before a value is set.

A required input was accessed but no value was bound.

This can happen when a required input is accessed too early in your directive or component.
This is commonly happening when the input is read as part of class construction.

Inputs are guaranteed to be available in the `ngOnInit` lifecycle hook and afterwards.

## Fixing the error

Access the required input in reactive contexts.
For example, in the template itself, inside a `computed`, or inside an effect.

Alternatively, access the input inside the `ngOnInit` lifecycle hook, or later.
