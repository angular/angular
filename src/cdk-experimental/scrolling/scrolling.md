**Warning: this component is still experimental. It may have bugs and the API may change at any
time**

### Scrolling over items with different sizes
When the items have different or unknown sizes, you can use the `AutoSizeVirtualScrollStrategy`.
This can be added to your viewport by using the `autosize` directive.

```html
<cdk-virtual-scroll-viewport autosize>
  ...
</cdk-virtual-scroll-viewport>
```

The `autosize` strategy is configured through two inputs: `minBufferPx` and `maxBufferPx`.

**`minBufferPx`** determines the minimum space outside virtual scrolling viewport that will be
filled with content. Increasing this will increase the amount of content a user will see before more
content must be rendered. However, too large a value will cause more content to be rendered than is
necessary.

**`maxBufferPx`** determines the amount of content that will be added incrementally as the viewport
is scrolled. This should be greater than the size of `minBufferPx` so that one "render" is needed at
a time.

```html
<cdk-virtual-scroll-viewport autosize minBufferPx="50" maxBufferPx="100">
  ...
</cdk-virtual-scroll-viewport>
```

Because the auto size strategy needs to measure the size of the elements, its performance may not
be as good as the fixed size strategy. 
