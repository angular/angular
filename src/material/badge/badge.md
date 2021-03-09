Badges are small status descriptors for UI elements. A badge consists of a small circle, 
typically containing a number or other short set of characters, that appears in proximity to
another object.

Badges must always be applied to [block-level elements][block-level].

[block-level]: https://developer.mozilla.org/en-US/docs/Web/HTML/Block-level_elements

<!-- example(badge-overview) -->

### Badge position
By default, the badge will be placed `above after`. The direction can be changed by defining
the attribute `matBadgePosition` follow by `above|below` and `before|after`.

<!-- example({"example":"badge-overview",
              "file":"badge-overview-example.html", 
              "region":"mat-badge-position"}) -->

The overlap of the badge in relation to its inner contents can also be defined
using the `matBadgeOverlap` tag. Typically, you want the badge to overlap an icon and not
a text phrase. By default it will overlap.

<!-- example({"example":"badge-overview",
              "file":"badge-overview-example.html", 
              "region":"mat-badge-overlap"}) -->

### Badge sizing
The badge has 3 sizes: `small`, `medium` and `large`. By default, the badge is set to `medium`.
You can change the size by adding `matBadgeSize` to the host element.

<!-- example({"example":"badge-overview",
              "file":"badge-overview-example.html", 
              "region":"mat-badge-size"}) -->

### Badge visibility
The badge visibility can be toggled programmatically by defining `matBadgeHidden`.

<!-- example({"example":"badge-overview",
              "file":"badge-overview-example.html", 
              "region":"mat-badge-hide"}) -->

### Theming
Badges can be colored in terms of the current theme using the `matBadgeColor` property to set the
background color to `primary`, `accent`, or `warn`.

<!-- example({"example":"badge-overview",
              "file":"badge-overview-example.html", 
              "region":"mat-badge-color"}) -->

### Accessibility
Badges should be given a meaningful description via `matBadgeDescription`. This description will be
applied, via `aria-describedby` to the element decorated by `matBadge`.

When applying a badge to a `<mat-icon>`, it is important to know that the icon is marked as
`aria-hidden` by default. If the combination of icon and badge communicates some meaningful
information, that information should be surfaced in another way. [See the guidance on indicator
icons for more information](https://material.angular.io/components/icon/overview#indicator-icons).
