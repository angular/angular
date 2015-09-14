import {isPresent, Type} from 'angular2/src/core/facade/lang';
import {
  TemplateCmd,
  text,
  ngContent,
  beginElement,
  endElement,
  beginComponent,
  endComponent,
  embeddedTemplate
} from 'angular2/src/core/compiler/template_commands';
import {
  TemplateAst,
  TemplateAstVisitor,
  NgContentAst,
  EmbeddedTemplateAst,
  ElementAst,
  VariableAst,
  BoundEventAst,
  BoundElementPropertyAst,
  AttrAst,
  BoundTextAst,
  TextAst,
  DirectiveAst,
  BoundDirectivePropertyAst,
  templateVisitAll
} from './template_ast';
import {TypeMetadata, NormalizedDirectiveMetadata} from './directive_metadata';
import {SourceExpression, moduleRef} from './source_module';

import {ViewEncapsulation} from 'angular2/src/core/render/api';
import {shimHostAttribute, shimContentAttribute} from './style_compiler';
import {escapeSingleQuoteString} from './util';
import {Injectable} from 'angular2/src/core/di';

export var TEMPLATE_COMMANDS_MODULE_REF = moduleRef('angular2/src/core/compiler/template_commands');

@Injectable()
export class CommandCompiler {
  compileComponentRuntime(component: NormalizedDirectiveMetadata, template: TemplateAst[],
                          componentTemplateFactory: Function): TemplateCmd[] {
    var visitor =
        new CommandBuilderVisitor(new RuntimeCommandFactory(componentTemplateFactory), component);
    templateVisitAll(visitor, template);
    return visitor.result;
  }

  compileComponentCodeGen(component: NormalizedDirectiveMetadata, template: TemplateAst[],
                          componentTemplateFactory: Function): SourceExpression {
    var visitor =
        new CommandBuilderVisitor(new CodegenCommandFactory(componentTemplateFactory), component);
    templateVisitAll(visitor, template);
    var source = `[${visitor.result.join(',')}]`;
    return new SourceExpression([], source);
  }
}

interface CommandFactory<R> {
  createText(value: string, isBound: boolean, ngContentIndex: number): R;
  createNgContent(ngContentIndex: number): R;
  createBeginElement(name: string, attrNameAndValues: string[], eventNames: string[],
                     variableNameAndValues: string[], directives: NormalizedDirectiveMetadata[],
                     isBound: boolean, ngContentIndex: number): R;
  createEndElement(): R;
  createBeginComponent(name: string, attrNameAndValues: string[], eventNames: string[],
                       variableNameAndValues: string[], directives: NormalizedDirectiveMetadata[],
                       nativeShadow: boolean, ngContentIndex: number): R;
  createEndComponent(): R;
  createEmbeddedTemplate(attrNameAndValues: string[], variableNameAndValues: string[],
                         directives: NormalizedDirectiveMetadata[], isMerged: boolean,
                         ngContentIndex: number, children: R[]): R;
}

class RuntimeCommandFactory implements CommandFactory<TemplateCmd> {
  constructor(public componentTemplateFactory: Function) {}
  private _mapDirectives(directives: NormalizedDirectiveMetadata[]): Type[] {
    return directives.map(directive => directive.type.runtime);
  }

  createText(value: string, isBound: boolean, ngContentIndex: number): TemplateCmd {
    return text(value, isBound, ngContentIndex);
  }
  createNgContent(ngContentIndex: number): TemplateCmd { return ngContent(ngContentIndex); }
  createBeginElement(name: string, attrNameAndValues: string[], eventNames: string[],
                     variableNameAndValues: string[], directives: NormalizedDirectiveMetadata[],
                     isBound: boolean, ngContentIndex: number): TemplateCmd {
    return beginElement(name, attrNameAndValues, eventNames, variableNameAndValues,
                        this._mapDirectives(directives), isBound, ngContentIndex);
  }
  createEndElement(): TemplateCmd { return endElement(); }
  createBeginComponent(name: string, attrNameAndValues: string[], eventNames: string[],
                       variableNameAndValues: string[], directives: NormalizedDirectiveMetadata[],
                       nativeShadow: boolean, ngContentIndex: number): TemplateCmd {
    return beginComponent(name, attrNameAndValues, eventNames, variableNameAndValues,
                          this._mapDirectives(directives), nativeShadow, ngContentIndex,
                          this.componentTemplateFactory(directives[0]));
  }
  createEndComponent(): TemplateCmd { return endComponent(); }
  createEmbeddedTemplate(attrNameAndValues: string[], variableNameAndValues: string[],
                         directives: NormalizedDirectiveMetadata[], isMerged: boolean,
                         ngContentIndex: number, children: TemplateCmd[]): TemplateCmd {
    return embeddedTemplate(attrNameAndValues, variableNameAndValues,
                            this._mapDirectives(directives), isMerged, ngContentIndex, children);
  }
}

