The Angular Material tooltip provides a text label that is displayed when the user hovers
over or longpresses an element.

<!-- example(tooltip-overview) -->

### Positioning

The tooltip will be displayed below the element but this can be configured using the
`matTooltipPosition` input.
The tooltip can be displayed above, below, left, or right of the element. By default the position
will be below. If the tooltip should switch left/right positions in an RTL layout direction, then
the positions `before` and `after` should be used instead of `left` and `right`, respectively.

| Position  | Description                                                                          |
|-----------|--------------------------------------------------------------------------------------|
| `above`   | Always display above the element                                                     |
| `below `  | Always display beneath the element                                                   |
| `left`    | Always display to the left of the element                                            |
| `right`   | Always display to the right of the element                                           |
| `before`  | Display to the left in left-to-right layout and to the right in right-to-left layout |
| `after`   | Display to the right in left-to-right layout and to the right in right-to-left layout|


### Showing and hiding

The tooltip is immediately shown when the user's mouse hovers over the element and immediately
hides when the user's mouse leaves. A delay in showing or hiding the tooltip can be added through
the inputs `matTooltipShowDelay` and `matTooltipHideDelay`. The default show and hide delays can be
configured through the `MAT_TOOLTIP_DEFAULT_OPTIONS` injection token.

On mobile, the tooltip is displayed when the user longpresses the element and hides after a
delay of 1500ms. The longpress behavior requires HammerJS to be loaded on the page.

The tooltip can also be shown and hidden through the `show` and `hide` directive methods,
which both accept a number in milliseconds to delay before applying the display change.

To turn off the tooltip and prevent it from showing to the user, use the `matTooltipDisabled` input
flag.

### Accessibility

Elements with the `matTooltip` will add an `aria-describedby` label that provides a reference
to a visually hidden element containing the tooltip's message. This provides screenreaders the
information needed to read out the tooltip's contents when the end-user focuses on the element
triggering the tooltip.
