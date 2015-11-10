library angular2.src.compiler.change_definition_factory;

import "package:angular2/src/facade/collection.dart" show ListWrapper;
import "package:angular2/src/facade/lang.dart" show isPresent, isBlank;
import "package:angular2/src/core/reflection/reflection.dart" show reflector;
import "package:angular2/src/core/change_detection/change_detection.dart"
    show
        DirectiveIndex,
        BindingRecord,
        DirectiveRecord,
        ChangeDetectionStrategy,
        ChangeDetectorDefinition,
        ChangeDetectorGenConfig,
        ASTWithSource;
import "directive_metadata.dart"
    show CompileDirectiveMetadata, CompileTypeMetadata;
import "template_ast.dart"
    show
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
        TextAst;
import "package:angular2/src/core/linker/interfaces.dart" show LifecycleHooks;

List<ChangeDetectorDefinition> createChangeDetectorDefinitions(
    CompileTypeMetadata componentType,
    ChangeDetectionStrategy componentStrategy,
    ChangeDetectorGenConfig genConfig,
    List<TemplateAst> parsedTemplate) {
  var pvVisitors = [];
  var visitor = new ProtoViewVisitor(null, pvVisitors, componentStrategy);
  templateVisitAll(visitor, parsedTemplate);
  return createChangeDefinitions(pvVisitors, componentType, genConfig);
}

class ProtoViewVisitor implements TemplateAstVisitor {
  ProtoViewVisitor parent;
  List<ProtoViewVisitor> allVisitors;
  ChangeDetectionStrategy strategy;
  num viewIndex;
  num boundTextCount = 0;
  num boundElementCount = 0;
  List<String> variableNames = [];
  List<BindingRecord> bindingRecords = [];
  List<BindingRecord> eventRecords = [];
  List<DirectiveRecord> directiveRecords = [];
  ProtoViewVisitor(this.parent, this.allVisitors, this.strategy) {
    this.viewIndex = allVisitors.length;
    allVisitors.add(this);
  }
  dynamic visitEmbeddedTemplate(EmbeddedTemplateAst ast, dynamic context) {
    this.boundElementCount++;
    templateVisitAll(this, ast.outputs);
    for (var i = 0; i < ast.directives.length; i++) {
      ast.directives[i].visit(this, i);
    }
    var childVisitor = new ProtoViewVisitor(
        this, this.allVisitors, ChangeDetectionStrategy.Default);
    // Attention: variables present on an embedded template count towards

    // the embedded template and not the template anchor!
    templateVisitAll(childVisitor, ast.vars);
    templateVisitAll(childVisitor, ast.children);
    return null;
  }

  dynamic visitElement(ElementAst ast, dynamic context) {
    if (ast.isBound()) {
      this.boundElementCount++;
    }
    templateVisitAll(this, ast.inputs, null);
    templateVisitAll(this, ast.outputs);
    templateVisitAll(this, ast.exportAsVars);
    for (var i = 0; i < ast.directives.length; i++) {
      ast.directives[i].visit(this, i);
    }
    templateVisitAll(this, ast.children);
    return null;
  }

  dynamic visitNgContent(NgContentAst ast, dynamic context) {
    return null;
  }

  dynamic visitVariable(VariableAst ast, dynamic context) {
    this.variableNames.add(ast.name);
    return null;
  }

  dynamic visitEvent(BoundEventAst ast, DirectiveRecord directiveRecord) {
    var bindingRecord = isPresent(directiveRecord)
        ? BindingRecord.createForHostEvent(
            ast.handler, ast.fullName, directiveRecord)
        : BindingRecord.createForEvent(
            ast.handler, ast.fullName, this.boundElementCount - 1);
    this.eventRecords.add(bindingRecord);
    return null;
  }

  dynamic visitElementProperty(
      BoundElementPropertyAst ast, DirectiveRecord directiveRecord) {
    var boundElementIndex = this.boundElementCount - 1;
    var dirIndex =
        isPresent(directiveRecord) ? directiveRecord.directiveIndex : null;
    var bindingRecord;
    if (identical(ast.type, PropertyBindingType.Property)) {
      bindingRecord = isPresent(dirIndex)
          ? BindingRecord.createForHostProperty(dirIndex, ast.value, ast.name)
          : BindingRecord.createForElementProperty(
              ast.value, boundElementIndex, ast.name);
    } else if (identical(ast.type, PropertyBindingType.Attribute)) {
      bindingRecord = isPresent(dirIndex)
          ? BindingRecord.createForHostAttribute(dirIndex, ast.value, ast.name)
          : BindingRecord.createForElementAttribute(
              ast.value, boundElementIndex, ast.name);
    } else if (identical(ast.type, PropertyBindingType.Class)) {
      bindingRecord = isPresent(dirIndex)
          ? BindingRecord.createForHostClass(dirIndex, ast.value, ast.name)
          : BindingRecord.createForElementClass(
              ast.value, boundElementIndex, ast.name);
    } else if (identical(ast.type, PropertyBindingType.Style)) {
      bindingRecord = isPresent(dirIndex)
          ? BindingRecord.createForHostStyle(
              dirIndex, ast.value, ast.name, ast.unit)
          : BindingRecord.createForElementStyle(
              ast.value, boundElementIndex, ast.name, ast.unit);
    }
    this.bindingRecords.add(bindingRecord);
    return null;
  }

