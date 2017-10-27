`<mat-menu>` is a floating panel containing list of options.

<!-- example(menu-overview) -->

By itself, the `<mat-menu>` element does not render anything. The menu is attached to and opened
via application of the `matMenuTriggerFor` directive:
```html
<mat-menu #appMenu="matMenu">
  <button mat-menu-item> Settings </button>
  <button mat-menu-item> Help </button>
</mat-menu>

<button mat-icon-button [matMenuTriggerFor]="appMenu">
   <mat-icon>more_vert</mat-icon>
</button>
```

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

*my-comp.html*
```html
<mat-menu #menu="matMenu">
  <button mat-menu-item>
    <mat-icon> dialpad </mat-icon>
    <span> Redial </span>
  </button>
  <button mat-menu-item disabled>
    <mat-icon> voicemail </mat-icon>
    <span> Check voicemail </span>
  </button>
  <button mat-menu-item>
    <mat-icon> notifications_off </mat-icon>
    <span> Disable alerts </span>
  </button>
</mat-menu>
```

### Customizing menu position

By default, the menu will display below (y-axis), after (x-axis), and overlapping its trigger.
The position can be changed using the `xPosition` (`before | after`) and `yPosition`
(`above | below`) attributes. The menu can be be forced to not overlap the trigger using
`[overlapTrigger]="false"` attribute.

```html
<mat-menu #appMenu="matMenu" yPosition="above">
  <button mat-menu-item> Settings </button>
  <button mat-menu-item> Help </button>
</mat-menu>

<button mat-icon-button [matMenuTriggerFor]="appMenu">
  <mat-icon>more_vert</mat-icon>
</button>
```

### Nested menu

Material supports the ability for an `mat-menu-item` to open a sub-menu. To do so, you have to define
your root menu and sub-menus, in addition to setting the `[matMenuTriggerFor]` on the `mat-menu-item`
that should trigger the sub-menu:

```html
<mat-menu #rootMenu="matMenu">
  <button mat-menu-item [matMenuTriggerFor]="subMenu">Power</button>
  <button mat-menu-item>System settings</button>
</mat-menu>

<mat-menu #subMenu="matMenu">
  <button mat-menu-item>Shut down</button>
  <button mat-menu-item>Restart</button>
  <button mat-menu-item>Hibernate</button>
</mat-menu>

<button mat-icon-button [matMenuTriggerFor]="rootMenu">
  <mat-icon>more_vert</mat-icon>
</button>
```

<!-- example(nested-menu) -->

### Keyboard interaction
- <kbd>DOWN_ARROW</kbd>: Focuses the next menu item
- <kbd>UP_ARROW</kbd>: Focuses previous menu item
- <kbd>RIGHT_ARROW</kbd>: Opens the menu item's sub-menu
- <kbd>LEFT_ARROW</kbd>: Closes the current menu, if it is a sub-menu.
- <kbd>ENTER</kbd>: Activates the focused menu item

### Accessibility
Menu triggers or menu items without text or labels should be given a meaningful label via
`aria-label` or `aria-labelledby`.
