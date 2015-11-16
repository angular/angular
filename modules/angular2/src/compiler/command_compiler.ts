import {isPresent, isBlank, Type, isString, StringWrapper, IS_DART} from 'angular2/src/facade/lang';
import {SetWrapper, StringMapWrapper, ListWrapper} from 'angular2/src/facade/collection';
import {
  TemplateCmd,
  TextCmd,
  NgContentCmd,
  BeginElementCmd,
  EndElementCmd,
  BeginComponentCmd,
  EndComponentCmd,
  EmbeddedTemplateCmd,
  CompiledComponentTemplate
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
  escapeSingleQuoteString,
  codeGenConstConstructorCall,
  codeGenValueFn,
  MODULE_SUFFIX
} from './util';
import {Injectable} from 'angular2/src/core/di';

export var TEMPLATE_COMMANDS_MODULE_REF =
    moduleRef(`package:angular2/src/core/linker/template_commands${MODULE_SUFFIX}`);

const IMPLICIT_TEMPLATE_VAR = '\$implicit';
const CLASS_ATTR = 'class';
const STYLE_ATTR = 'style';

@Injectable()
export class CommandCompiler {
  compileComponentRuntime(component: CompileDirectiveMetadata, template: TemplateAst[],
                          changeDetectorFactories: Function[],
                          componentTemplateFactory: Function): TemplateCmd[] {
    var visitor = new CommandBuilderVisitor(
        new RuntimeCommandFactory(component, componentTemplateFactory, changeDetectorFactories), 0);
    templateVisitAll(visitor, template);
    return visitor.result;
  }

  compileComponentCodeGen(component: CompileDirectiveMetadata, template: TemplateAst[],
                          changeDetectorFactoryExpressions: string[],
                          componentTemplateFactory: Function): SourceExpression {
    var visitor =
        new CommandBuilderVisitor(new CodegenCommandFactory(component, componentTemplateFactory,
                                                            changeDetectorFactoryExpressions),
                                  0);
    templateVisitAll(visitor, template);
    return new SourceExpression([], codeGenArray(visitor.result));
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
                       encapsulation: ViewEncapsulation, ngContentIndex: number): R;
  createEndComponent(): R;
  createEmbeddedTemplate(embeddedTemplateIndex: number, attrNameAndValues: string[],
                         variableNameAndValues: string[], directives: CompileDirectiveMetadata[],
                         isMerged: boolean, ngContentIndex: number, children: R[]): R;
}

class RuntimeCommandFactory implements CommandFactory<TemplateCmd> {
  constructor(private component: CompileDirectiveMetadata,
              private componentTemplateFactory: Function,
              private changeDetectorFactories: Function[]) {}
  private _mapDirectives(directives: CompileDirectiveMetadata[]): Type[] {
    return directives.map(directive => directive.type.runtime);
  }

  createText(value: string, isBound: boolean, ngContentIndex: number): TemplateCmd {
    return new TextCmd(value, isBound, ngContentIndex);
  }
  createNgContent(index: number, ngContentIndex: number): TemplateCmd {
    return new NgContentCmd(index, ngContentIndex);
  }
  createBeginElement(name: string, attrNameAndValues: string[], eventTargetAndNames: string[],
                     variableNameAndValues: string[], directives: CompileDirectiveMetadata[],
                     isBound: boolean, ngContentIndex: number): TemplateCmd {
    return new BeginElementCmd(name, attrNameAndValues, eventTargetAndNames, variableNameAndValues,
                               this._mapDirectives(directives), isBound, ngContentIndex);
  }
  createEndElement(): TemplateCmd { return new EndElementCmd(); }
  createBeginComponent(name: string, attrNameAndValues: string[], eventTargetAndNames: string[],
                       variableNameAndValues: string[], directives: CompileDirectiveMetadata[],
                       encapsulation: ViewEncapsulation, ngContentIndex: number): TemplateCmd {
    var nestedTemplateAccessor = this.componentTemplateFactory(directives[0]);
    return new BeginComponentCmd(name, attrNameAndValues, eventTargetAndNames,
                                 variableNameAndValues, this._mapDirectives(directives),
                                 encapsulation, ngContentIndex, nestedTemplateAccessor);
  }
  createEndComponent(): TemplateCmd { return new EndComponentCmd(); }
  createEmbeddedTemplate(embeddedTemplateIndex: number, attrNameAndValues: string[],
                         variableNameAndValues: string[], directives: CompileDirectiveMetadata[],
                         isMerged: boolean, ngContentIndex: number,
                         children: TemplateCmd[]): TemplateCmd {
    return new EmbeddedTemplateCmd(attrNameAndValues, variableNameAndValues,
                                   this._mapDirectives(directives), isMerged, ngContentIndex,
                                   this.changeDetectorFactories[embeddedTemplateIndex], children);
  }
}

