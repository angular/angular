Badges are small status descriptors for UI elements. A badge consists of a small circle, 
typically containing a number or other short set of characters, that appears in proximity to
another object.

<!-- example(badge-overview) -->

### Badge position
By default, the badge will be placed `above after`. The direction can be changed by defining
the attribute `matBadgePosition` follow by `above|below` and `before|after`.

```html
<mat-icon matBadge="22" matBadgePosition="above after">home</mat-icon>
```

The overlap of the badge in relation to its inner contents can also be defined
using the `matBadgeOverlap` tag. Typically, you want the badge to overlap an icon and not
a text phrase. By default it will overlap.

```html
<h1 matBadge="11" matBadgeOverlap="false">
  Email
</h1>
```

### Badge sizing
The badge has 3 sizes: `small`, `medium` and `large`. By default, the badge is set to `medium`.
You can change the size by adding `matBadgeSize` to the host element.

```html
<h1 matBadge="11" matBadgeSize="large">
  Email
</h1>
```

### Badge visibility
The badge visibility can be toggled programmatically by defining `matBadgeHidden`.

```html
<h1 matBadge="11" [matBadgeHidden]="!visible">
  Email
</h1>
```

### Theming
Badges can be colored in terms of the current theme using the `matBadgeColor` property to set the
background color to `primary`, `accent`, or `warn`.

```html
<mat-icon matBadge="22" matBadgeColor="accent">
  home
</mat-icon>
```

### Accessibility
Badges should be given a meaningful description via `matBadgeDescription`. This description will be
applied, via `aria-describedby` to the element decorated by `matBadge`.

When applying a badge to a `<mat-icon>`, it is important to know that the icon is marked as
`aria-hidden` by default. If the combination of icon and badge communicates some meaningful
information, that information should be surfaced in another way. [See the guidance on indicator
icons for more information](https://material.angular.io/components/icon/overview#indicator-icons).
