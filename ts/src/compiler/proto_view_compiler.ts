import {
  isPresent,
  isBlank,
  Type,
  isString,
  StringWrapper,
  IS_DART,
  CONST_EXPR
} from 'angular2/src/facade/lang';
import {
  SetWrapper,
  StringMapWrapper,
  ListWrapper,
  MapWrapper
} from 'angular2/src/facade/collection';
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
import {
  CompileTypeMetadata,
  CompileDirectiveMetadata,
  CompilePipeMetadata
} from './directive_metadata';
import {SourceExpressions, SourceExpression, moduleRef} from './source_module';
import {AppProtoView, AppView} from 'angular2/src/core/linker/view';
import {ViewType} from 'angular2/src/core/linker/view_type';
import {AppProtoElement, AppElement} from 'angular2/src/core/linker/element';
import {ResolvedMetadataCache} from 'angular2/src/core/linker/resolved_metadata_cache';
import {
  escapeSingleQuoteString,
  codeGenConstConstructorCall,
  codeGenValueFn,
  codeGenFnHeader,
  MODULE_SUFFIX,
  codeGenStringMap,
  Expression,
  Statement
} from './util';
import {Injectable} from 'angular2/src/core/di';

export const PROTO_VIEW_JIT_IMPORTS = CONST_EXPR(
    {'AppProtoView': AppProtoView, 'AppProtoElement': AppProtoElement, 'ViewType': ViewType});

// TODO: have a single file that reexports everything needed for
// codegen explicitly
// - helps understanding what codegen works against
// - less imports in codegen code
export var APP_VIEW_MODULE_REF = moduleRef('package:angular2/src/core/linker/view' + MODULE_SUFFIX);
export var VIEW_TYPE_MODULE_REF =
    moduleRef('package:angular2/src/core/linker/view_type' + MODULE_SUFFIX);
export var APP_EL_MODULE_REF =
    moduleRef('package:angular2/src/core/linker/element' + MODULE_SUFFIX);
export var METADATA_MODULE_REF =
    moduleRef('package:angular2/src/core/metadata/view' + MODULE_SUFFIX);

const IMPLICIT_TEMPLATE_VAR = '\$implicit';
const CLASS_ATTR = 'class';
const STYLE_ATTR = 'style';

@Injectable()
export class ProtoViewCompiler {
  constructor() {}

  compileProtoViewRuntime(metadataCache: ResolvedMetadataCache, component: CompileDirectiveMetadata,
                          template: TemplateAst[], pipes: CompilePipeMetadata[]):
      CompileProtoViews<AppProtoView, AppProtoElement, any> {
    var protoViewFactory = new RuntimeProtoViewFactory(metadataCache, component, pipes);
    var allProtoViews = [];
    protoViewFactory.createCompileProtoView(template, [], [], allProtoViews);
    return new CompileProtoViews<AppProtoView, AppProtoElement, any>([], allProtoViews);
  }

  compileProtoViewCodeGen(resolvedMetadataCacheExpr: Expression,
                          component: CompileDirectiveMetadata, template: TemplateAst[],
                          pipes: CompilePipeMetadata[]):
      CompileProtoViews<Expression, Expression, string> {
    var protoViewFactory = new CodeGenProtoViewFactory(resolvedMetadataCacheExpr, component, pipes);
    var allProtoViews = [];
    var allStatements = [];
    protoViewFactory.createCompileProtoView(template, [], allStatements, allProtoViews);
    return new CompileProtoViews<Expression, Expression, string>(
        allStatements.map(stmt => stmt.statement), allProtoViews);
  }
}

export class CompileProtoViews<APP_PROTO_VIEW, APP_PROTO_EL, STATEMENT> {
  constructor(public declarations: STATEMENT[],
              public protoViews: CompileProtoView<APP_PROTO_VIEW, APP_PROTO_EL>[]) {}
}


export class CompileProtoView<APP_PROTO_VIEW, APP_PROTO_EL> {
  constructor(public embeddedTemplateIndex: number,
              public protoElements: CompileProtoElement<APP_PROTO_EL>[],
              public protoView: APP_PROTO_VIEW) {}
}

export class CompileProtoElement<APP_PROTO_EL> {
  constructor(public boundElementIndex, public attrNameAndValues: string[][],
              public variableNameAndValues: string[][], public renderEvents: BoundEventAst[],
              public directives: CompileDirectiveMetadata[], public embeddedTemplateIndex: number,
              public appProtoEl: APP_PROTO_EL) {}
}

