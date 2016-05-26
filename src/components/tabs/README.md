# MdTabGroup
Tab groups allow the user to organize their content by labels such that only one tab is visible at any given time.

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

## `<md-tab-group>`
### Properties

| Name | Type | Description |
| --- | --- | --- |
| `selectedIndex` | `number` | The index of the currently active tab. |