class CodegenCommandFactory implements CommandFactory<Expression> {
  constructor(private component: CompileDirectiveMetadata,
              private componentTemplateFactory: Function,
              private changeDetectorFactoryExpressions: string[]) {}

  createText(value: string, isBound: boolean, ngContentIndex: number): Expression {
    return new Expression(
        `${codeGenConstConstructorCall(TEMPLATE_COMMANDS_MODULE_REF+'TextCmd')}(${escapeSingleQuoteString(value)}, ${isBound}, ${ngContentIndex})`);
  }
  createNgContent(index: number, ngContentIndex: number): Expression {
    return new Expression(
        `${codeGenConstConstructorCall(TEMPLATE_COMMANDS_MODULE_REF+'NgContentCmd')}(${index}, ${ngContentIndex})`);
  }
  createBeginElement(name: string, attrNameAndValues: string[], eventTargetAndNames: string[],
                     variableNameAndValues: string[], directives: CompileDirectiveMetadata[],
                     isBound: boolean, ngContentIndex: number): Expression {
    var attrsExpression = codeGenArray(attrNameAndValues);
    return new Expression(
        `${codeGenConstConstructorCall(TEMPLATE_COMMANDS_MODULE_REF+'BeginElementCmd')}(${escapeSingleQuoteString(name)}, ${attrsExpression}, ` +
        `${codeGenArray(eventTargetAndNames)}, ${codeGenArray(variableNameAndValues)}, ${codeGenDirectivesArray(directives)}, ${isBound}, ${ngContentIndex})`);
  }
  createEndElement(): Expression {
    return new Expression(
        `${codeGenConstConstructorCall(TEMPLATE_COMMANDS_MODULE_REF+'EndElementCmd')}()`);
  }
  createBeginComponent(name: string, attrNameAndValues: string[], eventTargetAndNames: string[],
                       variableNameAndValues: string[], directives: CompileDirectiveMetadata[],
                       encapsulation: ViewEncapsulation, ngContentIndex: number): Expression {
    var attrsExpression = codeGenArray(attrNameAndValues);
    return new Expression(
        `${codeGenConstConstructorCall(TEMPLATE_COMMANDS_MODULE_REF+'BeginComponentCmd')}(${escapeSingleQuoteString(name)}, ${attrsExpression}, ` +
        `${codeGenArray(eventTargetAndNames)}, ${codeGenArray(variableNameAndValues)}, ${codeGenDirectivesArray(directives)}, ${codeGenViewEncapsulation(encapsulation)}, ${ngContentIndex}, ${this.componentTemplateFactory(directives[0])})`);
  }
  createEndComponent(): Expression {
    return new Expression(
        `${codeGenConstConstructorCall(TEMPLATE_COMMANDS_MODULE_REF+'EndComponentCmd')}()`);
  }
  createEmbeddedTemplate(embeddedTemplateIndex: number, attrNameAndValues: string[],
                         variableNameAndValues: string[], directives: CompileDirectiveMetadata[],
                         isMerged: boolean, ngContentIndex: number,
                         children: Expression[]): Expression {
    return new Expression(
        `${codeGenConstConstructorCall(TEMPLATE_COMMANDS_MODULE_REF+'EmbeddedTemplateCmd')}(${codeGenArray(attrNameAndValues)}, ${codeGenArray(variableNameAndValues)}, ` +
        `${codeGenDirectivesArray(directives)}, ${isMerged}, ${ngContentIndex}, ${this.changeDetectorFactoryExpressions[embeddedTemplateIndex]}, ${codeGenArray(children)})`);
  }
}

function visitAndReturnContext(visitor: TemplateAstVisitor, asts: TemplateAst[],
                               context: any): any {
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
          component.template.encapsulation, ast.ngContentIndex));
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
  var base = `[${data.map(escapeValue).join(',')}]`;
  return IS_DART ? `const ${base}` : base;
}

function codeGenDirectivesArray(directives: CompileDirectiveMetadata[]): string {
  var expressions = directives.map(
      directiveType => `${moduleRef(directiveType.type.moduleUrl)}${directiveType.type.name}`);
  var base = `[${expressions.join(',')}]`;
  return IS_DART ? `const ${base}` : base;
}

function codeGenViewEncapsulation(value: ViewEncapsulation): string {
  if (IS_DART) {
    return `${TEMPLATE_COMMANDS_MODULE_REF}${value}`;
  } else {
    return `${value}`;
  }
}
