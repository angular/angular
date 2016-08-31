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

### Examples
A basic tab group would have the following markup.
```html
<md-tab-group>
  <md-tab>
    <template md-tab-label>One</template>
    <template md-tab-content>
      <h1>Some tab content</h1>
      <p>...</p>
    </template>
  </md-tab>
  <md-tab>
    <template md-tab-label>Two</template>
    <template md-tab-content>
      <h1>Some more tab content</h1>
      <p>...</p>
    </template>
  </md-tab>
</md-tab-group>
```

It is also possible to specifiy the active tab by using the `selectedIndex` property.

```html
<md-tab-group [selectedIndex]="1">
  ...
</md-tab-group>
```

**Note**: The index always starts counting from `zero`.