function escapeStringArray(data: string[]): string {
  return `[${data.map( value => escapeSingleQuoteString(value)).join(',')}]`;
}

class CodegenCommandFactory implements CommandFactory<string> {
  constructor(public componentTemplateFactory: Function) {}

  createText(value: string, isBound: boolean, ngContentIndex: number): string {
    return `${TEMPLATE_COMMANDS_MODULE_REF}text(${escapeSingleQuoteString(value)}, ${isBound}, ${ngContentIndex})`;
  }
  createNgContent(ngContentIndex: number): string {
    return `${TEMPLATE_COMMANDS_MODULE_REF}ngContent(${ngContentIndex})`;
  }
  createBeginElement(name: string, attrNameAndValues: string[], eventNames: string[],
                     variableNameAndValues: string[], directives: NormalizedDirectiveMetadata[],
                     isBound: boolean, ngContentIndex: number): string {
    return `${TEMPLATE_COMMANDS_MODULE_REF}beginElement(${escapeSingleQuoteString(name)}, ${escapeStringArray(attrNameAndValues)}, ${escapeStringArray(eventNames)}, ${escapeStringArray(variableNameAndValues)}, [${_escapeDirectives(directives).join(',')}], ${isBound}, ${ngContentIndex})`;
  }
  createEndElement(): string { return `${TEMPLATE_COMMANDS_MODULE_REF}endElement()`; }
  createBeginComponent(name: string, attrNameAndValues: string[], eventNames: string[],
                       variableNameAndValues: string[], directives: NormalizedDirectiveMetadata[],
                       nativeShadow: boolean, ngContentIndex: number): string {
    return `${TEMPLATE_COMMANDS_MODULE_REF}beginComponent(${escapeSingleQuoteString(name)}, ${escapeStringArray(attrNameAndValues)}, ${escapeStringArray(eventNames)}, ${escapeStringArray(variableNameAndValues)}, [${_escapeDirectives(directives).join(',')}], ${nativeShadow}, ${ngContentIndex}, ${this.componentTemplateFactory(directives[0])})`;
  }
  createEndComponent(): string { return `${TEMPLATE_COMMANDS_MODULE_REF}endComponent()`; }
  createEmbeddedTemplate(attrNameAndValues: string[], variableNameAndValues: string[],
                         directives: NormalizedDirectiveMetadata[], isMerged: boolean,
                         ngContentIndex: number, children: string[]): string {
    return `${TEMPLATE_COMMANDS_MODULE_REF}embeddedTemplate(${escapeStringArray(attrNameAndValues)}, ${escapeStringArray(variableNameAndValues)}, [${_escapeDirectives(directives).join(',')}], ${isMerged}, ${ngContentIndex}, [${children.join(',')}])`;
  }
}

function _escapeDirectives(directives: NormalizedDirectiveMetadata[]): string[] {
  return directives.map(directiveType =>
                            `${moduleRef(directiveType.type.moduleId)}${directiveType.type.name}`);
}

function visitAndReturnContext(visitor: TemplateAstVisitor, asts: TemplateAst[], context: any):
    any {
  templateVisitAll(visitor, asts, context);
  return context;
}

class CommandBuilderVisitor<R> implements TemplateAstVisitor {
  result: R[] = [];
  transitiveNgContentCount: number = 0;
  constructor(public commandFactory: CommandFactory<R>,
              public component: NormalizedDirectiveMetadata) {}

