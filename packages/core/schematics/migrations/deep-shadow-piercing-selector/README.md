## shadow-piercing selector `/deep/` to `::ng-deep`

Automatically migrates shadow-piercing selector from `/deep/` to `::ng-deep`.

#### Before
```css
:host /deep/ * {
  cursor: pointer;
}
```

#### After
```css
:host ::ng-deep * {
  cursor: pointer;
}
```
