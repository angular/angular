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
