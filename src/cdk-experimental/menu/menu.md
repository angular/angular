The `@angular/cdk-experimental/menu` module provides directives to help create custom menu
interactions based on the [WAI ARIA specification][aria].

By using `@angular/cdk-experimental/menu` you get all of the expected behaviors for an accessible
experience, including bidi layout support, keyboard interaction, and focus management. All
directives apply their associated ARIA roles to their host element.

### Supported ARIA Roles

The directives in `@angular/cdk-experimental/menu` set the appropriate roles on their host element.

| Directive           | ARIA Role        |
| ------------------- | ---------------- |
| CdkMenuBar          | menubar          |
| CdkMenu             | menu             |
| CdkMenuGroup        | group            |
| CdkMenuItem         | menuitem         |
| CdkMenuItemRadio    | menuitemradio    |
| CdkMenuItemCheckbox | menuitemcheckbox |

### Getting started

Import the `CdkMenuModule` into the `NgModule` in which you want to create menus. You can then apply
menu directives to build your custom menu. A typical menu consists of the following directives:

- `cdkMenuTriggerFor` - links a trigger button to a menu you intend to open
- `cdkMenuPanel` - wraps the menu and provides a link between the `cdkMenuTriggerFor` and the
  `cdkMenu`
- `cdkMenu` - the actual menu you want to open
- `cdkMenuItem` - added to each button

<!-- example({
  "example": "cdk-menu-standalone-menu",
  "file": "cdk-menu-standalone-menu-example.html"
  }) -->

Most menu interactions consist of two parts: a trigger and a menu panel.

#### Triggers

You must add the `cdkMenuItem` and `cdkMenuTriggerFor` directives to triggers like so,

```html
<button cdkMenuItem [cdkMenuTriggerFor]="menu">Click me!</button>
```

Adding `cdkMenuItem` gives you keyboard navigation and focus management. Associating a trigger with
a menu is done through the `cdkMenuTriggerFor` directive and you must provide a template reference
variable to it. Once both of these directives are set, you can toggle the associated menu
programmatically, using a mouse or using a keyboard.

#### Menu panels

You must wrap pop-up menus with an `ng-template` with the `cdkMenuPanel` directive and a reference
variable which must be of type `cdkMenuPanel`. Further, the `cdkMenu` must also reference the
`cdkMenuPanel`.

```html
<ng-template cdkMenuPanel #panel="cdkMenuPanel">
  <div cdkMenu [cdkMenuPanel]="panel">
    <!-- some content -->
  </div>
</ng-template>
```

Note that Angular CDK provides no styles; you must add styles as part of building your custom menu.

### Menu Bars

The `CdkMenuBar` directive follows the [ARIA menubar][menubar] spec and behaves similar to a desktop
app menubar. It consists of at least one `CdkMenuItem` which triggers a submenu. A menubar can be
layed out horizontally or vertically (defaulting to horizontal). If the layout changes, you must set
the `orientation` attribute to match in order for the keyboard navigation to work properly and for
menus to open up in the correct location.

<!-- example({
  "example": "cdk-menu-menubar",
  "file": "cdk-menu-menubar-example.html"
  }) -->

### Context Menus

A context menu opens when a user right-clicks within some container element. You can mark a
container element with the `cdkContextMenuTriggerFor`, which behaves like `cdkMenuTriggerFor` except
that it responds to the browser's native `contextmenu` event. Custom context menus appear next to
the cursor, similarly to native context menus.

<!-- example({
  "example": "cdk-menu-context",
  "file": "cdk-menu-context-example.html"
  }) -->

You can nest context menu container elements. Upon right-click, the menu associated with the closest
container element will open.

```html
<div [cdkContextMenuTriggerFor]="outer">
  My outer context
  <div [cdkContextMenuTriggerFor]="inner">My inner context</div>
</div>
```

In the example above, right clicking on "My inner context" will open up the "inner" menu and right
clicking inside "My outer context" will open up the "outer" menu.

### Inline Menus

An _inline menu_ is a menu that lives directly on the page rather than a pop-up associated with a
trigger. You can use an inline menu when you want a persistent menu interaction on a page. Menu
items within an inline menus are logically grouped together and you can navigate through them using
your keyboard.

<!-- example({
  "example": "cdk-menu-inline",
  "file": "cdk-menu-inline-example.html"
  }) -->

### Menu Items

Both menu and menubar elements should exclusively contain menuitem elements. This directive allows
the items to be navigated to via keyboard interaction.

A menuitem by itself can provide some user defined action by hooking into the `cdkMenuItemTriggered`
output. An example may be a close button which performs some closing logic.

