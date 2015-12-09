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
exports.getUrlScheme = compiler_1.getUrlScheme;
exports.DEFAULT_PACKAGE_URL_PROVIDER = compiler_1.DEFAULT_PACKAGE_URL_PROVIDER;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYW5ndWxhcjIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJhbmd1bGFyMi9hbmd1bGFyMi50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFBQSxpQkFBYyxVQUFVLENBQUMsRUFBQTtBQUN6QixpQkFBYyxRQUFRLENBQUMsRUFBQTtBQUN2QixpQkFBYyxtQkFBbUIsQ0FBQyxFQUFBO0FBQ2xDLGlCQUFjLG9CQUFvQixDQUFDLEVBQUE7QUFDbkMsaUJBQWMsZ0NBQWdDLENBQUMsRUFBQTtBQUMvQyxpQkFBYyx5Q0FBeUMsQ0FBQyxFQUFBO0FBQ3hELGlCQUFjLFdBQVcsQ0FBQyxFQUFBO0FBQzFCLHlCQUFrRixZQUFZLENBQUM7QUFBdkYsNkNBQVc7QUFBRSwyQ0FBVTtBQUFFLCtDQUFZO0FBQUUsK0VBQWdEIiwic291cmNlc0NvbnRlbnQiOlsiZXhwb3J0ICogZnJvbSAnLi9jb21tb24nO1xuZXhwb3J0ICogZnJvbSAnLi9jb3JlJztcbmV4cG9ydCAqIGZyb20gJy4vaW5zdHJ1bWVudGF0aW9uJztcbmV4cG9ydCAqIGZyb20gJy4vcGxhdGZvcm0vYnJvd3Nlcic7XG5leHBvcnQgKiBmcm9tICcuL3NyYy9wbGF0Zm9ybS9kb20vZG9tX2FkYXB0ZXInO1xuZXhwb3J0ICogZnJvbSAnLi9zcmMvcGxhdGZvcm0vZG9tL2V2ZW50cy9ldmVudF9tYW5hZ2VyJztcbmV4cG9ydCAqIGZyb20gJy4vdXBncmFkZSc7XG5leHBvcnQge1VybFJlc29sdmVyLCBBcHBSb290VXJsLCBnZXRVcmxTY2hlbWUsIERFRkFVTFRfUEFDS0FHRV9VUkxfUFJPVklERVJ9IGZyb20gJy4vY29tcGlsZXInO1xuIl19