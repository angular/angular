import {isPresent, isBlank, Type, isString, StringWrapper} from 'angular2/src/core/facade/lang';
import {SetWrapper, StringMapWrapper, ListWrapper} from 'angular2/src/core/facade/collection';
import {
  TemplateCmd,
  text,
  ngContent,
  beginElement,
  endElement,
  beginComponent,
  endComponent,
  embeddedTemplate,
  CompiledTemplate
} from 'angular2/src/core/linker/template_commands';
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

import {ViewEncapsulation} from 'angular2/src/core/metadata/view';
import {
  shimHostAttribute,
  shimContentAttribute,
  shimContentAttributeExpr,
  shimHostAttributeExpr
} from './style_compiler';
import {escapeSingleQuoteString, MODULE_SUFFIX} from './util';
import {Injectable} from 'angular2/src/core/di';

export var TEMPLATE_COMMANDS_MODULE_REF =
    moduleRef(`package:angular2/src/core/linker/template_commands${MODULE_SUFFIX}`);

const IMPLICIT_TEMPLATE_VAR = '\$implicit';
const CLASS_ATTR = 'class';
const STYLE_ATTR = 'style';

@Injectable()
export class CommandCompiler {
  compileComponentRuntime(component: CompileDirectiveMetadata, appId: string, templateId: number,
                          template: TemplateAst[], changeDetectorFactories: Function[],
                          componentTemplateFactory: Function): TemplateCmd[] {
    var visitor = new CommandBuilderVisitor(
        new RuntimeCommandFactory(component, appId, templateId, componentTemplateFactory,
                                  changeDetectorFactories),
        0);
    templateVisitAll(visitor, template);
    return visitor.result;
  }

  compileComponentCodeGen(component: CompileDirectiveMetadata, appIdExpr: string,
                          templateIdExpr: string, template: TemplateAst[],
                          changeDetectorFactoryExpressions: string[],
                          componentTemplateFactory: Function): SourceExpression {
    var visitor = new CommandBuilderVisitor(
        new CodegenCommandFactory(component, appIdExpr, templateIdExpr, componentTemplateFactory,
                                  changeDetectorFactoryExpressions),
        0);
    templateVisitAll(visitor, template);
    var source = `[${visitor.result.join(',')}]`;
    return new SourceExpression([], source);
  }
}

interface CommandFactory<R> {
  createText(value: string, isBound: boolean, ngContentIndex: number): R;
  createNgContent(index: number, ngContentIndex: number): R;
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
  constructor(private component: CompileDirectiveMetadata, private appId: string,
              private templateId: number, private componentTemplateFactory: Function,
              private changeDetectorFactories: Function[]) {}
  private _mapDirectives(directives: CompileDirectiveMetadata[]): Type[] {
    return directives.map(directive => directive.type.runtime);
  }
  private _addStyleShimAttributes(attrNameAndValues: string[],
                                  localComponent: CompileDirectiveMetadata,
                                  localTemplateId: number): string[] {
    var additionalStyles = [];
    if (isPresent(localComponent) &&
        localComponent.template.encapsulation === ViewEncapsulation.Emulated) {
      additionalStyles.push(shimHostAttribute(this.appId, localTemplateId));
      additionalStyles.push('');
    }
    if (this.component.template.encapsulation === ViewEncapsulation.Emulated) {
      additionalStyles.push(shimContentAttribute(this.appId, this.templateId));
      additionalStyles.push('');
    }
    return additionalStyles.concat(attrNameAndValues);
  }

