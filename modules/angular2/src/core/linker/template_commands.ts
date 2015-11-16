import {Type, CONST_EXPR, CONST, isPresent, isBlank} from 'angular2/src/facade/lang';
import {unimplemented} from 'angular2/src/facade/exceptions';
import {
  RenderTemplateCmd,
  RenderCommandVisitor,
  RenderBeginElementCmd,
  RenderTextCmd,
  RenderNgContentCmd,
  RenderBeginComponentCmd,
  RenderEmbeddedTemplateCmd
} from 'angular2/src/core/render/render';
import {ViewEncapsulation} from 'angular2/src/core/metadata';
// Export ViewEncapsulation so that compiled templates only need to depend
// on template_commands.
export {ViewEncapsulation} from 'angular2/src/core/metadata';

/**
 * A compiled host template.
 *
 * This is const as we are storing it as annotation
 * for the compiled component type.
 */
@CONST()
export class CompiledHostTemplate {
  constructor(public template: CompiledComponentTemplate) {}
}

/**
 * A compiled template.
 */
@CONST()
export class CompiledComponentTemplate {
  constructor(public id: string, public changeDetectorFactory: Function,
              public commands: TemplateCmd[], public styles: string[]) {}
}

const EMPTY_ARR = CONST_EXPR([]);

export interface TemplateCmd extends RenderTemplateCmd {
  visit(visitor: RenderCommandVisitor, context: any): any;
}

@CONST()
export class TextCmd implements TemplateCmd, RenderTextCmd {
  constructor(public value: string, public isBound: boolean, public ngContentIndex: number) {}
  visit(visitor: RenderCommandVisitor, context: any): any {
    return visitor.visitText(this, context);
  }
}

@CONST()
export class NgContentCmd implements TemplateCmd, RenderNgContentCmd {
  isBound: boolean = false;
  constructor(public index: number, public ngContentIndex: number) {}
  visit(visitor: RenderCommandVisitor, context: any): any {
    return visitor.visitNgContent(this, context);
  }
}

export abstract class IBeginElementCmd extends RenderBeginElementCmd implements TemplateCmd {
  get variableNameAndValues(): Array<string | number> { return unimplemented(); }
  get eventTargetAndNames(): string[] { return unimplemented(); }
  get directives(): Type[] { return unimplemented(); }
  abstract visit(visitor: RenderCommandVisitor, context: any): any;
}

@CONST()
export class BeginElementCmd implements TemplateCmd, IBeginElementCmd, RenderBeginElementCmd {
  constructor(public name: string, public attrNameAndValues: string[],
              public eventTargetAndNames: string[],
              public variableNameAndValues: Array<string | number>, public directives: Type[],
              public isBound: boolean, public ngContentIndex: number) {}
  visit(visitor: RenderCommandVisitor, context: any): any {
    return visitor.visitBeginElement(this, context);
  }
}


@CONST()
export class EndElementCmd implements TemplateCmd {
  visit(visitor: RenderCommandVisitor, context: any): any {
    return visitor.visitEndElement(context);
  }
}

@CONST()
export class BeginComponentCmd implements TemplateCmd, IBeginElementCmd, RenderBeginComponentCmd {
  isBound: boolean = true;
  constructor(public name: string, public attrNameAndValues: string[],
              public eventTargetAndNames: string[],
              public variableNameAndValues: Array<string | number>, public directives: Type[],
              public encapsulation: ViewEncapsulation, public ngContentIndex: number,
              // Note: the template needs to be stored as a function
              // so that we can resolve cycles
              public templateGetter: Function /*() => CompiledComponentTemplate*/) {}

  get templateId(): string { return this.templateGetter().id; }

  visit(visitor: RenderCommandVisitor, context: any): any {
    return visitor.visitBeginComponent(this, context);
  }
}

@CONST()
export class EndComponentCmd implements TemplateCmd {
  visit(visitor: RenderCommandVisitor, context: any): any {
    return visitor.visitEndComponent(context);
  }
}

@CONST()
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
