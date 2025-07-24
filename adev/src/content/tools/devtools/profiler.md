# Profile your application

The **Profiler** tab lets you visualize the execution of Angular's change detection.
This is useful for determining when and how change detection impacts your application's performance.

<img src="assets/images/guide/devtools/profiler.png" alt="A screenshot of the 'Profiler' tab which reads 'Click the play button to start a new recording, or upload a json file containing profiler data.' Next to this is a record button to begin recording a new profile as well as a file picker to select an existing profile.">

The Profiler tab lets you start profiling the current application or import an existing profile from a previous run.
To start profiling your application, hover over the circle in the top-left corner within the **Profiler** tab and click **Start recording**.

During profiling, Angular DevTools captures execution events, such as change detection and lifecycle hook execution.
Interact with your application to trigger change detection and generate data Angular DevTools can use.
To finish recording, click the circle again to **Stop recording**.

You can also import an existing recording.
Read more about this feature in the [Import recording](tools/devtools#import-and-export-recordings) section.

## Understand your application's execution

After recording or importing a profile, Angular DevTools displays a visualization of change detection cycles.

<img src="assets/images/guide/devtools/default-profiler-view.png" alt="A screenshot of the 'Profiler' tab after a profile has been recorded or uploaded. It displays a bar chart illustrating various change detection cycles with some text which reads 'Select a bar to preview a particular change detection cycle'.">

Each bar in the sequence represents a change detection cycle in your app.
The taller a bar is, the longer the application spent running change detection in this cycle.
When you select a bar, DevTools displays useful information about it including:

- A bar chart with all the components and directives that it captured during this cycle
- How much time Angular spent running change detection in this cycle.
- An estimated frame rate as experienced by the user.
- The source which triggered change detection.

<img src="assets/images/guide/devtools/profiler-selected-bar.png" alt="A screenshot of the 'Profiler' tab. A single bar has been selected by the user and a nearby dropdown menu displays 'Bar chart`, showing a second bar chart underneath it. The new chart has two bars which take up the majority of the space, one labeled `TodosComponent` and the other labeled `NgForOf`. The other bars are small enough to be negligible in comparison.">

## Understand component execution

The bar chart displayed after clicking on a change detection cycle displays a detailed view about how much time your application spent running change detection in that particular component or directive.

This example shows the total time spent by the `NgForOf` directive and which method was called on it.

<img src="assets/images/guide/devtools/directive-details.png" alt="A screenshot of the 'Profiler' tab where the `NgForOf` bar is selected. A detailed view of `NgForOf` is visible to the right where it lists 'Total time spent: 1.76 ms'. It includes a with exactly one row, listing `NgForOf` as a directives with an `ngDoCheck` method which took 1.76 ms. It also includes a list labeled 'Parent Hierarchy' containing the parent components of this directive.">

## Hierarchical views

<img src="assets/images/guide/devtools/flame-graph-view.png" alt="A screenshot of the 'Profiler' tab. A single bar has been selected by the user and a nearby dropdown menu now displays 'Flame graph', showing a flame graph underneath it. The flame graph starts with a row called 'Entire application' and another row called 'AppComponent'. Beneath those, the rows start to break up into multiple items, starting with `[RouterOutlet]` and `DemoAppComponent` on the third row. A few layers deep, one cell is highlighted red.">

You can also visualize the change detection execution in a flame graph-like view.

Each tile in the graph represents an element on the screen at a specific position in the render tree.
For example, consider a change detection cycle where a `LoggedOutUserComponent` is removed and in its place Angular rendered a `LoggedInUserComponent`. In this scenario both components will be displayed in the same tile.

The x-axis represents the full time it took to render this change detection cycle.
The y-axis represents the element hierarchy. Running change detection for an element requires rendering its directives and child components.
Together, this graph visualizes which components are taking the longest time to render and where that time is going.

Each tile is colored depending on how much time Angular spent there.
Angular DevTools determines the intensity of the color by the time spent relative to the tile where rendering took the most time.

When you click on a certain tile, you'll see details about it in the panel on the right.
Double-clicking the tile zooms it in so you can more easily view its nested children.

## Debug change detection and `OnPush` components

Normally, the graph visualizes the time it takes to _render_ an application, for any given change detection frame. However some components such as `OnPush` components will only re-render if their input properties change. It can be useful to visualize the flame graph without these components for particular frames.

To visualize only the components in a change detection frame that went through the change detection process, select the **Change detection** checkbox at the top, above the flame graph.

This view highlights all the components that went through change detection and displays those that did not in gray, such as `OnPush` components that did not re-render.

<img src="assets/images/guide/devtools/debugging-onpush.png" alt="A screenshot of the 'Profiler' tab displaying a flame chart visualization of a change detection cycle. A checkbox labeled 'Show only change detection' is now checked. The flame graph looks very similar to before, however the color of components has changed from orange to blue. Several tiles labeled `[RouterOutlet]` are no longer highlighted with any color.">

## Import and export recordings

Click the **Save Profile** button at the top-right of a recorded profiling session to export it as a JSON file and save it to the disk.
Later, import the file in the initial view of the profiler by clicking the **Choose file** input.

<img src="assets/images/guide/devtools/save-profile.png" alt="A screenshot of the 'Profiler' tab displaying change detection cycles. On the right side a 'Save Profile' button is visible.">
