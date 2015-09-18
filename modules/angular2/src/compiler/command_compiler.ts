import {isPresent, isBlank, Type, isString} from 'angular2/src/core/facade/lang';
import {SetWrapper, StringMapWrapper, ListWrapper} from 'angular2/src/core/facade/collection';
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
import {CompileTypeMetadata, CompileDirectiveMetadata} from './directive_metadata';
import {SourceExpressions, SourceExpression, moduleRef} from './source_module';

import {ViewEncapsulation} from 'angular2/src/core/render/api';
import {shimHostAttribute, shimContentAttribute} from './style_compiler';
import {escapeSingleQuoteString} from './util';
import {Injectable} from 'angular2/src/core/di';

export var TEMPLATE_COMMANDS_MODULE_REF = moduleRef('angular2/src/core/compiler/template_commands');
const IMPLICIT_VAR = '%implicit';

@Injectable()
export class CommandCompiler {
  compileComponentRuntime(component: CompileDirectiveMetadata, template: TemplateAst[],
                          changeDetectorFactories: Function[],
                          componentTemplateFactory: Function): TemplateCmd[] {
    var visitor = new CommandBuilderVisitor(
        new RuntimeCommandFactory(componentTemplateFactory, changeDetectorFactories), component, 0);
    templateVisitAll(visitor, template);
    return visitor.result;
  }

  compileComponentCodeGen(component: CompileDirectiveMetadata, template: TemplateAst[],
                          changeDetectorFactoryExpressions: string[],
                          componentTemplateFactory: Function): SourceExpression {
    var visitor = new CommandBuilderVisitor(
        new CodegenCommandFactory(componentTemplateFactory, changeDetectorFactoryExpressions),
        component, 0);
    templateVisitAll(visitor, template);
    var source = `[${visitor.result.join(',')}]`;
    return new SourceExpression([], source);
  }
}

interface CommandFactory<R> {
  createText(value: string, isBound: boolean, ngContentIndex: number): R;
  createNgContent(ngContentIndex: number): R;
  createBeginElement(name: string, attrNameAndValues: string[], eventTargetAndNames: string[],
                     variableNameAndValues: string[], directives: CompileDirectiveMetadata[],
                     isBound: boolean, ngContentIndex: number): R;
  createEndElement(): R;
  createBeginComponent(name: string, attrNameAndValues: string[], eventTargetAndNames: string[],
                       variableNameAndValues: string[], directives: CompileDirectiveMetadata[],
                       nativeShadow: boolean, ngContentIndex: number): R;
  createEndComponent(): R;
  createEmbeddedTemplate(embeddedTemplateIndex: number, attrNameAndValues: string[],
                         variableNameAndValues: string[], directives: CompileDirectiveMetadata[],
                         isMerged: boolean, ngContentIndex: number, children: R[]): R;
}

class RuntimeCommandFactory implements CommandFactory<TemplateCmd> {
  constructor(public componentTemplateFactory: Function,
              public changeDetectorFactories: Function[]) {}
  private _mapDirectives(directives: CompileDirectiveMetadata[]): Type[] {
    return directives.map(directive => directive.type.runtime);
  }

  createText(value: string, isBound: boolean, ngContentIndex: number): TemplateCmd {
    return text(value, isBound, ngContentIndex);
  }
  createNgContent(ngContentIndex: number): TemplateCmd { return ngContent(ngContentIndex); }
  createBeginElement(name: string, attrNameAndValues: string[], eventTargetAndNames: string[],
                     variableNameAndValues: string[], directives: CompileDirectiveMetadata[],
                     isBound: boolean, ngContentIndex: number): TemplateCmd {
    return beginElement(name, attrNameAndValues, eventTargetAndNames, variableNameAndValues,
                        this._mapDirectives(directives), isBound, ngContentIndex);
  }
  createEndElement(): TemplateCmd { return endElement(); }
  createBeginComponent(name: string, attrNameAndValues: string[], eventTargetAndNames: string[],
                       variableNameAndValues: string[], directives: CompileDirectiveMetadata[],
                       nativeShadow: boolean, ngContentIndex: number): TemplateCmd {
    return beginComponent(name, attrNameAndValues, eventTargetAndNames, variableNameAndValues,
                          this._mapDirectives(directives), nativeShadow, ngContentIndex,
                          this.componentTemplateFactory(directives[0]));
  }
  createEndComponent(): TemplateCmd { return endComponent(); }
  createEmbeddedTemplate(embeddedTemplateIndex: number, attrNameAndValues: string[],
                         variableNameAndValues: string[], directives: CompileDirectiveMetadata[],
                         isMerged: boolean, ngContentIndex: number,
                         children: TemplateCmd[]): TemplateCmd {
    return embeddedTemplate(attrNameAndValues, variableNameAndValues,
                            this._mapDirectives(directives), isMerged, ngContentIndex,
                            this.changeDetectorFactories[embeddedTemplateIndex], children);
  }
}

