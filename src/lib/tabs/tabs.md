Angular Material tabs organize content into separate views where only one view can be
visible at a time. Each tab's label is shown in the tab header and the active
tab's label is designated with the animated ink bar. When the list of tab labels exceeds the width
of the header, pagination controls appear to let the user scroll left and right across the labels.

The active tab may be set using the `selectedIndex` input or when the user selects one of the
tab labels in the header.

<!-- example(tabs-overview) -->

### Events

The `selectChange` output event is emitted when the active tab changes.

The `focusChange` output event is emitted when the user puts focus on any of the tab labels in
the header, usually through keyboard navigation.

### Labels

If a tab's label is only text then the simple tab-group API can be used.

```html
<mat-tab-group>
  <mat-tab label="One">
    <h1>Some tab content</h1>
    <p>...</p>
  </mat-tab>
  <mat-tab label="Two">
    <h1>Some more tab content</h1>
    <p>...</p>
  </mat-tab>
</mat-tab-group>
```

For more complex labels, add a template with the `mat-tab-label` directive inside the `mat-tab`.

```html
<mat-tab-group>
  <mat-tab>
    <ng-template mat-tab-label>
      The <em>best</em> pasta
    </ng-template>
    <h1>Best pasta restaurants</h1>
    <p>...</p>
  </mat-tab>
  <mat-tab>
    <ng-template mat-tab-label>
      <mat-icon>thumb_down</mat-icon> The worst sushi
    </ng-template>
    <h1>Terrible sushi restaurants</h1>
    <p>...</p>
  </mat-tab>
</mat-tab-group>
```

### Dynamic Height

By default, the tab group will not change its height to the height of the currently active tab. To
change this, set the `dynamicHeight` input to true. The tab body will animate its height according
 to the height of the active tab.

### Tabs and navigation
While `<mat-tab-group>` is used to switch between views within a single route, `<nav mat-tab-nav-bar>`
provides a tab-like UI for navigating between routes.
```html
<nav mat-tab-nav-bar>
  <a mat-tab-link
     *ngFor="let link of navLinks"
     [routerLink]="link.path"
     routerLinkActive #rla="routerLinkActive"
     [active]="rla.isActive">
    {{link.label}}
  </a>
</nav>

<router-outlet></router-outlet>
```

The `tab-nav-bar` is not tied to any particular router; it works with normal `<a>` elements and uses
the `active` property to determine which tab is currently active. The corresponding
`<router-outlet>` can be placed anywhere in the view.

### Accessibility
Tabs without text or labels should be given a meaningful label via `aria-label` or
`aria-labelledby`. For `MatTabNav`, the `<nav>` element should have a label as well.


#### Keyboard shortcuts

| Shortcut             | Action                     |
|----------------------|----------------------------|
| `LEFT_ARROW`         | Move focus to previous tab |
| `RIGHT_ARROW`        | Move focus to next tab     |
| `SPACE` or `ENTER`   | Switch to focused tab      |
