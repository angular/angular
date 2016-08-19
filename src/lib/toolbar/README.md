# MdToolbar
`MdToolbar` is a vertical aligned bar, which can hold the application title or actions.

### Screenshots
![Preview](https://cloud.githubusercontent.com/assets/4987015/13727769/6d952c78-e900-11e5-890a-ccfd46996812.png)

## `<md-toolbar>`
### Bound Properties

| Name | Type | Description |
| --- | --- | --- |
| `color` | `"primary" | "accent" | "warn"` | The color palette for the toolbar |

### Notes
The `md-toolbar` component will use by default the background palette.

### Examples
A basic toolbar would have the following markup.
```html
<md-toolbar [color]="myColor">
  <span>My Application Title</span>
</md-toolbar>
```

Toolbars can also have multiple rows.<br/>
Multiple rows inside of a `md-toolbar` can be added by appending as many as needed `<md-toolbar-row>` elements.

```html
<md-toolbar [color]="myColor">
  <span>First Row</span>
  
  <md-toolbar-row>
    <span>Second Row</span>
  </md-toolbar-row>
  
  <md-toolbar-row>
    <span>Third Row</span>
  </md-toolbar-row>
</md-toolbar>
```

### Alignment
The alignment inside of a toolbar row can be easily done by using the flexbox layout.<br/>
For example, the following markup aligns the items on the `right`.

Custom HTML
```html
<md-toolbar color="primary">
  <span>Application Title</span>
  
  <!-- This fills the remaining space of the current row -->
  <span class="example-fill-remaining-space"></span>
  
  <span>Right Aligned Text</span>
</md-toolbar>
```

Custom SCSS
```scss
.example-fill-remaining-space {
  // This fills the remaining space, by using flexbox. 
  // Every toolbar row uses a flexbox row layout.
  flex: 1 1 auto;
}
```

Output
![image](https://cloud.githubusercontent.com/assets/4987015/13730760/0864894e-e959-11e5-9312-7f3cb990d80a.png)