function escapePrimitiveArray(data: any[]): string {
  return `[${data.map( (value) => {
    if (isString(value)) {
      return escapeSingleQuoteString(value);
    } else if (isBlank(value)) {
      return 'null';
    } else {
      return value;
    }
  }).join(',')}]`;
}

class CodegenCommandFactory implements CommandFactory<string> {
  constructor(public componentTemplateFactory: Function,
              public changeDetectorFactoryExpressions: string[]) {}

  createText(value: string, isBound: boolean, ngContentIndex: number): string {
    return `${TEMPLATE_COMMANDS_MODULE_REF}text(${escapeSingleQuoteString(value)}, ${isBound}, ${ngContentIndex})`;
  }
  createNgContent(ngContentIndex: number): string {
    return `${TEMPLATE_COMMANDS_MODULE_REF}ngContent(${ngContentIndex})`;
  }
  createBeginElement(name: string, attrNameAndValues: string[], eventTargetAndNames: string[],
                     variableNameAndValues: string[], directives: CompileDirectiveMetadata[],
                     isBound: boolean, ngContentIndex: number): string {
    return `${TEMPLATE_COMMANDS_MODULE_REF}beginElement(${escapeSingleQuoteString(name)}, ${escapePrimitiveArray(attrNameAndValues)}, ${escapePrimitiveArray(eventTargetAndNames)}, ${escapePrimitiveArray(variableNameAndValues)}, [${_escapeDirectives(directives).join(',')}], ${isBound}, ${ngContentIndex})`;
  }
  createEndElement(): string { return `${TEMPLATE_COMMANDS_MODULE_REF}endElement()`; }
  createBeginComponent(name: string, attrNameAndValues: string[], eventTargetAndNames: string[],
                       variableNameAndValues: string[], directives: CompileDirectiveMetadata[],
                       nativeShadow: boolean, ngContentIndex: number): string {
    return `${TEMPLATE_COMMANDS_MODULE_REF}beginComponent(${escapeSingleQuoteString(name)}, ${escapePrimitiveArray(attrNameAndValues)}, ${escapePrimitiveArray(eventTargetAndNames)}, ${escapePrimitiveArray(variableNameAndValues)}, [${_escapeDirectives(directives).join(',')}], ${nativeShadow}, ${ngContentIndex}, ${this.componentTemplateFactory(directives[0])})`;
  }
  createEndComponent(): string { return `${TEMPLATE_COMMANDS_MODULE_REF}endComponent()`; }
  createEmbeddedTemplate(embeddedTemplateIndex: number, attrNameAndValues: string[],
                         variableNameAndValues: string[], directives: CompileDirectiveMetadata[],
                         isMerged: boolean, ngContentIndex: number, children: string[]): string {
    return `${TEMPLATE_COMMANDS_MODULE_REF}embeddedTemplate(${escapePrimitiveArray(attrNameAndValues)}, ${escapePrimitiveArray(variableNameAndValues)}, ` +
           `[${_escapeDirectives(directives).join(',')}], ${isMerged}, ${ngContentIndex}, ${this.changeDetectorFactoryExpressions[embeddedTemplateIndex]}, [${children.join(',')}])`;
  }
}