  createText(value: string, isBound: boolean, ngContentIndex: number): TemplateCmd {
    return text(value, isBound, ngContentIndex);
  }
  createNgContent(index: number, ngContentIndex: number): TemplateCmd {
    return ngContent(index, ngContentIndex);
  }
  createBeginElement(name: string, attrNameAndValues: string[], eventTargetAndNames: string[],
                     variableNameAndValues: string[], directives: CompileDirectiveMetadata[],
                     isBound: boolean, ngContentIndex: number): TemplateCmd {
    return beginElement(name, this._addStyleShimAttributes(attrNameAndValues, null, null),
                        eventTargetAndNames, variableNameAndValues, this._mapDirectives(directives),
                        isBound, ngContentIndex);
  }
  createEndElement(): TemplateCmd { return endElement(); }
  createBeginComponent(name: string, attrNameAndValues: string[], eventTargetAndNames: string[],
                       variableNameAndValues: string[], directives: CompileDirectiveMetadata[],
                       nativeShadow: boolean, ngContentIndex: number): TemplateCmd {
    var nestedTemplate = this.componentTemplateFactory(directives[0]);
    return beginComponent(
        name, this._addStyleShimAttributes(attrNameAndValues, directives[0], nestedTemplate.id),
        eventTargetAndNames, variableNameAndValues, this._mapDirectives(directives), nativeShadow,
        ngContentIndex, nestedTemplate);
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

class CodegenCommandFactory implements CommandFactory<string> {
  constructor(private component: CompileDirectiveMetadata, private appIdExpr: string,
              private templateIdExpr: string, private componentTemplateFactory: Function,
              private changeDetectorFactoryExpressions: string[]) {}

  private _addStyleShimAttributes(attrNameAndValues: string[],
                                  localComponent: CompileDirectiveMetadata,
                                  localTemplateIdExpr: string): any[] {
    var additionalStlyes = [];
    if (isPresent(localComponent) &&
        localComponent.template.encapsulation === ViewEncapsulation.Emulated) {
      additionalStlyes.push(
          new Expression(shimHostAttributeExpr(this.appIdExpr, localTemplateIdExpr)));
      additionalStlyes.push('');
    }
    if (this.component.template.encapsulation === ViewEncapsulation.Emulated) {
      additionalStlyes.push(
          new Expression(shimContentAttributeExpr(this.appIdExpr, this.templateIdExpr)));
      additionalStlyes.push('');
    }
    return additionalStlyes.concat(attrNameAndValues);
  }

  createText(value: string, isBound: boolean, ngContentIndex: number): string {
    return `${TEMPLATE_COMMANDS_MODULE_REF}text(${escapeSingleQuoteString(value)}, ${isBound}, ${ngContentIndex})`;
  }
  createNgContent(index: number, ngContentIndex: number): string {
    return `${TEMPLATE_COMMANDS_MODULE_REF}ngContent(${index}, ${ngContentIndex})`;
  }
  createBeginElement(name: string, attrNameAndValues: string[], eventTargetAndNames: string[],
                     variableNameAndValues: string[], directives: CompileDirectiveMetadata[],
                     isBound: boolean, ngContentIndex: number): string {
    var attrsExpression = codeGenArray(this._addStyleShimAttributes(attrNameAndValues, null, null));
    return `${TEMPLATE_COMMANDS_MODULE_REF}beginElement(${escapeSingleQuoteString(name)}, ${attrsExpression}, ${codeGenArray(eventTargetAndNames)}, ${codeGenArray(variableNameAndValues)}, ${codeGenDirectivesArray(directives)}, ${isBound}, ${ngContentIndex})`;
  }
  createEndElement(): string { return `${TEMPLATE_COMMANDS_MODULE_REF}endElement()`; }
  createBeginComponent(name: string, attrNameAndValues: string[], eventTargetAndNames: string[],
                       variableNameAndValues: string[], directives: CompileDirectiveMetadata[],
                       nativeShadow: boolean, ngContentIndex: number): string {
    var nestedCompExpr = this.componentTemplateFactory(directives[0]);
    var attrsExpression = codeGenArray(
        this._addStyleShimAttributes(attrNameAndValues, directives[0], `${nestedCompExpr}.id`));
    return `${TEMPLATE_COMMANDS_MODULE_REF}beginComponent(${escapeSingleQuoteString(name)}, ${attrsExpression}, ${codeGenArray(eventTargetAndNames)}, ${codeGenArray(variableNameAndValues)}, ${codeGenDirectivesArray(directives)}, ${nativeShadow}, ${ngContentIndex}, ${nestedCompExpr})`;
  }
  createEndComponent(): string { return `${TEMPLATE_COMMANDS_MODULE_REF}endComponent()`; }
  createEmbeddedTemplate(embeddedTemplateIndex: number, attrNameAndValues: string[],
                         variableNameAndValues: string[], directives: CompileDirectiveMetadata[],
                         isMerged: boolean, ngContentIndex: number, children: string[]): string {
    return `${TEMPLATE_COMMANDS_MODULE_REF}embeddedTemplate(${codeGenArray(attrNameAndValues)}, ${codeGenArray(variableNameAndValues)}, ` +
           `${codeGenDirectivesArray(directives)}, ${isMerged}, ${ngContentIndex}, ${this.changeDetectorFactoryExpressions[embeddedTemplateIndex]}, [${children.join(',')}])`;
  }
}

function visitAndReturnContext(visitor: TemplateAstVisitor, asts: TemplateAst[], context: any):
    any {
  templateVisitAll(visitor, asts, context);
  return context;
}

class CommandBuilderVisitor<R> implements TemplateAstVisitor {
  result: R[] = [];
  transitiveNgContentCount: number = 0;
  constructor(public commandFactory: CommandFactory<R>, public embeddedTemplateIndex: number) {}

  private _readAttrNameAndValues(directives: CompileDirectiveMetadata[],
                                 attrAsts: TemplateAst[]): string[] {
    var attrs = keyValueArrayToMap(visitAndReturnContext(this, attrAsts, []));
    directives.forEach(directiveMeta => {
      StringMapWrapper.forEach(directiveMeta.hostAttributes, (value, name) => {
        var prevValue = attrs[name];
        attrs[name] = isPresent(prevValue) ? mergeAttributeValue(name, prevValue, value) : value;
      });
    });
    return mapToKeyValueArray(attrs);
  }

  visitNgContent(ast: NgContentAst, context: any): any {
    this.transitiveNgContentCount++;
    this.result.push(this.commandFactory.createNgContent(ast.index, ast.ngContentIndex));
    return null;
  }
  visitEmbeddedTemplate(ast: EmbeddedTemplateAst, context: any): any {
    this.embeddedTemplateIndex++;
    var childVisitor = new CommandBuilderVisitor(this.commandFactory, this.embeddedTemplateIndex);
    templateVisitAll(childVisitor, ast.children);
    var isMerged = childVisitor.transitiveNgContentCount > 0;
    var variableNameAndValues = [];
    ast.vars.forEach((varAst) => {
      variableNameAndValues.push(varAst.name);
      variableNameAndValues.push(varAst.value.length > 0 ? varAst.value : IMPLICIT_TEMPLATE_VAR);
    });
    var directives = [];
    ListWrapper.forEachWithIndex(ast.directives, (directiveAst: DirectiveAst, index: number) => {
      directiveAst.visit(this, new DirectiveContext(index, [], [], directives));
    });
    this.result.push(this.commandFactory.createEmbeddedTemplate(
        this.embeddedTemplateIndex, this._readAttrNameAndValues(directives, ast.attrs),
        variableNameAndValues, directives, isMerged, ast.ngContentIndex, childVisitor.result));
    this.transitiveNgContentCount += childVisitor.transitiveNgContentCount;
    this.embeddedTemplateIndex = childVisitor.embeddedTemplateIndex;
    return null;
  }
  visitElement(ast: ElementAst, context: any): any {
    var component = ast.getComponent();
    var eventTargetAndNames = visitAndReturnContext(this, ast.outputs, []);
    var variableNameAndValues = [];
    if (isBlank(component)) {
      ast.exportAsVars.forEach((varAst) => {
        variableNameAndValues.push(varAst.name);
        variableNameAndValues.push(null);
      });
    }
    var directives = [];
    ListWrapper.forEachWithIndex(ast.directives, (directiveAst: DirectiveAst, index: number) => {
      directiveAst.visit(this, new DirectiveContext(index, eventTargetAndNames,
                                                    variableNameAndValues, directives));
    });
    eventTargetAndNames = removeKeyValueArrayDuplicates(eventTargetAndNames);

    var attrNameAndValues = this._readAttrNameAndValues(directives, ast.attrs);
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

function keyValueArrayToMap(keyValueArr: string[]): {[key: string]: string} {
  var data: {[key: string]: string} = {};
  for (var i = 0; i < keyValueArr.length; i += 2) {
    data[keyValueArr[i]] = keyValueArr[i + 1];
  }
  return data;
}

function mapToKeyValueArray(data: {[key: string]: string}): string[] {
  var entryArray = [];
  StringMapWrapper.forEach(data, (value, name) => { entryArray.push([name, value]); });
  // We need to sort to get a defined output order
  // for tests and for caching generated artifacts...
  ListWrapper.sort(entryArray, (entry1, entry2) => StringWrapper.compare(entry1[0], entry2[0]));
  var keyValueArray = [];
  entryArray.forEach((entry) => {
    keyValueArray.push(entry[0]);
    keyValueArray.push(entry[1]);
  });
  return keyValueArray;
}

function mergeAttributeValue(attrName: string, attrValue1: string, attrValue2: string): string {
  if (attrName == CLASS_ATTR || attrName == STYLE_ATTR) {
    return `${attrValue1} ${attrValue2}`;
  } else {
    return attrValue2;
  }
}

class DirectiveContext {
  constructor(public index: number, public eventTargetAndNames: string[],
              public targetVariableNameAndValues: any[],
              public targetDirectives: CompileDirectiveMetadata[]) {}
}

class Expression {
  constructor(public value: string) {}
}

function escapeValue(value: any): string {
  if (value instanceof Expression) {
    return value.value;
  } else if (isString(value)) {
    return escapeSingleQuoteString(value);
  } else if (isBlank(value)) {
    return 'null';
  } else {
    return `${value}`;
  }
}

function codeGenArray(data: any[]): string {
  return `[${data.map(escapeValue).join(',')}]`;
}

function codeGenDirectivesArray(directives: CompileDirectiveMetadata[]): string {
  var expressions = directives.map(
      directiveType => `${moduleRef(directiveType.type.moduleUrl)}${directiveType.type.name}`);
  return `[${expressions.join(',')}]`;
}
