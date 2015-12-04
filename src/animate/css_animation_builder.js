'use strict';var css_animation_options_1 = require('./css_animation_options');
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
})();
exports.CssAnimationBuilder = CssAnimationBuilder;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY3NzX2FuaW1hdGlvbl9idWlsZGVyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiYW5ndWxhcjIvc3JjL2FuaW1hdGUvY3NzX2FuaW1hdGlvbl9idWlsZGVyLnRzIl0sIm5hbWVzIjpbIkNzc0FuaW1hdGlvbkJ1aWxkZXIiLCJDc3NBbmltYXRpb25CdWlsZGVyLmNvbnN0cnVjdG9yIiwiQ3NzQW5pbWF0aW9uQnVpbGRlci5hZGRBbmltYXRpb25DbGFzcyIsIkNzc0FuaW1hdGlvbkJ1aWxkZXIuYWRkQ2xhc3MiLCJDc3NBbmltYXRpb25CdWlsZGVyLnJlbW92ZUNsYXNzIiwiQ3NzQW5pbWF0aW9uQnVpbGRlci5zZXREdXJhdGlvbiIsIkNzc0FuaW1hdGlvbkJ1aWxkZXIuc2V0RGVsYXkiLCJDc3NBbmltYXRpb25CdWlsZGVyLnNldFN0eWxlcyIsIkNzc0FuaW1hdGlvbkJ1aWxkZXIuc2V0RnJvbVN0eWxlcyIsIkNzc0FuaW1hdGlvbkJ1aWxkZXIuc2V0VG9TdHlsZXMiLCJDc3NBbmltYXRpb25CdWlsZGVyLnN0YXJ0Il0sIm1hcHBpbmdzIjoiQUFBQSxzQ0FBa0MseUJBQXlCLENBQUMsQ0FBQTtBQUM1RCwwQkFBd0IsYUFBYSxDQUFDLENBQUE7QUFHdEM7SUFJRUE7O09BRUdBO0lBQ0hBLDZCQUFtQkEsY0FBOEJBO1FBQTlCQyxtQkFBY0EsR0FBZEEsY0FBY0EsQ0FBZ0JBO1FBTmpEQSxrQ0FBa0NBO1FBQ2xDQSxTQUFJQSxHQUF3QkEsSUFBSUEsMkNBQW1CQSxFQUFFQSxDQUFDQTtJQUtGQSxDQUFDQTtJQUVyREQ7OztPQUdHQTtJQUNIQSwrQ0FBaUJBLEdBQWpCQSxVQUFrQkEsU0FBaUJBO1FBQ2pDRSxJQUFJQSxDQUFDQSxJQUFJQSxDQUFDQSxnQkFBZ0JBLENBQUNBLElBQUlBLENBQUNBLFNBQVNBLENBQUNBLENBQUNBO1FBQzNDQSxNQUFNQSxDQUFDQSxJQUFJQSxDQUFDQTtJQUNkQSxDQUFDQTtJQUVERjs7O09BR0dBO0lBQ0hBLHNDQUFRQSxHQUFSQSxVQUFTQSxTQUFpQkE7UUFDeEJHLElBQUlBLENBQUNBLElBQUlBLENBQUNBLFlBQVlBLENBQUNBLElBQUlBLENBQUNBLFNBQVNBLENBQUNBLENBQUNBO1FBQ3ZDQSxNQUFNQSxDQUFDQSxJQUFJQSxDQUFDQTtJQUNkQSxDQUFDQTtJQUVESDs7O09BR0dBO0lBQ0hBLHlDQUFXQSxHQUFYQSxVQUFZQSxTQUFpQkE7UUFDM0JJLElBQUlBLENBQUNBLElBQUlBLENBQUNBLGVBQWVBLENBQUNBLElBQUlBLENBQUNBLFNBQVNBLENBQUNBLENBQUNBO1FBQzFDQSxNQUFNQSxDQUFDQSxJQUFJQSxDQUFDQTtJQUNkQSxDQUFDQTtJQUVESjs7O09BR0dBO0lBQ0hBLHlDQUFXQSxHQUFYQSxVQUFZQSxRQUFnQkE7UUFDMUJLLElBQUlBLENBQUNBLElBQUlBLENBQUNBLFFBQVFBLEdBQUdBLFFBQVFBLENBQUNBO1FBQzlCQSxNQUFNQSxDQUFDQSxJQUFJQSxDQUFDQTtJQUNkQSxDQUFDQTtJQUVETDs7O09BR0dBO0lBQ0hBLHNDQUFRQSxHQUFSQSxVQUFTQSxLQUFhQTtRQUNwQk0sSUFBSUEsQ0FBQ0EsSUFBSUEsQ0FBQ0EsS0FBS0EsR0FBR0EsS0FBS0EsQ0FBQ0E7UUFDeEJBLE1BQU1BLENBQUNBLElBQUlBLENBQUNBO0lBQ2RBLENBQUNBO0lBRUROOzs7O09BSUdBO0lBQ0hBLHVDQUFTQSxHQUFUQSxVQUFVQSxJQUEwQkEsRUFBRUEsRUFBd0JBO1FBQzVETyxNQUFNQSxDQUFDQSxJQUFJQSxDQUFDQSxhQUFhQSxDQUFDQSxJQUFJQSxDQUFDQSxDQUFDQSxXQUFXQSxDQUFDQSxFQUFFQSxDQUFDQSxDQUFDQTtJQUNsREEsQ0FBQ0E7SUFFRFA7OztPQUdHQTtJQUNIQSwyQ0FBYUEsR0FBYkEsVUFBY0EsSUFBMEJBO1FBQ3RDUSxJQUFJQSxDQUFDQSxJQUFJQSxDQUFDQSxVQUFVQSxHQUFHQSxJQUFJQSxDQUFDQTtRQUM1QkEsTUFBTUEsQ0FBQ0EsSUFBSUEsQ0FBQ0E7SUFDZEEsQ0FBQ0E7SUFFRFI7OztPQUdHQTtJQUNIQSx5Q0FBV0EsR0FBWEEsVUFBWUEsRUFBd0JBO1FBQ2xDUyxJQUFJQSxDQUFDQSxJQUFJQSxDQUFDQSxRQUFRQSxHQUFHQSxFQUFFQSxDQUFDQTtRQUN4QkEsTUFBTUEsQ0FBQ0EsSUFBSUEsQ0FBQ0E7SUFDZEEsQ0FBQ0E7SUFFRFQ7OztPQUdHQTtJQUNIQSxtQ0FBS0EsR0FBTEEsVUFBTUEsT0FBb0JBO1FBQ3hCVSxNQUFNQSxDQUFDQSxJQUFJQSxxQkFBU0EsQ0FBQ0EsT0FBT0EsRUFBRUEsSUFBSUEsQ0FBQ0EsSUFBSUEsRUFBRUEsSUFBSUEsQ0FBQ0EsY0FBY0EsQ0FBQ0EsQ0FBQ0E7SUFDaEVBLENBQUNBO0lBQ0hWLDBCQUFDQTtBQUFEQSxDQUFDQSxBQXhGRCxJQXdGQztBQXhGWSwyQkFBbUIsc0JBd0YvQixDQUFBIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHtDc3NBbmltYXRpb25PcHRpb25zfSBmcm9tICcuL2Nzc19hbmltYXRpb25fb3B0aW9ucyc7XG5pbXBvcnQge0FuaW1hdGlvbn0gZnJvbSAnLi9hbmltYXRpb24nO1xuaW1wb3J0IHtCcm93c2VyRGV0YWlsc30gZnJvbSAnLi9icm93c2VyX2RldGFpbHMnO1xuXG5leHBvcnQgY2xhc3MgQ3NzQW5pbWF0aW9uQnVpbGRlciB7XG4gIC8qKiBAdHlwZSB7Q3NzQW5pbWF0aW9uT3B0aW9uc30gKi9cbiAgZGF0YTogQ3NzQW5pbWF0aW9uT3B0aW9ucyA9IG5ldyBDc3NBbmltYXRpb25PcHRpb25zKCk7XG5cbiAgLyoqXG4gICAqIEFjY2VwdHMgcHVibGljIHByb3BlcnRpZXMgZm9yIENzc0FuaW1hdGlvbkJ1aWxkZXJcbiAgICovXG4gIGNvbnN0cnVjdG9yKHB1YmxpYyBicm93c2VyRGV0YWlsczogQnJvd3NlckRldGFpbHMpIHt9XG5cbiAgLyoqXG4gICAqIEFkZHMgYSB0ZW1wb3JhcnkgY2xhc3MgdGhhdCB3aWxsIGJlIHJlbW92ZWQgYXQgdGhlIGVuZCBvZiB0aGUgYW5pbWF0aW9uXG4gICAqIEBwYXJhbSBjbGFzc05hbWVcbiAgICovXG4gIGFkZEFuaW1hdGlvbkNsYXNzKGNsYXNzTmFtZTogc3RyaW5nKTogQ3NzQW5pbWF0aW9uQnVpbGRlciB7XG4gICAgdGhpcy5kYXRhLmFuaW1hdGlvbkNsYXNzZXMucHVzaChjbGFzc05hbWUpO1xuICAgIHJldHVybiB0aGlzO1xuICB9XG5cbiAgLyoqXG4gICAqIEFkZHMgYSBjbGFzcyB0aGF0IHdpbGwgcmVtYWluIG9uIHRoZSBlbGVtZW50IGFmdGVyIHRoZSBhbmltYXRpb24gaGFzIGZpbmlzaGVkXG4gICAqIEBwYXJhbSBjbGFzc05hbWVcbiAgICovXG4gIGFkZENsYXNzKGNsYXNzTmFtZTogc3RyaW5nKTogQ3NzQW5pbWF0aW9uQnVpbGRlciB7XG4gICAgdGhpcy5kYXRhLmNsYXNzZXNUb0FkZC5wdXNoKGNsYXNzTmFtZSk7XG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cblxuICAvKipcbiAgICogUmVtb3ZlcyBhIGNsYXNzIGZyb20gdGhlIGVsZW1lbnRcbiAgICogQHBhcmFtIGNsYXNzTmFtZVxuICAgKi9cbiAgcmVtb3ZlQ2xhc3MoY2xhc3NOYW1lOiBzdHJpbmcpOiBDc3NBbmltYXRpb25CdWlsZGVyIHtcbiAgICB0aGlzLmRhdGEuY2xhc3Nlc1RvUmVtb3ZlLnB1c2goY2xhc3NOYW1lKTtcbiAgICByZXR1cm4gdGhpcztcbiAgfVxuXG4gIC8qKlxuICAgKiBTZXRzIHRoZSBhbmltYXRpb24gZHVyYXRpb24gKGFuZCBvdmVycmlkZXMgYW55IGRlZmluZWQgdGhyb3VnaCBDU1MpXG4gICAqIEBwYXJhbSBkdXJhdGlvblxuICAgKi9cbiAgc2V0RHVyYXRpb24oZHVyYXRpb246IG51bWJlcik6IENzc0FuaW1hdGlvbkJ1aWxkZXIge1xuICAgIHRoaXMuZGF0YS5kdXJhdGlvbiA9IGR1cmF0aW9uO1xuICAgIHJldHVybiB0aGlzO1xuICB9XG5cbiAgLyoqXG4gICAqIFNldHMgdGhlIGFuaW1hdGlvbiBkZWxheSAoYW5kIG92ZXJyaWRlcyBhbnkgZGVmaW5lZCB0aHJvdWdoIENTUylcbiAgICogQHBhcmFtIGRlbGF5XG4gICAqL1xuICBzZXREZWxheShkZWxheTogbnVtYmVyKTogQ3NzQW5pbWF0aW9uQnVpbGRlciB7XG4gICAgdGhpcy5kYXRhLmRlbGF5ID0gZGVsYXk7XG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cblxuICAvKipcbiAgICogU2V0cyBzdHlsZXMgZm9yIGJvdGggdGhlIGluaXRpYWwgc3RhdGUgYW5kIHRoZSBkZXN0aW5hdGlvbiBzdGF0ZVxuICAgKiBAcGFyYW0gZnJvbVxuICAgKiBAcGFyYW0gdG9cbiAgICovXG4gIHNldFN0eWxlcyhmcm9tOiB7W2tleTogc3RyaW5nXTogYW55fSwgdG86IHtba2V5OiBzdHJpbmddOiBhbnl9KTogQ3NzQW5pbWF0aW9uQnVpbGRlciB7XG4gICAgcmV0dXJuIHRoaXMuc2V0RnJvbVN0eWxlcyhmcm9tKS5zZXRUb1N0eWxlcyh0byk7XG4gIH1cblxuICAvKipcbiAgICogU2V0cyB0aGUgaW5pdGlhbCBzdHlsZXMgZm9yIHRoZSBhbmltYXRpb25cbiAgICogQHBhcmFtIGZyb21cbiAgICovXG4gIHNldEZyb21TdHlsZXMoZnJvbToge1trZXk6IHN0cmluZ106IGFueX0pOiBDc3NBbmltYXRpb25CdWlsZGVyIHtcbiAgICB0aGlzLmRhdGEuZnJvbVN0eWxlcyA9IGZyb207XG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cblxuICAvKipcbiAgICogU2V0cyB0aGUgZGVzdGluYXRpb24gc3R5bGVzIGZvciB0aGUgYW5pbWF0aW9uXG4gICAqIEBwYXJhbSB0b1xuICAgKi9cbiAgc2V0VG9TdHlsZXModG86IHtba2V5OiBzdHJpbmddOiBhbnl9KTogQ3NzQW5pbWF0aW9uQnVpbGRlciB7XG4gICAgdGhpcy5kYXRhLnRvU3R5bGVzID0gdG87XG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cblxuICAvKipcbiAgICogU3RhcnRzIHRoZSBhbmltYXRpb24gYW5kIHJldHVybnMgYSBwcm9taXNlXG4gICAqIEBwYXJhbSBlbGVtZW50XG4gICAqL1xuICBzdGFydChlbGVtZW50OiBIVE1MRWxlbWVudCk6IEFuaW1hdGlvbiB7XG4gICAgcmV0dXJuIG5ldyBBbmltYXRpb24oZWxlbWVudCwgdGhpcy5kYXRhLCB0aGlzLmJyb3dzZXJEZXRhaWxzKTtcbiAgfVxufVxuIl19