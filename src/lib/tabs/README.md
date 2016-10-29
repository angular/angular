# MdTabGroup
Tab groups allow the user to organize their content by labels such that only one tab is visible at any given time.

## `<md-tab-group>`
### Properties

| Name | Type | Description |
| --- | --- | --- |
| `selectedIndex` | `number` | The index of the currently active tab. |

### Events

| Name | Type | Description |
| --- | --- | --- |
| `focusChange` | `Event` | Fired when focus changes from one label to another |
| `selectChange` | `Event` | Fired when the selected tab changes |

### Basic use
A basic tab group would have the following markup.
```html
<md-tab-group>
  <md-tab label="One">
    <h1>Some tab content</h1>
    <p>...</p>
  </md-tab>
  <md-tab label="Two">
    <h1>Some more tab content</h1>
    <p>...</p>
  </md-tab>
</md-tab-group>
```

You can specifiy the active tab by using the `selectedIndex` property.

```html
<md-tab-group [selectedIndex]="1">
  ...
</md-tab-group>
```

**Note**: The index always starts counting from `zero`.


### Tabs with label templates
If you want to use an arbitrary template for your tab, you can use the `md-tab-label` directive to
provide the label template:
```html
<md-tab-group>
  <md-tab>
    <template md-tab-label>
      The <em>best</em> pasta
    </template>
    <h1>Best pasta restaurants</h1>
    <p>...</p>
  </md-tab>
  <md-tab>
    <template md-tab-label>
      <md-icon>thumb_down</md-icon> The worst sushi
    </template>
    <h1>Terrible sushi restaurants</h1>
    <p>...</p>
  </md-tab>
</md-tab-group>
```
