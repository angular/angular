## Assignments to template variables

With Ivy, assignments to template variables are no longer supported
as template variables are effectively constants.

This means that assignments to template variables will break your
application once Ivy is enabled by default. For example:

```html
<button *ngFor="let option of options"
       (click)="option = 'newButtonText'">
  {{ option }}
</button>
```

In the example from above, a value is assigned to the `option`
template variable on `click`. This will ultimately break your
application and therefore the logic needs to be adjusted to not
update the `option` variable, but rather the given element in
the `options` array:

```html
<button *ngFor="let option of options; let idx = index"
       (click)="options[idx] = 'newButtonText'">
  {{ option }}
</button>
```