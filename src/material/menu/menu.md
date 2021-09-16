`<mat-menu>` is a floating panel containing list of options.

<!-- example(menu-overview) -->

By itself, the `<mat-menu>` element does not render anything. The menu is attached to and opened
via application of the `matMenuTriggerFor` directive:
<!-- example({"example": "menu-overview",
              "file": "menu-overview-example.html",
              "region": "mat-menu-trigger-for"}) -->

### Toggling the menu programmatically
The menu exposes an API to open/close programmatically. Please note that in this case, an
`matMenuTriggerFor` directive is still necessary to attach the menu to a trigger element in the DOM.

```ts
class MyComponent {
  @ViewChild(MatMenuTrigger) trigger: MatMenuTrigger;

  someMethod() {
    this.trigger.openMenu();
  }
}
```

### Icons
Menus support displaying `mat-icon` elements before the menu item text.

<!-- example({"example": "menu-icons",
              "file": "menu-icons-example.html"}) -->

### Customizing menu position

By default, the menu will display below (y-axis), after (x-axis), without overlapping
its trigger. The position can be changed using the `xPosition` (`before | after`) and `yPosition`
(`above | below`) attributes. The menu can be forced to overlap the trigger using the
`overlapTrigger` attribute.

<!-- example({"example": "menu-position",
              "file": "menu-position-example.html",
              "region": "menu-position"}) -->

### Nested menu

Material supports the ability for an `mat-menu-item` to open a sub-menu. To do so, you have to define
your root menu and sub-menus, in addition to setting the `[matMenuTriggerFor]` on the `mat-menu-item`
that should trigger the sub-menu:

<!-- example({"example": "menu-nested",
              "file": "menu-nested-example.html",
              "region": "sub-menu"}) -->

### Lazy rendering
By default, the menu content will be initialized even when the panel is closed. To defer
initialization until the menu is open, the content can be provided as an `ng-template`
with the `matMenuContent` attribute:

```html
<mat-menu #appMenu="matMenu">
  <ng-template matMenuContent>
    <button mat-menu-item>Settings</button>
    <button mat-menu-item>Help</button>
  </ng-template>
</mat-menu>

<button mat-icon-button [matMenuTriggerFor]="appMenu">
  <mat-icon>more_vert</mat-icon>
</button>
```

### Passing in data to a menu
When using lazy rendering, additional context data can be passed to the menu panel via
the `matMenuTriggerData` input. This allows for a single menu instance to be rendered
with a different set of data, depending on the trigger that opened it:

```html
<mat-menu #appMenu="matMenu">
  <ng-template matMenuContent let-name="name">
    <button mat-menu-item>Settings</button>
    <button mat-menu-item>Log off {{name}}</button>
  </ng-template>
</mat-menu>

<button mat-icon-button [matMenuTriggerFor]="appMenu" [matMenuTriggerData]="{name: 'Sally'}">
  <mat-icon>more_vert</mat-icon>
</button>

<button mat-icon-button [matMenuTriggerFor]="appMenu" [matMenuTriggerData]="{name: 'Bob'}">
  <mat-icon>more_vert</mat-icon>
</button>
```

### Keyboard interaction
| Keyboard shortcut      | Action                                      |
|------------------------|---------------------------------------------|
| <kbd>Down Arrow</kbd>  | Focus the next menu item.                   |
| <kbd>Up Arrow</kbd>    | Focus the previous menu item.               |
| <kbd>Left Arrow</kbd>  | Close the current menu if it is a sub-menu. |
| <kbd>Right Arrow</kbd> | Opens the current menu item's sub-menu.     |
| <kbd>Enter</kbd>       | Activate the focused menu item.             |
| <kbd>Escape</kbd>      | Close all open menus.                       |

### Accessibility

Angular Material's menu component consists of two connected parts: the trigger and the pop-up menu.

The menu trigger is a standard button element augmented with `aria-haspopup`, `aria-expanded`, and
`aria-controls` to create the relationship to the pop-up panel.

The pop-up menu implements the `role="menu"` pattern, handling keyboard interaction and focus
management. Upon opening, the trigger will focus the first focusable menu item. Upon close, the menu
will return focus to its trigger. Avoid creating a menu in which all items are disabled, instead
hiding or disabling the menu trigger. 

Angular Material does not support the `menuitemcheckbox` or `menuitemradio` roles.

Always provide an accessible label via `aria-label` or `aria-labelledby` for any menu
triggers or menu items without descriptive text content.
