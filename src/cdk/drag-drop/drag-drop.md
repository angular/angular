The `@angular/cdk/drag-drop` module provides you with a way to easily and declaratively create
drag-and-drop interfaces, with support for free dragging, sorting within a list, transferring items
between lists, animations, touch devices, custom drag handles, previews, and placeholders,
in addition to horizontal lists and locking along an axis.

### Getting started
Start by importing `DragDropModule` into the `NgModule` where you want to use drag-and-drop
features. You can now add the `cdkDrag` directive to elements to make them draggable. When
outside of a `<cdk-drop>` element, draggable elements can be freely moved around the page.
You can add `<cdk-drop>` elements to constrain where elements may be dropped.

<!-- example(cdk-drag-drop-overview) -->

### Reordering lists
Adding `<cdk-drop>` around a set of `cdkDrag` elements groups the draggables into a
reorderable collection. Items will automatically rearrange as an element moves. Note
that this will *not* update your data model; you can listen to the `dropped` event to
update the data model once the user finishes dragging.

<!-- example(cdk-drag-drop-sorting) -->

### Transferring items between lists
The `<cdk-drop>` component supports transferring dragged items between connected drop zones.
You can connect one or more `<cdk-drop>` instances together by setting the `connectedTo`
property.

<!-- example(cdk-drag-drop-connected-sorting) -->

Note that `connectedTo` works both with a direct reference to another `<cdk-drop>`, or by
referencing the `id` of another drop container:

```html
<!-- This is valid -->
<cdk-drop #listOne [connectedTo]="[listTwo]"></cdk-drop>
<cdk-drop #listTwo [connectedTo]="[listOne]"></cdk-drop>

<!-- This is valid as well -->
<cdk-drop id="list-one" [connectedTo]="['list-two']"></cdk-drop>
<cdk-drop id="list-two" [connectedTo]="['list-one']"></cdk-drop>
```

### Attaching data
You can associate some arbitrary data with both `cdkDrag` and `<cdk-drop>` by setting
`cdkDragData` or `data`, respectively. Events fired from both directives include this data,
allowing you to easily identify the origin of the drag or drop interaction.

```html
<cdk-drop [data]="list" *ngFor="let list of lists" (dropped)="drop($event)">
  <div cdkDrag [cdkDragData]="item" *ngFor="let item of list"></div>
</cdk-drop>
```

### Styling
The `cdkDrag` and `<cdk-drop>` directive include only those styles strictly necessary for
functionality. The application can then customize the elements by styling CSS classes added
by the directives:

| Selector            | Description                                                              |
|---------------------|--------------------------------------------------------------------------|
| `.cdk-drop`         | Corresponds to the `<cdk-drop>` container.                               |
| `.cdk-drag`         | Corresponds to a `cdkDrag` instance.                                     |
| `.cdk-drag-preview` | This is the element that will be rendered next to the user's cursor as they're dragging an item in a sortable list. By default the element looks exactly like the element that is being dragged. |
| `.cdk-drag-placeholder` | This is element that will be shown instead of the real element as it's being dragged inside a `<cdk-drop>`. By default this will look exactly like the element that is being sorted. |
| `.cdk-drop-dragging` | A class that is added to `<cdk-drop>` while the user is dragging an item. |

### Animations
The drag-and-drop module supports animations both while sorting an element inside a list, as well as
animating it from the position that the user dropped it to its final place in the list. To set up
your animations, you have to define a `transition` that targets the `transform` property. The
following classes can be used for animations:

* `.cdk-drag` - If you add a `transition` to this class, it'll animate as the user is sorting
    through a list.
* `.cdk-drag-animating` - This class is added to a `cdkDrag` when the user has stopped dragging.
    If you add a `transition` to it, the CDK will animate the element from its drop position to
    the final position inside the `<cdk-drop>` container.

Example animations:

```css
/* Animate items as they're being sorted. */
.cdk-drop-dragging .cdk-drag {
  transition: transform 250ms cubic-bezier(0, 0, 0.2, 1);
}

/* Animate an item that has been dropped. */
.cdk-drag-animating {
  transition: transform 300ms cubic-bezier(0, 0, 0.2, 1);
}
```

### Customizing the drag area using a handle
By default, the user can drag the entire `cdkDrag` element to move it around. If you want to
restrict the user to only be able to do so using a handle element, you can do it by adding the
`cdkDragHandle` directive to an element inside of `cdkDrag`. Note that you can have as many
`cdkDragHandle` elements as you want:

<!-- example(cdk-drag-drop-handle) -->

### Customizing the drag preview
When a `cdkDrag` element is picked up, it will create a preview element visible while dragging.
By default, this will be a clone of the original element positioned next to the user's cursor.
This preview can be customized, though, by providing a custom template via `*cdkDragPreview`:

<!-- example(cdk-drag-drop-custom-preview) -->

### List orientation
The `cdk-drop` component assumes that lists are vertical by default. This can be
changed by setting the `orientation` property to `"horizontal".

<!-- example(cdk-drag-drop-horizontal-sorting) -->

### Restricting movement along an axis
By default, `cdkDrag` allows free movement in all directions. To restrict dragging to a
specific axis, you can set `cdkDragLockAxis` on `cdkDrag` or `lockAxis` on `<cdk-drop>`
to either `"x"` or `"y"`.

<!-- example(cdk-drag-drop-axis-lock) -->
