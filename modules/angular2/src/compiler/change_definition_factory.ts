import {ListWrapper} from 'angular2/src/core/facade/collection';
import {isPresent, isBlank} from 'angular2/src/core/facade/lang';
import {reflector} from 'angular2/src/core/reflection/reflection';

import {
  ChangeDetection,
  DirectiveIndex,
  BindingRecord,
  DirectiveRecord,
  ProtoChangeDetector,
  ChangeDetectionStrategy,
  ChangeDetectorDefinition,
  ChangeDetectorGenConfig,
  ASTWithSource
} from 'angular2/src/core/change_detection/change_detection';

import {DirectiveMetadata, TypeMetadata} from './api';
import {
  TemplateAst,
  ElementAst,
  BoundTextAst,
  PropertyBindingType,
  DirectiveAst,
  TemplateAstVisitor,
  templateVisitAll,
  NgContentAst,
  EmbeddedTemplateAst,
  VariableAst,
  BoundElementPropertyAst,
  BoundEventAst,
  BoundDirectivePropertyAst,
  AttrAst,
  TextAst
} from './template_ast';

export function createChangeDetectorDefinitions(
    componentType: TypeMetadata, componentStrategy: ChangeDetectionStrategy,
    genConfig: ChangeDetectorGenConfig, parsedTemplate: TemplateAst[]): ChangeDetectorDefinition[] {
  var visitor = new ProtoViewVisitor(componentStrategy);
  templateVisitAll(visitor, parsedTemplate);
  return createChangeDefinitions(visitor.allProtoViews, componentType, genConfig);
}

class ProtoViewVisitor implements TemplateAstVisitor {
  viewCount: number = 0;
  protoViewStack: ProtoViewVisitorData[] = [];
  allProtoViews: ProtoViewVisitorData[] = [];

  constructor(componentStrategy: ChangeDetectionStrategy) {
    this._beginProtoView(new ProtoViewVisitorData(null, componentStrategy, this.viewCount++));
  }

  private _beginProtoView(data: ProtoViewVisitorData) {
    this.protoViewStack.push(data);
    this.allProtoViews.push(data);
  }

  get currentProtoView(): ProtoViewVisitorData {
    return this.protoViewStack[this.protoViewStack.length - 1];
  }

  visitEmbeddedTemplate(ast: EmbeddedTemplateAst, context: any): any {
    this.currentProtoView.boundElementCount++;
    templateVisitAll(this, ast.directives);

    this.viewCount++;
    this._beginProtoView(new ProtoViewVisitorData(
        this.currentProtoView, ChangeDetectionStrategy.Default, this.viewCount - 1));
    // Attention: variables present on an embedded template count towards
    // the embedded template and not the template anchor!
    templateVisitAll(this, ast.vars);
    templateVisitAll(this, ast.children);
    this.protoViewStack.pop();
    return null;
  }

  visitElement(ast: ElementAst, context: any): any {
    if (ast.isBound()) {
      this.currentProtoView.boundElementCount++;
    }
    templateVisitAll(this, ast.properties, null);
    templateVisitAll(this, ast.events);
    templateVisitAll(this, ast.vars);
    for (var i = 0; i < ast.directives.length; i++) {
      ast.directives[i].visit(this, i);
    }
    templateVisitAll(this, ast.children);
    return null;
  }

  visitNgContent(ast: NgContentAst, context: any): any { return null; }

  visitVariable(ast: VariableAst, context: any): any {
    this.currentProtoView.variableNames.push(ast.name);
    return null;
  }

  visitEvent(ast: BoundEventAst, directiveRecord: DirectiveRecord): any {
    var bindingRecord =
        isPresent(directiveRecord) ?
            BindingRecord.createForHostEvent(ast.handler, ast.name, directiveRecord) :
            BindingRecord.createForEvent(ast.handler, ast.name,
                                         this.currentProtoView.boundElementCount - 1);
    this.currentProtoView.eventRecords.push(bindingRecord);
    return null;
  }

