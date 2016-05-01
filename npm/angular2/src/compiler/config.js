'use strict';"use strict";
var lang_1 = require('angular2/src/facade/lang');
var exceptions_1 = require('angular2/src/facade/exceptions');
var identifiers_1 = require('./identifiers');
var CompilerConfig = (function () {
    function CompilerConfig(genDebugInfo, logBindingUpdate, useJit, renderTypes) {
        if (renderTypes === void 0) { renderTypes = null; }
        this.genDebugInfo = genDebugInfo;
        this.logBindingUpdate = logBindingUpdate;
        this.useJit = useJit;
        if (lang_1.isBlank(renderTypes)) {
            renderTypes = new DefaultRenderTypes();
        }
        this.renderTypes = renderTypes;
    }
    return CompilerConfig;
}());
exports.CompilerConfig = CompilerConfig;
/**
 * Types used for the renderer.
 * Can be replaced to specialize the generated output to a specific renderer
 * to help tree shaking.
 */
var RenderTypes = (function () {
    function RenderTypes() {
    }
    Object.defineProperty(RenderTypes.prototype, "renderer", {
        get: function () { return exceptions_1.unimplemented(); },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(RenderTypes.prototype, "renderText", {
        get: function () { return exceptions_1.unimplemented(); },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(RenderTypes.prototype, "renderElement", {
        get: function () { return exceptions_1.unimplemented(); },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(RenderTypes.prototype, "renderComment", {
        get: function () { return exceptions_1.unimplemented(); },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(RenderTypes.prototype, "renderNode", {
        get: function () { return exceptions_1.unimplemented(); },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(RenderTypes.prototype, "renderEvent", {
        get: function () { return exceptions_1.unimplemented(); },
        enumerable: true,
        configurable: true
    });
    return RenderTypes;
}());
exports.RenderTypes = RenderTypes;
var DefaultRenderTypes = (function () {
    function DefaultRenderTypes() {
        this.renderer = identifiers_1.Identifiers.Renderer;
        this.renderText = null;
        this.renderElement = null;
        this.renderComment = null;
        this.renderNode = null;
        this.renderEvent = null;
    }
    return DefaultRenderTypes;
}());
exports.DefaultRenderTypes = DefaultRenderTypes;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29uZmlnLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiZGlmZmluZ19wbHVnaW5fd3JhcHBlci1vdXRwdXRfcGF0aC1yNVBySks5aC50bXAvYW5ndWxhcjIvc3JjL2NvbXBpbGVyL2NvbmZpZy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUEscUJBQXNCLDBCQUEwQixDQUFDLENBQUE7QUFDakQsMkJBQTRCLGdDQUFnQyxDQUFDLENBQUE7QUFDN0QsNEJBQTBCLGVBQWUsQ0FBQyxDQUFBO0FBRzFDO0lBRUUsd0JBQW1CLFlBQXFCLEVBQVMsZ0JBQXlCLEVBQ3ZELE1BQWUsRUFBRSxXQUErQjtRQUEvQiwyQkFBK0IsR0FBL0Isa0JBQStCO1FBRGhELGlCQUFZLEdBQVosWUFBWSxDQUFTO1FBQVMscUJBQWdCLEdBQWhCLGdCQUFnQixDQUFTO1FBQ3ZELFdBQU0sR0FBTixNQUFNLENBQVM7UUFDaEMsRUFBRSxDQUFDLENBQUMsY0FBTyxDQUFDLFdBQVcsQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUN6QixXQUFXLEdBQUcsSUFBSSxrQkFBa0IsRUFBRSxDQUFDO1FBQ3pDLENBQUM7UUFDRCxJQUFJLENBQUMsV0FBVyxHQUFHLFdBQVcsQ0FBQztJQUNqQyxDQUFDO0lBQ0gscUJBQUM7QUFBRCxDQUFDLEFBVEQsSUFTQztBQVRZLHNCQUFjLGlCQVMxQixDQUFBO0FBRUQ7Ozs7R0FJRztBQUNIO0lBQUE7SUFPQSxDQUFDO0lBTkMsc0JBQUksaUNBQVE7YUFBWixjQUE0QyxNQUFNLENBQUMsMEJBQWEsRUFBRSxDQUFDLENBQUMsQ0FBQzs7O09BQUE7SUFDckUsc0JBQUksbUNBQVU7YUFBZCxjQUE4QyxNQUFNLENBQUMsMEJBQWEsRUFBRSxDQUFDLENBQUMsQ0FBQzs7O09BQUE7SUFDdkUsc0JBQUksc0NBQWE7YUFBakIsY0FBaUQsTUFBTSxDQUFDLDBCQUFhLEVBQUUsQ0FBQyxDQUFDLENBQUM7OztPQUFBO0lBQzFFLHNCQUFJLHNDQUFhO2FBQWpCLGNBQWlELE1BQU0sQ0FBQywwQkFBYSxFQUFFLENBQUMsQ0FBQyxDQUFDOzs7T0FBQTtJQUMxRSxzQkFBSSxtQ0FBVTthQUFkLGNBQThDLE1BQU0sQ0FBQywwQkFBYSxFQUFFLENBQUMsQ0FBQyxDQUFDOzs7T0FBQTtJQUN2RSxzQkFBSSxvQ0FBVzthQUFmLGNBQStDLE1BQU0sQ0FBQywwQkFBYSxFQUFFLENBQUMsQ0FBQyxDQUFDOzs7T0FBQTtJQUMxRSxrQkFBQztBQUFELENBQUMsQUFQRCxJQU9DO0FBUHFCLG1CQUFXLGNBT2hDLENBQUE7QUFFRDtJQUFBO1FBQ0UsYUFBUSxHQUFHLHlCQUFXLENBQUMsUUFBUSxDQUFDO1FBQ2hDLGVBQVUsR0FBRyxJQUFJLENBQUM7UUFDbEIsa0JBQWEsR0FBRyxJQUFJLENBQUM7UUFDckIsa0JBQWEsR0FBRyxJQUFJLENBQUM7UUFDckIsZUFBVSxHQUFHLElBQUksQ0FBQztRQUNsQixnQkFBVyxHQUFHLElBQUksQ0FBQztJQUNyQixDQUFDO0lBQUQseUJBQUM7QUFBRCxDQUFDLEFBUEQsSUFPQztBQVBZLDBCQUFrQixxQkFPOUIsQ0FBQSIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7aXNCbGFua30gZnJvbSAnYW5ndWxhcjIvc3JjL2ZhY2FkZS9sYW5nJztcbmltcG9ydCB7dW5pbXBsZW1lbnRlZH0gZnJvbSAnYW5ndWxhcjIvc3JjL2ZhY2FkZS9leGNlcHRpb25zJztcbmltcG9ydCB7SWRlbnRpZmllcnN9IGZyb20gJy4vaWRlbnRpZmllcnMnO1xuaW1wb3J0IHtDb21waWxlSWRlbnRpZmllck1ldGFkYXRhfSBmcm9tICcuL2NvbXBpbGVfbWV0YWRhdGEnO1xuXG5leHBvcnQgY2xhc3MgQ29tcGlsZXJDb25maWcge1xuICBwdWJsaWMgcmVuZGVyVHlwZXM6IFJlbmRlclR5cGVzO1xuICBjb25zdHJ1Y3RvcihwdWJsaWMgZ2VuRGVidWdJbmZvOiBib29sZWFuLCBwdWJsaWMgbG9nQmluZGluZ1VwZGF0ZTogYm9vbGVhbixcbiAgICAgICAgICAgICAgcHVibGljIHVzZUppdDogYm9vbGVhbiwgcmVuZGVyVHlwZXM6IFJlbmRlclR5cGVzID0gbnVsbCkge1xuICAgIGlmIChpc0JsYW5rKHJlbmRlclR5cGVzKSkge1xuICAgICAgcmVuZGVyVHlwZXMgPSBuZXcgRGVmYXVsdFJlbmRlclR5cGVzKCk7XG4gICAgfVxuICAgIHRoaXMucmVuZGVyVHlwZXMgPSByZW5kZXJUeXBlcztcbiAgfVxufVxuXG4vKipcbiAqIFR5cGVzIHVzZWQgZm9yIHRoZSByZW5kZXJlci5cbiAqIENhbiBiZSByZXBsYWNlZCB0byBzcGVjaWFsaXplIHRoZSBnZW5lcmF0ZWQgb3V0cHV0IHRvIGEgc3BlY2lmaWMgcmVuZGVyZXJcbiAqIHRvIGhlbHAgdHJlZSBzaGFraW5nLlxuICovXG5leHBvcnQgYWJzdHJhY3QgY2xhc3MgUmVuZGVyVHlwZXMge1xuICBnZXQgcmVuZGVyZXIoKTogQ29tcGlsZUlkZW50aWZpZXJNZXRhZGF0YSB7IHJldHVybiB1bmltcGxlbWVudGVkKCk7IH1cbiAgZ2V0IHJlbmRlclRleHQoKTogQ29tcGlsZUlkZW50aWZpZXJNZXRhZGF0YSB7IHJldHVybiB1bmltcGxlbWVudGVkKCk7IH1cbiAgZ2V0IHJlbmRlckVsZW1lbnQoKTogQ29tcGlsZUlkZW50aWZpZXJNZXRhZGF0YSB7IHJldHVybiB1bmltcGxlbWVudGVkKCk7IH1cbiAgZ2V0IHJlbmRlckNvbW1lbnQoKTogQ29tcGlsZUlkZW50aWZpZXJNZXRhZGF0YSB7IHJldHVybiB1bmltcGxlbWVudGVkKCk7IH1cbiAgZ2V0IHJlbmRlck5vZGUoKTogQ29tcGlsZUlkZW50aWZpZXJNZXRhZGF0YSB7IHJldHVybiB1bmltcGxlbWVudGVkKCk7IH1cbiAgZ2V0IHJlbmRlckV2ZW50KCk6IENvbXBpbGVJZGVudGlmaWVyTWV0YWRhdGEgeyByZXR1cm4gdW5pbXBsZW1lbnRlZCgpOyB9XG59XG5cbmV4cG9ydCBjbGFzcyBEZWZhdWx0UmVuZGVyVHlwZXMgaW1wbGVtZW50cyBSZW5kZXJUeXBlcyB7XG4gIHJlbmRlcmVyID0gSWRlbnRpZmllcnMuUmVuZGVyZXI7XG4gIHJlbmRlclRleHQgPSBudWxsO1xuICByZW5kZXJFbGVtZW50ID0gbnVsbDtcbiAgcmVuZGVyQ29tbWVudCA9IG51bGw7XG4gIHJlbmRlck5vZGUgPSBudWxsO1xuICByZW5kZXJFdmVudCA9IG51bGw7XG59XG4iXX0=