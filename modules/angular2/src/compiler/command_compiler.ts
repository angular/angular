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
import {SourceModule, DirectiveMetadata, TypeMetadata} from './api';
import {ViewEncapsulation} from 'angular2/src/core/render/api';
import {shimHostAttribute, shimContentAttribute} from './style_compiler';
import {escapeSingleQuoteString} from './util';

const TEMPLATE_COMMANDS_MODULE = 'angular2/src/core/compiler/template_commands';
const TEMPLATE_COMMANDS_MODULE_ALIAS = 'tc';

export class CommandCompiler {
  compileComponentRuntime(component: DirectiveMetadata, template: TemplateAst[],
                          componentTemplateFactory: Function): TemplateCmd[] {
    var visitor =
        new CommandBuilderVisitor(new RuntimeCommandFactory(componentTemplateFactory), component);
    templateVisitAll(visitor, template);
    return visitor.result;
  }

  compileComponentCodeGen(component: DirectiveMetadata, template: TemplateAst[],
                          componentTemplateFactory: Function): SourceModule {
    var imports: string[][] = [[TEMPLATE_COMMANDS_MODULE, TEMPLATE_COMMANDS_MODULE_ALIAS]];
    var visitor = new CommandBuilderVisitor(
        new CodegenCommandFactory(componentTemplateFactory, TEMPLATE_COMMANDS_MODULE_ALIAS,
                                  imports),
        component);
    templateVisitAll(visitor, template);
    var source = `var COMMANDS = [${visitor.result.join(',')}];`;
    return new SourceModule(null, source, imports);
  }
}

interface CommandFactory<R> {
  createText(value: string, isBound: boolean, ngContentIndex: number): R;
  createNgContent(ngContentIndex: number): R;
  createBeginElement(name: string, attrNameAndValues: string[], eventNames: string[],
                     variableNameAndValues: string[], directives: TypeMetadata[], isBound: boolean,
                     ngContentIndex: number): R;
  createEndElement(): R;
  createBeginComponent(name: string, attrNameAndValues: string[], eventNames: string[],
                       variableNameAndValues: string[], directives: TypeMetadata[],
                       nativeShadow: boolean, ngContentIndex: number): R;
  createEndComponent(): R;
  createEmbeddedTemplate(attrNameAndValues: string[], variableNameAndValues: string[],
                         directives: TypeMetadata[], isMerged: boolean, ngContentIndex: number,
                         children: R[]): R;
}

class RuntimeCommandFactory implements CommandFactory<TemplateCmd> {
  constructor(public componentTemplateFactory: Function) {}
  private _mapDirectives(directives: TypeMetadata[]): Type[] {
    return directives.map(directive => directive.type);
  }

  createText(value: string, isBound: boolean, ngContentIndex: number): TemplateCmd {
    return text(value, isBound, ngContentIndex);
  }
  createNgContent(ngContentIndex: number): TemplateCmd { return ngContent(ngContentIndex); }
  createBeginElement(name: string, attrNameAndValues: string[], eventNames: string[],
                     variableNameAndValues: string[], directives: TypeMetadata[], isBound: boolean,
                     ngContentIndex: number): TemplateCmd {
    return beginElement(name, attrNameAndValues, eventNames, variableNameAndValues,
                        this._mapDirectives(directives), isBound, ngContentIndex);
  }
  createEndElement(): TemplateCmd { return endElement(); }
  createBeginComponent(name: string, attrNameAndValues: string[], eventNames: string[],
                       variableNameAndValues: string[], directives: TypeMetadata[],
                       nativeShadow: boolean, ngContentIndex: number): TemplateCmd {
    return beginComponent(name, attrNameAndValues, eventNames, variableNameAndValues,
                          this._mapDirectives(directives), nativeShadow, ngContentIndex,
                          this.componentTemplateFactory(directives[0]));
  }
  createEndComponent(): TemplateCmd { return endComponent(); }
  createEmbeddedTemplate(attrNameAndValues: string[], variableNameAndValues: string[],
                         directives: TypeMetadata[], isMerged: boolean, ngContentIndex: number,
                         children: TemplateCmd[]): TemplateCmd {
    return embeddedTemplate(attrNameAndValues, variableNameAndValues,
                            this._mapDirectives(directives), isMerged, ngContentIndex, children);
  }
}

