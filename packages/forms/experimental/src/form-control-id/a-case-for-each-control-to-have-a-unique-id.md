# A case for each group/field to have a unique id

## For fields + label

In an Angular template it's very common to need a unique id to match an input
and label.

```
<label for="name">
<input id="name" [formControl]="control">
```

Every time developers have to come up with a unique id, which adds cognitive
load, but also creating a11y issues if the ID is not unique (label always
selects the
first input with matching ids in the doc).

The problem is partially solved by custom input containers, such as
mat-form-field, which generates a sequential matching ids, but those are not
used everywhere.

Instead, each control can have a unique (sequential?) id:

```angular2html
<label [for]="control.id">
  <input [id]="control.id" [formControl]="control"> 
```

## For FormArray iteration

Not super convinced it would be useful here, but currently if there's
any kind of reordering/removing items from form array, in the loop, they'd have
to be tracked by a control instance (and things would fail miserably if it's by
index, e.g. https://github.com/angular/angular/issues/21682)

Given tracking is required in the new `@for`, maybe it would be beneficial to
allow tracking by component ID?

```html
@for (language of languages.controls; track language.id) {
{{language}}
}
```

Essentially it's the same as `track language.`