function _escapeDirectives(directives: CompileDirectiveMetadata[]): string[] {
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
  constructor(public commandFactory: CommandFactory<R>, public component: CompileDirectiveMetadata,
              public embeddedTemplateIndex: number) {}

  private _readAttrNameAndValues(localComponent: CompileDirectiveMetadata,
                                 directives: CompileDirectiveMetadata[],
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
    directives.forEach(directiveMeta => {
      StringMapWrapper.forEach(directiveMeta.hostAttributes, (value, name) => {
        attrNameAndValues.push(name);
        attrNameAndValues.push(value);
      });
    });
    return removeKeyValueArrayDuplicates(attrNameAndValues);
  }

  visitNgContent(ast: NgContentAst, context: any): any {
    this.transitiveNgContentCount++;
    this.result.push(this.commandFactory.createNgContent(ast.ngContentIndex));
    return null;
  }
  visitEmbeddedTemplate(ast: EmbeddedTemplateAst, context: any): any {
    this.embeddedTemplateIndex++;
    var childVisitor =
        new CommandBuilderVisitor(this.commandFactory, this.component, this.embeddedTemplateIndex);
    templateVisitAll(childVisitor, ast.children);
    var isMerged = childVisitor.transitiveNgContentCount > 0;
    var variableNameAndValues = [];
    ast.vars.forEach((varAst) => {
      variableNameAndValues.push(varAst.name);
      variableNameAndValues.push(varAst.value);
    });
    var directives = [];
    ListWrapper.forEachWithIndex(ast.directives, (directiveAst: DirectiveAst, index: number) => {
      directiveAst.visit(this, new DirectiveContext(index, [], [], directives));
    });
    this.result.push(this.commandFactory.createEmbeddedTemplate(
        this.embeddedTemplateIndex, this._readAttrNameAndValues(null, directives, ast.attrs),
        variableNameAndValues, directives, isMerged, ast.ngContentIndex, childVisitor.result));
    this.transitiveNgContentCount += childVisitor.transitiveNgContentCount;
    this.embeddedTemplateIndex = childVisitor.embeddedTemplateIndex;
    return null;
  }
  visitElement(ast: ElementAst, context: any): any {
    var component = ast.getComponent();
    var eventTargetAndNames = visitAndReturnContext(this, ast.events, []);
    var variableNameAndValues = [];
    if (isBlank(component)) {
      ast.exportAsVars.forEach((varAst) => {
        variableNameAndValues.push(varAst.name);
        variableNameAndValues.push(IMPLICIT_VAR);
      });
    }
    var directives = [];
    ListWrapper.forEachWithIndex(ast.directives, (directiveAst: DirectiveAst, index: number) => {
      directiveAst.visit(this, new DirectiveContext(index, eventTargetAndNames,
                                                    variableNameAndValues, directives));
    });
    eventTargetAndNames = removeKeyValueArrayDuplicates(eventTargetAndNames);

    var attrNameAndValues = this._readAttrNameAndValues(component, directives, ast.attrs);
    if (isPresent(component)) {
      this.result.push(this.commandFactory.createBeginComponent(
          ast.name, attrNameAndValues, eventTargetAndNames, variableNameAndValues, directives,
          component.template.encapsulation === ViewEncapsulation.Native, ast.ngContentIndex));
      templateVisitAll(this, ast.children);
      this.result.push(this.commandFactory.createEndComponent());
    } else {
      this.result.push(this.commandFactory.createBeginElement(
          ast.name, attrNameAndValues, eventTargetAndNames, variableNameAndValues, directives,
          ast.isBound(), ast.ngContentIndex));
      templateVisitAll(this, ast.children);
      this.result.push(this.commandFactory.createEndElement());
    }
    return null;
  }
  visitVariable(ast: VariableAst, ctx: any): any { return null; }
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
  visitDirective(ast: DirectiveAst, ctx: DirectiveContext): any {
    ctx.targetDirectives.push(ast.directive);
    templateVisitAll(this, ast.hostEvents, ctx.eventTargetAndNames);
    ast.exportAsVars.forEach(varAst => {
      ctx.targetVariableNameAndValues.push(varAst.name);
      ctx.targetVariableNameAndValues.push(ctx.index);
    });
    return null;
  }
  visitEvent(ast: BoundEventAst, eventTargetAndNames: string[]): any {
    eventTargetAndNames.push(ast.target);
    eventTargetAndNames.push(ast.name);
    return null;
  }
  visitDirectiveProperty(ast: BoundDirectivePropertyAst, context: any): any { return null; }
  visitElementProperty(ast: BoundElementPropertyAst, context: any): any { return null; }
}

function removeKeyValueArrayDuplicates(keyValueArray: string[]): string[] {
  var knownPairs = new Set();
  var resultKeyValueArray = [];
  for (var i = 0; i < keyValueArray.length; i += 2) {
    var key = keyValueArray[i];
    var value = keyValueArray[i + 1];
    var pairId = `${key}:${value}`;
    if (!SetWrapper.has(knownPairs, pairId)) {
      resultKeyValueArray.push(key);
      resultKeyValueArray.push(value);
      knownPairs.add(pairId);
    }
  }
  return resultKeyValueArray;
}

class DirectiveContext {
  constructor(public index: number, public eventTargetAndNames: string[],
              public targetVariableNameAndValues: any[],
              public targetDirectives: CompileDirectiveMetadata[]) {}
}