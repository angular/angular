import { unimplemented } from 'angular2/src/facade/exceptions';
import { ChangeDetectionStrategy } from 'angular2/src/core/change_detection/constants';
export class ViewRef {
    get destroyed() { return unimplemented(); }
}
/**
 * Represents an Angular View.
 *
 * <!-- TODO: move the next two paragraphs to the dev guide -->
 * A View is a fundamental building block of the application UI. It is the smallest grouping of
 * Elements which are created and destroyed together.
 *
 * Properties of elements in a View can change, but the structure (number and order) of elements in
 * a View cannot. Changing the structure of Elements can only be done by inserting, moving or
 * removing nested Views via a {@link ViewContainerRef}. Each View can contain many View Containers.
 * <!-- /TODO -->
 *
 * ### Example
 *
 * Given this template...
 *
 * ```
 * Count: {{items.length}}
 * <ul>
 *   <li *ngFor="let  item of items">{{item}}</li>
 * </ul>
 * ```
 *
 * ... we have two {@link TemplateRef}s:
 *
 * Outer {@link TemplateRef}:
 * ```
 * Count: {{items.length}}
 * <ul>
 *   <template ngFor let-item [ngForOf]="items"></template>
 * </ul>
 * ```
 *
 * Inner {@link TemplateRef}:
 * ```
 *   <li>{{item}}</li>
 * ```
 *
 * Notice that the original template is broken down into two separate {@link TemplateRef}s.
 *
 * The outer/inner {@link TemplateRef}s are then assembled into views like so:
 *
 * ```
 * <!-- ViewRef: outer-0 -->
 * Count: 2
 * <ul>
 *   <template view-container-ref></template>
 *   <!-- ViewRef: inner-1 --><li>first</li><!-- /ViewRef: inner-1 -->
 *   <!-- ViewRef: inner-2 --><li>second</li><!-- /ViewRef: inner-2 -->
 * </ul>
 * <!-- /ViewRef: outer-0 -->
 * ```
 */
