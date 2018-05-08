The `mat-tree` provides a Material Design styled tree that can be used to display hierarchy
data.

This tree builds on the foundation of the CDK tree and uses a similar interface for its
data source input and template, except that its element and attribute selectors will be prefixed
with `mat-` instead of `cdk-`.

There are two types of trees: Flat tree and nested tree. The DOM structures are different for these
two types of trees.

#### Flat tree
In a flat tree, the hierarchy is flattened; nodes are not rendered inside of each other,
but instead are rendered as siblings in sequence. An instance of `TreeFlattener` is
used to generate the flat list of items from hierarchical data. The "level" of each tree
node is read through the `getLevel` method of the `TreeControl`; this level can be
used to style the node such that it is indented to the appropriate level.


```html
<mat-tree>
  <mat-tree-node> parent node </mat-tree-node>
  <mat-tree-node> -- child node1 </mat-tree-node>
  <mat-tree-node> -- child node2 </mat-tree-node>
</mat-tree>
```

<!-- example(tree-flat-overview) -->

Flat trees are generally easier to style and inspect. They are also more friendly to
scrolling variations, such as infinite or virtual scrolling

<!--TODO(tinayuangao): Add a flat tree example here -->

#### Nested tree
In Nested tree, children nodes are placed inside their parent node in DOM. The parent node has an
outlet to keep all the children nodes.

```html
<mat-tree>
   <mat-nested-tree-node>
     parent node
     <mat-nested-tree-node> -- child node1 </mat-nested-tree-node>
     <mat-nested-tree-node> -- child node2 </mat-nested-tree-node>
   </mat-nested-tree-node>
</mat-tree>
```

<!-- example(tree-nested-overview) -->

Nested trees are easier to work with when hierarchical relationships are visually
represented in ways that would be difficult to accomplish with flat nodes.

<!--TODO(tinayuangao): Add a nested tree example here -->

### Features

The `<mat-tree>` itself only deals with the rendering of a tree structure.
Additional features can be built on top of the tree by adding behavior inside node templates
(e.g., padding and toggle). Interactions that affect the
rendered data (such as expand/collapse) should be propagated through the table's data source.

### TreeControl

The `TreeControl` controls the expand/collapse state of tree nodes. Users can expand/collapse a tree
node recursively through tree control. For nested tree node, `getChildren` function need to pass to
the `NestedTreeControl` to make it work recursively. For flattened tree node, `getLevel` and
`isExpandable` functions need to pass to the `FlatTreeControl` to make it work recursively.

### Toggle

A `matTreeNodeToggle` can be added in the tree node template to expand/collapse the tree node. The
toggle toggles the expand/collapse functions in `TreeControl` and is able to expand/collapse a
tree node recursively by setting `[matTreeNodeToggleRecursive]` to `true`.

The toggle can be placed anywhere in the tree node, and is only toggled by `click` action.


### Padding (Flat tree only)

The `matTreeNodePadding` can be placed in a flat tree's node template to display the `level`
information of a flat tree node.

Nested tree does not need this padding since padding can be easily added to the hierarchy
structure in DOM.


### Accessibility
Trees without text or labels should be given a meaningful label via `aria-label` or
`aria-labelledby`. The `aria-readonly` defaults to `true` if it's not set.

Tree's role is `tree`.
Parent nodes are given `role="group"`, while leaf nodes are given `role="treeitem"`

`mat-tree` does not manage any focus/keyboard interaction on its own. Users can add desired
focus/keyboard interactions in their application.
