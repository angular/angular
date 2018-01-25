### FocusTrap
The `cdkTrapFocus` directive traps <kbd>Tab</kbd> key focus within an element. This is intended to
be used to create accessible experience for components like
[modal dialogs](https://www.w3.org/TR/wai-aria-practices-1.1/#dialog_modal), where focus must be
constrained.

This directive is declared in `A11yModule`.

#### Example
```html
<div class="my-inner-dialog-content" cdkTrapFocus>
  <!-- Tab and Shift + Tab will not leave this element. -->
</div>
```