export class EmbeddedViewRef extends ViewRef {
    get context() { return unimplemented(); }
    get rootNodes() { return unimplemented(); }
    ;
}
export class ViewRef_ {
    constructor(_view) {
        this._view = _view;
        this._view = _view;
    }
    get internalView() { return this._view; }
    get rootNodes() { return this._view.flatRootNodes; }
    get context() { return this._view.context; }
    get destroyed() { return this._view.destroyed; }
    markForCheck() { this._view.markPathToRootAsCheckOnce(); }
    detach() { this._view.cdMode = ChangeDetectionStrategy.Detached; }
    detectChanges() { this._view.detectChanges(false); }
    checkNoChanges() { this._view.detectChanges(true); }
    reattach() {
        this._view.cdMode = ChangeDetectionStrategy.CheckAlways;
        this.markForCheck();
    }
    onDestroy(callback) { this._view.disposables.push(callback); }
    destroy() { this._view.destroy(); }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidmlld19yZWYuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJkaWZmaW5nX3BsdWdpbl93cmFwcGVyLW91dHB1dF9wYXRoLWd0TTdRaEVuLnRtcC9hbmd1bGFyMi9zcmMvY29yZS9saW5rZXIvdmlld19yZWYudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ik9BQU8sRUFBQyxhQUFhLEVBQUMsTUFBTSxnQ0FBZ0M7T0FJckQsRUFBQyx1QkFBdUIsRUFBQyxNQUFNLDhDQUE4QztBQUVwRjtJQUNFLElBQUksU0FBUyxLQUFjLE1BQU0sQ0FBVSxhQUFhLEVBQUUsQ0FBQyxDQUFDLENBQUM7QUFHL0QsQ0FBQztBQUVEOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0dBb0RHO0FBQ0gscUNBQWlELE9BQU87SUFDdEQsSUFBSSxPQUFPLEtBQVEsTUFBTSxDQUFDLGFBQWEsRUFBRSxDQUFDLENBQUMsQ0FBQztJQUU1QyxJQUFJLFNBQVMsS0FBWSxNQUFNLENBQVEsYUFBYSxFQUFFLENBQUMsQ0FBQyxDQUFDOztBQU0zRCxDQUFDO0FBRUQ7SUFDRSxZQUFvQixLQUFpQjtRQUFqQixVQUFLLEdBQUwsS0FBSyxDQUFZO1FBQUksSUFBSSxDQUFDLEtBQUssR0FBRyxLQUFLLENBQUM7SUFBQyxDQUFDO0lBRTlELElBQUksWUFBWSxLQUFpQixNQUFNLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUM7SUFFckQsSUFBSSxTQUFTLEtBQVksTUFBTSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsYUFBYSxDQUFDLENBQUMsQ0FBQztJQUUzRCxJQUFJLE9BQU8sS0FBSyxNQUFNLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDO0lBRTVDLElBQUksU0FBUyxLQUFjLE1BQU0sQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUM7SUFFekQsWUFBWSxLQUFXLElBQUksQ0FBQyxLQUFLLENBQUMseUJBQXlCLEVBQUUsQ0FBQyxDQUFDLENBQUM7SUFDaEUsTUFBTSxLQUFXLElBQUksQ0FBQyxLQUFLLENBQUMsTUFBTSxHQUFHLHVCQUF1QixDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUM7SUFDeEUsYUFBYSxLQUFXLElBQUksQ0FBQyxLQUFLLENBQUMsYUFBYSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQztJQUMxRCxjQUFjLEtBQVcsSUFBSSxDQUFDLEtBQUssQ0FBQyxhQUFhLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDO0lBQzFELFFBQVE7UUFDTixJQUFJLENBQUMsS0FBSyxDQUFDLE1BQU0sR0FBRyx1QkFBdUIsQ0FBQyxXQUFXLENBQUM7UUFDeEQsSUFBSSxDQUFDLFlBQVksRUFBRSxDQUFDO0lBQ3RCLENBQUM7SUFFRCxTQUFTLENBQUMsUUFBa0IsSUFBSSxJQUFJLENBQUMsS0FBSyxDQUFDLFdBQVcsQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxDQUFDO0lBRXhFLE9BQU8sS0FBSyxJQUFJLENBQUMsS0FBSyxDQUFDLE9BQU8sRUFBRSxDQUFDLENBQUMsQ0FBQztBQUNyQyxDQUFDO0FBQUEiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQge3VuaW1wbGVtZW50ZWR9IGZyb20gJ2FuZ3VsYXIyL3NyYy9mYWNhZGUvZXhjZXB0aW9ucyc7XG5pbXBvcnQge2lzUHJlc2VudH0gZnJvbSAnYW5ndWxhcjIvc3JjL2ZhY2FkZS9sYW5nJztcbmltcG9ydCB7Q2hhbmdlRGV0ZWN0b3JSZWZ9IGZyb20gJy4uL2NoYW5nZV9kZXRlY3Rpb24vY2hhbmdlX2RldGVjdG9yX3JlZic7XG5pbXBvcnQge0FwcFZpZXd9IGZyb20gJy4vdmlldyc7XG5pbXBvcnQge0NoYW5nZURldGVjdGlvblN0cmF0ZWd5fSBmcm9tICdhbmd1bGFyMi9zcmMvY29yZS9jaGFuZ2VfZGV0ZWN0aW9uL2NvbnN0YW50cyc7XG5cbmV4cG9ydCBhYnN0cmFjdCBjbGFzcyBWaWV3UmVmIHtcbiAgZ2V0IGRlc3Ryb3llZCgpOiBib29sZWFuIHsgcmV0dXJuIDxib29sZWFuPnVuaW1wbGVtZW50ZWQoKTsgfVxuXG4gIGFic3RyYWN0IG9uRGVzdHJveShjYWxsYmFjazogRnVuY3Rpb24pO1xufVxuXG4vKipcbiAqIFJlcHJlc2VudHMgYW4gQW5ndWxhciBWaWV3LlxuICpcbiAqIDwhLS0gVE9ETzogbW92ZSB0aGUgbmV4dCB0d28gcGFyYWdyYXBocyB0byB0aGUgZGV2IGd1aWRlIC0tPlxuICogQSBWaWV3IGlzIGEgZnVuZGFtZW50YWwgYnVpbGRpbmcgYmxvY2sgb2YgdGhlIGFwcGxpY2F0aW9uIFVJLiBJdCBpcyB0aGUgc21hbGxlc3QgZ3JvdXBpbmcgb2ZcbiAqIEVsZW1lbnRzIHdoaWNoIGFyZSBjcmVhdGVkIGFuZCBkZXN0cm95ZWQgdG9nZXRoZXIuXG4gKlxuICogUHJvcGVydGllcyBvZiBlbGVtZW50cyBpbiBhIFZpZXcgY2FuIGNoYW5nZSwgYnV0IHRoZSBzdHJ1Y3R1cmUgKG51bWJlciBhbmQgb3JkZXIpIG9mIGVsZW1lbnRzIGluXG4gKiBhIFZpZXcgY2Fubm90LiBDaGFuZ2luZyB0aGUgc3RydWN0dXJlIG9mIEVsZW1lbnRzIGNhbiBvbmx5IGJlIGRvbmUgYnkgaW5zZXJ0aW5nLCBtb3Zpbmcgb3JcbiAqIHJlbW92aW5nIG5lc3RlZCBWaWV3cyB2aWEgYSB7QGxpbmsgVmlld0NvbnRhaW5lclJlZn0uIEVhY2ggVmlldyBjYW4gY29udGFpbiBtYW55IFZpZXcgQ29udGFpbmVycy5cbiAqIDwhLS0gL1RPRE8gLS0+XG4gKlxuICogIyMjIEV4YW1wbGVcbiAqXG4gKiBHaXZlbiB0aGlzIHRlbXBsYXRlLi4uXG4gKlxuICogYGBgXG4gKiBDb3VudDoge3tpdGVtcy5sZW5ndGh9fVxuICogPHVsPlxuICogICA8bGkgKm5nRm9yPVwibGV0ICBpdGVtIG9mIGl0ZW1zXCI+e3tpdGVtfX08L2xpPlxuICogPC91bD5cbiAqIGBgYFxuICpcbiAqIC4uLiB3ZSBoYXZlIHR3byB7QGxpbmsgVGVtcGxhdGVSZWZ9czpcbiAqXG4gKiBPdXRlciB7QGxpbmsgVGVtcGxhdGVSZWZ9OlxuICogYGBgXG4gKiBDb3VudDoge3tpdGVtcy5sZW5ndGh9fVxuICogPHVsPlxuICogICA8dGVtcGxhdGUgbmdGb3IgbGV0LWl0ZW0gW25nRm9yT2ZdPVwiaXRlbXNcIj48L3RlbXBsYXRlPlxuICogPC91bD5cbiAqIGBgYFxuICpcbiAqIElubmVyIHtAbGluayBUZW1wbGF0ZVJlZn06XG4gKiBgYGBcbiAqICAgPGxpPnt7aXRlbX19PC9saT5cbiAqIGBgYFxuICpcbiAqIE5vdGljZSB0aGF0IHRoZSBvcmlnaW5hbCB0ZW1wbGF0ZSBpcyBicm9rZW4gZG93biBpbnRvIHR3byBzZXBhcmF0ZSB7QGxpbmsgVGVtcGxhdGVSZWZ9cy5cbiAqXG4gKiBUaGUgb3V0ZXIvaW5uZXIge0BsaW5rIFRlbXBsYXRlUmVmfXMgYXJlIHRoZW4gYXNzZW1ibGVkIGludG8gdmlld3MgbGlrZSBzbzpcbiAqXG4gKiBgYGBcbiAqIDwhLS0gVmlld1JlZjogb3V0ZXItMCAtLT5cbiAqIENvdW50OiAyXG4gKiA8dWw+XG4gKiAgIDx0ZW1wbGF0ZSB2aWV3LWNvbnRhaW5lci1yZWY+PC90ZW1wbGF0ZT5cbiAqICAgPCEtLSBWaWV3UmVmOiBpbm5lci0xIC0tPjxsaT5maXJzdDwvbGk+PCEtLSAvVmlld1JlZjogaW5uZXItMSAtLT5cbiAqICAgPCEtLSBWaWV3UmVmOiBpbm5lci0yIC0tPjxsaT5zZWNvbmQ8L2xpPjwhLS0gL1ZpZXdSZWY6IGlubmVyLTIgLS0+XG4gKiA8L3VsPlxuICogPCEtLSAvVmlld1JlZjogb3V0ZXItMCAtLT5cbiAqIGBgYFxuICovXG5leHBvcnQgYWJzdHJhY3QgY2xhc3MgRW1iZWRkZWRWaWV3UmVmPEM+IGV4dGVuZHMgVmlld1JlZiB7XG4gIGdldCBjb250ZXh0KCk6IEMgeyByZXR1cm4gdW5pbXBsZW1lbnRlZCgpOyB9XG5cbiAgZ2V0IHJvb3ROb2RlcygpOiBhbnlbXSB7IHJldHVybiA8YW55W10+dW5pbXBsZW1lbnRlZCgpOyB9O1xuXG4gIC8qKlxuICAgKiBEZXN0cm95cyB0aGUgdmlldyBhbmQgYWxsIG9mIHRoZSBkYXRhIHN0cnVjdHVyZXMgYXNzb2NpYXRlZCB3aXRoIGl0LlxuICAgKi9cbiAgYWJzdHJhY3QgZGVzdHJveSgpO1xufVxuXG5leHBvcnQgY2xhc3MgVmlld1JlZl88Qz4gaW1wbGVtZW50cyBFbWJlZGRlZFZpZXdSZWY8Qz4sIENoYW5nZURldGVjdG9yUmVmIHtcbiAgY29uc3RydWN0b3IocHJpdmF0ZSBfdmlldzogQXBwVmlldzxDPikgeyB0aGlzLl92aWV3ID0gX3ZpZXc7IH1cblxuICBnZXQgaW50ZXJuYWxWaWV3KCk6IEFwcFZpZXc8Qz4geyByZXR1cm4gdGhpcy5fdmlldzsgfVxuXG4gIGdldCByb290Tm9kZXMoKTogYW55W10geyByZXR1cm4gdGhpcy5fdmlldy5mbGF0Um9vdE5vZGVzOyB9XG5cbiAgZ2V0IGNvbnRleHQoKSB7IHJldHVybiB0aGlzLl92aWV3LmNvbnRleHQ7IH1cblxuICBnZXQgZGVzdHJveWVkKCk6IGJvb2xlYW4geyByZXR1cm4gdGhpcy5fdmlldy5kZXN0cm95ZWQ7IH1cblxuICBtYXJrRm9yQ2hlY2soKTogdm9pZCB7IHRoaXMuX3ZpZXcubWFya1BhdGhUb1Jvb3RBc0NoZWNrT25jZSgpOyB9XG4gIGRldGFjaCgpOiB2b2lkIHsgdGhpcy5fdmlldy5jZE1vZGUgPSBDaGFuZ2VEZXRlY3Rpb25TdHJhdGVneS5EZXRhY2hlZDsgfVxuICBkZXRlY3RDaGFuZ2VzKCk6IHZvaWQgeyB0aGlzLl92aWV3LmRldGVjdENoYW5nZXMoZmFsc2UpOyB9XG4gIGNoZWNrTm9DaGFuZ2VzKCk6IHZvaWQgeyB0aGlzLl92aWV3LmRldGVjdENoYW5nZXModHJ1ZSk7IH1cbiAgcmVhdHRhY2goKTogdm9pZCB7XG4gICAgdGhpcy5fdmlldy5jZE1vZGUgPSBDaGFuZ2VEZXRlY3Rpb25TdHJhdGVneS5DaGVja0Fsd2F5cztcbiAgICB0aGlzLm1hcmtGb3JDaGVjaygpO1xuICB9XG5cbiAgb25EZXN0cm95KGNhbGxiYWNrOiBGdW5jdGlvbikgeyB0aGlzLl92aWV3LmRpc3Bvc2FibGVzLnB1c2goY2FsbGJhY2spOyB9XG5cbiAgZGVzdHJveSgpIHsgdGhpcy5fdmlldy5kZXN0cm95KCk7IH1cbn1cbiJdfQ==