function escapeStringArray(data: string[]): string {
  return `[${data.map( value => escapeSingleQuoteString(value)).join(',')}]`;
}

class CodegenCommandFactory implements CommandFactory<string> {
  constructor(public componentTemplateFactory: Function, public templateCommandsModuleAlias,
              public imports: string[][]) {}

  private _escapeDirectives(directives: TypeMetadata[]): string[] {
    return directives.map(directiveType => {
      var importAlias = `dir${this.imports.length}`;
      this.imports.push([directiveType.typeUrl, importAlias]);
      return `${importAlias}.${directiveType.typeName}`;
    });
  }

  createText(value: string, isBound: boolean, ngContentIndex: number): string {
    return `${this.templateCommandsModuleAlias}.text(${escapeSingleQuoteString(value)}, ${isBound}, ${ngContentIndex})`;
  }
  createNgContent(ngContentIndex: number): string {
    return `${this.templateCommandsModuleAlias}.ngContent(${ngContentIndex})`;
  }
  createBeginElement(name: string, attrNameAndValues: string[], eventNames: string[],
                     variableNameAndValues: string[], directives: TypeMetadata[], isBound: boolean,
                     ngContentIndex: number): string {
    return `${this.templateCommandsModuleAlias}.beginElement(${escapeSingleQuoteString(name)}, ${escapeStringArray(attrNameAndValues)}, ${escapeStringArray(eventNames)}, ${escapeStringArray(variableNameAndValues)}, [${this._escapeDirectives(directives).join(',')}], ${isBound}, ${ngContentIndex})`;
  }
  createEndElement(): string { return `${this.templateCommandsModuleAlias}.endElement()`; }
  createBeginComponent(name: string, attrNameAndValues: string[], eventNames: string[],
                       variableNameAndValues: string[], directives: TypeMetadata[],
                       nativeShadow: boolean, ngContentIndex: number): string {
    return `${this.templateCommandsModuleAlias}.beginComponent(${escapeSingleQuoteString(name)}, ${escapeStringArray(attrNameAndValues)}, ${escapeStringArray(eventNames)}, ${escapeStringArray(variableNameAndValues)}, [${this._escapeDirectives(directives).join(',')}], ${nativeShadow}, ${ngContentIndex}, ${this.componentTemplateFactory(directives[0], this.imports)})`;
  }
  createEndComponent(): string { return `${this.templateCommandsModuleAlias}.endComponent()`; }
  createEmbeddedTemplate(attrNameAndValues: string[], variableNameAndValues: string[],
                         directives: TypeMetadata[], isMerged: boolean, ngContentIndex: number,
                         children: string[]): string {
    return `${this.templateCommandsModuleAlias}.embeddedTemplate(${escapeStringArray(attrNameAndValues)}, ${escapeStringArray(variableNameAndValues)}, [${this._escapeDirectives(directives).join(',')}], ${isMerged}, ${ngContentIndex}, [${children.join(',')}])`;
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
  constructor(public commandFactory: CommandFactory<R>, public component: DirectiveMetadata) {}

  private _readAttrNameAndValues(localComponent: DirectiveMetadata,
                                 attrAsts: TemplateAst[]): string[] {
    var attrNameAndValues: string[] = visitAndReturnContext(this, attrAsts, []);
    if (isPresent(localComponent) &&
        localComponent.template.encapsulation === ViewEncapsulation.Emulated) {
      attrNameAndValues.push(shimHostAttribute(localComponent.type));
      attrNameAndValues.push('');
    }
    if (this.component.template.encapsulation === ViewEncapsulation.Emulated) {
      attrNameAndValues.push(shimContentAttribute(this.component.type));
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
    directivesAndEventNames[0].push(ast.directive.type);
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
