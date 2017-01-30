`<md-toolbar>` is a container for headers, titles, or actions.

<!-- example(toolbar-overview) -->

### Multiple rows
Toolbars can have multiple rows using `<md-toolbar-row>` elements. Any content outside of an 
`<md-toolbar-row>` element are automatically placed inside of one at the begining of the toolbar.
Each toolbar row is a `display: flex` container.

```html
<md-toolbar>
  <span>First Row</span>
  
  <md-toolbar-row>
    <span>Second Row</span>
  </md-toolbar-row>
  
  <md-toolbar-row>
    <span>Third Row</span>
  </md-toolbar-row>
</md-toolbar>
```

### Positioning toolbar content
The toolbar does not perform any positioning of its content. This gives the user full power to 
position the content as it suits their application.

A common pattern is to position a title on the left with some actions on the right. This can be
easily accomplished with `display: flex`:
```html
<md-toolbar color="primary">
  <span>Application Title</span>
  
  <!-- This fills the remaining space of the current row -->
  <span class="example-fill-remaining-space"></span>
  
  <span>Right Aligned Text</span>
</md-toolbar>
```
```scss
.example-fill-remaining-space {
  // This fills the remaining space, by using flexbox. 
  // Every toolbar row uses a flexbox row layout.
  flex: 1 1 auto;
}
```

### Theming
The color of a `<md-toolbar>` can be changed by using the `color` property. By default, toolbars
use a neutral background color based on the current theme (light or dark). This can be changed to 
`'primary'`, `'accent'`, or `'warn'`.  