  dynamic visitAttr(AttrAst ast, dynamic context) {
    return null;
  }

  dynamic visitBoundText(BoundTextAst ast, dynamic context) {
    var boundTextIndex = this.boundTextCount++;
    this
        .bindingRecords
        .add(BindingRecord.createForTextNode(ast.value, boundTextIndex));
    return null;
  }

  dynamic visitText(TextAst ast, dynamic context) {
    return null;
  }

  dynamic visitDirective(DirectiveAst ast, num directiveIndexAsNumber) {
    var directiveIndex =
        new DirectiveIndex(this.boundElementCount - 1, directiveIndexAsNumber);
    var directiveMetadata = ast.directive;
    var directiveRecord = new DirectiveRecord(
        directiveIndex: directiveIndex,
        callAfterContentInit: !identical(
            directiveMetadata.lifecycleHooks
                .indexOf(LifecycleHooks.AfterContentInit),
            -1),
        callAfterContentChecked: !identical(
            directiveMetadata.lifecycleHooks
                .indexOf(LifecycleHooks.AfterContentChecked),
            -1),
        callAfterViewInit: !identical(
            directiveMetadata.lifecycleHooks
                .indexOf(LifecycleHooks.AfterViewInit),
            -1),
        callAfterViewChecked: !identical(
            directiveMetadata.lifecycleHooks
                .indexOf(LifecycleHooks.AfterViewChecked),
            -1),
        callOnChanges: !identical(
            directiveMetadata.lifecycleHooks.indexOf(LifecycleHooks.OnChanges),
            -1),
        callDoCheck: !identical(
            directiveMetadata.lifecycleHooks.indexOf(LifecycleHooks.DoCheck),
            -1),
        callOnInit: !identical(
            directiveMetadata.lifecycleHooks.indexOf(LifecycleHooks.OnInit),
            -1),
        changeDetection: directiveMetadata.changeDetection);
    this.directiveRecords.add(directiveRecord);
    templateVisitAll(this, ast.inputs, directiveRecord);
    var bindingRecords = this.bindingRecords;
    if (directiveRecord.callOnChanges) {
      bindingRecords
          .add(BindingRecord.createDirectiveOnChanges(directiveRecord));
    }
    if (directiveRecord.callOnInit) {
      bindingRecords.add(BindingRecord.createDirectiveOnInit(directiveRecord));
    }
    if (directiveRecord.callDoCheck) {
      bindingRecords.add(BindingRecord.createDirectiveDoCheck(directiveRecord));
    }
    templateVisitAll(this, ast.hostProperties, directiveRecord);
    templateVisitAll(this, ast.hostEvents, directiveRecord);
    templateVisitAll(this, ast.exportAsVars);
    return null;
  }

  dynamic visitDirectiveProperty(
      BoundDirectivePropertyAst ast, DirectiveRecord directiveRecord) {
    // TODO: these setters should eventually be created by change detection, to make

    // it monomorphic!
    var setter = reflector.setter(ast.directiveName);
    this.bindingRecords.add(BindingRecord.createForDirective(
        ast.value, ast.directiveName, setter, directiveRecord));
    return null;
  }
}

List<ChangeDetectorDefinition> createChangeDefinitions(
    List<ProtoViewVisitor> pvVisitors,
    CompileTypeMetadata componentType,
    ChangeDetectorGenConfig genConfig) {
  var pvVariableNames = _collectNestedProtoViewsVariableNames(pvVisitors);
  return pvVisitors.map((pvVisitor) {
    var id = '''${ componentType . name}_${ pvVisitor . viewIndex}''';
    return new ChangeDetectorDefinition(
        id,
        pvVisitor.strategy,
        pvVariableNames[pvVisitor.viewIndex],
        pvVisitor.bindingRecords,
        pvVisitor.eventRecords,
        pvVisitor.directiveRecords,
        genConfig);
  }).toList();
}

List<List<String>> _collectNestedProtoViewsVariableNames(
    List<ProtoViewVisitor> pvVisitors) {
  List<List<String>> nestedPvVariableNames =
      ListWrapper.createFixedSize(pvVisitors.length);
  pvVisitors.forEach((pv) {
    List<String> parentVariableNames =
        isPresent(pv.parent) ? nestedPvVariableNames[pv.parent.viewIndex] : [];
    nestedPvVariableNames[pv.viewIndex] = (new List.from(parentVariableNames)
      ..addAll(pv.variableNames));
  });
  return nestedPvVariableNames;
}
