# DevTools Overview

Angular DevTools is a browser extension that provides debugging and profiling capabilities for Angular applications.

<docs-video src="https://www.youtube.com/embed/bavWOHZM6zE"/>

Install Angular DevTools from the [Chrome Web Store](https://chrome.google.com/webstore/detail/angular-developer-tools/ienfalfjdbdpebioblfackkekamfmbnh) or from [Firefox Addons](https://addons.mozilla.org/firefox/addon/angular-devtools/).

You can open Chrome or Firefox DevTools on any web page by pressing <kbd>F12</kbd> or <kbd><kbd>Ctrl</kbd>+<kbd>Shift</kbd>+<kbd>I</kbd></kbd> (Windows or Linux) and <kbd><kbd>Fn</kbd>+<kbd>F12</kbd></kbd> or <kbd><kbd>Cmd</kbd>+<kbd>Option</kbd>+<kbd>I</kbd></kbd> (Mac).
Once browser DevTools is open and Angular DevTools is installed, you can find it under the "Angular" tab.

HELPFUL: Chrome's new tab page does not run installed extensions, so the Angular tab will not appear in DevTools. Visit any other page to see it.

<img src="assets/images/guide/devtools/devtools.png" alt="An overview of Angular DevTools showing a tree of components for an application.">

## Open your application

When you open the extension, you'll see two additional tabs:

| Tabs                                     | Details |
|:---                                      |:---     |
| [Components](tools/devtools#debug-your-application) | Lets you explore the components and directives in your application and preview or edit their state.                    |
| [Profiler](tools/devtools#profile-your-application)     | Lets you profile your application and understand what the performance bottleneck is during change detection execution. |

<img src="assets/images/guide/devtools/devtools-tabs.png" alt="A screenshot of the top of Angular DevTools illustrating two tabs in the upper-left corner, one labeled 'Components' and another labeled 'Profiler'.">

In the top-right corner of Angular DevTools you'll find which version of Angular is running on the page as well as the latest commit hash for the extension.

### Angular application not detected

If you see an error message "Angular application not detected" when opening Angular DevTools, this means it is not able to communicate with an Angular app on the page.
The most common reason for this is because the web page you are inspecting does not contain an Angular application.
Double check that you are inspecting the right web page and that the Angular app is running.

### We detected an application built with production configuration

If you see an error message "We detected an application built with production configuration. Angular DevTools only supports development builds.", this means that an Angular application was found on the page, but it was compiled with production optimizations.
When compiling for production, Angular CLI removes various debug features to minimize the amount of the JavaScript on the page to improve performance. This includes features needed to communicate with DevTools.

To run DevTools, you need to compile your application with optimizations disabled. `ng serve` does this by default.
If you need to debug a deployed application, disable optimizations in your build with the [`optimization` configuration option](reference/configs/workspace-config#optimization-configuration) (`{"optimization": false}`).

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

## Profile your application

The **Profiler** tab lets you visualize the execution of Angular's change detection.
This is useful for determining when and how change detection impacts your application's performance.

<img src="assets/images/guide/devtools/profiler.png" alt="A screenshot of the 'Profiler' tab which reads 'Click the play button to start a new recording, or upload a json file containing profiler data.' Next to this is a record button to being recording a new profile as well as a file picker to select an existing profile.">

The Profiler tab lets you start profiling the current application or import an existing profile from a previous run.
To start profiling your application, hover over the circle in the top-left corner within the **Profiler** tab and click **Start recording**.

During profiling, Angular DevTools captures execution events, such as change detection and lifecycle hook execution.
Interact with your application to trigger change detection and generate data Angular DevTools can use.
To finish recording, click the circle again to **Stop recording**.

You can also import an existing recording.
Read more about this feature in the [Import recording](tools/devtools#import-and-export-recordings) section.

### Understand your application's execution

After recording or importing a profile, Angular DevTools displays a visualization of change detection cycles.

<img src="assets/images/guide/devtools/default-profiler-view.png" alt="A screenshot of the 'Profiler' tab after a profile has been recorded or uploaded. It displays a bar chart illustrating various change detection cycles with some text which reads 'Select a bar to preview a particular change detection cycle'.">

Each bar in the sequence represents a change detection cycle in your app.
The taller a bar is, the longer the application spent running change detection in this cycle.
When you select a bar, DevTools displays useful information about it including:

* A bar chart with all the components and directives that it captured during this cycle
* How much time Angular spent running change detection in this cycle.
* An estimated frame rate as experienced by the user.
* The source which triggered change detection.

<img src="assets/images/guide/devtools/profiler-selected-bar.png" alt="A screenshot of the 'Profiler' tab. A single bar has been selected by the user and a nearby dropdown menu displays 'Bar chart`, showing a second bar chart underneath it. The new chart has two bars which take up the majority of the space, one labeled `TodosComponent` and the other labeled `NgForOf`. The other bars are small enough to be negligible in comparison.">

### Understand component execution

The bar chart displayed after clicking on a change detection cycle displays a detailed view about how much time your application spent running change detection in that particular component or directive.

This example shows the total time spent by the `NgForOf` directive and which method was called on it.

<img src="assets/images/guide/devtools/directive-details.png" alt="A screenshot of the 'Profiler' tab where the `NgForOf` bar is selected. A detailed view of `NgForOf` is visible to the right where it lists 'Total time spent: 1.76 ms'. It includes a with exactly one row, listing `NgForOf` as a directives with an `ngDoCheck` method which took 1.76 ms. It also includes a list labeled 'Parent Hierarchy' containing the parent components of this directive.">

### Hierarchical views

<img src="assets/images/guide/devtools/flame-graph-view.png" alt="A screenshot of the 'Profiler' tab. A single bar has been selected by the user and a nearby dropdown menu now displays 'Flame graph', showing a flame graph underneath it. The flame graph starts with a row called 'Entire application' and another row called 'AppComponent'. Beneath those, the rows start to break up into multiple items, starting with `[RouterOutlet]` and `DemoAppComponent` on the third row. A few layers deep, one cell is highlighted red.">

You can also visualize the change detection execution in a flame graph-like view.

Each tile in the graph represents an element on the screen at a specific position in the render tree.
For example, consider a change detection cycle where a `LoggedOutUserComponent` is removed and in its place Angular rendered a `LoggedInUserComponent`. In this scenario both components will be displayed in the same tile.

The x-axis represents the full time it took to render this change detection cycle.
The y-axis represents the element hierarchy. Running change detection for an element requires render its directives and child components.
Together, this graph visualizes which components are taking the longest time to render and where that time is going.

Each tile is colored depending on how much time Angular spent there.
Angular DevTools determines the intensity of the color by the time spent relative to the tile where rendering took the most time.

When you click on a certain tile, you'll see details about it in the panel on the right.
Double-clicking the tile zooms it in so you can more easily view its nested children.

### Debug change detection and `OnPush` components

Normally, the graph visualizes the time it takes to *render* an application, for any given change detection frame. However some components such as `OnPush` components will only re-render if their input properties change. It can be useful to visualize the flame graph without these components for particular frames.

To visualize only the components in a change detection frame that went through the change detection process, select the **Change detection** checkbox at the top, above the flame graph.

This view highlights all the components that went through change detection and displays those that did not in gray, such as `OnPush` components that did not re-render.

<img src="assets/images/guide/devtools/debugging-onpush.png" alt="A screenshot of the 'Profiler' tab displaying a flame chart visualization of a change detection cycle. A checkbox labeled 'Show only change detection' is now checked. The flame graph looks very similar to before, however the color of components has changed from orange to blue. Several tiles labeled `[RouterOutlet]` are no longer highlighted with any color.">

### Import and export recordings

Click the **Save Profile** button at the top-right of a recorded profiling session to export it as a JSON file and save it to the disk.
Later, import the file in the initial view of the profiler by clicking the **Choose file** input.

<img src="assets/images/guide/devtools/save-profile.png" alt="A screenshot of the 'Profiler' tab displaying change detection cycles. On the right side a 'Save Profile' button is visible.">

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
