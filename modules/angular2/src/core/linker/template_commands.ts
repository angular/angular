import {Type, CONST_EXPR, CONST, isPresent, isBlank} from 'angular2/src/core/facade/lang';
import {
  RenderTemplateCmd,
  RenderCommandVisitor,
  RenderBeginElementCmd,
  RenderTextCmd,
  RenderNgContentCmd,
  RenderBeginComponentCmd,
  RenderEmbeddedTemplateCmd
} from 'angular2/src/core/render/render';

var _nextTemplateId: number = 0;

export function nextTemplateId(): number {
  return _nextTemplateId++;
}

/**
 * A compiled host template.
 *
 * This is const as we are storing it as annotation
 * for the compiled component type.
 */
@CONST()
export class CompiledHostTemplate {
  // Note: _templateGetter is a function so that CompiledHostTemplate can be
  // a const!
  constructor(private _templateGetter: Function) {}

  getTemplate(): CompiledTemplate { return this._templateGetter(); }
}

/**
 * A compiled template.
 */
export class CompiledTemplate {
  // Note: paramGetter is a function so that we can have cycles between templates!
  // paramGetter returns a tuple with:
  // - ChangeDetector factory function
  // - TemplateCmd[]
  // - styles
  constructor(public id: number,
              private _dataGetter: /*()=>Array<Function, TemplateCmd[], string[]>*/ Function) {}

  getData(appId: string): CompiledTemplateData {
    var data = this._dataGetter(appId, this.id);
    return new CompiledTemplateData(data[0], data[1], data[2]);
  }
}

export class CompiledTemplateData {
  constructor(public changeDetectorFactory: Function, public commands: TemplateCmd[],
              public styles: string[]) {}
}

const EMPTY_ARR = CONST_EXPR([]);

export interface TemplateCmd extends RenderTemplateCmd {
  visit(visitor: RenderCommandVisitor, context: any): any;
}

export class TextCmd implements TemplateCmd, RenderTextCmd {
  constructor(public value: string, public isBound: boolean, public ngContentIndex: number) {}
  visit(visitor: RenderCommandVisitor, context: any): any {
    return visitor.visitText(this, context);
  }
}

export function text(value: string, isBound: boolean, ngContentIndex: number): TextCmd {
  return new TextCmd(value, isBound, ngContentIndex);
}

export class NgContentCmd implements TemplateCmd, RenderNgContentCmd {
  isBound: boolean = false;
  constructor(public index: number, public ngContentIndex: number) {}
  visit(visitor: RenderCommandVisitor, context: any): any {
    return visitor.visitNgContent(this, context);
  }
}

export function ngContent(index: number, ngContentIndex: number): NgContentCmd {
  return new NgContentCmd(index, ngContentIndex);
}

export interface IBeginElementCmd extends TemplateCmd, RenderBeginElementCmd {
  variableNameAndValues: Array<string | number>;
  eventTargetAndNames: string[];
  directives: Type[];
  visit(visitor: RenderCommandVisitor, context: any): any;
}

export class BeginElementCmd implements TemplateCmd, IBeginElementCmd, RenderBeginElementCmd {
  constructor(public name: string, public attrNameAndValues: string[],
              public eventTargetAndNames: string[],
              public variableNameAndValues: Array<string | number>, public directives: Type[],
              public isBound: boolean, public ngContentIndex: number) {}
  visit(visitor: RenderCommandVisitor, context: any): any {
    return visitor.visitBeginElement(this, context);
  }
}

export function beginElement(name: string, attrNameAndValues: string[],
                             eventTargetAndNames: string[],
                             variableNameAndValues: Array<string | number>, directives: Type[],
                             isBound: boolean, ngContentIndex: number): BeginElementCmd {
  return new BeginElementCmd(name, attrNameAndValues, eventTargetAndNames, variableNameAndValues,
                             directives, isBound, ngContentIndex);
}

export class EndElementCmd implements TemplateCmd {
  visit(visitor: RenderCommandVisitor, context: any): any {
    return visitor.visitEndElement(context);
  }
}

export function endElement(): TemplateCmd {
  return new EndElementCmd();
}

export class BeginComponentCmd implements TemplateCmd, IBeginElementCmd, RenderBeginComponentCmd {
  isBound: boolean = true;
  templateId: number;
  constructor(public name: string, public attrNameAndValues: string[],
              public eventTargetAndNames: string[],
              public variableNameAndValues: Array<string | number>, public directives: Type[],
              public nativeShadow: boolean, public ngContentIndex: number,
              public template: CompiledTemplate) {
    this.templateId = template.id;
  }
  visit(visitor: RenderCommandVisitor, context: any): any {
    return visitor.visitBeginComponent(this, context);
  }
}

export function beginComponent(
    name: string, attrNameAnsValues: string[], eventTargetAndNames: string[],
    variableNameAndValues: Array<string | number>, directives: Type[], nativeShadow: boolean,
    ngContentIndex: number, template: CompiledTemplate): BeginComponentCmd {
  return new BeginComponentCmd(name, attrNameAnsValues, eventTargetAndNames, variableNameAndValues,
                               directives, nativeShadow, ngContentIndex, template);
}

export class EndComponentCmd implements TemplateCmd {
  visit(visitor: RenderCommandVisitor, context: any): any {
    return visitor.visitEndComponent(context);
  }
}

export function endComponent(): TemplateCmd {
  return new EndComponentCmd();
}

export class EmbeddedTemplateCmd implements TemplateCmd, IBeginElementCmd,
    RenderEmbeddedTemplateCmd {
  isBound: boolean = true;
  name: string = null;
  eventTargetAndNames: string[] = EMPTY_ARR;
  constructor(public attrNameAndValues: string[], public variableNameAndValues: string[],
              public directives: Type[], public isMerged: boolean, public ngContentIndex: number,
              public changeDetectorFactory: Function, public children: TemplateCmd[]) {}
  visit(visitor: RenderCommandVisitor, context: any): any {
    return visitor.visitEmbeddedTemplate(this, context);
  }
}

export function embeddedTemplate(attrNameAndValues: string[], variableNameAndValues: string[],
                                 directives: Type[], isMerged: boolean, ngContentIndex: number,
                                 changeDetectorFactory: Function, children: TemplateCmd[]):
    EmbeddedTemplateCmd {
  return new EmbeddedTemplateCmd(attrNameAndValues, variableNameAndValues, directives, isMerged,
                                 ngContentIndex, changeDetectorFactory, children);
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

export function visitAllCommands(visitor: CommandVisitor, cmds: TemplateCmd[],
                                 context: any = null) {
  for (var i = 0; i < cmds.length; i++) {
    cmds[i].visit(visitor, context);
  }
}
