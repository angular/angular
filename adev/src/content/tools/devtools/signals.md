# Debug the signal graph

The **Components** tab can display a live signal graph for the selected component or directive.
The graph shows how the signals, computeds, effects, and other reactive nodes in that component depend on each other, which makes it easier to understand and debug reactive data flows.

## Open the signal graph

In the **Components** tab, select a component or directive.
In the property pane header, click **Show Signal Graph**.
The signal graph opens next to the component tree.

You can also jump directly to a specific signal: in the properties view, right-click a signal property and choose **Show in signal graph**.

The **Show Signal Graph** button appears automatically when the inspected application supports the signal graph API — there is no setting to enable.

NOTE: Like the rest of Angular DevTools, the signal graph requires a development build of your application.

## Read the graph

Nodes in the graph represent the reactive nodes that participate in the selected component:

- **Signal**: a writable signal created with `signal()`.
- **Computed**: a derived value created with `computed()`.
- **Effect**: a side effect created with `effect()` or `afterRenderEffect()`.
- **Linked signal**: a writable signal created with `linkedSignal()`.
- **Template**: the component's template, which reads signals when it renders.
- **Resource**: signals that belong to a `resource()` or `rxResource()` are grouped into a collapsible cluster. Click **Expand** on the cluster node to see the individual nodes inside.

Lines between nodes show reactive dependencies: each node is connected to the producers it reads from (upstream) and the consumers that read it (downstream).

## Search the graph

Click the search icon in the graph toolbar to find a node by name.
Angular DevTools highlights every match and lets you step through them.

## Inspect a node

Click a node to open its details panel, which shows the node's current value as an expandable tree and offers the following actions:

- **View source**: navigate to the node's definition in the Sources tab (Chrome) or Debugger tab (Firefox). The action is disabled when the source location is not available.
- **Set breakpoint**: pause execution when the signal updates. Breakpoints are only available in Chromium-based browsers.
- **Watch signal**: log the signal's updates and invalidations to the browser console. Click the action again to stop watching.
- **Highlight upstream / downstream**: trace the paths of the node's dependencies or its dependents.

If the component uses no signals, Angular DevTools shows a "No signals in this component" message instead of the graph.

## Version support

The signal graph requires an application built with Angular 19 or later running in development mode.
DevTools detects support automatically — the **Show Signal Graph** button only appears when the inspected application exposes the signal graph debug API.