function visitAndReturnContext(visitor: TemplateAstVisitor, asts: TemplateAst[],
                               context: any): any {
  templateVisitAll(visitor, asts, context);
  return context;
}

abstract class ProtoViewFactory<APP_PROTO_VIEW, APP_PROTO_EL, STATEMENT> {
  constructor(public component: CompileDirectiveMetadata) {}

  abstract createAppProtoView(embeddedTemplateIndex: number, viewType: ViewType,
                              templateVariableBindings: string[][],
                              targetStatements: STATEMENT[]): APP_PROTO_VIEW;

  abstract createAppProtoElement(boundElementIndex: number, attrNameAndValues: string[][],
                                 variableNameAndValues: string[][],
                                 directives: CompileDirectiveMetadata[],
                                 targetStatements: STATEMENT[]): APP_PROTO_EL;

  createCompileProtoView(template: TemplateAst[], templateVariableBindings: string[][],
                         targetStatements: STATEMENT[],
                         targetProtoViews: CompileProtoView<APP_PROTO_VIEW, APP_PROTO_EL>[]):
      CompileProtoView<APP_PROTO_VIEW, APP_PROTO_EL> {
    var embeddedTemplateIndex = targetProtoViews.length;
    // Note: targetProtoViews needs to be in depth first order.
    // So we "reserve" a space here that we fill after the recursion is done
    targetProtoViews.push(null);
    var builder = new ProtoViewBuilderVisitor<APP_PROTO_VIEW, APP_PROTO_EL, any>(
        this, targetStatements, targetProtoViews);
    templateVisitAll(builder, template);
    var viewType = getViewType(this.component, embeddedTemplateIndex);
    var appProtoView = this.createAppProtoView(embeddedTemplateIndex, viewType,
                                               templateVariableBindings, targetStatements);
    var cpv = new CompileProtoView<APP_PROTO_VIEW, APP_PROTO_EL>(
        embeddedTemplateIndex, builder.protoElements, appProtoView);
    targetProtoViews[embeddedTemplateIndex] = cpv;
    return cpv;
  }
}

class CodeGenProtoViewFactory extends ProtoViewFactory<Expression, Expression, Statement> {
  private _nextVarId: number = 0;

  constructor(public resolvedMetadataCacheExpr: Expression, component: CompileDirectiveMetadata,
              public pipes: CompilePipeMetadata[]) {
    super(component);
  }

  private _nextProtoViewVar(embeddedTemplateIndex: number): string {
    return `appProtoView${this._nextVarId++}_${this.component.type.name}${embeddedTemplateIndex}`;
  }

  createAppProtoView(embeddedTemplateIndex: number, viewType: ViewType,
                     templateVariableBindings: string[][],
                     targetStatements: Statement[]): Expression {
    var protoViewVarName = this._nextProtoViewVar(embeddedTemplateIndex);
    var viewTypeExpr = codeGenViewType(viewType);
    var pipesExpr = embeddedTemplateIndex === 0 ?
                        codeGenTypesArray(this.pipes.map(pipeMeta => pipeMeta.type)) :
                        null;
    var statement =
        `var ${protoViewVarName} = ${APP_VIEW_MODULE_REF}AppProtoView.create(${this.resolvedMetadataCacheExpr.expression}, ${viewTypeExpr}, ${pipesExpr}, ${codeGenStringMap(templateVariableBindings)});`;
    targetStatements.push(new Statement(statement));
    return new Expression(protoViewVarName);
  }

  createAppProtoElement(boundElementIndex: number, attrNameAndValues: string[][],
                        variableNameAndValues: string[][], directives: CompileDirectiveMetadata[],
                        targetStatements: Statement[]): Expression {
    var varName = `appProtoEl${this._nextVarId++}_${this.component.type.name}`;
    var value = `${APP_EL_MODULE_REF}AppProtoElement.create(
        ${this.resolvedMetadataCacheExpr.expression},
        ${boundElementIndex},
        ${codeGenStringMap(attrNameAndValues)},
        ${codeGenDirectivesArray(directives)},
        ${codeGenStringMap(variableNameAndValues)}
      )`;
    var statement = `var ${varName} = ${value};`;
    targetStatements.push(new Statement(statement));
    return new Expression(varName);
  }
}

