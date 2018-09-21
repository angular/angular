The `<cdk-tree>` enables developers to build a customized tree experience for structured data. The
`<cdk-tree>` provides a foundation to build other features such as filtering on top of tree.
For a Material Design styled tree, see `<mat-tree>` which builds on top of the `<cdk-tree>`.

There are two types of trees: flat tree and nested Tree. The DOM structures are different for
these two types of trees.

#### Flat tree

<!-- example(cdk-tree-flat) -->


In a flat tree, the hierarchy is flattened; nodes are not rendered inside of each other, but instead
are rendered as siblings in sequence. An instance of `TreeFlattener` is used to generate the flat
list of items from hierarchical data. The "level" of each tree node is read through the `getLevel`
method of the `TreeControl`; this level can be used to style the node such that it is indented to
the appropriate level.

```html
<cdk-tree>
  <cdk-tree-node> parent node </cdk-tree-node>
  <cdk-tree-node> -- child node1 </cdk-tree-node>
  <cdk-tree-node> -- child node2 </cdk-tree-node>
</cdk-tree>

```

Flat trees are generally easier to style and inspect. They are also more friendly to scrolling
variations, such as infinite or virtual scrolling.


#### Nested tree

<!-- example(cdk-tree-nested) -->

In nested tree, children nodes are placed inside their parent node in DOM. The parent node contains
a node outlet into which children are projected.

```html
<cdk-tree>
  <cdk-nested-tree-node>
    parent node
    <cdk-nested-tree-node> -- child node1 </cdk-nested-tree-node>
    <cdk-nested-tree-node> -- child node2 </cdk-nested-tree-node>
  </cdk-nested-tree-node>
</cdk-tree>
```

Nested trees are easier to work with when hierarchical relationships are visually represented in
ways that would be difficult to accomplish with flat nodes.

### Using the CDK tree

#### Writing your tree template

The only thing you need to define is the tree node template. There are two types of tree nodes,
`<cdk-tree-node>` for flat tree and `<cdk-tree-nested-node> for nested tree`. The tree node
template defines the look of the tree node, expansion/collapsing control and the structure for
nested children nodes.

A node definition is specified via any element with `cdkNodeDef`. This directive exports the node
data to be used in any bindings in the node template.

```html
<cdk-tree-node *cdkNodeDef="let node">
  {{node.key}}: {{node.value}}
</cdk-tree-node>
```

##### Flat tree node template

Flat tree uses each node's `level` to render the hierarchy of the nodes.
The "indent" for a given node is accomplished by adding spacing to each node based on its level.
Spacing can be added either by applying the `cdkNodePadding` directive or by applying custom styles.


##### Nested tree node template

When using nested tree nodes, the node template must contain a `cdkTreeNodeOutlet`, which marks
where the children of the node will be rendered.

```html
<cdk-nested-tree-node *cdkNodeDef="let node">
  {{node.value}}
  <ng-container cdkTreeNodeOutlet></ng-container>
</cdk-nested-tree-node>

```

#### Adding expand/collapse

A `cdkTreeNodeToggle` can be added in the tree node template to expand/collapse the tree node.
The toggle toggles the expand/collapse functions in TreeControl and is able to expand/collapse
a tree node recursively by setting `[cdkTreeNodeToggleRecursive]` to true.

```html
<cdk-tree-node *cdkNodeDef="let node" cdkTreeNodeToggle [cdkTreeNodeToggleRecursive]="true">
    {{node.value}}
</cdk-tree-node>
```

The toggle can be placed anywhere in the tree node, and is only toggled by click action.
For best accessibility, `cdkTreeNodeToggle` should be on a button element and have an appropriate
`aria-label`.

```html
<cdk-tree-node *cdkNodeDef="let node">
  <button cdkTreeNodeToggle aria-label="toggle tree node" [cdkTreeNodeToggleRecursive]="true">
    <mat-icon>expand</mat-icon>
  </button>
  {{node.value}}
</cdk-tree-node>
```

#### Padding (Flat tree only)

The cdkTreeNodePadding can be placed in a flat tree's node template to display the level
information of a flat tree node.

```html
<cdk-tree-node *cdkNodeDef="let node" cdkNodePadding>
  {{node.value}}
</cdk-tree-node>

```

Nested tree does not need this padding since padding can be easily added to the hierarchy structure
in DOM.


#### Conditional template
The tree may include multiple node templates, where a template is chosen
for a particular data node via the `when` predicate of the template.


```html
<cdk-tree-node *cdkNodeDef="let node" cdkTreeNodePadding>
  {{node.value}}
</cdk-tree-node>
<cdk-tree-node *cdkNodeDef="let node; when: isSpecial" cdkTreeNodePadding>
  [ A special node {{node.value}} ]
</cdk-tree-node>
```

### Data Source

#### Connecting the tree to a data source

Similar to `cdk-table`, data is provided to the tree through a `DataSource`. When the tree receives
a `DataSource` it will call its `connect()` method which returns an observable that emits an array
of data. Whenever the data source emits data to this stream, the tree will render an update.

Because the data source provides this stream, it bears the responsibility of toggling tree
updates. This can be based on anything: tree node expansion change, websocket connections, user
interaction, model updates, time-based intervals, etc.


#### Flat tree

The flat tree data source is responsible for the node expansion/collapsing events, since when
the expansion status changes, the data nodes feed to the tree are changed. A new list of visible
nodes should be sent to tree component based on current expansion status.


#### Nested tree

The data source for nested tree has an option to leave the node expansion/collapsing event for each
tree node component to handle.

##### `trackBy`

To improve performance, a `trackBy` function can be provided to the tree similar to Angular’s
[`ngFor` `trackBy`](https://angular.io/api/common/NgForOf#change-propagation). This informs the
tree how to uniquely identify nodes to track how the data changes with each update.

```html
<cdk-tree [dataSource]="dataSource" [treeControl]="treeControl" [trackBy]="trackByFn">
```
