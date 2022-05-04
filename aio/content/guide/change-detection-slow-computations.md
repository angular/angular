# Slow computations

On every change detection cycle, Angular synchronously:

* Evaluates all template expressions in all components, unless specified otherwise, based on that each component's detection strategy
* Executes the `ngDoCheck`, `ngAfterContentChecked`, `ngAfterViewChecked`, and `ngOnChanges` lifecycle hooks.
A single slow computation within a template or a lifecycle hook can slow down the entire change detection process because Angular runs the computations sequentially. 

## Identifying slow computations

You can identify heavy computations with Angular DevTools’ profiler. In the performance timeline, click on a bar to preview a particular change detection cycle. This displays a bar chart, which shows how long the framework spent in change detection for each component. When you click on a component, you can preview how long Angular spent  evaluating its template and lifecycle hooks.

<div class="lightbox">
  <img alt="Angular DevTools profiler preview showing slow computation" src="generated/images/guide/change-detection/slow-computations.png">
</div>

For example, in the screenshot above, we selected the second change detection cycle after the profiler started where Angular spent over 573 ms. Angular spent most time in the `EmployeeListComponent`. In the details panel, we can see that we spent over 297ms in evaluating the template of the `EmployeeListComponent`.


## Optimizing slow computations

There are several techniques to eliminate slow computations:

* **Optimizing the underlying algorithm**. This is the recommended approach; if you can speed up the algorithm that is causing the problem, you can speed up the entire change detection mechanism.
* **Caching using pure pipes**. You can move the heavy computation to a pure [pipe](https://angular.io/guide/pipes). Angular will reevaluate a pure pipe only if it detects that its inputs changed, compared to the previous time Angular called it.
* **Using memoization**. [Memoization](https://en.wikipedia.org/wiki/Memoization) is a similar technique to pure pipes, with the difference that pure pipes preserve only the last result from the computation where memoization could store multiple results.
* **Avoid repaints/reflows in lifecycle hooks**. Certain [operations](https://web.dev/avoid-large-complex-layouts-and-layout-thrashing/) cause the browser to either synchronously recalculate the layout of the page or re-render it. Since reflows and repaints are generally slow, we want to avoid performing them in every change detection cycle.

Pure pipes and memoization have different trade-offs. Pure pipes are an Angular built-in concept compared to memoization, which is a general software engineering practice for caching function results. The memory overhead of memoization could be significant if you invoke the heavy computation frequently with different arguments.

@reviewed 2022-05-04
