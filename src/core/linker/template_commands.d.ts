import { Type } from 'angular2/src/facade/lang';
import { RenderTemplateCmd, RenderCommandVisitor, RenderBeginElementCmd, RenderTextCmd, RenderNgContentCmd, RenderBeginComponentCmd, RenderEmbeddedTemplateCmd } from 'angular2/src/core/render/api';
import { ViewEncapsulation } from 'angular2/src/core/metadata';
export { ViewEncapsulation } from 'angular2/src/core/metadata';
/**
 * A compiled host template.
 *
 * This is const as we are storing it as annotation
 * for the compiled component type.
 */
export declare class CompiledHostTemplate {
    template: CompiledComponentTemplate;
    constructor(template: CompiledComponentTemplate);
}
/**
 * A compiled template.
 */
export declare class CompiledComponentTemplate {
    id: string;
    changeDetectorFactory: Function;
    commands: TemplateCmd[];
    styles: string[];
    constructor(id: string, changeDetectorFactory: Function, commands: TemplateCmd[], styles: string[]);
}
export interface TemplateCmd extends RenderTemplateCmd {
    visit(visitor: RenderCommandVisitor, context: any): any;
}
export declare class TextCmd implements TemplateCmd, RenderTextCmd {
    value: string;
    isBound: boolean;
    ngContentIndex: number;
    constructor(value: string, isBound: boolean, ngContentIndex: number);
    visit(visitor: RenderCommandVisitor, context: any): any;
}
export declare class NgContentCmd implements TemplateCmd, RenderNgContentCmd {
    index: number;
    ngContentIndex: number;
    isBound: boolean;
    constructor(index: number, ngContentIndex: number);
    visit(visitor: RenderCommandVisitor, context: any): any;
}
export declare abstract class IBeginElementCmd extends RenderBeginElementCmd implements TemplateCmd {
    variableNameAndValues: Array<string | number>;
    eventTargetAndNames: string[];
    directives: Type[];
    abstract visit(visitor: RenderCommandVisitor, context: any): any;
}
export declare class BeginElementCmd implements TemplateCmd, IBeginElementCmd, RenderBeginElementCmd {
    name: string;
    attrNameAndValues: string[];
    eventTargetAndNames: string[];
    variableNameAndValues: Array<string | number>;
    directives: Type[];
    isBound: boolean;
    ngContentIndex: number;
    constructor(name: string, attrNameAndValues: string[], eventTargetAndNames: string[], variableNameAndValues: Array<string | number>, directives: Type[], isBound: boolean, ngContentIndex: number);
    visit(visitor: RenderCommandVisitor, context: any): any;
}
export declare class EndElementCmd implements TemplateCmd {
    visit(visitor: RenderCommandVisitor, context: any): any;
}
export declare class BeginComponentCmd implements TemplateCmd, IBeginElementCmd, RenderBeginComponentCmd {
    name: string;
    attrNameAndValues: string[];
    eventTargetAndNames: string[];
    variableNameAndValues: Array<string | number>;
    directives: Type[];
    encapsulation: ViewEncapsulation;
    ngContentIndex: number;
    templateGetter: Function;
    isBound: boolean;
    constructor(name: string, attrNameAndValues: string[], eventTargetAndNames: string[], variableNameAndValues: Array<string | number>, directives: Type[], encapsulation: ViewEncapsulation, ngContentIndex: number, templateGetter: Function);
    templateId: string;
    visit(visitor: RenderCommandVisitor, context: any): any;
}
export declare class EndComponentCmd implements TemplateCmd {
    visit(visitor: RenderCommandVisitor, context: any): any;
}
export declare class EmbeddedTemplateCmd implements TemplateCmd, IBeginElementCmd, RenderEmbeddedTemplateCmd {
    attrNameAndValues: string[];
    variableNameAndValues: string[];
    directives: Type[];
    isMerged: boolean;
    ngContentIndex: number;
    changeDetectorFactory: Function;
    children: TemplateCmd[];
    isBound: boolean;
    name: string;
    eventTargetAndNames: string[];
    constructor(attrNameAndValues: string[], variableNameAndValues: string[], directives: Type[], isMerged: boolean, ngContentIndex: number, changeDetectorFactory: Function, children: TemplateCmd[]);
    visit(visitor: RenderCommandVisitor, context: any): any;
}
export interface CommandVisitor extends RenderCommandVisitor {
    visitText(cmd: TextCmd, context: any): any;
    visitNgContent(cmd: NgContentCmd, context: any): any;
    visitBeginElement(cmd: BeginElementCmd, context: any): any;
    visitEndElement(context: any): any;
    visitBeginComponent(cmd: BeginComponentCmd, context: any): any;
    visitEndComponent(context: any): any;
    visitEmbeddedTemplate(cmd: EmbeddedTemplateCmd, context: any): any;
}
export declare function visitAllCommands(visitor: CommandVisitor, cmds: TemplateCmd[], context?: any): void;
