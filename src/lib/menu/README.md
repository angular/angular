# md-menu

`md-menu` is a list of options that displays when triggered.  You can read more about menus in the 
[Material Design spec](https://material.google.com/components/menus.html).

### Not yet implemented

- `prevent-close` option, to turn off automatic menu close when clicking outside the menu
- Custom offset support
- Menu groupings (which menus are allowed to open together)

## Usage

### Simple menu

In your template, create an `md-menu` element. You can use either `<button>` or `<anchor>` tags for 
your menu items, as long as each is tagged with an `md-menu-item` attribute. Note that you can 
disable items by adding the `disabled` boolean attribute or binding to it.

*my-comp.html*
```html
<!-- this menu starts as hidden by default -->
<md-menu>
    <button md-menu-item> Refresh </button>
    <button md-menu-item> Settings </button>
    <button md-menu-item> Help </button>
    <button md-menu-item disabled> Sign Out </button>
</md-menu>
```

Menus are hidden by default, so you'll want to connect up a menu trigger that can open your menu.  
You can do so by adding a button tag with an `md-menu-trigger-for` attribute and passing in the menu 
instance.  You can create a local reference to your menu instance by adding `#menu="mdMenu"` to  
your menu element.

*my-comp.html*
```html
<!-- menu opens when trigger button is clicked -->
<button md-icon-button [md-menu-trigger-for]="menu">
   <md-icon>more_vert</md-icon>
</button>

<md-menu #menu="mdMenu">
    <button md-menu-item> Refresh </button>
    <button md-menu-item> Settings </button>
    <button md-menu-item> Help </button>
    <button md-menu-item disabled> Sign Out </button>
</md-menu>
```

Output:

<img src="https://material.angularjs.org/material2_assets/menu/default_closed.png">
<img src="https://material.angularjs.org/material2_assets/menu/default_open.png">

### Toggling the menu programmatically

You can also use the menu's API to open or close the menu programmatically from your class. Please 
note that in this case, an `md-menu-trigger-for` attribute is still necessary to connect 
the menu to its trigger element in the DOM.
  
*my-comp.component.ts*
```ts
class MyComp {
  @ViewChild(MdMenuTrigger) trigger: MdMenuTrigger;

  someMethod() {
    this.trigger.openMenu();
  }
}
```

*my-comp.html*
```html
<button md-icon-button [md-menu-trigger-for]="menu">
   <md-icon>more_vert</md-icon>
</button>

<md-menu #menu="mdMenu">
    <button md-menu-item> Refresh </button>
    <button md-menu-item> Settings </button>
    <button md-menu-item> Help </button>
    <button md-menu-item disabled> Sign Out </button>
</md-menu>
```

### Adding an icon

Menus also support displaying `md-icon` elements before the menu item text.

*my-comp.html*
```html
<md-menu #menu="mdMenu">
  <button md-menu-item> 
    <md-icon> dialpad </md-icon>
    <span> Redial </span>
  </button>
  <button md-menu-item disabled> 
    <md-icon> voicemail </md-icon>
    <span> Check voicemail </span>
  </button>
  <button md-menu-item> 
    <md-icon> notifications_off </md-icon>
    <span> Disable alerts </span>
  </button>
</md-menu>
```

Output:

<img src="https://material.angularjs.org/material2_assets/menu/icon_menu_closed.png">
<img src="https://material.angularjs.org/material2_assets/menu/icon_menu_open.png">


### Customizing menu position

By default, the menu will display after and below its trigger.  You can change this display position 
using the `x-position` (`before | after`) and `y-position` (`above | below`) attributes.  

*my-comp.html*
```html
<md-menu x-position="before" #menu="mdMenu">
    <button md-menu-item> Refresh </button>
    <button md-menu-item> Settings </button>
    <button md-menu-item> Help </button>
    <button md-menu-item disabled> Sign Out </button>
</md-menu>
```

Output:

<img src="https://material.angularjs.org/material2_assets/menu/before_closed.png">
<img src="https://material.angularjs.org/material2_assets/menu/before_open.png">

### Accessibility

The menu adds `role="menu"` to the main menu element and `role="menuitem"` to each menu item. It 
also adds `aria-hasPopup="true"` to the trigger element.

#### Keyboard events:
- <kbd>DOWN_ARROW</kbd>: Focus next menu item
- <kbd>UP_ARROW</kbd>: Focus previous menu item
- <kbd>ENTER</kbd>: Select focused item

### Menu attributes

| Signature | Values | Description |
| --- | --- | --- |
| `x-position` | `before | after` | The horizontal position of the menu in relation to the trigger. Defaults to `after`. | 
| `y-position` | `above | below` | The vertical position of the menu in relation to the trigger. Defaults to `below`. |
 
### Trigger Programmatic API

**Properties**

| Name | Type | Description |
| --- | --- | --- |
| `menuOpen` | `Boolean` | Property that is true when the menu is open. It is not settable (use methods below). | 
| `onMenuOpen` | `Observable<void>` | Observable that emits when the menu opens. | 
| `onMenuClose` | `Observable<void>` | Observable that emits when the menu closes. | 

**Methods**

| Method | Returns | Description |
| --- | --- | --- |
| `openMenu()` | `Promise<void>` | Opens the menu. Returns a promise that will resolve when the menu has opened. |
| `closeMenu()` | `Promise<void>` | Closes the menu. Returns a promise that will resolve when the menu has closed. |
| `toggleMenu()` | `Promise<void>` | Toggles the menu. Returns a promise that will resolve when the menu has completed opening or closing. |  
| `destroyMenu()` | `Promise<void>` | Destroys the menu overlay completely. 
  

