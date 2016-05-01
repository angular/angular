var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { Injectable } from 'angular2/src/core/di';
import { CompileElement } from './compile_element';
import { CompileView } from './compile_view';
import { buildView, finishView } from './view_builder';
import { bindView } from './view_binder';
import { CompilerConfig } from '../config';
export class ViewCompileResult {
    constructor(statements, viewFactoryVar, dependencies) {
        this.statements = statements;
        this.viewFactoryVar = viewFactoryVar;
        this.dependencies = dependencies;
    }
}
export let ViewCompiler = class ViewCompiler {
    constructor(_genConfig) {
        this._genConfig = _genConfig;
    }
    compileComponent(component, template, styles, pipes) {
        var statements = [];
        var dependencies = [];
        var view = new CompileView(component, this._genConfig, pipes, styles, 0, CompileElement.createNull(), []);
        buildView(view, template, dependencies);
        // Need to separate binding from creation to be able to refer to
        // variables that have been declared after usage.
        bindView(view, template);
        finishView(view, statements);
        return new ViewCompileResult(statements, view.viewFactory.name, dependencies);
    }
};
ViewCompiler = __decorate([
    Injectable(), 
    __metadata('design:paramtypes', [CompilerConfig])
], ViewCompiler);
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidmlld19jb21waWxlci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbImRpZmZpbmdfcGx1Z2luX3dyYXBwZXItb3V0cHV0X3BhdGgtZ3RNN1FoRW4udG1wL2FuZ3VsYXIyL3NyYy9jb21waWxlci92aWV3X2NvbXBpbGVyL3ZpZXdfY29tcGlsZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7O09BQU8sRUFBQyxVQUFVLEVBQUMsTUFBTSxzQkFBc0I7T0FHeEMsRUFBQyxjQUFjLEVBQUMsTUFBTSxtQkFBbUI7T0FDekMsRUFBQyxXQUFXLEVBQUMsTUFBTSxnQkFBZ0I7T0FDbkMsRUFBQyxTQUFTLEVBQUUsVUFBVSxFQUF3QixNQUFNLGdCQUFnQjtPQUNwRSxFQUFDLFFBQVEsRUFBQyxNQUFNLGVBQWU7T0FLL0IsRUFBQyxjQUFjLEVBQUMsTUFBTSxXQUFXO0FBRXhDO0lBQ0UsWUFBbUIsVUFBeUIsRUFBUyxjQUFzQixFQUN4RCxZQUFxQztRQURyQyxlQUFVLEdBQVYsVUFBVSxDQUFlO1FBQVMsbUJBQWMsR0FBZCxjQUFjLENBQVE7UUFDeEQsaUJBQVksR0FBWixZQUFZLENBQXlCO0lBQUcsQ0FBQztBQUM5RCxDQUFDO0FBR0Q7SUFDRSxZQUFvQixVQUEwQjtRQUExQixlQUFVLEdBQVYsVUFBVSxDQUFnQjtJQUFHLENBQUM7SUFFbEQsZ0JBQWdCLENBQUMsU0FBbUMsRUFBRSxRQUF1QixFQUM1RCxNQUFvQixFQUFFLEtBQTRCO1FBQ2pFLElBQUksVUFBVSxHQUFHLEVBQUUsQ0FBQztRQUNwQixJQUFJLFlBQVksR0FBRyxFQUFFLENBQUM7UUFDdEIsSUFBSSxJQUFJLEdBQUcsSUFBSSxXQUFXLENBQUMsU0FBUyxFQUFFLElBQUksQ0FBQyxVQUFVLEVBQUUsS0FBSyxFQUFFLE1BQU0sRUFBRSxDQUFDLEVBQzVDLGNBQWMsQ0FBQyxVQUFVLEVBQUUsRUFBRSxFQUFFLENBQUMsQ0FBQztRQUM1RCxTQUFTLENBQUMsSUFBSSxFQUFFLFFBQVEsRUFBRSxZQUFZLENBQUMsQ0FBQztRQUN4QyxnRUFBZ0U7UUFDaEUsaURBQWlEO1FBQ2pELFFBQVEsQ0FBQyxJQUFJLEVBQUUsUUFBUSxDQUFDLENBQUM7UUFDekIsVUFBVSxDQUFDLElBQUksRUFBRSxVQUFVLENBQUMsQ0FBQztRQUU3QixNQUFNLENBQUMsSUFBSSxpQkFBaUIsQ0FBQyxVQUFVLEVBQUUsSUFBSSxDQUFDLFdBQVcsQ0FBQyxJQUFJLEVBQUUsWUFBWSxDQUFDLENBQUM7SUFDaEYsQ0FBQztBQUNILENBQUM7QUFsQkQ7SUFBQyxVQUFVLEVBQUU7O2dCQUFBO0FBa0JaIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHtJbmplY3RhYmxlfSBmcm9tICdhbmd1bGFyMi9zcmMvY29yZS9kaSc7XG5cbmltcG9ydCAqIGFzIG8gZnJvbSAnLi4vb3V0cHV0L291dHB1dF9hc3QnO1xuaW1wb3J0IHtDb21waWxlRWxlbWVudH0gZnJvbSAnLi9jb21waWxlX2VsZW1lbnQnO1xuaW1wb3J0IHtDb21waWxlVmlld30gZnJvbSAnLi9jb21waWxlX3ZpZXcnO1xuaW1wb3J0IHtidWlsZFZpZXcsIGZpbmlzaFZpZXcsIFZpZXdDb21waWxlRGVwZW5kZW5jeX0gZnJvbSAnLi92aWV3X2J1aWxkZXInO1xuaW1wb3J0IHtiaW5kVmlld30gZnJvbSAnLi92aWV3X2JpbmRlcic7XG5cbmltcG9ydCB7Q29tcGlsZURpcmVjdGl2ZU1ldGFkYXRhLCBDb21waWxlUGlwZU1ldGFkYXRhfSBmcm9tICcuLi9jb21waWxlX21ldGFkYXRhJztcblxuaW1wb3J0IHtUZW1wbGF0ZUFzdH0gZnJvbSAnLi4vdGVtcGxhdGVfYXN0JztcbmltcG9ydCB7Q29tcGlsZXJDb25maWd9IGZyb20gJy4uL2NvbmZpZyc7XG5cbmV4cG9ydCBjbGFzcyBWaWV3Q29tcGlsZVJlc3VsdCB7XG4gIGNvbnN0cnVjdG9yKHB1YmxpYyBzdGF0ZW1lbnRzOiBvLlN0YXRlbWVudFtdLCBwdWJsaWMgdmlld0ZhY3RvcnlWYXI6IHN0cmluZyxcbiAgICAgICAgICAgICAgcHVibGljIGRlcGVuZGVuY2llczogVmlld0NvbXBpbGVEZXBlbmRlbmN5W10pIHt9XG59XG5cbkBJbmplY3RhYmxlKClcbmV4cG9ydCBjbGFzcyBWaWV3Q29tcGlsZXIge1xuICBjb25zdHJ1Y3Rvcihwcml2YXRlIF9nZW5Db25maWc6IENvbXBpbGVyQ29uZmlnKSB7fVxuXG4gIGNvbXBpbGVDb21wb25lbnQoY29tcG9uZW50OiBDb21waWxlRGlyZWN0aXZlTWV0YWRhdGEsIHRlbXBsYXRlOiBUZW1wbGF0ZUFzdFtdLFxuICAgICAgICAgICAgICAgICAgIHN0eWxlczogby5FeHByZXNzaW9uLCBwaXBlczogQ29tcGlsZVBpcGVNZXRhZGF0YVtdKTogVmlld0NvbXBpbGVSZXN1bHQge1xuICAgIHZhciBzdGF0ZW1lbnRzID0gW107XG4gICAgdmFyIGRlcGVuZGVuY2llcyA9IFtdO1xuICAgIHZhciB2aWV3ID0gbmV3IENvbXBpbGVWaWV3KGNvbXBvbmVudCwgdGhpcy5fZ2VuQ29uZmlnLCBwaXBlcywgc3R5bGVzLCAwLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIENvbXBpbGVFbGVtZW50LmNyZWF0ZU51bGwoKSwgW10pO1xuICAgIGJ1aWxkVmlldyh2aWV3LCB0ZW1wbGF0ZSwgZGVwZW5kZW5jaWVzKTtcbiAgICAvLyBOZWVkIHRvIHNlcGFyYXRlIGJpbmRpbmcgZnJvbSBjcmVhdGlvbiB0byBiZSBhYmxlIHRvIHJlZmVyIHRvXG4gICAgLy8gdmFyaWFibGVzIHRoYXQgaGF2ZSBiZWVuIGRlY2xhcmVkIGFmdGVyIHVzYWdlLlxuICAgIGJpbmRWaWV3KHZpZXcsIHRlbXBsYXRlKTtcbiAgICBmaW5pc2hWaWV3KHZpZXcsIHN0YXRlbWVudHMpO1xuXG4gICAgcmV0dXJuIG5ldyBWaWV3Q29tcGlsZVJlc3VsdChzdGF0ZW1lbnRzLCB2aWV3LnZpZXdGYWN0b3J5Lm5hbWUsIGRlcGVuZGVuY2llcyk7XG4gIH1cbn1cbiJdfQ==