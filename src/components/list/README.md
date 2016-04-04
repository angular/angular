# md-list

`md-list` is a container component that wraps and formats a series of line items. As the base list component,
 it provides Material Design styling, but no behavior of its own.

## Usage

### Simple list

To use `md-list`, first import the list directives and add them to your component's directives array:

```javascript
@Component({
  ...
  directives: [MD_LIST_DIRECTIVES]
})
```

In your template, create an `md-list` element and wrap each of your items in an `md-list-item` tag.

```html
<md-list>
   <md-list-item> Pepper </md-list-item>
   <md-list-item> Salt </md-list-item>
   <md-list-item> Paprika </md-list-item>
</md-list>
```

Output:

<img src="https://material.angularjs.org/material2_assets/list/basic-list.png">

### Multi-line lists

If your list requires multiple lines per list item, annotate each line with an `md-line` attribute. 
You can use whichever heading tag is appropriate for your DOM hierarchy (doesn't have to be `h3`), 
as long as the `md-line` attribute is included.

```html
<!-- two line list -->
<md-list>
  <md-list-item *ngFor="#message of messages">
    <h3 md-line> {{message.from}} </h3>
    <p md-line>
      <span> {{message.subject}} </span>
      <span class="demo-2"> -- {{message.message}} </span>
    </p>
  </md-list-item>
</md-list>

<!-- three line list -->
<md-list>
  <md-list-item *ngFor="#message of messages">
    <h3 md-line> {{message.from}} </h3>
    <p md-line> {{message.subject}} </p>
    <p md-line class="demo-2"> {{message.message}} </p>
  </md-list-item>
</md-list>
```

Two line list output:

<img src="https://material.angularjs.org/material2_assets/list/two-line-list.png">

Three line list output: 

<img src="https://material.angularjs.org/material2_assets/list/three-line-list.png">

### Lists with avatars

To include an avatar, add an image tag with an `md-list-avatar` attribute. 

```html
<md-list>
  <md-list-item *ngFor="#message of messages">
    <img md-list-avatar src="..." alt="...">
    <h3 md-line> {{message.from}} </h3>
    <p md-line>
      <span> {{message.subject}} </span>
      <span class="demo-2"> -- {{message.message}} </span>
    </p>
  </md-list-item>
</md-list>
```

Output:

<img src="https://material.angularjs.org/material2_assets/list/list-with-avatar-2.png">
    
### Dense lists
Lists are also available in "dense layout" mode, which shrinks the font size and height of the list 
to suit UIs that may need to display more information.  To enable this mode, add a `dense` attribute 
to the main `md-list` tag.  


```html
<md-list dense>
   <md-list-item> Pepper </md-list-item>
   <md-list-item> Salt </md-list-item>
   <md-list-item> Paprika </md-list-item>
</md-list>
```

Output:

<img src="https://material.angularjs.org/material2_assets/list/dense-list.png">

### Lists with multiple sections

You can add a subheader to a list by annotating a heading tag with an `md-subheader` attribute. To add a divider,
use `<md-divider>` tags.

```html
<md-list>
   <h3 md-subheader>Folders</h3>
   <md-list-item *ngFor="#folder of folders">
      <i md-list-avatar class="material-icons">folder</i>
      <h4 md-line>{{folder.name}}</h4>
      <p md-line class="demo-secondary-text"> {{folder.updated}} </p>
   </md-list-item>
   <md-divider></md-divider>
   <h3 md-subheader>Notes</h3>
   <md-list-item *ngFor="#note of notes">
      <i md-list-avatar class="material-icons">note</i>
      <h4 md-line>{{note.name}}</h4>
      <p md-line class="demo-secondary-text"> {{note.updated}} </p>
   </md-list-item>   
</md-list>
```

Output:

<img src="https://material.angularjs.org/material2_assets/list/subheader-list.png">

### Lists with secondary text
Secondary text styling will be part of a broader typography module to 
[come later](https://github.com/angular/material2/issues/205), and won’t be implemented as part of this component 
specifically. Gray text in the examples above comes from a "demo-2" class added manually by the demo.

### Lists with `*ngIf`

If you'd like to use `*ngIf` on one of your list item lines, make sure to use `<template [ngIf]>` syntax rather than 
the `*ngIf` shortcut (see example below).  There is currently an [issue in the main Angular repo](https://github.com/angular/angular/issues/6303) 
that will project the line into the wrong content container if the shortcut is used.   

```html
<md-list-item>
  <h3 md-line> Some heading </h3>
  <template [ngIf]="showLine">
    <p md-line> Some text </p>
  </template>
</md-list-item>
```