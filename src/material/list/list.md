`<mat-list>` is a container component that wraps and formats a series of `<mat-list-item>`. As the
base list component, it provides Material Design styling, but no behavior of its own.

<!-- example(list-overview) -->

List items can be constructed in two ways depending the the content they need to show:

### Simple lists

If a list item needs to show a single line of textual information, the text can be inserted
directly into the `<mat-list-item>` element.

```html
<mat-list>
 <mat-list-item>Pepper</mat-list-item>
 <mat-list-item>Salt</mat-list-item>
 <mat-list-item>Paprika</mat-list-item>
</mat-list>
```

### Multi-line lists

List items that have more than one line of text have to use the `matListItemTitle` directive to
indicate their title text for accessibility purposes, in addition to the `matListItemLine` directive
for each subsequent line of text.

```html
<mat-list>
  <mat-list-item>
    <span matListItemTitle>Pepper</span>
    <span matListItemLine>Produced by a plant</span>
  </mat-list-item>
  <mat-list-item>
    <span matListItemTitle>Salt</span>
    <span matListItemLine>Extracted from sea water</span>
  </mat-list-item>
  <mat-list-item>
    <span matListItemTitle>Paprika</span>
    <span matListItemLine>Produced by dried and ground red peppers</span>
  </mat-list-item>
</mat-list>
```

To activate text wrapping, the `lines` input has to be set on the `<mat-list-item>` indicating the
number of lines of text.

The following directives can be used to style the content of a list item:

| Directive           | Description                                                                |
|---------------------|----------------------------------------------------------------------------|
| `matListItemTitle`  | Indicates the title of the list item. Required for multi-line list items.  |
| `matListItemLine`   | Wraps a line of text within a list item.                                   |
| `matListItemIcon`   | Icon typically placed at the beginning of a list item.                     |
| `matListItemAvatar` | Image typically placed at the beginning of a list item.                    |
| `matListItemMeta`   | Inserts content in the meta section at the end of a list item.             |

### Navigation lists

Use `mat-nav-list` tags for navigation lists (i.e. lists that have anchor tags).

Simple navigation lists can use the `mat-list-item` attribute on anchor tag elements directly:

```html
<mat-nav-list>
  <a mat-list-item href="..." *ngFor="let link of links" [activated]="link.isActive">{{ link }}</a>
</mat-nav-list>
```

For more complex navigation lists (e.g. with more than one target per item), wrap the anchor
element in an `<mat-list-item>`.

```html
<mat-nav-list>
  <mat-list-item *ngFor="let link of links" [activated]="link.isActive">
     <a matListItemTitle href="...">{{ link }}</a>
     <button mat-icon-button (click)="showInfo(link)" matListItemMeta>
        <mat-icon>info</mat-icon>
     </button>
  </mat-list-item>
</mat-nav-list>
```

### Action lists

Use the `<mat-action-list>` element when each item in the list performs some _action_. Each item
in an action list is a `<button>` element.

Simple action lists can use the `mat-list-item` attribute on button tag elements directly:

```html
<mat-action-list>
  <button mat-list-item (click)="save()">Save</button>
  <button mat-list-item (click)="undo()">Undo</button>
</mat-action-list>
```

### Selection lists
A selection list provides an interface for selecting values, where each list item is an option.

<!-- example(list-selection) -->

The options within a selection-list should not contain further interactive controls, such
as buttons and anchors.


### Multi-line lists
For lists that require multiple lines per item, annotate each line with an `matListItemLine`
attribute. Whichever heading tag is appropriate for your DOM hierarchy should be used
(not necessarily `<h3>` as shown in the example).

```html
<!-- two line list -->
<mat-list>
  <mat-list-item *ngFor="let message of messages">
    <h3 matListItemTitle>{{message.from}}</h3>
    <p matListItemLine>
      <span>{{message.subject}}</span>
      <span class="demo-2"> -- {{message.content}}</span>
    </p>
  </mat-list-item>
</mat-list>

<!-- three line list -->
<mat-list>
  <mat-list-item *ngFor="let message of messages">
    <h3 matListItemTitle>{{message.from}}</h3>
    <p matListItemLine>{{message.subject}}</p>
    <p matListItemLine class="demo-2">{{message.content}}</p>
  </mat-list-item>
</mat-list>
```

### Lists with icons

To add an icon to your list item, use the `matListItemIcon` attribute.


```html
<mat-list>
  <mat-list-item *ngFor="let message of messages">
    <mat-icon matListItemIcon>folder</mat-icon>
    <h3 matListItemTitle>{{message.from}}</h3>
    <p matListItemLine>
      <span>{{message.subject}}</span>
      <span class="demo-2"> -- {{message.content}}</span>
    </p>
  </mat-list-item>
</mat-list>
```

### Lists with avatars

To include an avatar image, add an image tag with an `matListItemAvatar` attribute.

```html
<mat-list>
  <mat-list-item *ngFor="let message of messages">
    <img matListItemAvatar src="..." alt="...">
    <h3 matListItemTitle>{{message.from}}</h3>
    <p matListItemLine>
      <span>{{message.subject}}</span>
      <span class="demo-2"> -- {{message.content}}</span>
    </p>
  </mat-list-item>
</mat-list>
```

### Lists with multiple sections

Subheaders can be added to a list by annotating a heading tag with an `matSubheader` attribute.
To add a divider, use `<mat-divider>`.

```html
<mat-list>
   <h3 matSubheader>Folders</h3>
   <mat-list-item *ngFor="let folder of folders">
      <mat-icon matListIcon>folder</mat-icon>
      <h4 matListItemTitle>{{folder.name}}</h4>
      <p matListItemLine class="demo-2"> {{folder.updated}} </p>
   </mat-list-item>
   <mat-divider></mat-divider>
   <h3 matSubheader>Notes</h3>
   <mat-list-item *ngFor="let note of notes">
      <mat-icon matListIcon>note</mat-icon>
      <h4 matListItemTitle>{{note.name}}</h4>
      <p matListItemLine class="demo-2"> {{note.updated}} </p>
   </mat-list-item>
</mat-list>
```

### Accessibility

Angular Material offers multiple varieties of list so that you can choose the type that best applies
to your use-case.

#### Navigation

You should use `MatNavList` when every item in the list is an anchor that navigate to another URL.
The root `<mat-nav-list>` element sets `role="navigation"` and should contain only anchor elements
with the `mat-list-item` attribute. You should not nest any interactive elements inside these
anchors, including buttons and checkboxes.

Always provide an accessible label for the `<mat-nav-list>` element via `aria-label` or
`aria-labelledby`.

#### Selection

You should use `MatSelectionList` and `MatListOption` for lists that allow the user to select one
or more values. This list variant uses the `role="listbox"` interaction pattern, handling all
associated keyboard input and focus management. You should not nest any interactive elements inside
these options, including buttons and anchors.

Always provide an accessible label for the `<mat-selection-list>` element via `aria-label` or
`aria-labelledby` that describes the selection being made.

#### Custom scenarios

By default, the list assumes that it will be used in a purely decorative fashion and thus it sets no
roles, ARIA attributes, or keyboard shortcuts. This is equivalent to having a sequence of `<div>`
elements on the page. Any interactive content within the list should be given an appropriate
accessibility treatment based on the specific workflow of your application.

If the list is used to present a list of non-interactive content items, then the list element should
be given `role="list"` and each list item should be given `role="listitem"`.
