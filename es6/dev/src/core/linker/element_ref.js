import { unimplemented } from 'angular2/src/facade/exceptions';
/**
 * Represents a location in a View that has an injection, change-detection and render context
 * associated with it.
 *
 * An `ElementRef` is created for each element in the Template that contains a Directive, Component
 * or data-binding.
 *
 * An `ElementRef` is backed by a render-specific element. In the browser, this is usually a DOM
 * element.
 */
export class ElementRef {
    /**
     * The underlying native element or `null` if direct access to native elements is not supported
     * (e.g. when the application runs in a web worker).
     *
     * <div class="callout is-critical">
     *   <header>Use with caution</header>
     *   <p>
     *    Use this API as the last resort when direct access to DOM is needed. Use templating and
     *    data-binding provided by Angular instead. Alternatively you take a look at {@link Renderer}
     *    which provides API that can safely be used even when direct access to native elements is not
     *    supported.
     *   </p>
     *   <p>
     *    Relying on direct DOM access creates tight coupling between your application and rendering
     *    layers which will make it impossible to separate the two and deploy your application into a
     *    web worker.
     *   </p>
     * </div>
     */
    get nativeElement() { return unimplemented(); }
    ;
    get renderView() { return unimplemented(); }
}
export class ElementRef_ extends ElementRef {
    constructor(parentView, 
        /**
         * Index of the element inside the {@link ViewRef}.
         *
         * This is used internally by the Angular framework to locate elements.
         */
        boundElementIndex, _renderer) {
        super();
        this.parentView = parentView;
        this.boundElementIndex = boundElementIndex;
        this._renderer = _renderer;
    }
    get renderView() { return this.parentView.render; }
    set renderView(value) { unimplemented(); }
    get nativeElement() { return this._renderer.getNativeElementSync(this); }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZWxlbWVudF9yZWYuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJhbmd1bGFyMi9zcmMvY29yZS9saW5rZXIvZWxlbWVudF9yZWYudHMiXSwibmFtZXMiOlsiRWxlbWVudFJlZiIsIkVsZW1lbnRSZWYubmF0aXZlRWxlbWVudCIsIkVsZW1lbnRSZWYucmVuZGVyVmlldyIsIkVsZW1lbnRSZWZfIiwiRWxlbWVudFJlZl8uY29uc3RydWN0b3IiLCJFbGVtZW50UmVmXy5yZW5kZXJWaWV3IiwiRWxlbWVudFJlZl8ubmF0aXZlRWxlbWVudCJdLCJtYXBwaW5ncyI6Ik9BQU8sRUFBZ0IsYUFBYSxFQUFDLE1BQU0sZ0NBQWdDO0FBSTNFOzs7Ozs7Ozs7R0FTRztBQUNIO0lBaUJFQTs7Ozs7Ozs7Ozs7Ozs7Ozs7O09Ba0JHQTtJQUNIQSxJQUFJQSxhQUFhQSxLQUFVQyxNQUFNQSxDQUFDQSxhQUFhQSxFQUFFQSxDQUFDQSxDQUFDQSxDQUFDQTs7SUFFcERELElBQUlBLFVBQVVBLEtBQW9CRSxNQUFNQSxDQUFDQSxhQUFhQSxFQUFFQSxDQUFDQSxDQUFDQSxDQUFDQTtBQUM3REYsQ0FBQ0E7QUFFRCxpQ0FBaUMsVUFBVTtJQUN6Q0csWUFBbUJBLFVBQW1CQTtRQUUxQkE7Ozs7V0FJR0E7UUFDSUEsaUJBQXlCQSxFQUFVQSxTQUFtQkE7UUFDdkVDLE9BQU9BLENBQUNBO1FBUlNBLGVBQVVBLEdBQVZBLFVBQVVBLENBQVNBO1FBT25CQSxzQkFBaUJBLEdBQWpCQSxpQkFBaUJBLENBQVFBO1FBQVVBLGNBQVNBLEdBQVRBLFNBQVNBLENBQVVBO0lBRXpFQSxDQUFDQTtJQUVERCxJQUFJQSxVQUFVQSxLQUFvQkUsTUFBTUEsQ0FBWUEsSUFBSUEsQ0FBQ0EsVUFBV0EsQ0FBQ0EsTUFBTUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7SUFDOUVGLElBQUlBLFVBQVVBLENBQUNBLEtBQUtBLElBQUlFLGFBQWFBLEVBQUVBLENBQUNBLENBQUNBLENBQUNBO0lBQzFDRixJQUFJQSxhQUFhQSxLQUFVRyxNQUFNQSxDQUFDQSxJQUFJQSxDQUFDQSxTQUFTQSxDQUFDQSxvQkFBb0JBLENBQUNBLElBQUlBLENBQUNBLENBQUNBLENBQUNBLENBQUNBO0FBQ2hGSCxDQUFDQTtBQUFBIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHtCYXNlRXhjZXB0aW9uLCB1bmltcGxlbWVudGVkfSBmcm9tICdhbmd1bGFyMi9zcmMvZmFjYWRlL2V4Y2VwdGlvbnMnO1xuaW1wb3J0IHtWaWV3UmVmLCBWaWV3UmVmX30gZnJvbSAnLi92aWV3X3JlZic7XG5pbXBvcnQge1JlbmRlclZpZXdSZWYsIFJlbmRlckVsZW1lbnRSZWYsIFJlbmRlcmVyfSBmcm9tICdhbmd1bGFyMi9zcmMvY29yZS9yZW5kZXIvYXBpJztcblxuLyoqXG4gKiBSZXByZXNlbnRzIGEgbG9jYXRpb24gaW4gYSBWaWV3IHRoYXQgaGFzIGFuIGluamVjdGlvbiwgY2hhbmdlLWRldGVjdGlvbiBhbmQgcmVuZGVyIGNvbnRleHRcbiAqIGFzc29jaWF0ZWQgd2l0aCBpdC5cbiAqXG4gKiBBbiBgRWxlbWVudFJlZmAgaXMgY3JlYXRlZCBmb3IgZWFjaCBlbGVtZW50IGluIHRoZSBUZW1wbGF0ZSB0aGF0IGNvbnRhaW5zIGEgRGlyZWN0aXZlLCBDb21wb25lbnRcbiAqIG9yIGRhdGEtYmluZGluZy5cbiAqXG4gKiBBbiBgRWxlbWVudFJlZmAgaXMgYmFja2VkIGJ5IGEgcmVuZGVyLXNwZWNpZmljIGVsZW1lbnQuIEluIHRoZSBicm93c2VyLCB0aGlzIGlzIHVzdWFsbHkgYSBET01cbiAqIGVsZW1lbnQuXG4gKi9cbmV4cG9ydCBhYnN0cmFjdCBjbGFzcyBFbGVtZW50UmVmIGltcGxlbWVudHMgUmVuZGVyRWxlbWVudFJlZiB7XG4gIC8qKlxuICAgKiBAaW50ZXJuYWxcbiAgICpcbiAgICogUmVmZXJlbmNlIHRvIHRoZSB7QGxpbmsgVmlld1JlZn0gdGhhdCB0aGlzIGBFbGVtZW50UmVmYCBpcyBwYXJ0IG9mLlxuICAgKi9cbiAgcGFyZW50VmlldzogVmlld1JlZjtcblxuICAvKipcbiAgICogQGludGVybmFsXG4gICAqXG4gICAqIEluZGV4IG9mIHRoZSBlbGVtZW50IGluc2lkZSB0aGUge0BsaW5rIFZpZXdSZWZ9LlxuICAgKlxuICAgKiBUaGlzIGlzIHVzZWQgaW50ZXJuYWxseSBieSB0aGUgQW5ndWxhciBmcmFtZXdvcmsgdG8gbG9jYXRlIGVsZW1lbnRzLlxuICAgKi9cbiAgYm91bmRFbGVtZW50SW5kZXg6IG51bWJlcjtcblxuICAvKipcbiAgICogVGhlIHVuZGVybHlpbmcgbmF0aXZlIGVsZW1lbnQgb3IgYG51bGxgIGlmIGRpcmVjdCBhY2Nlc3MgdG8gbmF0aXZlIGVsZW1lbnRzIGlzIG5vdCBzdXBwb3J0ZWRcbiAgICogKGUuZy4gd2hlbiB0aGUgYXBwbGljYXRpb24gcnVucyBpbiBhIHdlYiB3b3JrZXIpLlxuICAgKlxuICAgKiA8ZGl2IGNsYXNzPVwiY2FsbG91dCBpcy1jcml0aWNhbFwiPlxuICAgKiAgIDxoZWFkZXI+VXNlIHdpdGggY2F1dGlvbjwvaGVhZGVyPlxuICAgKiAgIDxwPlxuICAgKiAgICBVc2UgdGhpcyBBUEkgYXMgdGhlIGxhc3QgcmVzb3J0IHdoZW4gZGlyZWN0IGFjY2VzcyB0byBET00gaXMgbmVlZGVkLiBVc2UgdGVtcGxhdGluZyBhbmRcbiAgICogICAgZGF0YS1iaW5kaW5nIHByb3ZpZGVkIGJ5IEFuZ3VsYXIgaW5zdGVhZC4gQWx0ZXJuYXRpdmVseSB5b3UgdGFrZSBhIGxvb2sgYXQge0BsaW5rIFJlbmRlcmVyfVxuICAgKiAgICB3aGljaCBwcm92aWRlcyBBUEkgdGhhdCBjYW4gc2FmZWx5IGJlIHVzZWQgZXZlbiB3aGVuIGRpcmVjdCBhY2Nlc3MgdG8gbmF0aXZlIGVsZW1lbnRzIGlzIG5vdFxuICAgKiAgICBzdXBwb3J0ZWQuXG4gICAqICAgPC9wPlxuICAgKiAgIDxwPlxuICAgKiAgICBSZWx5aW5nIG9uIGRpcmVjdCBET00gYWNjZXNzIGNyZWF0ZXMgdGlnaHQgY291cGxpbmcgYmV0d2VlbiB5b3VyIGFwcGxpY2F0aW9uIGFuZCByZW5kZXJpbmdcbiAgICogICAgbGF5ZXJzIHdoaWNoIHdpbGwgbWFrZSBpdCBpbXBvc3NpYmxlIHRvIHNlcGFyYXRlIHRoZSB0d28gYW5kIGRlcGxveSB5b3VyIGFwcGxpY2F0aW9uIGludG8gYVxuICAgKiAgICB3ZWIgd29ya2VyLlxuICAgKiAgIDwvcD5cbiAgICogPC9kaXY+XG4gICAqL1xuICBnZXQgbmF0aXZlRWxlbWVudCgpOiBhbnkgeyByZXR1cm4gdW5pbXBsZW1lbnRlZCgpOyB9O1xuXG4gIGdldCByZW5kZXJWaWV3KCk6IFJlbmRlclZpZXdSZWYgeyByZXR1cm4gdW5pbXBsZW1lbnRlZCgpOyB9XG59XG5cbmV4cG9ydCBjbGFzcyBFbGVtZW50UmVmXyBleHRlbmRzIEVsZW1lbnRSZWYge1xuICBjb25zdHJ1Y3RvcihwdWJsaWMgcGFyZW50VmlldzogVmlld1JlZixcblxuICAgICAgICAgICAgICAvKipcbiAgICAgICAgICAgICAgICogSW5kZXggb2YgdGhlIGVsZW1lbnQgaW5zaWRlIHRoZSB7QGxpbmsgVmlld1JlZn0uXG4gICAgICAgICAgICAgICAqXG4gICAgICAgICAgICAgICAqIFRoaXMgaXMgdXNlZCBpbnRlcm5hbGx5IGJ5IHRoZSBBbmd1bGFyIGZyYW1ld29yayB0byBsb2NhdGUgZWxlbWVudHMuXG4gICAgICAgICAgICAgICAqL1xuICAgICAgICAgICAgICBwdWJsaWMgYm91bmRFbGVtZW50SW5kZXg6IG51bWJlciwgcHJpdmF0ZSBfcmVuZGVyZXI6IFJlbmRlcmVyKSB7XG4gICAgc3VwZXIoKTtcbiAgfVxuXG4gIGdldCByZW5kZXJWaWV3KCk6IFJlbmRlclZpZXdSZWYgeyByZXR1cm4gKDxWaWV3UmVmXz50aGlzLnBhcmVudFZpZXcpLnJlbmRlcjsgfVxuICBzZXQgcmVuZGVyVmlldyh2YWx1ZSkgeyB1bmltcGxlbWVudGVkKCk7IH1cbiAgZ2V0IG5hdGl2ZUVsZW1lbnQoKTogYW55IHsgcmV0dXJuIHRoaXMuX3JlbmRlcmVyLmdldE5hdGl2ZUVsZW1lbnRTeW5jKHRoaXMpOyB9XG59XG4iXX0=