class RuntimeProtoViewFactory extends ProtoViewFactory<AppProtoView, AppProtoElement, any> {
  constructor(public metadataCache: ResolvedMetadataCache, component: CompileDirectiveMetadata,
              public pipes: CompilePipeMetadata[]) {
    super(component);
  }

  createAppProtoView(embeddedTemplateIndex: number, viewType: ViewType,
                     templateVariableBindings: string[][], targetStatements: any[]): AppProtoView {
    var pipes =
        embeddedTemplateIndex === 0 ? this.pipes.map(pipeMeta => pipeMeta.type.runtime) : [];
    var templateVars = keyValueArrayToStringMap(templateVariableBindings);
    return AppProtoView.create(this.metadataCache, viewType, pipes, templateVars);
  }

  createAppProtoElement(boundElementIndex: number, attrNameAndValues: string[][],
                        variableNameAndValues: string[][], directives: CompileDirectiveMetadata[],
                        targetStatements: any[]): AppProtoElement {
    var attrs = keyValueArrayToStringMap(attrNameAndValues);
    return AppProtoElement.create(this.metadataCache, boundElementIndex, attrs,
                                  directives.map(dirMeta => dirMeta.type.runtime),
                                  keyValueArrayToStringMap(variableNameAndValues));
  }
}

class ProtoViewBuilderVisitor<APP_PROTO_VIEW, APP_PROTO_EL, STATEMENT> implements
    TemplateAstVisitor {
  protoElements: CompileProtoElement<APP_PROTO_EL>[] = [];
  boundElementCount: number = 0;

  constructor(public factory: ProtoViewFactory<APP_PROTO_VIEW, APP_PROTO_EL, STATEMENT>,
              public allStatements: STATEMENT[],
              public allProtoViews: CompileProtoView<APP_PROTO_VIEW, APP_PROTO_EL>[]) {}

  private _readAttrNameAndValues(directives: CompileDirectiveMetadata[],
                                 attrAsts: TemplateAst[]): string[][] {
    var attrs = visitAndReturnContext(this, attrAsts, {});
    directives.forEach(directiveMeta => {
      StringMapWrapper.forEach(directiveMeta.hostAttributes, (value, name) => {
        var prevValue = attrs[name];
        attrs[name] = isPresent(prevValue) ? mergeAttributeValue(name, prevValue, value) : value;
      });
    });
    return mapToKeyValueArray(attrs);
  }

  visitBoundText(ast: BoundTextAst, context: any): any { return null; }
  visitText(ast: TextAst, context: any): any { return null; }

  visitNgContent(ast: NgContentAst, context: any): any { return null; }

  visitElement(ast: ElementAst, context: any): any {
    var boundElementIndex = null;
    if (ast.isBound()) {
      boundElementIndex = this.boundElementCount++;
    }
    var component = ast.getComponent();

    var variableNameAndValues: string[][] = [];
    if (isBlank(component)) {
      ast.exportAsVars.forEach((varAst) => { variableNameAndValues.push([varAst.name, null]); });
    }
    var directives = [];
    var renderEvents: Map<string, BoundEventAst> =
        visitAndReturnContext(this, ast.outputs, new Map<string, BoundEventAst>());
    ListWrapper.forEachWithIndex(ast.directives, (directiveAst: DirectiveAst, index: number) => {
      directiveAst.visit(this, new DirectiveContext(index, boundElementIndex, renderEvents,
                                                    variableNameAndValues, directives));
    });
    var renderEventArray = [];
    renderEvents.forEach((eventAst, _) => renderEventArray.push(eventAst));

    var attrNameAndValues = this._readAttrNameAndValues(directives, ast.attrs);
    this._addProtoElement(ast.isBound(), boundElementIndex, attrNameAndValues,
                          variableNameAndValues, renderEventArray, directives, null);
    templateVisitAll(this, ast.children);
    return null;
  }

  visitEmbeddedTemplate(ast: EmbeddedTemplateAst, context: any): any {
    var boundElementIndex = this.boundElementCount++;
    var directives: CompileDirectiveMetadata[] = [];
    ListWrapper.forEachWithIndex(ast.directives, (directiveAst: DirectiveAst, index: number) => {
      directiveAst.visit(
          this, new DirectiveContext(index, boundElementIndex, new Map<string, BoundEventAst>(), [],
                                     directives));
    });

    var attrNameAndValues = this._readAttrNameAndValues(directives, ast.attrs);
    var templateVariableBindings = ast.vars.map(
        varAst => [varAst.value.length > 0 ? varAst.value : IMPLICIT_TEMPLATE_VAR, varAst.name]);
    var nestedProtoView = this.factory.createCompileProtoView(
        ast.children, templateVariableBindings, this.allStatements, this.allProtoViews);
    this._addProtoElement(true, boundElementIndex, attrNameAndValues, [], [], directives,
                          nestedProtoView.embeddedTemplateIndex);
    return null;
  }

  private _addProtoElement(isBound: boolean, boundElementIndex, attrNameAndValues: string[][],
                           variableNameAndValues: string[][], renderEvents: BoundEventAst[],
                           directives: CompileDirectiveMetadata[], embeddedTemplateIndex: number) {
    var appProtoEl = null;
    if (isBound) {
      appProtoEl =
          this.factory.createAppProtoElement(boundElementIndex, attrNameAndValues,
                                             variableNameAndValues, directives, this.allStatements);
    }
    var compileProtoEl = new CompileProtoElement<APP_PROTO_EL>(
        boundElementIndex, attrNameAndValues, variableNameAndValues, renderEvents, directives,
        embeddedTemplateIndex, appProtoEl);
    this.protoElements.push(compileProtoEl);
  }

  visitVariable(ast: VariableAst, ctx: any): any { return null; }
  visitAttr(ast: AttrAst, attrNameAndValues: {[key: string]: string}): any {
    attrNameAndValues[ast.name] = ast.value;
    return null;
  }
  visitDirective(ast: DirectiveAst, ctx: DirectiveContext): any {
    ctx.targetDirectives.push(ast.directive);
    templateVisitAll(this, ast.hostEvents, ctx.hostEventTargetAndNames);
    ast.exportAsVars.forEach(
        varAst => { ctx.targetVariableNameAndValues.push([varAst.name, ctx.index]); });
    return null;
  }
  visitEvent(ast: BoundEventAst, eventTargetAndNames: Map<string, BoundEventAst>): any {
    eventTargetAndNames.set(ast.fullName, ast);
    return null;
  }
  visitDirectiveProperty(ast: BoundDirectivePropertyAst, context: any): any { return null; }
  visitElementProperty(ast: BoundElementPropertyAst, context: any): any { return null; }
}

