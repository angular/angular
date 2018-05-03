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
| `after`   | Display to the right in left-to-right layout and to the left in right-to-left layout|

<!-- example(tooltip-position) -->

### Showing and hiding

By default, the tooltip will be immediately shown when the user's mouse hovers over the tooltip's
trigger element and immediately hides when the user's mouse leaves. 

On mobile, the tooltip is displayed when the user longpresses the element and hides after a
delay of 1500ms. The longpress behavior requires HammerJS to be loaded on the page. To learn more
about adding HammerJS to your app, check out the Gesture Support section of the Getting Started 
guide.

#### Show and hide delays

To add a delay before showing or hiding the tooltip, you can use the inputs `matTooltipShowDelay` 
and `matTooltipHideDelay` to provide a delay time in milliseconds.

The following example has a tooltip that waits one second to display after the user
hovers over the button, and waits two seconds to hide after the user moves the mouse away.

<!-- example(tooltip-delay) -->

#### Changing the default delay behavior

You can configure your app's tooltip default show/hide delays by configuring and providing
your options using the `MAT_TOOLTIP_DEFAULT_OPTIONS` injection token.

<!-- example(tooltip-modified-defaults) -->

#### Manually calling show() and hide()

To manually cause the tooltip to show or hide, you can call the `show` and `hide` directive methods,
which both accept a number in milliseconds to delay before applying the display change.

<!-- example(tooltip-manual) -->

#### Disabling the tooltip from showing

To completely disable a tooltip, set `matTooltipDisabled`. While disabled, a tooltip will never be 
shown.

### Accessibility

Elements with the `matTooltip` will add an `aria-describedby` label that provides a reference
to a visually hidden element containing the tooltip's message. This provides screenreaders the
information needed to read out the tooltip's contents when the end-user focuses on the element
triggering the tooltip. The element referenced via `aria-describedby` is not the tooltip itself,
but instead an invisible copy of the tooltip content that is always present in the DOM.

If a tooltip will only be shown manually via click, keypress, etc., then extra care should be taken
such that the action behaves similarly for screen-reader users. One possible approach would be
to use the `LiveAnnouncer` from the `cdk/a11y` package to announce the tooltip content on such
an interaction.
