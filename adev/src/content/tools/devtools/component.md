# Inspect the component tree

## Debug your application

The **Components** tab lets you explore the structure of your application.
You can visualize the component and directive instances in the DOM and inspect or modify their state.

### Explore the application structure

The component tree displays a hierarchical relationship of the *components and directives* within your application.

<img src="assets/images/guide/devtools/component-explorer.png" alt="A screenshot of the 'Components' tab showing a tree of Angular components and directives starting the root of the application.">

Click the individual components or directives in the component explorer to select them and preview their properties.
Angular DevTools displays properties and metadata on the right side of the component tree.

To look up a component or directive by name use the search box above the component tree.

<img src="assets/images/guide/devtools/search.png" alt="A screenshot of the 'Components' tab. The filter bar immediately underneath the tab is searching for 'todo' and all components with 'todo' in the name are highlighted in the tree. `app-todos` is currently selected and a sidebar to the right displays information about the component's properties. This includes a section of `@Output` fields and another section for other properties.">

### Navigate to the host node

To go to the host element of a particular component or directive, double-click it in the component explorer.
Angular DevTools will open the Elements tab in Chrome or the Inspector tab in Firefox, and select the associated DOM node.

### Navigate to source

For components, Angular DevTools lets you navigate to the component definition in the Sources tab (Chrome) and Debugger tab (Firefox).
After you select a particular component, click the icon at the top-right of the properties view:

<img src="assets/images/guide/devtools/navigate-source.png" alt="A screenshot of the 'Components' tab. The properties view on the right is visible for a component and the mouse rests in the upper right corner of that view on top of a `<>` icon. An adjacent tooltip reads 'Open component source'.">

### Update property value

Like browsers' DevTools, the properties view lets you edit the value of an input, output, or other properties.
Right-click on the property value and if edit functionality is available for this value type, a text input will appear.
Type the new value and press `Enter` to apply this value to the property.

<img src="assets/images/guide/devtools/update-property.png" alt="A screenshot of the 'Components' tab with the properties view open for a component. An `@Input` named `todo` contains a `label` property which is currently selected and has been manually updated to the value 'Buy milk'.">

### Access selected component or directive in console

As a shortcut in the console, Angular DevTools provides access to instances of recently selected components or directives.
Type `$ng0` to get a reference to the instance of the currently selected component or directive, and type `$ng1` for the previously selected instance, `$ng2` for the instance selected before that, and so on.

<img src="assets/images/guide/devtools/access-console.png" alt="A screenshot of the 'Components' tab with the browser console underneath. In the console, the user has typed three commands, `$ng0`, `$ng1`, and `$ng2` to view the three most recently selected elements. After each statement, the console prints a different component reference.">

### Select a directive or component

Similar to browsers' DevTools, you can inspect the page to select a particular component or directive.
Click the ***Inspect element*** icon in the top left corner within Angular DevTools and hover over a DOM element on the page.
The extension recognizes the associated directives and/or components and lets you select the corresponding element in the Component tree.

<img src="assets/images/guide/devtools/inspect-element.png" alt="A screenshot of the 'Components' tab with an Angular todo application visible. In the very top-left corner of Angular DevTools, an icon of a screen with a mouse icon inside it is selected. The mouse rests on a todo element in the Angular application UI. The element is highlighted with a `<TodoComponent>` label displayed in an adjacent tooltip.">


## Inspect your injectors

 NOTE: The Injector Tree is available for Angular Applications built with version 17 or higher.

### View the injector hierarchy of your application

 The **Injector Tree** tab lets you explore the structure of the Injectors configured in your application. Here you will see two trees representing the [injector hierarchy](guide/di/hierarchical-dependency-injection) of your application. One tree is your environment hierarchy, the other is your element hierarchy.

<img src="assets/images/guide/devtools/di-injector-tree.png" alt="A screenshot of the 'Profiler' tab displaying the injector tree tab in Angular Devtools visualizing the injector graph for an example application.">

 ### Visualize resolution paths

 When a specific injector is selected, the path that Angular's dependency injection algorithm traverses from that injector to the root is highlighted. For element injectors, this includes highlighting the environment injectors that the dependency injection algorithm jumps to when a dependency cannot be resolved in the element hierarchy.

See [resolution rules](guide/di/hierarchical-dependency-injection#resolution-rules) for more details about how Angular resolves resolution paths.

<img src="assets/images/guide/devtools/di-injector-tree-selected.png" alt="A screenshot of the 'Profiler' tab displaying how the injector tree visualize highlights resolution paths when an injector is selected.">

 ### View injector providers

 Clicking an injector that has configured providers will display those providers in a list on the right of the injector tree view. Here you can view the provided token and it's type.

<img src="assets/images/guide/devtools/di-injector-tree-providers.png" alt="A screenshot of the 'Profiler' tab displaying how providers are made visible when an injector is selected.">