  private _readAttrNameAndValues(localComponent: NormalizedDirectiveMetadata,
                                 attrAsts: TemplateAst[]): string[] {
    var attrNameAndValues: string[] = visitAndReturnContext(this, attrAsts, []);
    if (isPresent(localComponent) &&
        localComponent.template.encapsulation === ViewEncapsulation.Emulated) {
      attrNameAndValues.push(shimHostAttribute(localComponent.type.id));
      attrNameAndValues.push('');
    }
    if (this.component.template.encapsulation === ViewEncapsulation.Emulated) {
      attrNameAndValues.push(shimContentAttribute(this.component.type.id));
      attrNameAndValues.push('');
    }
    return attrNameAndValues;
  }

  visitNgContent(ast: NgContentAst, context: any): any {
    this.transitiveNgContentCount++;
    this.result.push(this.commandFactory.createNgContent(ast.ngContentIndex));
    return null;
  }
  visitEmbeddedTemplate(ast: EmbeddedTemplateAst, context: any): any {
    var childVisitor = new CommandBuilderVisitor(this.commandFactory, this.component);
    templateVisitAll(childVisitor, ast.children);
    var isMerged = childVisitor.transitiveNgContentCount > 0;
    this.transitiveNgContentCount += childVisitor.transitiveNgContentCount;
    var directivesAndEventNames = visitAndReturnContext(this, ast.directives, [[], []]);
    this.result.push(this.commandFactory.createEmbeddedTemplate(
        this._readAttrNameAndValues(null, ast.attrs), visitAndReturnContext(this, ast.vars, []),
        directivesAndEventNames[0], isMerged, ast.ngContentIndex, childVisitor.result));
    return null;
  }
  visitElement(ast: ElementAst, context: any): any {
    var component = ast.getComponent();
    var eventNames = visitAndReturnContext(this, ast.events, []);
    var directives = [];
    visitAndReturnContext(this, ast.directives, [directives, eventNames]);
    var attrNameAndValues = this._readAttrNameAndValues(component, ast.attrs);
    var vars = visitAndReturnContext(this, ast.vars, []);
    if (isPresent(component)) {
      this.result.push(this.commandFactory.createBeginComponent(
          ast.name, attrNameAndValues, eventNames, vars, directives,
          component.template.encapsulation === ViewEncapsulation.Native, ast.ngContentIndex));
      templateVisitAll(this, ast.children);
      this.result.push(this.commandFactory.createEndComponent());
    } else {
      this.result.push(this.commandFactory.createBeginElement(ast.name, attrNameAndValues,
                                                              eventNames, vars, directives,
                                                              ast.isBound(), ast.ngContentIndex));
      templateVisitAll(this, ast.children);
      this.result.push(this.commandFactory.createEndElement());
    }
    return null;
  }
  visitVariable(ast: VariableAst, variableNameAndValues: string[]): any {
    variableNameAndValues.push(ast.name);
    variableNameAndValues.push(ast.value);
    return null;
  }
  visitAttr(ast: AttrAst, attrNameAndValues: string[]): any {
    attrNameAndValues.push(ast.name);
    attrNameAndValues.push(ast.value);
    return null;
  }
  visitBoundText(ast: BoundTextAst, context: any): any {
    this.result.push(this.commandFactory.createText(null, true, ast.ngContentIndex));
    return null;
  }
  visitText(ast: TextAst, context: any): any {
    this.result.push(this.commandFactory.createText(ast.value, false, ast.ngContentIndex));
    return null;
  }
  visitDirective(ast: DirectiveAst, directivesAndEventNames: any[][]): any {
    directivesAndEventNames[0].push(ast.directive);
    templateVisitAll(this, ast.hostEvents, directivesAndEventNames[1]);
    return null;
  }
  visitEvent(ast: BoundEventAst, eventNames: string[]): any {
    eventNames.push(ast.getFullName());
    return null;
  }
  visitDirectiveProperty(ast: BoundDirectivePropertyAst, context: any): any { return null; }
  visitElementProperty(ast: BoundElementPropertyAst, context: any): any { return null; }
}