  visitElementProperty(ast: BoundElementPropertyAst, directiveRecord: DirectiveRecord): any {
    var boundElementIndex = this.currentProtoView.boundElementCount - 1;
    var dirIndex = isPresent(directiveRecord) ? directiveRecord.directiveIndex : null;
    var bindingRecord;
    if (ast.type === PropertyBindingType.Property) {
      bindingRecord =
          isPresent(dirIndex) ?
              BindingRecord.createForHostProperty(dirIndex, ast.value, ast.name) :
              BindingRecord.createForElementProperty(ast.value, boundElementIndex, ast.name);
    } else if (ast.type === PropertyBindingType.Attribute) {
      bindingRecord =
          isPresent(dirIndex) ?
              BindingRecord.createForHostAttribute(dirIndex, ast.value, ast.name) :
              BindingRecord.createForElementAttribute(ast.value, boundElementIndex, ast.name);
    } else if (ast.type === PropertyBindingType.Class) {
      bindingRecord =
          isPresent(dirIndex) ?
              BindingRecord.createForHostClass(dirIndex, ast.value, ast.name) :
              BindingRecord.createForElementClass(ast.value, boundElementIndex, ast.name);
    } else if (ast.type === PropertyBindingType.Style) {
      bindingRecord =
          isPresent(dirIndex) ?
              BindingRecord.createForHostStyle(dirIndex, ast.value, ast.name, ast.unit) :
              BindingRecord.createForElementStyle(ast.value, boundElementIndex, ast.name, ast.unit);
    }
    this.currentProtoView.bindingRecords.push(bindingRecord);
    return null;
  }
  visitAttr(ast: AttrAst, context: any): any { return null; }
  visitBoundText(ast: BoundTextAst, context: any): any {
    var boundTextIndex = this.currentProtoView.boundTextCount++;
    this.currentProtoView.bindingRecords.push(
        BindingRecord.createForTextNode(ast.value, boundTextIndex));
    return null;
  }
  visitText(ast: TextAst, context: any): any { return null; }
  visitDirective(ast: DirectiveAst, directiveIndexAsNumber: number): any {
    var directiveIndex =
        new DirectiveIndex(this.currentProtoView.boundElementCount - 1, directiveIndexAsNumber);
    var directiveMetadata = ast.directive;
    var changeDetectionMeta = directiveMetadata.changeDetection;
    var directiveRecord = new DirectiveRecord({
      directiveIndex: directiveIndex,
      callAfterContentInit: changeDetectionMeta.callAfterContentInit,
      callAfterContentChecked: changeDetectionMeta.callAfterContentChecked,
      callAfterViewInit: changeDetectionMeta.callAfterViewInit,
      callAfterViewChecked: changeDetectionMeta.callAfterViewChecked,
      callOnChanges: changeDetectionMeta.callOnChanges,
      callDoCheck: changeDetectionMeta.callDoCheck,
      callOnInit: changeDetectionMeta.callOnInit,
      changeDetection: changeDetectionMeta.changeDetection
    });
    this.currentProtoView.directiveRecords.push(directiveRecord);

    templateVisitAll(this, ast.properties, directiveRecord);
    var bindingRecords = this.currentProtoView.bindingRecords;
    if (directiveRecord.callOnChanges) {
      bindingRecords.push(BindingRecord.createDirectiveOnChanges(directiveRecord));
    }
    if (directiveRecord.callOnInit) {
      bindingRecords.push(BindingRecord.createDirectiveOnInit(directiveRecord));
    }
    if (directiveRecord.callDoCheck) {
      bindingRecords.push(BindingRecord.createDirectiveDoCheck(directiveRecord));
    }
    templateVisitAll(this, ast.hostProperties, directiveRecord);
    templateVisitAll(this, ast.hostEvents, directiveRecord);
    return null;
  }
  visitDirectiveProperty(ast: BoundDirectivePropertyAst, directiveRecord: DirectiveRecord): any {
    // TODO: these setters should eventually be created by change detection, to make
    // it monomorphic!
    var setter = reflector.setter(ast.directiveName);
    this.currentProtoView.bindingRecords.push(
        BindingRecord.createForDirective(ast.value, ast.directiveName, setter, directiveRecord));
    return null;
  }
}

class ProtoViewVisitorData {
  boundTextCount: number = 0;
  boundElementCount: number = 0;
  variableNames: string[] = [];
  bindingRecords: BindingRecord[] = [];
  eventRecords: BindingRecord[] = [];
  directiveRecords: DirectiveRecord[] = [];
  constructor(public parent: ProtoViewVisitorData, public strategy: ChangeDetectionStrategy,
              public viewIndex: number) {}
}

function createChangeDefinitions(pvDatas: ProtoViewVisitorData[], componentType: TypeMetadata,
                                 genConfig: ChangeDetectorGenConfig): ChangeDetectorDefinition[] {
  var pvVariableNames = _collectNestedProtoViewsVariableNames(pvDatas);
  return pvDatas.map(pvData => {
    var viewType = pvData.viewIndex === 0 ? 'component' : 'embedded';
    var id = _protoViewId(componentType, pvData.viewIndex, viewType);
    return new ChangeDetectorDefinition(id, pvData.strategy, pvVariableNames[pvData.viewIndex],
                                        pvData.bindingRecords, pvData.eventRecords,
                                        pvData.directiveRecords, genConfig);

  });
}

function _collectNestedProtoViewsVariableNames(pvs: ProtoViewVisitorData[]): string[][] {
  var nestedPvVariableNames: string[][] = ListWrapper.createFixedSize(pvs.length);
  pvs.forEach((pv) => {
    var parentVariableNames: string[] =
        isPresent(pv.parent) ? nestedPvVariableNames[pv.parent.viewIndex] : [];
    nestedPvVariableNames[pv.viewIndex] = parentVariableNames.concat(pv.variableNames);
  });
  return nestedPvVariableNames;
}


function _protoViewId(hostComponentType: TypeMetadata, pvIndex: number, viewType: string): string {
  return `${hostComponentType.typeName}_${viewType}_${pvIndex}`;
}
