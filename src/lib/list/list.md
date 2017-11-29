`<mat-list>` is a container component that wraps and formats a series of line items. As the base 
list component, it provides Material Design styling, but no behavior of its own.

<!-- example(list-overview) -->


### Simple lists

An `<mat-list>` element contains a number of `<mat-list-item>` elements.

```html
<mat-list>
 <mat-list-item> Pepper </mat-list-item>
 <mat-list-item> Salt </mat-list-item>
 <mat-list-item> Paprika </mat-list-item>
</mat-list>
```

### Navigation lists

Use `mat-nav-list` tags for navigation lists (i.e. lists that have anchor tags).

Simple navigation lists can use the `mat-list-item` attribute on anchor tag elements directly:

```html
<mat-nav-list>
   <a mat-list-item href="..." *ngFor="let link of links"> {{ link }} </a>
</mat-nav-list>
```

For more complex navigation lists (e.g. with more than one target per item), wrap the anchor 
element in an `<mat-list-item>`.

```html
<mat-nav-list>
  <mat-list-item *ngFor="let link of links">
     <a matLine href="...">{{ link }}</a>
     <button mat-icon-button (click)="showInfo(link)">
        <mat-icon>info</mat-icon>
     </button>
  </mat-list-item>
</mat-nav-list>
```

### Selection lists
A selection list provides an interface for selecting values, where each list item is an option.

<!-- example(list-selection) -->

The options within a selection-list should not contain further interactive controls, such
as buttons and anchors.


### Multi-line lists
For lists that require multiple lines per item, annotate each line with an `matLine` attribute.
Whichever heading tag is appropriate for your DOM hierarchy should be used (not necessarily `<h3>`
as shown in the example).

```html
<!-- two line list -->
<mat-list>
  <mat-list-item *ngFor="let message of messages">
    <h3 matLine> {{message.from}} </h3>
    <p matLine>
      <span> {{message.subject}} </span>
      <span class="demo-2"> -- {{message.content}} </span>
    </p>
  </mat-list-item>
</mat-list>

<!-- three line list -->
<mat-list>
  <mat-list-item *ngFor="let message of messages">
    <h3 matLine> {{message.from}} </h3>
    <p matLine> {{message.subject}} </p>
    <p matLine class="demo-2"> {{message.content}} </p>
  </mat-list-item>
</mat-list>
```

### Lists with icons

To add an icon to your list item, use the `matListIcon` attribute.


```html
<mat-list>
  <mat-list-item *ngFor="let message of messages">
    <mat-icon matListIcon>folder</mat-icon>
    <h3 matLine> {{message.from}} </h3>
    <p matLine>
      <span> {{message.subject}} </span>
      <span class="demo-2"> -- {{message.content}} </span>
    </p>
  </mat-list-item>
</mat-list>
```

### Lists with avatars

To include an avatar image, add an image tag with an `matListAvatar` attribute. 

```html
<mat-list>
  <mat-list-item *ngFor="let message of messages">
    <img matListAvatar src="..." alt="...">
    <h3 matLine> {{message.from}} </h3>
    <p matLine>
      <span> {{message.subject}} </span>
      <span class="demo-2"> -- {{message.content}} </span>
    </p>
  </mat-list-item>
</mat-list>
```

### Dense lists
Lists are also available in "dense layout" mode, which shrinks the font size and height of the list
to suit UIs that may need to display more information. To enable this mode, add a `dense` attribute
to the main `mat-list` tag.


```html
<mat-list dense>
 <mat-list-item> Pepper </mat-list-item>
 <mat-list-item> Salt </mat-list-item>
 <mat-list-item> Paprika </mat-list-item>
</mat-list>
```


### Lists with multiple sections

Subheader can be added to a list by annotating a heading tag with an `matSubheader` attribute. 
To add a divider, use `<mat-divider>`.

```html
<mat-list>
   <h3 matSubheader>Folders</h3>
   <mat-list-item *ngFor="let folder of folders">
      <mat-icon matListIcon>folder</mat-icon>
      <h4 matLine>{{folder.name}}</h4>
      <p matLine class="demo-2"> {{folder.updated}} </p>
   </mat-list-item>
   <mat-divider></mat-divider>
   <h3 matSubheader>Notes</h3>
   <mat-list-item *ngFor="let note of notes">
      <mat-icon matListIcon>note</mat-icon>
      <h4 matLine>{{note.name}}</h4>
      <p matLine class="demo-2"> {{note.updated}} </p>
   </mat-list-item>
</mat-list>
```

### Accessibility
By default, the list assumes that it will be used in a purely decorative fashion and thus sets no
roles, ARIA attributes, or keyboard shortcuts. This is equivalent to having a sequence of <div>
elements on the page. Any interactive content within the list should be given an appropriate
accessibility treatment based on the specific workflow of your application.

If the list is used to present a list of non-interactive content items, then the list element should
be given `role="list"` and each list item should be given `role="listitem"`.
