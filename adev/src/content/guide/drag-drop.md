# Drag and drop

## Overview
This page describes the drag and drop directives which lets you quickly create drag and drop interfaces with the following:
- Free dragging
- Create a list of reorderable draggable elements
- Transfer draggable elements between lists
- Dragging animations
- Lock draggable elements along an axis or element
- Add custom drag handles
- Add previews on drag
- Add custom drag placeholder

For the full API reference, please see the [Angular CDK's drag and drop API reference page](api#angular_cdk_drag-drop).

## Before you start

### CDK Installation

The [Component Dev Kit (CDK)](https://material.angular.dev/cdk/categories) is a set of behavior primitives for building components. To use the drag and drop directives, first install `@angular/cdk` from npm. You can do this from your terminal using Angular CLI:

<docs-code language="shell">
  ng add @angular/cdk
</docs-code>

### Importing drag and drop

To use drag and drop, import what you need from the directives in your component.

<docs-code language="typescript">
import {Component} from '@angular/core';
import {CdkDrag} from '@angular/cdk/drag-drop';

@Component({
  selector: 'my-custom-component',
  templateUrl: 'my-custom-component.html',
  standalone: true,
  imports: [CdkDrag],
})
export class DragDropExample {}
</docs-code>

## Create draggable elements

You can make any element draggable by adding the `cdkDrag` directive. By default, all draggable elements support free dragging.

<docs-code-multifile preview path="adev/src/content/examples/drag-drop/src/overview/app/app.component.ts">
  <docs-code header="app/app.component.html" path="adev/src/content/examples/drag-drop/src/overview/app/app.component.html"/>
  <docs-code header="app/app.component.ts" path="adev/src/content/examples/drag-drop/src/overview/app/app.component.ts"/>
  <docs-code header="app/app.component.css" path="adev/src/content/examples/drag-drop/src/overview/app/app.component.css"/>
</docs-code-multifile>


## Create a list of reorderable draggable elements

Add the `cdkDropList` directive to a parent element to group draggable elements into a reorderable collection. This defines where draggable elements can be dropped. The draggable elements in the drop list group rearrange automatically as an element moves.

The drag and drop directives don't update your data model. To update the data model, listen to the `cdkDropListDropped` event (once the user finishes dragging) and update the data model manually.

<docs-code-multifile preview path="adev/src/content/examples/drag-drop/src/sorting/app/app.component.ts">
  <docs-code header="app/app.component.html" path="adev/src/content/examples/drag-drop/src/sorting/app/app.component.html"/>
  <docs-code header="app/app.component.ts" path="adev/src/content/examples/drag-drop/src/sorting/app/app.component.ts"/>
  <docs-code header="app/app.component.css" path="adev/src/content/examples/drag-drop/src/sorting/app/app.component.css"/>
</docs-code-multifile>

You can use the `CDK_DROP_LIST` injection token that can be used to reference instances of `cdkDropList`. For more information see the [dependency injection guide](https://angular.dev/guide/di) and the [drop list injection token API](api/cdk/drag-drop/CDK_DROP_LIST).

## Transfer draggable elements between lists

The `cdkDropList` directive supports transferring draggable elements between connected drop lists. There are two ways to connect one or more `cdkDropList` instances together:
- Set the `cdkDropListConnectedTo` property to another drop list.
- Wrap the elements in an element with the `cdkDropListGroup` attribute.

The `cdkDropListConnectedTo` directive works both with a direct reference to another `cdkDropList` or by referencing the id of another drop container.

<docs-code language="html">
<!-- This is valid -->
<div cdkDropList #listOne="cdkDropList" [cdkDropListConnectedTo]="[listTwo]"></div>
<div cdkDropList #listTwo="cdkDropList" [cdkDropListConnectedTo]="[listOne]"></div>

<!-- This is valid as well -->
<div cdkDropList id="list-one" [cdkDropListConnectedTo]="['list-two']"></div>
<div cdkDropList id="list-two" [cdkDropListConnectedTo]="['list-one']"></div>
</docs-code>

<docs-code-multifile preview path="adev/src/content/examples/drag-drop/src/connected-sorting/app/app.component.ts">
  <docs-code header="app/app.component.html" path="adev/src/content/examples/drag-drop/src/connected-sorting/app/app.component.html"/>
  <docs-code header="app/app.component.ts" path="adev/src/content/examples/drag-drop/src/connected-sorting/app/app.component.ts"/>
  <docs-code header="app/app.component.css" path="adev/src/content/examples/drag-drop/src/connected-sorting/app/app.component.css"/>
</docs-code-multifile>

Use the `cdkDropListGroup` directive if you have an unknown number of connected drop lists to set up the connection automatically. Any new `cdkDropList` that is added under a group automatically connects to all other lists.

<docs-code language="html">
<div cdkDropListGroup>
  <!-- All lists in here will be connected. -->
  @for (list of lists; track list) {
    <div cdkDropList></div>
  }
</div>
</docs-code>

<docs-code-multifile preview path="adev/src/content/examples/drag-drop/src/connected-sorting-group/app/app.component.ts">
  <docs-code header="app/app.component.html" path="adev/src/content/examples/drag-drop/src/connected-sorting-group/app/app.component.html"/>
  <docs-code header="app/app.component.ts" path="adev/src/content/examples/drag-drop/src/connected-sorting-group/app/app.component.ts"/>
  <docs-code header="app/app.component.css" path="adev/src/content/examples/drag-drop/src/connected-sorting-group/app/app.component.css"/>
</docs-code-multifile>

You can use the `CDK_DROP_LIST_GROUP` injection token that can be used to reference instances of `cdkDropListGroup`. For more information see the [dependency injection guide](https://angular.dev/guide/di) and the [drop list group injection token API](api/cdk/drag-drop/CDK_DROP_LIST_GROUP).

### Selective dragging

By default, a user can move `cdkDrag` elements from one container into another connected container. For more fine-grained control over which elements can be dropped into a container, use `cdkDropListEnterPredicate`. Angular calls the predicate whenever a draggable element enters a new container. Depending on whether the predicate returns true or false, the item may or may not be allowed into the new container.

<docs-code-multifile preview path="adev/src/content/examples/drag-drop/src/enter-predicate/app/app.component.ts">
  <docs-code header="app/app.component.html" path="adev/src/content/examples/drag-drop/src/enter-predicate/app/app.component.html"/>
  <docs-code header="app/app.component.ts" path="adev/src/content/examples/drag-drop/src/enter-predicate/app/app.component.ts"/>
  <docs-code header="app/app.component.css" path="adev/src/content/examples/drag-drop/src/enter-predicate/app/app.component.css"/>
</docs-code-multifile>

## Attach data

You can associate some arbitrary data with both `cdkDrag` and `cdkDropList` by setting `cdkDragData` or `cdkDropListData`, respectively. You can bind to the events fired from both directives that will include this data, allowing you to easily identify the origin of the drag or drop interaction.

<docs-code language="html">
@for (list of lists; track list) {
  <div cdkDropList [cdkDropListData]="list" (cdkDropListDropped)="drop($event)">
    @for (item of list; track item) {
      <div cdkDrag [cdkDragData]="item"></div>
    }
  </div>
}
</docs-code>

## Dragging customizations

### Customize drag handle

By default, the user can drag the entire `cdkDrag` element to move it around. To restrict the user to only be able to do so using a handle element, add the `cdkDragHandle` directive to an element inside of `cdkDrag`. You can have as many `cdkDragHandle` elements as you want.

<docs-code-multifile preview path="adev/src/content/examples/drag-drop/src/custom-handle/app/app.component.ts">
  <docs-code header="app/app.component.html" path="adev/src/content/examples/drag-drop/src/custom-handle/app/app.component.html"/>
  <docs-code header="app/app.component.ts" path="adev/src/content/examples/drag-drop/src/custom-handle/app/app.component.ts"/>
  <docs-code header="app/app.component.css" path="adev/src/content/examples/drag-drop/src/custom-handle/app/app.component.css"/>
</docs-code-multifile>


You can use the `CDK_DRAG_HANDLE` injection token that can be used to reference instances of `cdkDragHandle`. For more information see the [dependency injection guide](https://angular.dev/guide/di) and the [drag handle injection token API](api/cdk/drag-drop/CDK_DRAG_HANDLE).

### Customize drag preview

A preview element becomes visible when a `cdkDrag` element is being dragged. By default, the preview is a clone of the original element positioned next to the user's cursor.

To customize the preview, provide a custom template via `*cdkDragPreview`. The custom preview won't match the size of the original dragged element since assumptions aren't made about the element's content. To match the size of the element for the drag preview, pass true to the `matchSize` input.

The cloned element removes its id attribute in order to avoid having multiple elements with the same id on the page. This will cause any CSS that targets that id not to be applied.

<docs-code-multifile preview path="adev/src/content/examples/drag-drop/src/custom-preview/app/app.component.ts">
  <docs-code header="app/app.component.html" path="adev/src/content/examples/drag-drop/src/custom-preview/app/app.component.html"/>
  <docs-code header="app/app.component.ts" path="adev/src/content/examples/drag-drop/src/custom-preview/app/app.component.ts"/>
  <docs-code header="app/app.component.css" path="adev/src/content/examples/drag-drop/src/custom-preview/app/app.component.css"/>
</docs-code-multifile>

You can use the `CDK_DRAG_PREVIEW` injection token that can be used to reference instances of `cdkDragPreview`. For more information see the [dependency injection guide](https://angular.dev/guide/di) and the [drag preview injection token API](api/cdk/drag-drop/CDK_DRAG_PREVIEW).

### Customize drag insertion point

By default, Angular inserts the `cdkDrag` preview into the `<body>` of the page in order to avoid issues with positioning and overflow. This may not be desirable in some cases because the preview won't have its inherited styles applied.

You can change where Angular inserts the preview using the `cdkDragPreviewContainer` input on `cdkDrag`. The possible values are:

| Value                         | Description                                                                             | Advantages                                                                                                                  | Disadvantages                                                                                                                                                             |
|:---                           |:---                                                                                     |:---                                                                                                                         |:---                                                                                                                                                                       |
| `global`                      | Default value. Angular inserts the preview into the <body> or the closest shadow root.  | Preview won't be affected by `z-index` or `overflow: hidden`. It also won't affect `:nth-child` selectors and flex layouts. | Doesn't retain inherited styles.                                                                                                                                          |
| `parent`                      | Angular inserts the preview inside the parent of the element that is being dragged.     | Preview inherits the same styles as the dragged element.                                                                    | Preview may be clipped by `overflow: hidden` or be placed under other elements due to `z-index`. Furthermore, it can affect `:nth-child` selectors and some flex layouts. |
| `ElementRef` or `HTMLElement` | Angular inserts the preview into the specified element.                                 | Preview inherits styles from the specified container element.                                                               | Preview may be clipped by `overflow: hidden` or be placed under other elements due to `z-index`. Furthermore, it can affect `:nth-child` selectors and some flex layouts. |

Alternatively, you can modify the `CDK_DRAG_CONFIG` injection token to update `previewContainer` within the config if the value is `global` or `parent`. For more information see the [dependency injection guide](https://angular.dev/guide/di), [drag config injection token API](api/cdk/drag-drop/CDK_DRAG_CONFIG), and the [drag drop config API](api/cdk/drag-drop/DragDropConfig).

### Customize drag placeholder

While a `cdkDrag` element is being dragged, the directive creates a placeholder element that shows where the element will be placed when dropped. By default, the placeholder is a clone of the element that is being dragged. You can replace the placeholder with a custom one using the `*cdkDragPlaceholder` directive:

<docs-code-multifile preview path="adev/src/content/examples/drag-drop/src/custom-placeholder/app/app.component.ts">
  <docs-code header="app/app.component.html" path="adev/src/content/examples/drag-drop/src/custom-placeholder/app/app.component.html"/>
  <docs-code header="app/app.component.ts" path="adev/src/content/examples/drag-drop/src/custom-placeholder/app/app.component.ts"/>
  <docs-code header="app/app.component.css" path="adev/src/content/examples/drag-drop/src/custom-placeholder/app/app.component.css"/>
</docs-code-multifile>

You can use the `CDK_DRAG_PLACEHOLDER` injection token that can be used to reference instances of `cdkDragPlaceholder`. For more information see the [dependency injection guide](https://angular.dev/guide/di) and the [drag placeholder injection token API](api/cdk/drag-drop/CDK_DRAG_PLACEHOLDER).

### Customize drag root element

Set the `cdkDragRootElement` attribute if there's an element that you want to make draggable but you don't have direct access to it.

The attribute accepts a selector and looks up the DOM until it finds an element that matches the selector. If an element is found, it becomes draggable. This is useful for cases such as making a dialog draggable.

<docs-code-multifile preview path="adev/src/content/examples/drag-drop/src/root-element/app/app.component.ts">
  <docs-code header="app/app.component.html" path="adev/src/content/examples/drag-drop/src/root-element/app/app.component.html"/>
  <docs-code header="app/app.component.ts" path="adev/src/content/examples/drag-drop/src/root-element/app/app.component.ts"/>
  <docs-code header="app/app.component.css" path="adev/src/content/examples/drag-drop/src/root-element/app/app.component.css"/>
</docs-code-multifile>

Alternatively, you can modify the `CDK_DRAG_CONFIG` injection token to update `rootElementSelector` within the config. For more information see the [dependency injection guide](https://angular.dev/guide/di), [drag config injection token API](api/cdk/drag-drop/CDK_DRAG_CONFIG), and the [drag drop config API](api/cdk/drag-drop/DragDropConfig).

### Set DOM position of a draggable element

By default, `cdkDrag` elements not in a `cdkDropList` move from their normal DOM position only when a user manually moves the element. Use the `cdkDragFreeDragPosition` input to explicitly set the element’s position. A common use case for this is restoring a draggable element's position after a user has navigated away and then returned.

<docs-code-multifile preview path="adev/src/content/examples/drag-drop/src/free-drag-position/app/app.component.ts">
  <docs-code header="app/app.component.html" path="adev/src/content/examples/drag-drop/src/free-drag-position/app/app.component.html"/>
  <docs-code header="app/app.component.ts" path="adev/src/content/examples/drag-drop/src/free-drag-position/app/app.component.ts"/>
  <docs-code header="app/app.component.css" path="adev/src/content/examples/drag-drop/src/free-drag-position/app/app.component.css"/>
</docs-code-multifile>

### Restrict movement within an element

To stop the user from being able to drag a `cdkDrag` element outside of another element, pass a CSS selector to the `cdkDragBoundary` attribute. This attribute accepts a selector and looks up the DOM until it finds an element that matches it. If a match is found, the element becomes the boundary that the draggable element can't be dragged outside of `cdkDragBoundary` can also be used when `cdkDrag` is placed inside a `cdkDropList`.

<docs-code-multifile preview path="adev/src/content/examples/drag-drop/src/boundary/app/app.component.ts">
  <docs-code header="app/app.component.html" path="adev/src/content/examples/drag-drop/src/boundary/app/app.component.html"/>
  <docs-code header="app/app.component.ts" path="adev/src/content/examples/drag-drop/src/boundary/app/app.component.ts"/>
  <docs-code header="app/app.component.css" path="adev/src/content/examples/drag-drop/src/boundary/app/app.component.css"/>
</docs-code-multifile>

Alternatively, you can modify the `CDK_DRAG_CONFIG` injection token to update boundaryElement within the config. For more information see the [dependency injection guide](https://angular.dev/guide/di), [drag config injection token API](api/cdk/drag-drop/CDK_DRAG_CONFIG), and the [drag drop config API](api/cdk/drag-drop/DragDropConfig).

### Restrict movement along an axis

By default, `cdkDrag` allows free movement in all directions. To restrict dragging to a specific axis, set `cdkDragLockAxis` to either "x" or "y"on `cdkDrag`. To restrict dragging for multiple draggable elements within `cdkDropList`, set `cdkDropListLockAxis` on `cdkDropList` instead.

<docs-code-multifile preview path="adev/src/content/examples/drag-drop/src/axis-lock/app/app.component.ts">
  <docs-code header="app/app.component.html" path="adev/src/content/examples/drag-drop/src/axis-lock/app/app.component.html"/>
  <docs-code header="app/app.component.ts" path="adev/src/content/examples/drag-drop/src/axis-lock/app/app.component.ts"/>
  <docs-code header="app/app.component.css" path="adev/src/content/examples/drag-drop/src/axis-lock/app/app.component.css"/>
</docs-code-multifile>

Alternatively, you can modify the `CDK_DRAG_CONFIG` injection token to update `lockAxis` within the config. For more information see the [dependency injection guide](https://angular.dev/guide/di), [drag config injection token API](api/cdk/drag-drop/CDK_DRAG_CONFIG), and the [drag drop config API](api/cdk/drag-drop/DragDropConfig).

### Delay dragging

By default when the user puts their pointer down on a `cdkDrag`, the dragging sequence starts. This behavior might not be desirable in cases like fullscreen draggable elements on touch devices where the user might accidentally trigger a drag event as they scroll on the page.

You can delay the dragging sequence using the `cdkDragStartDelay` input. The input waits for the user to hold down their pointer for the specified number of milliseconds before dragging the element.

<docs-code-multifile preview path="adev/src/content/examples/drag-drop/src/delay-drag/app/app.component.ts">
  <docs-code header="app/app.component.html" path="adev/src/content/examples/drag-drop/src/delay-drag/app/app.component.html"/>
  <docs-code header="app/app.component.ts" path="adev/src/content/examples/drag-drop/src/delay-drag/app/app.component.ts"/>
  <docs-code header="app/app.component.css" path="adev/src/content/examples/drag-drop/src/delay-drag/app/app.component.css"/>
</docs-code-multifile>

Alternatively, you can modify the `CDK_DRAG_CONFIG` injection token to update dragStartDelay within the config. For more information see the [dependency injection guide](https://angular.dev/guide/di), [drag config injection token API](api/cdk/drag-drop/CDK_DRAG_CONFIG), and the [drag drop config API](api/cdk/drag-drop/DragDropConfig).

### Disable dragging

If you want to disable dragging for a particular drag item, set the `cdkDragDisabled` input on a `cdkDrag` item to true or false. You can disable an entire list using the `cdkDropListDisabled` input on a `cdkDropList`. It is also possible to disable a specific handle via `cdkDragHandleDisabled` on `cdkDragHandle`.

<docs-code-multifile preview path="adev/src/content/examples/drag-drop/src/disable-drag/app/app.component.ts">
  <docs-code header="app/app.component.html" path="adev/src/content/examples/drag-drop/src/disable-drag/app/app.component.html"/>
  <docs-code header="app/app.component.ts" path="adev/src/content/examples/drag-drop/src/disable-drag/app/app.component.ts"/>
  <docs-code header="app/app.component.css" path="adev/src/content/examples/drag-drop/src/disable-drag/app/app.component.css"/>
</docs-code-multifile>

Alternatively, you can modify the `CDK_DRAG_CONFIG` injection token to update `draggingDisabled` within the config.  For more information see the [dependency injection guide](https://angular.dev/guide/di), [drag config injection token API](api/cdk/drag-drop/CDK_DRAG_CONFIG), and the [drag drop config API](api/cdk/drag-drop/DragDropConfig).

## Sorting customizations

### List orientation

By default, the `cdkDropList` directive assumes lists are vertical. This can be changed by setting the `cdkDropListOrientation` property to horizontal.

<docs-code-multifile preview path="adev/src/content/examples/drag-drop/src/horizontal-sorting/app/app.component.ts">
  <docs-code header="app/app.component.html" path="adev/src/content/examples/drag-drop/src/horizontal-sorting/app/app.component.html"/>
  <docs-code header="app/app.component.ts" path="adev/src/content/examples/drag-drop/src/horizontal-sorting/app/app.component.ts"/>
  <docs-code header="app/app.component.css" path="adev/src/content/examples/drag-drop/src/horizontal-sorting/app/app.component.css"/>
</docs-code-multifile>

Alternatively, you can modify the `CDK_DRAG_CONFIG` injection token to update `listOrientation` within the config. For more information see the [dependency injection guide](https://angular.dev/guide/di), [drag config injection token API](api/cdk/drag-drop/CDK_DRAG_CONFIG), and the [drag drop config API](api/cdk/drag-drop/DragDropConfig).

### List wrapping

By default, the `cdkDropList` sorts the draggable elements by moving them around using a CSS transform. This allows for the sorting to be animated which provides a better user experience. However this also comes with the drawback that the drop list works only in one direction: vertically or horizontally.

If you have a sortable list that needs to wrap onto new lines, you can set `cdkDropListOrientation` attribute to `mixed`. This causes the list to use a different strategy of sorting the elements which involves moving them in the DOM. However the list can no longer animate the sorting action .

<docs-code-multifile preview path="adev/src/content/examples/drag-drop/src/mixed-sorting/app/app.component.ts">
  <docs-code header="app/app.component.html" path="adev/src/content/examples/drag-drop/src/mixed-sorting/app/app.component.html"/>
  <docs-code header="app/app.component.ts" path="adev/src/content/examples/drag-drop/src/mixed-sorting/app/app.component.ts"/>
  <docs-code header="app/app.component.css" path="adev/src/content/examples/drag-drop/src/mixed-sorting/app/app.component.css"/>
</docs-code-multifile>

### Selective sorting

By default, `cdkDrag` elements are sorted into any position inside of a `cdkDropList`. To change this behavior, set the `cdkDropListSortPredicate` attribute which takes in a function. The predicate function is called whenever a draggable element is about to be moved into a new index within the drop list. If the predicate returns true, the item will be moved into the new index, otherwise it will keep its current position.

<docs-code-multifile preview path="adev/src/content/examples/drag-drop/src/sort-predicate/app/app.component.ts">
  <docs-code header="app/app.component.html" path="adev/src/content/examples/drag-drop/src/sort-predicate/app/app.component.html"/>
  <docs-code header="app/app.component.ts" path="adev/src/content/examples/drag-drop/src/sort-predicate/app/app.component.ts"/>
  <docs-code header="app/app.component.css" path="adev/src/content/examples/drag-drop/src/sort-predicate/app/app.component.css"/>
</docs-code-multifile>


### Disable sorting

There are cases where draggable elements can be dragged out of one `cdkDropList` into another, however the user shouldn't be able to sort them within the source list. For these cases, add the `cdkDropListSortingDisabled` attribute to prevent the draggable elements in a `cdkDropList` from sorting. This preserves the dragged element's initial position in the source list if it does not get dragged to a new valid position.

<docs-code-multifile preview path="adev/src/content/examples/drag-drop/src/disable-sorting/app/app.component.ts">
  <docs-code header="app/app.component.html" path="adev/src/content/examples/drag-drop/src/disable-sorting/app/app.component.html"/>
  <docs-code header="app/app.component.ts" path="adev/src/content/examples/drag-drop/src/disable-sorting/app/app.component.ts"/>
  <docs-code header="app/app.component.css" path="adev/src/content/examples/drag-drop/src/disable-sorting/app/app.component.css"/>
</docs-code-multifile>

Alternatively, you can modify the `CDK_DRAG_CONFIG` injection token to update sortingDisabled within the config. For more information see the [dependency injection guide](https://angular.dev/guide/di), [drag config injection token API](api/cdk/drag-drop/CDK_DRAG_CONFIG), and the [drag drop config API](api/cdk/drag-drop/DragDropConfig).

## Customize animations

Drag and drop supports animations for both:
- Sorting an draggable element inside a list
- Moving the draggable element from the position that the user dropped it to the final position inside the list

To set up your animations, define a CSS transition that targets the transform property. The following classes can be used for animations:

| CSS class name      | Result of adding transition                                                                                                                                                                                 |
|:---                 |:---                                                                                                                                                                                                         |
| .cdk-drag           | Animate draggable elements as they are being sorted.                                                                                                                                                        |
| .cdk-drag-animating | Animate the draggable element from its dropped position to the final position within the `cdkDropList`.<br><br>This CSS class is applied to a `cdkDrag` element only when the dragging action has stopped.  |

## Styling

Both `cdkDrag` and `cdkDropList` directives only apply essential styles needed for functionality. Applications can customize their styles by targeting these specified CSS classes.


| CSS class name            | Description                                                                                                                                                                                                                                                                                             |
|:---                       |:---                                                                                                                                                                                                                                                                                                     |
| .cdk-drop-list            | Selector for the `cdkDropList` container elements.                                                                                                                                                                                                                                                      |
| .cdk-drag                 | Selector for `cdkDrag` elements.                                                                                                                                                                                                                                                                        |
| .cdk-drag-disabled        | Selector for disabled `cdkDrag` elements.                                                                                                                                                                                                                                                               |
| .cdk-drag-handle          | Selector for the host element of the `cdkDragHandle`.                                                                                                                                                                                                                                                   |
| .cdk-drag-preview         | Selector for the drag preview element. This is the element that appears next to the cursor as a user drags an element in a sortable list.<br><br>The element looks exactly like the element that is being dragged unless customized with a custom template through `*cdkDragPreview`.                   |
| .cdk-drag-placeholder     | Selector for the drag placeholder element. This is the element that is shown in the spot where the draggable element will be dragged to once the dragging action ends.<br><br>This element looks exactly like the element that is being sorted unless customized with the cdkDragPlaceholder directive. |
| .cdk-drop-list-dragging   | Selector for `cdkDropList` container element that has a draggable element currently being dragged.                                                                                                                                                                                                      |
| .cdk-drop-list-disabled   | Selector for `cdkDropList` container elements that are disabled.                                                                                                                                                                                                                                        |
| .cdk-drop-list-receiving  | Selector for `cdkDropList` container element that has a draggable element it can receive from a connected drop list that is currently being dragged.                                                                                                                                                    |
