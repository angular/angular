`<md-list>` is a container component that wraps and formats a series of line items. As the base 
list component, it provides Material Design styling, but no behavior of its own.

<!-- example(list-overview) -->


### Simple lists

An `<md-list>` element contains a number of `<md-list-item>` elements.

```html
<md-list>
 <md-list-item> Pepper </md-list-item>
 <md-list-item> Salt </md-list-item>
 <md-list-item> Paprika </md-list-item>
</md-list>
```

### Navigation lists

Use `md-nav-list` tags for navigation lists (i.e. lists that have anchor tags).

Simple navigation lists can use the `md-list-item` attribute on anchor tag elements directly:

```html
<md-nav-list>
   <a md-list-item href="..." *ngFor="let link of links"> {{ link }} </a>
</md-nav-list>
```

For more complex navigation lists (e.g. with more than one target per item), wrap the anchor 
element in an `<md-list-item>`.

```html
<md-nav-list>
  <md-list-item *ngFor="let link of links">
     <a mdLine href="...">{{ link }}</a>
     <button md-icon-button (click)="showInfo(link)">
        <md-icon>info</md-icon>
     </button>
  </md-list-item>
</md-nav-list>
```

### Selection lists
A selection list provides an interface for selecting values, where each list item is an option.

<!-- example(list-selection) -->

The options within a selection-list should not contain further interactive controls, such
as buttons and anchors.


### Multi-line lists
For lists that require multiple lines per item, annotate each line with an `mdLine` attribute.
Whichever heading tag is appropriate for your DOM hierarchy should be used (not necessarily `<h3>`
as shown in the example).

```html
<!-- two line list -->
<md-list>
  <md-list-item *ngFor="let message of messages">
    <h3 mdLine> {{message.from}} </h3>
    <p mdLine>
      <span> {{message.subject}} </span>
      <span class="demo-2"> -- {{message.content}} </span>
    </p>
  </md-list-item>
</md-list>

<!-- three line list -->
<md-list>
  <md-list-item *ngFor="let message of messages">
    <h3 mdLine> {{message.from}} </h3>
    <p mdLine> {{message.subject}} </p>
    <p mdLine class="demo-2"> {{message.content}} </p>
  </md-list-item>
</md-list>
```

### Lists with icons

To add an icon to your list item, use the `mdListIcon` attribute.


```html
<md-list>
  <md-list-item *ngFor="let message of messages">
    <md-icon mdListIcon>folder</md-icon>
    <h3 mdLine> {{message.from}} </h3>
    <p mdLine>
      <span> {{message.subject}} </span>
      <span class="demo-2"> -- {{message.content}} </span>
    </p>
  </md-list-item>
</md-list>
```

### Lists with avatars

To include an avatar image, add an image tag with an `mdListAvatar` attribute. 

```html
<md-list>
  <md-list-item *ngFor="let message of messages">
    <img mdListAvatar src="..." alt="...">
    <h3 mdLine> {{message.from}} </h3>
    <p mdLine>
      <span> {{message.subject}} </span>
      <span class="demo-2"> -- {{message.content}} </span>
    </p>
  </md-list-item>
</md-list>
```

### Dense lists
Lists are also available in "dense layout" mode, which shrinks the font size and height of the list
to suit UIs that may need to display more information. To enable this mode, add a `dense` attribute
to the main `md-list` tag.


```html
<md-list dense>
 <md-list-item> Pepper </md-list-item>
 <md-list-item> Salt </md-list-item>
 <md-list-item> Paprika </md-list-item>
</md-list>
```


### Lists with multiple sections

Subheader can be added to a list by annotating a heading tag with an `mdSubheader` attribute. 
To add a divider, use `<md-divider>`.

```html
<md-list>
   <h3 mdSubheader>Folders</h3>
   <md-list-item *ngFor="let folder of folders">
      <md-icon mdListIcon>folder</md-icon>
      <h4 mdLine>{{folder.name}}</h4>
      <p mdLine class="demo-2"> {{folder.updated}} </p>
   </md-list-item>
   <md-divider></md-divider>
   <h3 mdSubheader>Notes</h3>
   <md-list-item *ngFor="let note of notes">
      <md-icon mdListIcon>note</md-icon>
      <h4 mdLine>{{note.name}}</h4>
      <p mdLine class="demo-2"> {{note.updated}} </p>
   </md-list-item>
</md-list>
```
