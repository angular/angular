'use strict';function __export(m) {
    for (var p in m) if (!exports.hasOwnProperty(p)) exports[p] = m[p];
}
__export(require('./common'));
__export(require('./core'));
__export(require('./instrumentation'));
__export(require('./platform/browser'));
__export(require('./src/platform/dom/dom_adapter'));
__export(require('./src/platform/dom/events/event_manager'));
__export(require('./upgrade'));
var compiler_1 = require('./compiler');
exports.UrlResolver = compiler_1.UrlResolver;
exports.AppRootUrl = compiler_1.AppRootUrl;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYW5ndWxhcjIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJhbmd1bGFyMi9hbmd1bGFyMi50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFBQSxpQkFBYyxVQUFVLENBQUMsRUFBQTtBQUN6QixpQkFBYyxRQUFRLENBQUMsRUFBQTtBQUN2QixpQkFBYyxtQkFBbUIsQ0FBQyxFQUFBO0FBQ2xDLGlCQUFjLG9CQUFvQixDQUFDLEVBQUE7QUFDbkMsaUJBQWMsZ0NBQWdDLENBQUMsRUFBQTtBQUMvQyxpQkFBYyx5Q0FBeUMsQ0FBQyxFQUFBO0FBQ3hELGlCQUFjLFdBQVcsQ0FBQyxFQUFBO0FBQzFCLHlCQUFzQyxZQUFZLENBQUM7QUFBM0MsNkNBQVc7QUFBRSwyQ0FBOEIiLCJzb3VyY2VzQ29udGVudCI6WyJleHBvcnQgKiBmcm9tICcuL2NvbW1vbic7XG5leHBvcnQgKiBmcm9tICcuL2NvcmUnO1xuZXhwb3J0ICogZnJvbSAnLi9pbnN0cnVtZW50YXRpb24nO1xuZXhwb3J0ICogZnJvbSAnLi9wbGF0Zm9ybS9icm93c2VyJztcbmV4cG9ydCAqIGZyb20gJy4vc3JjL3BsYXRmb3JtL2RvbS9kb21fYWRhcHRlcic7XG5leHBvcnQgKiBmcm9tICcuL3NyYy9wbGF0Zm9ybS9kb20vZXZlbnRzL2V2ZW50X21hbmFnZXInO1xuZXhwb3J0ICogZnJvbSAnLi91cGdyYWRlJztcbmV4cG9ydCB7VXJsUmVzb2x2ZXIsIEFwcFJvb3RVcmx9IGZyb20gJy4vY29tcGlsZXInO1xuIl19