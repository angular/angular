'use strict';"use strict";
var css_animation_options_1 = require('./css_animation_options');
var animation_1 = require('./animation');
var CssAnimationBuilder = (function () {
    /**
     * Accepts public properties for CssAnimationBuilder
     */
    function CssAnimationBuilder(browserDetails) {
        this.browserDetails = browserDetails;
        /** @type {CssAnimationOptions} */
        this.data = new css_animation_options_1.CssAnimationOptions();
    }
    /**
     * Adds a temporary class that will be removed at the end of the animation
     * @param className
     */
    CssAnimationBuilder.prototype.addAnimationClass = function (className) {
        this.data.animationClasses.push(className);
        return this;
    };
    /**
     * Adds a class that will remain on the element after the animation has finished
     * @param className
     */
    CssAnimationBuilder.prototype.addClass = function (className) {
        this.data.classesToAdd.push(className);
        return this;
    };
    /**
     * Removes a class from the element
     * @param className
     */
    CssAnimationBuilder.prototype.removeClass = function (className) {
        this.data.classesToRemove.push(className);
        return this;
    };
    /**
     * Sets the animation duration (and overrides any defined through CSS)
     * @param duration
     */
    CssAnimationBuilder.prototype.setDuration = function (duration) {
        this.data.duration = duration;
        return this;
    };
    /**
     * Sets the animation delay (and overrides any defined through CSS)
     * @param delay
     */
    CssAnimationBuilder.prototype.setDelay = function (delay) {
        this.data.delay = delay;
        return this;
    };
    /**
     * Sets styles for both the initial state and the destination state
     * @param from
     * @param to
     */
    CssAnimationBuilder.prototype.setStyles = function (from, to) {
        return this.setFromStyles(from).setToStyles(to);
    };
    /**
     * Sets the initial styles for the animation
     * @param from
     */
    CssAnimationBuilder.prototype.setFromStyles = function (from) {
        this.data.fromStyles = from;
        return this;
    };
    /**
     * Sets the destination styles for the animation
     * @param to
     */
    CssAnimationBuilder.prototype.setToStyles = function (to) {
        this.data.toStyles = to;
        return this;
    };
    /**
     * Starts the animation and returns a promise
     * @param element
     */
    CssAnimationBuilder.prototype.start = function (element) {
        return new animation_1.Animation(element, this.data, this.browserDetails);
    };
    return CssAnimationBuilder;
}());
exports.CssAnimationBuilder = CssAnimationBuilder;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY3NzX2FuaW1hdGlvbl9idWlsZGVyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiZGlmZmluZ19wbHVnaW5fd3JhcHBlci1vdXRwdXRfcGF0aC1yNVBySks5aC50bXAvYW5ndWxhcjIvc3JjL2FuaW1hdGUvY3NzX2FuaW1hdGlvbl9idWlsZGVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQSxzQ0FBa0MseUJBQXlCLENBQUMsQ0FBQTtBQUM1RCwwQkFBd0IsYUFBYSxDQUFDLENBQUE7QUFHdEM7SUFJRTs7T0FFRztJQUNILDZCQUFtQixjQUE4QjtRQUE5QixtQkFBYyxHQUFkLGNBQWMsQ0FBZ0I7UUFOakQsa0NBQWtDO1FBQ2xDLFNBQUksR0FBd0IsSUFBSSwyQ0FBbUIsRUFBRSxDQUFDO0lBS0YsQ0FBQztJQUVyRDs7O09BR0c7SUFDSCwrQ0FBaUIsR0FBakIsVUFBa0IsU0FBaUI7UUFDakMsSUFBSSxDQUFDLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLENBQUM7UUFDM0MsTUFBTSxDQUFDLElBQUksQ0FBQztJQUNkLENBQUM7SUFFRDs7O09BR0c7SUFDSCxzQ0FBUSxHQUFSLFVBQVMsU0FBaUI7UUFDeEIsSUFBSSxDQUFDLElBQUksQ0FBQyxZQUFZLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxDQUFDO1FBQ3ZDLE1BQU0sQ0FBQyxJQUFJLENBQUM7SUFDZCxDQUFDO0lBRUQ7OztPQUdHO0lBQ0gseUNBQVcsR0FBWCxVQUFZLFNBQWlCO1FBQzNCLElBQUksQ0FBQyxJQUFJLENBQUMsZUFBZSxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsQ0FBQztRQUMxQyxNQUFNLENBQUMsSUFBSSxDQUFDO0lBQ2QsQ0FBQztJQUVEOzs7T0FHRztJQUNILHlDQUFXLEdBQVgsVUFBWSxRQUFnQjtRQUMxQixJQUFJLENBQUMsSUFBSSxDQUFDLFFBQVEsR0FBRyxRQUFRLENBQUM7UUFDOUIsTUFBTSxDQUFDLElBQUksQ0FBQztJQUNkLENBQUM7SUFFRDs7O09BR0c7SUFDSCxzQ0FBUSxHQUFSLFVBQVMsS0FBYTtRQUNwQixJQUFJLENBQUMsSUFBSSxDQUFDLEtBQUssR0FBRyxLQUFLLENBQUM7UUFDeEIsTUFBTSxDQUFDLElBQUksQ0FBQztJQUNkLENBQUM7SUFFRDs7OztPQUlHO0lBQ0gsdUNBQVMsR0FBVCxVQUFVLElBQTBCLEVBQUUsRUFBd0I7UUFDNUQsTUFBTSxDQUFDLElBQUksQ0FBQyxhQUFhLENBQUMsSUFBSSxDQUFDLENBQUMsV0FBVyxDQUFDLEVBQUUsQ0FBQyxDQUFDO0lBQ2xELENBQUM7SUFFRDs7O09BR0c7SUFDSCwyQ0FBYSxHQUFiLFVBQWMsSUFBMEI7UUFDdEMsSUFBSSxDQUFDLElBQUksQ0FBQyxVQUFVLEdBQUcsSUFBSSxDQUFDO1FBQzVCLE1BQU0sQ0FBQyxJQUFJLENBQUM7SUFDZCxDQUFDO0lBRUQ7OztPQUdHO0lBQ0gseUNBQVcsR0FBWCxVQUFZLEVBQXdCO1FBQ2xDLElBQUksQ0FBQyxJQUFJLENBQUMsUUFBUSxHQUFHLEVBQUUsQ0FBQztRQUN4QixNQUFNLENBQUMsSUFBSSxDQUFDO0lBQ2QsQ0FBQztJQUVEOzs7T0FHRztJQUNILG1DQUFLLEdBQUwsVUFBTSxPQUFvQjtRQUN4QixNQUFNLENBQUMsSUFBSSxxQkFBUyxDQUFDLE9BQU8sRUFBRSxJQUFJLENBQUMsSUFBSSxFQUFFLElBQUksQ0FBQyxjQUFjLENBQUMsQ0FBQztJQUNoRSxDQUFDO0lBQ0gsMEJBQUM7QUFBRCxDQUFDLEFBeEZELElBd0ZDO0FBeEZZLDJCQUFtQixzQkF3Ri9CLENBQUEiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQge0Nzc0FuaW1hdGlvbk9wdGlvbnN9IGZyb20gJy4vY3NzX2FuaW1hdGlvbl9vcHRpb25zJztcbmltcG9ydCB7QW5pbWF0aW9ufSBmcm9tICcuL2FuaW1hdGlvbic7XG5pbXBvcnQge0Jyb3dzZXJEZXRhaWxzfSBmcm9tICcuL2Jyb3dzZXJfZGV0YWlscyc7XG5cbmV4cG9ydCBjbGFzcyBDc3NBbmltYXRpb25CdWlsZGVyIHtcbiAgLyoqIEB0eXBlIHtDc3NBbmltYXRpb25PcHRpb25zfSAqL1xuICBkYXRhOiBDc3NBbmltYXRpb25PcHRpb25zID0gbmV3IENzc0FuaW1hdGlvbk9wdGlvbnMoKTtcblxuICAvKipcbiAgICogQWNjZXB0cyBwdWJsaWMgcHJvcGVydGllcyBmb3IgQ3NzQW5pbWF0aW9uQnVpbGRlclxuICAgKi9cbiAgY29uc3RydWN0b3IocHVibGljIGJyb3dzZXJEZXRhaWxzOiBCcm93c2VyRGV0YWlscykge31cblxuICAvKipcbiAgICogQWRkcyBhIHRlbXBvcmFyeSBjbGFzcyB0aGF0IHdpbGwgYmUgcmVtb3ZlZCBhdCB0aGUgZW5kIG9mIHRoZSBhbmltYXRpb25cbiAgICogQHBhcmFtIGNsYXNzTmFtZVxuICAgKi9cbiAgYWRkQW5pbWF0aW9uQ2xhc3MoY2xhc3NOYW1lOiBzdHJpbmcpOiBDc3NBbmltYXRpb25CdWlsZGVyIHtcbiAgICB0aGlzLmRhdGEuYW5pbWF0aW9uQ2xhc3Nlcy5wdXNoKGNsYXNzTmFtZSk7XG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cblxuICAvKipcbiAgICogQWRkcyBhIGNsYXNzIHRoYXQgd2lsbCByZW1haW4gb24gdGhlIGVsZW1lbnQgYWZ0ZXIgdGhlIGFuaW1hdGlvbiBoYXMgZmluaXNoZWRcbiAgICogQHBhcmFtIGNsYXNzTmFtZVxuICAgKi9cbiAgYWRkQ2xhc3MoY2xhc3NOYW1lOiBzdHJpbmcpOiBDc3NBbmltYXRpb25CdWlsZGVyIHtcbiAgICB0aGlzLmRhdGEuY2xhc3Nlc1RvQWRkLnB1c2goY2xhc3NOYW1lKTtcbiAgICByZXR1cm4gdGhpcztcbiAgfVxuXG4gIC8qKlxuICAgKiBSZW1vdmVzIGEgY2xhc3MgZnJvbSB0aGUgZWxlbWVudFxuICAgKiBAcGFyYW0gY2xhc3NOYW1lXG4gICAqL1xuICByZW1vdmVDbGFzcyhjbGFzc05hbWU6IHN0cmluZyk6IENzc0FuaW1hdGlvbkJ1aWxkZXIge1xuICAgIHRoaXMuZGF0YS5jbGFzc2VzVG9SZW1vdmUucHVzaChjbGFzc05hbWUpO1xuICAgIHJldHVybiB0aGlzO1xuICB9XG5cbiAgLyoqXG4gICAqIFNldHMgdGhlIGFuaW1hdGlvbiBkdXJhdGlvbiAoYW5kIG92ZXJyaWRlcyBhbnkgZGVmaW5lZCB0aHJvdWdoIENTUylcbiAgICogQHBhcmFtIGR1cmF0aW9uXG4gICAqL1xuICBzZXREdXJhdGlvbihkdXJhdGlvbjogbnVtYmVyKTogQ3NzQW5pbWF0aW9uQnVpbGRlciB7XG4gICAgdGhpcy5kYXRhLmR1cmF0aW9uID0gZHVyYXRpb247XG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cblxuICAvKipcbiAgICogU2V0cyB0aGUgYW5pbWF0aW9uIGRlbGF5IChhbmQgb3ZlcnJpZGVzIGFueSBkZWZpbmVkIHRocm91Z2ggQ1NTKVxuICAgKiBAcGFyYW0gZGVsYXlcbiAgICovXG4gIHNldERlbGF5KGRlbGF5OiBudW1iZXIpOiBDc3NBbmltYXRpb25CdWlsZGVyIHtcbiAgICB0aGlzLmRhdGEuZGVsYXkgPSBkZWxheTtcbiAgICByZXR1cm4gdGhpcztcbiAgfVxuXG4gIC8qKlxuICAgKiBTZXRzIHN0eWxlcyBmb3IgYm90aCB0aGUgaW5pdGlhbCBzdGF0ZSBhbmQgdGhlIGRlc3RpbmF0aW9uIHN0YXRlXG4gICAqIEBwYXJhbSBmcm9tXG4gICAqIEBwYXJhbSB0b1xuICAgKi9cbiAgc2V0U3R5bGVzKGZyb206IHtba2V5OiBzdHJpbmddOiBhbnl9LCB0bzoge1trZXk6IHN0cmluZ106IGFueX0pOiBDc3NBbmltYXRpb25CdWlsZGVyIHtcbiAgICByZXR1cm4gdGhpcy5zZXRGcm9tU3R5bGVzKGZyb20pLnNldFRvU3R5bGVzKHRvKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBTZXRzIHRoZSBpbml0aWFsIHN0eWxlcyBmb3IgdGhlIGFuaW1hdGlvblxuICAgKiBAcGFyYW0gZnJvbVxuICAgKi9cbiAgc2V0RnJvbVN0eWxlcyhmcm9tOiB7W2tleTogc3RyaW5nXTogYW55fSk6IENzc0FuaW1hdGlvbkJ1aWxkZXIge1xuICAgIHRoaXMuZGF0YS5mcm9tU3R5bGVzID0gZnJvbTtcbiAgICByZXR1cm4gdGhpcztcbiAgfVxuXG4gIC8qKlxuICAgKiBTZXRzIHRoZSBkZXN0aW5hdGlvbiBzdHlsZXMgZm9yIHRoZSBhbmltYXRpb25cbiAgICogQHBhcmFtIHRvXG4gICAqL1xuICBzZXRUb1N0eWxlcyh0bzoge1trZXk6IHN0cmluZ106IGFueX0pOiBDc3NBbmltYXRpb25CdWlsZGVyIHtcbiAgICB0aGlzLmRhdGEudG9TdHlsZXMgPSB0bztcbiAgICByZXR1cm4gdGhpcztcbiAgfVxuXG4gIC8qKlxuICAgKiBTdGFydHMgdGhlIGFuaW1hdGlvbiBhbmQgcmV0dXJucyBhIHByb21pc2VcbiAgICogQHBhcmFtIGVsZW1lbnRcbiAgICovXG4gIHN0YXJ0KGVsZW1lbnQ6IEhUTUxFbGVtZW50KTogQW5pbWF0aW9uIHtcbiAgICByZXR1cm4gbmV3IEFuaW1hdGlvbihlbGVtZW50LCB0aGlzLmRhdGEsIHRoaXMuYnJvd3NlckRldGFpbHMpO1xuICB9XG59XG4iXX0=