```html
<ng-template cdkMenuPanel #panel="cdkMenuPanel">
  <div cdkMenu [cdkMenuPanel]="panel">
    <button cdkMenuItem (cdkMenuItemTriggered)="closeApp()">Close</button>
  </div>
</ng-template>
```

You can create nested menus by using a menuitem as the trigger for another menu.

```html
<ng-template cdkMenuPanel #panel="cdkMenuPanel">
  <div cdkMenu [cdkMenuPanel]="panel">
    <button cdkMenuItem [cdkMenuTriggerFor]="submenu">Open Submenu</button>
  </div>
</ng-template>
```

A menuitem also has two sub-types, neither of which should trigger a menu: CdkMenuItemCheckbox and
CdkMenuItemRadio

#### Menu Item Checkboxes

A `cdkMenuItemCheckbox` is a special type of menuitem that behaves as a checkbox. You can use this
type of menuitem to toggle items on and off. An element with the `cdkMenuItemCheckbox` directive
does not need the additional `cdkMenuItem` directive.

#### Menu Item Radios

A `cdkMenuItemRadio` is a special type of menuitem that behaves as a radio button. You can use this
type of menuitem for menus with exclusively selectable items. An element with the `cdkMenuItemRadio`
directive does not need the additional `cdkMenuItem` directive.

#### Groups

By default `cdkMenu` acts as a group for `cdkMenuItemRadio` elements. Elements with
`cdkMenuItemRadio` added as children of a `cdkMenu` will be logically grouped and only a single item
can have the checked state.

If you would like to have unrelated groups of radio buttons within a single menu you should use the
`cdkMenuGroup` directive.

```html
<ng-template cdkMenuPanel #panel="cdkMenuPanel">
  <div cdkMenu [cdkMenuPanel]="panel">
    <!-- Font size -->
    <div cdkMenuGroup>
      <button cdkMenuItemRadio>Small</button>
      <button cdkMenuItemRadio>Medium</button>
      <button cdkMenuItemRadio>Large</button>
    </div>
    <hr />
    <!-- Paragraph alignment -->
    <div cdkMenuGroup>
      <button cdkMenuItemRadio>Left</button>
      <button cdkMenuItemRadio>Center</button>
      <button cdkMenuItemRadio>Right</button>
    </div>
  </div>
</ng-template>
```

Note however that when the menu is closed and reopened any state is lost. You must subscribe to the
groups `change` output, or to `cdkMenuItemToggled` on each radio item and track changes your self.
Finally, you can provide state for each item using the `checked` attribute.

<!-- example({
  "example": "cdk-menu-standalone-stateful-menu",
  "file": "cdk-menu-standalone-stateful-menu-example.html"
  }) -->

### Smart Menu Aim

`@angular/cdk-experimental/menu` intelligently predicts when a user intends to navigate to an open
submenu and prevent premature closeouts. This functionality prevents users from having to hunt
through the open menus in a maze-like fashion to reach their destination.

![menu aim diagram][diagram]

As demonstrated in the diagram above we first track the user's mouse movements within a menu. Next,
when a user mouses into a sibling menu item (e.g. Share button) the sibling item asks the Menu Aim
service if it can perform its close actions. In order to determine if the current submenu can be
closed out, the Menu Aim service calculates the slope between a selected target coordinate in the
submenu and the previous mouse point, and the slope between the target and the current mouse point.
If the slope of the current mouse point is greater than the slope of the previous that means the
user is moving towards the submenu and we shouldn't close out. Users however may sometimes stop
short in a sibling item after moving towards the submenu. The service is intelligent enough the
detect this intention and will trigger the next menu.

### Accessibility

The set of directives defined in `@angular/cdk-experimental/menu` follow accessibility best
practices as defined in the [ARIA spec][menubar]. Specifically, the menus are aware of left-to-right
and right-to-left layouts and opened appropriately. You should however add any necessary CSS styles.
Menu items should always have meaningful labels, whether through text content, `aria-label`, or
`aria-labelledby`. Finally, keyboard interaction is supported as defined in the [ARIA menubar
keyboard interaction spec][keyboard].

<!-- links -->

[aria]: https://www.w3.org/TR/wai-aria-1.1/ 'ARIA Spec'
[menubar]: https://www.w3.org/TR/wai-aria-practices-1.1/#menu 'ARIA Menubar Pattern'
[keyboard]:
  https://www.w3.org/TR/wai-aria-practices-1.1/#keyboard-interaction-12
  'ARIA Menubar Keyboard Interaction'
[diagram]: menuaim.png 'Menu Aim Diagram'
