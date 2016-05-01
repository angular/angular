'use strict';"use strict";
var lang_1 = require('angular2/src/facade/lang');
var collection_1 = require('angular2/src/facade/collection');
var exceptions_1 = require('angular2/src/facade/exceptions');
var view_type_1 = require('./view_type');
var element_ref_1 = require('./element_ref');
var view_container_ref_1 = require('./view_container_ref');
/**
 * An AppElement is created for elements that have a ViewContainerRef,
 * a nested component or a <template> element to keep data around
 * that is needed for later instantiations.
 */
var AppElement = (function () {
    function AppElement(index, parentIndex, parentView, nativeElement) {
        this.index = index;
        this.parentIndex = parentIndex;
        this.parentView = parentView;
        this.nativeElement = nativeElement;
        this.nestedViews = null;
        this.componentView = null;
    }
    Object.defineProperty(AppElement.prototype, "elementRef", {
        get: function () { return new element_ref_1.ElementRef(this.nativeElement); },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(AppElement.prototype, "vcRef", {
        get: function () { return new view_container_ref_1.ViewContainerRef_(this); },
        enumerable: true,
        configurable: true
    });
    AppElement.prototype.initComponent = function (component, componentConstructorViewQueries, view) {
        this.component = component;
        this.componentConstructorViewQueries = componentConstructorViewQueries;
        this.componentView = view;
    };
    Object.defineProperty(AppElement.prototype, "parentInjector", {
        get: function () { return this.parentView.injector(this.parentIndex); },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(AppElement.prototype, "injector", {
        get: function () { return this.parentView.injector(this.index); },
        enumerable: true,
        configurable: true
    });
    AppElement.prototype.mapNestedViews = function (nestedViewClass, callback) {
        var result = [];
        if (lang_1.isPresent(this.nestedViews)) {
            this.nestedViews.forEach(function (nestedView) {
                if (nestedView.clazz === nestedViewClass) {
                    result.push(callback(nestedView));
                }
            });
        }
        return result;
    };
    AppElement.prototype.attachView = function (view, viewIndex) {
        if (view.type === view_type_1.ViewType.COMPONENT) {
            throw new exceptions_1.BaseException("Component views can't be moved!");
        }
        var nestedViews = this.nestedViews;
        if (nestedViews == null) {
            nestedViews = [];
            this.nestedViews = nestedViews;
        }
        collection_1.ListWrapper.insert(nestedViews, viewIndex, view);
        var refRenderNode;
        if (viewIndex > 0) {
            var prevView = nestedViews[viewIndex - 1];
            refRenderNode = prevView.lastRootNode;
        }
        else {
            refRenderNode = this.nativeElement;
        }
        if (lang_1.isPresent(refRenderNode)) {
            view.renderer.attachViewAfter(refRenderNode, view.flatRootNodes);
        }
        view.addToContentChildren(this);
    };
    AppElement.prototype.detachView = function (viewIndex) {
        var view = collection_1.ListWrapper.removeAt(this.nestedViews, viewIndex);
        if (view.type === view_type_1.ViewType.COMPONENT) {
            throw new exceptions_1.BaseException("Component views can't be moved!");
        }
        view.renderer.detachView(view.flatRootNodes);
        view.removeFromContentChildren(this);
        return view;
    };
    return AppElement;
}());
exports.AppElement = AppElement;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZWxlbWVudC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbImRpZmZpbmdfcGx1Z2luX3dyYXBwZXItb3V0cHV0X3BhdGgtcjVQckpLOWgudG1wL2FuZ3VsYXIyL3NyYy9jb3JlL2xpbmtlci9lbGVtZW50LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQSxxQkFBdUMsMEJBQTBCLENBQUMsQ0FBQTtBQUNsRSwyQkFBMEIsZ0NBQWdDLENBQUMsQ0FBQTtBQUMzRCwyQkFBNEIsZ0NBQWdDLENBQUMsQ0FBQTtBQUs3RCwwQkFBdUIsYUFBYSxDQUFDLENBQUE7QUFDckMsNEJBQXlCLGVBQWUsQ0FBQyxDQUFBO0FBRXpDLG1DQUFrRCxzQkFBc0IsQ0FBQyxDQUFBO0FBSXpFOzs7O0dBSUc7QUFDSDtJQU9FLG9CQUFtQixLQUFhLEVBQVMsV0FBbUIsRUFBUyxVQUF3QixFQUMxRSxhQUFrQjtRQURsQixVQUFLLEdBQUwsS0FBSyxDQUFRO1FBQVMsZ0JBQVcsR0FBWCxXQUFXLENBQVE7UUFBUyxlQUFVLEdBQVYsVUFBVSxDQUFjO1FBQzFFLGtCQUFhLEdBQWIsYUFBYSxDQUFLO1FBUDlCLGdCQUFXLEdBQW1CLElBQUksQ0FBQztRQUNuQyxrQkFBYSxHQUFpQixJQUFJLENBQUM7SUFNRixDQUFDO0lBRXpDLHNCQUFJLGtDQUFVO2FBQWQsY0FBK0IsTUFBTSxDQUFDLElBQUksd0JBQVUsQ0FBQyxJQUFJLENBQUMsYUFBYSxDQUFDLENBQUMsQ0FBQyxDQUFDOzs7T0FBQTtJQUUzRSxzQkFBSSw2QkFBSzthQUFULGNBQWlDLE1BQU0sQ0FBQyxJQUFJLHNDQUFpQixDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQzs7O09BQUE7SUFFdEUsa0NBQWEsR0FBYixVQUFjLFNBQWMsRUFBRSwrQkFBaUQsRUFDakUsSUFBa0I7UUFDOUIsSUFBSSxDQUFDLFNBQVMsR0FBRyxTQUFTLENBQUM7UUFDM0IsSUFBSSxDQUFDLCtCQUErQixHQUFHLCtCQUErQixDQUFDO1FB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QUM7UUFDckMsTUFBTSxDQUFDLElBQUksQ0FBQztJQUNkLENBQUM7SUFDSCxpQkFBQztBQUFELENBQUMsQUF2RUQsSUF1RUM7QUF2RVksa0JBQVUsYUF1RXRCLENBQUEiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQge2lzUHJlc2VudCwgaXNCbGFuaywgVHlwZX0gZnJvbSAnYW5ndWxhcjIvc3JjL2ZhY2FkZS9sYW5nJztcbmltcG9ydCB7TGlzdFdyYXBwZXJ9IGZyb20gJ2FuZ3VsYXIyL3NyYy9mYWNhZGUvY29sbGVjdGlvbic7XG5pbXBvcnQge0Jhc2VFeGNlcHRpb259IGZyb20gJ2FuZ3VsYXIyL3NyYy9mYWNhZGUvZXhjZXB0aW9ucyc7XG5cbmltcG9ydCB7SW5qZWN0b3J9IGZyb20gJ2FuZ3VsYXIyL3NyYy9jb3JlL2RpJztcblxuaW1wb3J0IHtBcHBWaWV3fSBmcm9tICcuL3ZpZXcnO1xuaW1wb3J0IHtWaWV3VHlwZX0gZnJvbSAnLi92aWV3X3R5cGUnO1xuaW1wb3J0IHtFbGVtZW50UmVmfSBmcm9tICcuL2VsZW1lbnRfcmVmJztcblxuaW1wb3J0IHtWaWV3Q29udGFpbmVyUmVmLCBWaWV3Q29udGFpbmVyUmVmX30gZnJvbSAnLi92aWV3X2NvbnRhaW5lcl9yZWYnO1xuXG5pbXBvcnQge1F1ZXJ5TGlzdH0gZnJvbSAnLi9xdWVyeV9saXN0JztcblxuLyoqXG4gKiBBbiBBcHBFbGVtZW50IGlzIGNyZWF0ZWQgZm9yIGVsZW1lbnRzIHRoYXQgaGF2ZSBhIFZpZXdDb250YWluZXJSZWYsXG4gKiBhIG5lc3RlZCBjb21wb25lbnQgb3IgYSA8dGVtcGxhdGU+IGVsZW1lbnQgdG8ga2VlcCBkYXRhIGFyb3VuZFxuICogdGhhdCBpcyBuZWVkZWQgZm9yIGxhdGVyIGluc3RhbnRpYXRpb25zLlxuICovXG5leHBvcnQgY2xhc3MgQXBwRWxlbWVudCB7XG4gIHB1YmxpYyBuZXN0ZWRWaWV3czogQXBwVmlldzxhbnk+W10gPSBudWxsO1xuICBwdWJsaWMgY29tcG9uZW50VmlldzogQXBwVmlldzxhbnk+ID0gbnVsbDtcblxuICBwdWJsaWMgY29tcG9uZW50OiBhbnk7XG4gIHB1YmxpYyBjb21wb25lbnRDb25zdHJ1Y3RvclZpZXdRdWVyaWVzOiBRdWVyeUxpc3Q8YW55PltdO1xuXG4gIGNvbnN0cnVjdG9yKHB1YmxpYyBpbmRleDogbnVtYmVyLCBwdWJsaWMgcGFyZW50SW5kZXg6IG51bWJlciwgcHVibGljIHBhcmVudFZpZXc6IEFwcFZpZXc8YW55PixcbiAgICAgICAgICAgICAgcHVibGljIG5hdGl2ZUVsZW1lbnQ6IGFueSkge31cblxuICBnZXQgZWxlbWVudFJlZigpOiBFbGVtZW50UmVmIHsgcmV0dXJuIG5ldyBFbGVtZW50UmVmKHRoaXMubmF0aXZlRWxlbWVudCk7IH1cblxuICBnZXQgdmNSZWYoKTogVmlld0NvbnRhaW5lclJlZl8geyByZXR1cm4gbmV3IFZpZXdDb250YWluZXJSZWZfKHRoaXMpOyB9XG5cbiAgaW5pdENvbXBvbmVudChjb21wb25lbnQ6IGFueSwgY29tcG9uZW50Q29uc3RydWN0b3JWaWV3UXVlcmllczogUXVlcnlMaXN0PGFueT5bXSxcbiAgICAgICAgICAgICAgICB2aWV3OiBBcHBWaWV3PGFueT4pIHtcbiAgICB0aGlzLmNvbXBvbmVudCA9IGNvbXBvbmVudDtcbiAgICB0aGlzLmNvbXBvbmVudENvbnN0cnVjdG9yVmlld1F1ZXJpZXMgPSBjb21wb25lbnRDb25zdHJ1Y3RvclZpZXdRdWVyaWVzO1xuICAgIHRoaXMuY29tcG9uZW50VmlldyA9IHZpZXc7XG4gIH1cblxuICBnZXQgcGFyZW50SW5qZWN0b3IoKTogSW5qZWN0b3IgeyByZXR1cm4gdGhpcy5wYXJlbnRWaWV3LmluamVjdG9yKHRoaXMucGFyZW50SW5kZXgpOyB9XG4gIGdldCBpbmplY3RvcigpOiBJbmplY3RvciB7IHJldHVybiB0aGlzLnBhcmVudFZpZXcuaW5qZWN0b3IodGhpcy5pbmRleCk7IH1cblxuICBtYXBOZXN0ZWRWaWV3cyhuZXN0ZWRWaWV3Q2xhc3M6IGFueSwgY2FsbGJhY2s6IEZ1bmN0aW9uKTogYW55W10ge1xuICAgIHZhciByZXN1bHQgPSBbXTtcbiAgICBpZiAoaXNQcmVzZW50KHRoaXMubmVzdGVkVmlld3MpKSB7XG4gICAgICB0aGlzLm5lc3RlZFZpZXdzLmZvckVhY2goKG5lc3RlZFZpZXcpID0+IHtcbiAgICAgICAgaWYgKG5lc3RlZFZpZXcuY2xhenogPT09IG5lc3RlZFZpZXdDbGFzcykge1xuICAgICAgICAgIHJlc3VsdC5wdXNoKGNhbGxiYWNrKG5lc3RlZFZpZXcpKTtcbiAgICAgICAgfVxuICAgICAgfSk7XG4gICAgfVxuICAgIHJldHVybiByZXN1bHQ7XG4gIH1cblxuXG4gIGF0dGFjaFZpZXcodmlldzogQXBwVmlldzxhbnk+LCB2aWV3SW5kZXg6IG51bWJlcikge1xuICAgIGlmICh2aWV3LnR5cGUgPT09IFZpZXdUeXBlLkNPTVBPTkVOVCkge1xuICAgICAgdGhyb3cgbmV3IEJhc2VFeGNlcHRpb24oYENvbXBvbmVudCB2aWV3cyBjYW4ndCBiZSBtb3ZlZCFgKTtcbiAgICB9XG4gICAgdmFyIG5lc3RlZFZpZXdzID0gdGhpcy5uZXN0ZWRWaWV3cztcbiAgICBpZiAobmVzdGVkVmlld3MgPT0gbnVsbCkge1xuICAgICAgbmVzdGVkVmlld3MgPSBbXTtcbiAgICAgIHRoaXMubmVzdGVkVmlld3MgPSBuZXN0ZWRWaWV3cztcbiAgICB9XG4gICAgTGlzdFdyYXBwZXIuaW5zZXJ0KG5lc3RlZFZpZXdzLCB2aWV3SW5kZXgsIHZpZXcpO1xuICAgIHZhciByZWZSZW5kZXJOb2RlO1xuICAgIGlmICh2aWV3SW5kZXggPiAwKSB7XG4gICAgICB2YXIgcHJldlZpZXcgPSBuZXN0ZWRWaWV3c1t2aWV3SW5kZXggLSAxXTtcbiAgICAgIHJlZlJlbmRlck5vZGUgPSBwcmV2Vmlldy5sYXN0Um9vdE5vZGU7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJlZlJlbmRlck5vZGUgPSB0aGlzLm5hdGl2ZUVsZW1lbnQ7XG4gICAgfVxuICAgIGlmIChpc1ByZXNlbnQocmVmUmVuZGVyTm9kZSkpIHtcbiAgICAgIHZpZXcucmVuZGVyZXIuYXR0YWNoVmlld0FmdGVyKHJlZlJlbmRlck5vZGUsIHZpZXcuZmxhdFJvb3ROb2Rlcyk7XG4gICAgfVxuICAgIHZpZXcuYWRkVG9Db250ZW50Q2hpbGRyZW4odGhpcyk7XG4gIH1cblxuICBkZXRhY2hWaWV3KHZpZXdJbmRleDogbnVtYmVyKTogQXBwVmlldzxhbnk+IHtcbiAgICB2YXIgdmlldyA9IExpc3RXcmFwcGVyLnJlbW92ZUF0KHRoaXMubmVzdGVkVmlld3MsIHZpZXdJbmRleCk7XG4gICAgaWYgKHZpZXcudHlwZSA9PT0gVmlld1R5cGUuQ09NUE9ORU5UKSB7XG4gICAgICB0aHJvdyBuZXcgQmFzZUV4Y2VwdGlvbihgQ29tcG9uZW50IHZpZXdzIGNhbid0IGJlIG1vdmVkIWApO1xuICAgIH1cblxuICAgIHZpZXcucmVuZGVyZXIuZGV0YWNoVmlldyh2aWV3LmZsYXRSb290Tm9kZXMpO1xuXG4gICAgdmlldy5yZW1vdmVGcm9tQ29udGVudENoaWxkcmVuKHRoaXMpO1xuICAgIHJldHVybiB2aWV3O1xuICB9XG59XG4iXX0=