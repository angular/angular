'use strict';"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var di_1 = require('angular2/src/core/di');
var compile_element_1 = require('./compile_element');
var compile_view_1 = require('./compile_view');
var view_builder_1 = require('./view_builder');
var view_binder_1 = require('./view_binder');
var config_1 = require('../config');
var ViewCompileResult = (function () {
    function ViewCompileResult(statements, viewFactoryVar, dependencies) {
        this.statements = statements;
        this.viewFactoryVar = viewFactoryVar;
        this.dependencies = dependencies;
    }
    return ViewCompileResult;
}());
exports.ViewCompileResult = ViewCompileResult;
var ViewCompiler = (function () {
    function ViewCompiler(_genConfig) {
        this._genConfig = _genConfig;
    }
    ViewCompiler.prototype.compileComponent = function (component, template, styles, pipes) {
        var statements = [];
        var dependencies = [];
        var view = new compile_view_1.CompileView(component, this._genConfig, pipes, styles, 0, compile_element_1.CompileElement.createNull(), []);
        view_builder_1.buildView(view, template, dependencies);
        // Need to separate binding from creation to be able to refer to
        // variables that have been declared after usage.
        view_binder_1.bindView(view, template);
        view_builder_1.finishView(view, statements);
        return new ViewCompileResult(statements, view.viewFactory.name, dependencies);
    };
    ViewCompiler = __decorate([
        di_1.Injectable(), 
        __metadata('design:paramtypes', [config_1.CompilerConfig])
    ], ViewCompiler);
    return ViewCompiler;
}());
exports.ViewCompiler = ViewCompiler;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidmlld19jb21waWxlci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbImRpZmZpbmdfcGx1Z2luX3dyYXBwZXItb3V0cHV0X3BhdGgtcjVQckpLOWgudG1wL2FuZ3VsYXIyL3NyYy9jb21waWxlci92aWV3X2NvbXBpbGVyL3ZpZXdfY29tcGlsZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7OztBQUFBLG1CQUF5QixzQkFBc0IsQ0FBQyxDQUFBO0FBR2hELGdDQUE2QixtQkFBbUIsQ0FBQyxDQUFBO0FBQ2pELDZCQUEwQixnQkFBZ0IsQ0FBQyxDQUFBO0FBQzNDLDZCQUEyRCxnQkFBZ0IsQ0FBQyxDQUFBO0FBQzVFLDRCQUF1QixlQUFlLENBQUMsQ0FBQTtBQUt2Qyx1QkFBNkIsV0FBVyxDQUFDLENBQUE7QUFFekM7SUFDRSwyQkFBbUIsVUFBeUIsRUFBUyxjQUFzQixFQUN4RCxZQUFxQztRQURyQyxlQUFVLEdBQVYsVUFBVSxDQUFlO1FBQVMsbUJBQWMsR0FBZCxjQUFjLENBQVE7UUFDeEQsaUJBQVksR0FBWixZQUFZLENBQXlCO0lBQUcsQ0FBQztJQUM5RCx3QkFBQztBQUFELENBQUMsQUFIRCxJQUdDO0FBSFkseUJBQWlCLG9CQUc3QixDQUFBO0FBR0Q7SUFDRSxzQkFBb0IsVUFBMEI7UUFBMUIsZUFBVSxHQUFWLFVBQVUsQ0FBZ0I7SUFBRyxDQUFDO0lBRWxELHVDQUFnQixHQUFoQixVQUFpQixTQUFtQyxFQUFFLFFBQXVCLEVBQzVELE1BQW9CLEVBQUUsS0FBNEI7UUFDakUsSUFBSSxVQUFVLEdBQUcsRUFBRSxDQUFDO1FBQ3BCLElBQUksWUFBWSxHQUFHLEVBQUUsQ0FBQztRQUN0QixJQUFJLElBQUksR0FBRyxJQUFJLDBCQUFXLENBQUMsU0FBUyxFQUFFLElBQUksQ0FBQyxVQUFVLEVBQUUsS0FBSyxFQUFFLE1BQU0sRUFBRSxDQUFDLEVBQzVDLGdDQUFjLENBQUMsVUFBVSxFQUFFLEVBQUUsRUFBRSxDQUFDLENBQUM7UUFDNUQsd0JBQVMsQ0FBQyxJQUFJLEVBQUUsUUFBUSxFQUFFLFlBQVksQ0FBQyxDQUFDO1FBQ3hDLGdFQUFnRTtRQUNoRSxpREFBaUQ7UUFDakQsc0JBQVEsQ0FBQyxJQUFJLEVBQUUsUUFBUSxDQUFDLENBQUM7UUFDekIseUJBQVUsQ0FBQyxJQUFJLEVBQUUsVUFBVSxDQUFDLENBQUM7UUFFN0IsTUFBTSxDQUFDLElBQUksaUJBQWlCLENBQUMsVUFBVSxFQUFFLElBQUksQ0FBQyxXQUFXLENBQUMsSUFBSSxFQUFFLFlBQVksQ0FBQyxDQUFDO0lBQ2hGLENBQUM7SUFqQkg7UUFBQyxlQUFVLEVBQUU7O29CQUFBO0lBa0JiLG1CQUFDO0FBQUQsQ0FBQyxBQWpCRCxJQWlCQztBQWpCWSxvQkFBWSxlQWlCeEIsQ0FBQSIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7SW5qZWN0YWJsZX0gZnJvbSAnYW5ndWxhcjIvc3JjL2NvcmUvZGknO1xuXG5pbXBvcnQgKiBhcyBvIGZyb20gJy4uL291dHB1dC9vdXRwdXRfYXN0JztcbmltcG9ydCB7Q29tcGlsZUVsZW1lbnR9IGZyb20gJy4vY29tcGlsZV9lbGVtZW50JztcbmltcG9ydCB7Q29tcGlsZVZpZXd9IGZyb20gJy4vY29tcGlsZV92aWV3JztcbmltcG9ydCB7YnVpbGRWaWV3LCBmaW5pc2hWaWV3LCBWaWV3Q29tcGlsZURlcGVuZGVuY3l9IGZyb20gJy4vdmlld19idWlsZGVyJztcbmltcG9ydCB7YmluZFZpZXd9IGZyb20gJy4vdmlld19iaW5kZXInO1xuXG5pbXBvcnQge0NvbXBpbGVEaXJlY3RpdmVNZXRhZGF0YSwgQ29tcGlsZVBpcGVNZXRhZGF0YX0gZnJvbSAnLi4vY29tcGlsZV9tZXRhZGF0YSc7XG5cbmltcG9ydCB7VGVtcGxhdGVBc3R9IGZyb20gJy4uL3RlbXBsYXRlX2FzdCc7XG5pbXBvcnQge0NvbXBpbGVyQ29uZmlnfSBmcm9tICcuLi9jb25maWcnO1xuXG5leHBvcnQgY2xhc3MgVmlld0NvbXBpbGVSZXN1bHQge1xuICBjb25zdHJ1Y3RvcihwdWJsaWMgc3RhdGVtZW50czogby5TdGF0ZW1lbnRbXSwgcHVibGljIHZpZXdGYWN0b3J5VmFyOiBzdHJpbmcsXG4gICAgICAgICAgICAgIHB1YmxpYyBkZXBlbmRlbmNpZXM6IFZpZXdDb21waWxlRGVwZW5kZW5jeVtdKSB7fVxufVxuXG5ASW5qZWN0YWJsZSgpXG5leHBvcnQgY2xhc3MgVmlld0NvbXBpbGVyIHtcbiAgY29uc3RydWN0b3IocHJpdmF0ZSBfZ2VuQ29uZmlnOiBDb21waWxlckNvbmZpZykge31cblxuICBjb21waWxlQ29tcG9uZW50KGNvbXBvbmVudDogQ29tcGlsZURpcmVjdGl2ZU1ldGFkYXRhLCB0ZW1wbGF0ZTogVGVtcGxhdGVBc3RbXSxcbiAgICAgICAgICAgICAgICAgICBzdHlsZXM6IG8uRXhwcmVzc2lvbiwgcGlwZXM6IENvbXBpbGVQaXBlTWV0YWRhdGFbXSk6IFZpZXdDb21waWxlUmVzdWx0IHtcbiAgICB2YXIgc3RhdGVtZW50cyA9IFtdO1xuICAgIHZhciBkZXBlbmRlbmNpZXMgPSBbXTtcbiAgICB2YXIgdmlldyA9IG5ldyBDb21waWxlVmlldyhjb21wb25lbnQsIHRoaXMuX2dlbkNvbmZpZywgcGlwZXMsIHN0eWxlcywgMCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBDb21waWxlRWxlbWVudC5jcmVhdGVOdWxsKCksIFtdKTtcbiAgICBidWlsZFZpZXcodmlldywgdGVtcGxhdGUsIGRlcGVuZGVuY2llcyk7XG4gICAgLy8gTmVlZCB0byBzZXBhcmF0ZSBiaW5kaW5nIGZyb20gY3JlYXRpb24gdG8gYmUgYWJsZSB0byByZWZlciB0b1xuICAgIC8vIHZhcmlhYmxlcyB0aGF0IGhhdmUgYmVlbiBkZWNsYXJlZCBhZnRlciB1c2FnZS5cbiAgICBiaW5kVmlldyh2aWV3LCB0ZW1wbGF0ZSk7XG4gICAgZmluaXNoVmlldyh2aWV3LCBzdGF0ZW1lbnRzKTtcblxuICAgIHJldHVybiBuZXcgVmlld0NvbXBpbGVSZXN1bHQoc3RhdGVtZW50cywgdmlldy52aWV3RmFjdG9yeS5uYW1lLCBkZXBlbmRlbmNpZXMpO1xuICB9XG59XG4iXX0=