function mapToKeyValueArray(data: {[key: string]: string}): string[][] {
  var entryArray = [];
  StringMapWrapper.forEach(data, (value, name) => { entryArray.push([name, value]); });
  // We need to sort to get a defined output order
  // for tests and for caching generated artifacts...
  ListWrapper.sort(entryArray, (entry1, entry2) => StringWrapper.compare(entry1[0], entry2[0]));
  var keyValueArray = [];
  entryArray.forEach((entry) => { keyValueArray.push([entry[0], entry[1]]); });
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
  constructor(public index: number, public boundElementIndex: number,
              public hostEventTargetAndNames: Map<string, BoundEventAst>,
              public targetVariableNameAndValues: any[][],
              public targetDirectives: CompileDirectiveMetadata[]) {}
}

function keyValueArrayToStringMap(keyValueArray: any[][]): {[key: string]: any} {
  var stringMap: {[key: string]: string} = {};
  for (var i = 0; i < keyValueArray.length; i++) {
    var entry = keyValueArray[i];
    stringMap[entry[0]] = entry[1];
  }
  return stringMap;
}

function codeGenDirectivesArray(directives: CompileDirectiveMetadata[]): string {
  var expressions = directives.map(directiveType => typeRef(directiveType.type));
  return `[${expressions.join(',')}]`;
}

function codeGenTypesArray(types: CompileTypeMetadata[]): string {
  var expressions = types.map(typeRef);
  return `[${expressions.join(',')}]`;
}

function codeGenViewType(value: ViewType): string {
  if (IS_DART) {
    return `${VIEW_TYPE_MODULE_REF}${value}`;
  } else {
    return `${value}`;
  }
}

function typeRef(type: CompileTypeMetadata): string {
  return `${moduleRef(type.moduleUrl)}${type.name}`;
}

function getViewType(component: CompileDirectiveMetadata, embeddedTemplateIndex: number): ViewType {
  if (embeddedTemplateIndex > 0) {
    return ViewType.EMBEDDED;
  } else if (component.type.isHost) {
    return ViewType.HOST;
  } else {
    return ViewType.COMPONENT;
  }
}
