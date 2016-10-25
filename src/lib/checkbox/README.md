# md-checkbox

`md-checkbox` is a Material Design selection control that allows users to make a binary choice for
a predetermined conditioned. It is modeled after the browser's native checkbox element, and behaves
in the same way. Similar to the native checkbox element, it supports an indeterminate state for
"mixed" checkboxes.

A demo of the checkbox can be found at https://plnkr.co/edit/P7qce8lN9n2flS6kBhDy?p=preview.

## Usage

### Basic Usage

`md-checkbox` can be used anywhere a normal checkbox would be used, and in the same way.

```html
<ul>
  <li *ngFor="let todo of todos">
    <md-checkbox [checked]="todo.completed"
                 (change)="todo.completed = $event">
      {{todo.name}}
    </md-checkbox>
  </li>
</ul>
```

### Usage within Forms

In addition to supporting native checkbox functionality, `md-checkbox` also supports `[(ngModel)]`
for use within forms.

```html
<form (submit)="saveUser()">
  <!-- Form fields... -->
  <div>
    <md-checkbox [(ngModel)]="user.agreesToTOS">
      I have read and agree to the terms of service.
    </md-checkbox>
  </div>
  <button type="submit" [disabled]="!user.agreesToTOS">Sign Up</button>
</form>
```

### Indeterminate Checkboxes

Indeterminate checkboxes are useful when a checkbox needs to be in a "mixed" state

```html
<md-checkbox [checked]="false"
             [indeterminate]="isIndeterminate"
             (change)="isIndeterminate = false">
  Click the Button Below to Make Me Indeterminate.
</md-checkbox>
<button type="button" (click)="isIndeterminate = true">
  Make Indeterminate
</button>
```

### Alignment

Note that checkboxes can be aligned to come at the "start" or the "end" of its corresponding label.

```html
<md-checkbox [checked]="true" align="end">
  I come after my label.
</md-checkbox>
```

Note that this alignment is preserved within RTL layouts.

### Accessibility

By default, `md-checkbox` provides all the accessibility attributes needed. It also supports
keyboard navigation and toggling via the spacebar. However, you can provide an `aria-label` to the
checkbox if you do not wish to have any label text.

```html
<md-checkbox [checked]="false" aria-label="My standalone checkbox"></md-checkbox>
```

### Theming

The color of a `md-checkbox` can be changed by using the `color` attribute.
The value `accent` is default and will correspond to your theme accent color.
Alternatively, you can specify `primary` or `warn`.

Example:

 ```html
<md-checkbox [checked]="true" color="primary">
  I come after my label.
</md-checkbox>
 ```
