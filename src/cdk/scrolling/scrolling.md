The `scrolling` package provides helpers for directives that react to scroll events.

### cdkScrollable and ScrollDispatcher
The `cdkScrollable` directive and the `ScrollDispatcher` service together allow components to
react to scrolling in any of its ancestor scrolling containers.

The `cdkScrollable` directive should be applied to any element that acts as a scrolling container.
This marks the element as a `Scrollable` and registers it with the `ScrollDispatcher`. The
dispatcher, then, allows components to share both event listeners and knowledge of all of the
scrollable containers in the application.

### ViewportRuler
The `ViewportRuler` is a service that can be injected and used to measure the bounds of the browser
viewport.

### Virtual scrolling
The `<cdk-virtual-scroll-viewport>` displays large lists of elements performantly by only
rendering the items that fit on-screen. Loading hundreds of elements can be slow in any browser;
virtual scrolling enables a performant way to simulate all items being rendered by making the
height of the container element the same as the height of total number of elements to be rendered,
and then only rendering the items in view. Virtual scrolling is different from strategies like
infinite scroll where it renders a set amount of elements and then when you hit the end renders the
rest.

#### Creating items in the viewport
`*cdkVirtualFor` replaces `*ngFor` inside of a `<cdk-virtual-scroll-viewport>`, supporting the exact
same API as [`*ngFor`](https://angular.io/api/common/NgForOf). The simplest usage just specifies the
list of items:

```html
<cdk-virtual-scroll-viewport itemSize="50">
  <div *cdkVirtualFor="let item of items">{{item}}</div>
</cdk-virtual-scroll-viewport>
```

`*cdkVirtualFor` makes the following context variables available to the template:

| Context variable | Description                                        |
|------------------|----------------------------------------------------|
| `index`          | The index of the item in the data source.          |
| `count`          | The total number of items in the data source.      |
| `first`          | Whether this is the first item in the data source. |
| `last`           | Whether this is the last item in the data source.  |
| `even`           | Whether the `index` is even.                       |
| `odd`            | Whether the `index` is odd.                        |

All of these apply to the index of the item in the data source, not the index in the rendered
portion of the data.

```html
<cdk-virtual-scroll-viewport itemSize="50">
  <div *cdkVirtualFor="let item of items;
                       let index = index;
                       let count = count">
    {{item}} ({{index}} of {{count}})
  </div>
</cdk-virtual-scroll-viewport>
```

A `trackBy` function can be specified and works the same as the `*ngFor` `trackBy`. The `index`
passed to the tracking function will be the index in the data source, not the index in the rendered
portion.

##### View recycling
To improve rendering performance, `*cdkVirtualFor` caches previously created views after
they are no longer needed. When a new view would normally be created, a cached view
is reused instead. The size of the view cache can be adjusted via the `templateCacheSize`
property; setting this size to `0` disables caching. If your templates are expensive in terms of
memory you may wish to reduce this number to avoid spending too much memory on the template cache.

```html
<cdk-virtual-scroll-viewport itemSize="50">
  <div *cdkVirtualFor="let item of items; templateCacheSize: 0">{{item}}</div>
</cdk-virtual-scroll-viewport>
```

##### Specifying data
`*cdkVirtualFor` accepts data from an `Array`, `Observable<Array>`, or `DataSource`. The
`DataSource` for the virtual scroll is the same one used by the table and tree components. A
`DataSource` is simply an abstract class that has two methods: `connect` and `disconnect`. The
`connect` method will be called by the virtual scroll viewport to receive a stream that emits the
data array that should be rendered. The viewport will call `disconnect` when the viewport is
destroyed, which may be the right time to clean up any subscriptions that were registered during the
connect process.

#### Scrolling over fixed size items
When all items are the same fixed size, you can use the `FixedSizeVirtualScrollStrategy`. This can
be easily added to your viewport using the `itemSize` directive. The advantage of this constraint is
that it allows for better performance, since items do not need to be measured as they are rendered. 

```html
<cdk-virtual-scroll-viewport itemSize="50">
  ...
</cdk-virtual-scroll-viewport>
```

The fixed size strategy also supports setting a couple of buffer parameters that determine how much
extra content is rendered beyond what is visible in the viewport. The first of these parameters is
`minBufferPx`. The `minBufferPx` is the minimum amount of content buffer (in pixels) that the
viewport must render. If the viewport ever detects that there is less buffered content it will
immediately render more. The second buffer parameter is `maxBufferPx`. This tells the viewport how 
much buffer space to render back up to when it detects that more buffer is required.

The interaction of these two buffer parameters can be best illustrated with an example. Supposed 
that we have the following parameters: `itemSize = 50`, `minBufferPx = 100`, `maxBufferPx = 250`. As
the user is scrolling through the content the viewport detects that there is only `90px` of buffer
remaining. Since this is below `minBufferPx` the viewport must render more buffer. It must render at
least enough buffer to get back to `maxBufferPx`. In this case, it renders 4 items (an additional
`200px`) to bring the total buffer size to `290px`, back above `maxBufferPx`.

```html
<cdk-virtual-scroll-viewport itemSize="50" minBufferPx="100" maxBufferPx="250">
  ...
</cdk-virtual-scroll-viewport>
```

Other virtual scrolling strategies can be implemented by extending `VirtualScrollStrategy`. An
autosize strategy that works on elements of differing sizes is currently being developed in
`@angular/cdk-experimental`, but it is not ready for production use yet. 

### Viewport orientation
The virtual-scroll viewport defaults to a vertical orientation, but can also be set to
`orientation="horizontal"`. When changing the orientation, ensure that the item are laid
out horizontally via CSS. To do this you may want to target CSS at
`.cdk-virtual-scroll-content-wrapper` which is the wrapper element that contains the rendered
content.

```html
<cdk-virtual-scroll-viewport itemSize="50" orientation="horizontal">
  ...
</cdk-virtual-scroll-viewport>
```

### Elements with parent tag requirements
Some HTML elements such as `<tr>` and `<li>` have limitations on the kinds of parent elements they
can be placed inside. To enable virtual scrolling over these type of elements, place the elements in
their proper parent, and then wrap the whole thing in a `cdk-virtual-scroll-viewport`. Be careful
that the parent does not introduce additional space (e.g. via `margin` or `padding`) as it will
interfere with the scrolling.

```html
<cdk-virtual-scroll-viewport itemSize="50">
  <table>
    <tr *cdkVirtualFor="let row of rows">
      <td>{{row.first}}</td>
      <td>{{row.second}}</td>
    </tr>
  </table>
</cdk-virtual-scroll-viewport>
```
