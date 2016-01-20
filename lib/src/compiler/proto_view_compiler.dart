library angular2.src.compiler.proto_view_compiler;

import "package:angular2/src/facade/lang.dart"
    show isPresent, isBlank, Type, isString, StringWrapper, IS_DART;
import "package:angular2/src/facade/collection.dart"
    show SetWrapper, StringMapWrapper, ListWrapper, MapWrapper;
import "template_ast.dart"
    show
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
        templateVisitAll;
import "directive_metadata.dart"
    show CompileTypeMetadata, CompileDirectiveMetadata, CompilePipeMetadata;
import "source_module.dart" show SourceExpressions, SourceExpression, moduleRef;
import "package:angular2/src/core/linker/view.dart" show AppProtoView, AppView;
import "package:angular2/src/core/linker/view_type.dart" show ViewType;
import "package:angular2/src/core/linker/element.dart"
    show AppProtoElement, AppElement;
import "package:angular2/src/core/linker/resolved_metadata_cache.dart"
    show ResolvedMetadataCache;
import "util.dart"
    show
        escapeSingleQuoteString,
        codeGenConstConstructorCall,
        codeGenValueFn,
        codeGenFnHeader,
        MODULE_SUFFIX,
        codeGenStringMap,
        Expression,
        Statement;
import "package:angular2/src/core/di.dart" show Injectable;

const PROTO_VIEW_JIT_IMPORTS = const {
  "AppProtoView": AppProtoView,
  "AppProtoElement": AppProtoElement,
  "ViewType": ViewType
};
// TODO: have a single file that reexports everything needed for

// codegen explicitly

// - helps understanding what codegen works against

// - less imports in codegen code
var APP_VIEW_MODULE_REF =
    moduleRef("package:angular2/src/core/linker/view" + MODULE_SUFFIX);
var VIEW_TYPE_MODULE_REF =
    moduleRef("package:angular2/src/core/linker/view_type" + MODULE_SUFFIX);
var APP_EL_MODULE_REF =
    moduleRef("package:angular2/src/core/linker/element" + MODULE_SUFFIX);
var METADATA_MODULE_REF =
    moduleRef("package:angular2/src/core/metadata/view" + MODULE_SUFFIX);
const IMPLICIT_TEMPLATE_VAR = "\$implicit";
const CLASS_ATTR = "class";
const STYLE_ATTR = "style";

@Injectable()
class ProtoViewCompiler {
  ProtoViewCompiler() {}
  CompileProtoViews<AppProtoView, AppProtoElement,
      dynamic> compileProtoViewRuntime(
      ResolvedMetadataCache metadataCache,
      CompileDirectiveMetadata component,
      List<TemplateAst> template,
      List<CompilePipeMetadata> pipes) {
    var protoViewFactory =
        new RuntimeProtoViewFactory(metadataCache, component, pipes);
    var allProtoViews = [];
    protoViewFactory.createCompileProtoView(template, [], [], allProtoViews);
    return new CompileProtoViews<AppProtoView, AppProtoElement, dynamic>(
        [], allProtoViews);
  }

  CompileProtoViews<Expression, Expression, String> compileProtoViewCodeGen(
      Expression resolvedMetadataCacheExpr,
      CompileDirectiveMetadata component,
      List<TemplateAst> template,
      List<CompilePipeMetadata> pipes) {
    var protoViewFactory = new CodeGenProtoViewFactory(
        resolvedMetadataCacheExpr, component, pipes);
    var allProtoViews = [];
    var allStatements = [];
    protoViewFactory.createCompileProtoView(
        template, [], allStatements, allProtoViews);
    return new CompileProtoViews<Expression, Expression, String>(
        allStatements.map((stmt) => stmt.statement).toList(), allProtoViews);
  }
}

class CompileProtoViews<APP_PROTO_VIEW, APP_PROTO_EL, STATEMENT> {
  List<STATEMENT> declarations;
  List<CompileProtoView<APP_PROTO_VIEW, APP_PROTO_EL>> protoViews;
  CompileProtoViews(this.declarations, this.protoViews) {}
}

class CompileProtoView<APP_PROTO_VIEW, APP_PROTO_EL> {
  num embeddedTemplateIndex;
  List<CompileProtoElement<APP_PROTO_EL>> protoElements;
  APP_PROTO_VIEW protoView;
  CompileProtoView(
      this.embeddedTemplateIndex, this.protoElements, this.protoView) {}
}

class CompileProtoElement<APP_PROTO_EL> {
  var boundElementIndex;
  List<List<String>> attrNameAndValues;
  List<List<String>> variableNameAndValues;
  List<BoundEventAst> renderEvents;
  List<CompileDirectiveMetadata> directives;
  num embeddedTemplateIndex;
  APP_PROTO_EL appProtoEl;
  CompileProtoElement(
      this.boundElementIndex,
      this.attrNameAndValues,
      this.variableNameAndValues,
      this.renderEvents,
      this.directives,
      this.embeddedTemplateIndex,
      this.appProtoEl) {}
}

dynamic visitAndReturnContext(
    TemplateAstVisitor visitor, List<TemplateAst> asts, dynamic context) {
  templateVisitAll(visitor, asts, context);
  return context;
}

abstract class ProtoViewFactory<APP_PROTO_VIEW, APP_PROTO_EL, STATEMENT> {
  CompileDirectiveMetadata component;
  ProtoViewFactory(this.component) {}
  APP_PROTO_VIEW createAppProtoView(
      num embeddedTemplateIndex,
      ViewType viewType,
      List<List<String>> templateVariableBindings,
      List<STATEMENT> targetStatements);
  APP_PROTO_EL createAppProtoElement(
      num boundElementIndex,
      List<List<String>> attrNameAndValues,
      List<List<String>> variableNameAndValues,
      List<CompileDirectiveMetadata> directives,
      List<STATEMENT> targetStatements);
  CompileProtoView<APP_PROTO_VIEW, APP_PROTO_EL> createCompileProtoView(
      List<TemplateAst> template,
      List<List<String>> templateVariableBindings,
      List<STATEMENT> targetStatements,
      List<CompileProtoView<APP_PROTO_VIEW, APP_PROTO_EL>> targetProtoViews) {
    var embeddedTemplateIndex = targetProtoViews.length;
    // Note: targetProtoViews needs to be in depth first order.

    // So we "reserve" a space here that we fill after the recursion is done
    targetProtoViews.add(null);
    var builder =
        new ProtoViewBuilderVisitor<APP_PROTO_VIEW, APP_PROTO_EL, dynamic>(
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

class CodeGenProtoViewFactory
    extends ProtoViewFactory<Expression, Expression, Statement> {
  Expression resolvedMetadataCacheExpr;
  List<CompilePipeMetadata> pipes;
  num _nextVarId = 0;
  CodeGenProtoViewFactory(this.resolvedMetadataCacheExpr,
      CompileDirectiveMetadata component, this.pipes)
      : super(component) {
    /* super call moved to initializer */;
  }
  String _nextProtoViewVar(num embeddedTemplateIndex) {
    return '''appProtoView${ this . _nextVarId ++}_${ this . component . type . name}${ embeddedTemplateIndex}''';
  }

  Expression createAppProtoView(
      num embeddedTemplateIndex,
      ViewType viewType,
      List<List<String>> templateVariableBindings,
      List<Statement> targetStatements) {
    var protoViewVarName = this._nextProtoViewVar(embeddedTemplateIndex);
    var viewTypeExpr = codeGenViewType(viewType);
    var pipesExpr = identical(embeddedTemplateIndex, 0)
        ? codeGenTypesArray(
            this.pipes.map((pipeMeta) => pipeMeta.type).toList())
        : null;
    var statement =
        '''var ${ protoViewVarName} = ${ APP_VIEW_MODULE_REF}AppProtoView.create(${ this . resolvedMetadataCacheExpr . expression}, ${ viewTypeExpr}, ${ pipesExpr}, ${ codeGenStringMap ( templateVariableBindings )});''';
    targetStatements.add(new Statement(statement));
    return new Expression(protoViewVarName);
  }

  Expression createAppProtoElement(
      num boundElementIndex,
      List<List<String>> attrNameAndValues,
      List<List<String>> variableNameAndValues,
      List<CompileDirectiveMetadata> directives,
      List<Statement> targetStatements) {
    var varName =
        '''appProtoEl${ this . _nextVarId ++}_${ this . component . type . name}''';
    var value = '''${ APP_EL_MODULE_REF}AppProtoElement.create(
        ${ this . resolvedMetadataCacheExpr . expression},
        ${ boundElementIndex},
        ${ codeGenStringMap ( attrNameAndValues )},
        ${ codeGenDirectivesArray ( directives )},
        ${ codeGenStringMap ( variableNameAndValues )}
      )''';
    var statement = '''var ${ varName} = ${ value};''';
    targetStatements.add(new Statement(statement));
    return new Expression(varName);
  }
}

class RuntimeProtoViewFactory
    extends ProtoViewFactory<AppProtoView, AppProtoElement, dynamic> {
  ResolvedMetadataCache metadataCache;
  List<CompilePipeMetadata> pipes;
  RuntimeProtoViewFactory(
      this.metadataCache, CompileDirectiveMetadata component, this.pipes)
      : super(component) {
    /* super call moved to initializer */;
  }
  AppProtoView createAppProtoView(
      num embeddedTemplateIndex,
      ViewType viewType,
      List<List<String>> templateVariableBindings,
      List<dynamic> targetStatements) {
    var pipes = identical(embeddedTemplateIndex, 0)
        ? this.pipes.map((pipeMeta) => pipeMeta.type.runtime).toList()
        : [];
    var templateVars = keyValueArrayToStringMap(templateVariableBindings);
    return AppProtoView.create(
        this.metadataCache, viewType, pipes, templateVars);
  }

  AppProtoElement createAppProtoElement(
      num boundElementIndex,
      List<List<String>> attrNameAndValues,
      List<List<String>> variableNameAndValues,
      List<CompileDirectiveMetadata> directives,
      List<dynamic> targetStatements) {
    var attrs = keyValueArrayToStringMap(attrNameAndValues);
    return AppProtoElement.create(
        this.metadataCache,
        boundElementIndex,
        attrs,
        directives.map((dirMeta) => dirMeta.type.runtime).toList(),
        keyValueArrayToStringMap(variableNameAndValues));
  }
}

class ProtoViewBuilderVisitor<APP_PROTO_VIEW, APP_PROTO_EL, STATEMENT>
    implements TemplateAstVisitor {
  ProtoViewFactory<APP_PROTO_VIEW, APP_PROTO_EL, STATEMENT> factory;
  List<STATEMENT> allStatements;
  List<CompileProtoView<APP_PROTO_VIEW, APP_PROTO_EL>> allProtoViews;
  List<CompileProtoElement<APP_PROTO_EL>> protoElements = [];
  num boundElementCount = 0;
  ProtoViewBuilderVisitor(
      this.factory, this.allStatements, this.allProtoViews) {}
  List<List<String>> _readAttrNameAndValues(
      List<CompileDirectiveMetadata> directives, List<TemplateAst> attrAsts) {
    var attrs = visitAndReturnContext(this, attrAsts, {});
    directives.forEach((directiveMeta) {
      StringMapWrapper.forEach(directiveMeta.hostAttributes, (value, name) {
        var prevValue = attrs[name];
        attrs[name] = isPresent(prevValue)
            ? mergeAttributeValue(name, prevValue, value)
            : value;
      });
    });
    return mapToKeyValueArray(attrs);
  }

  dynamic visitBoundText(BoundTextAst ast, dynamic context) {
    return null;
  }

  dynamic visitText(TextAst ast, dynamic context) {
    return null;
  }

  dynamic visitNgContent(NgContentAst ast, dynamic context) {
    return null;
  }

  dynamic visitElement(ElementAst ast, dynamic context) {
    var boundElementIndex = null;
    if (ast.isBound()) {
      boundElementIndex = this.boundElementCount++;
    }
    var component = ast.getComponent();
    List<List<String>> variableNameAndValues = [];
    if (isBlank(component)) {
      ast.exportAsVars.forEach((varAst) {
        variableNameAndValues.add([varAst.name, null]);
      });
    }
    var directives = [];
    Map<String, BoundEventAst> renderEvents = visitAndReturnContext(
        this, ast.outputs, new Map<String, BoundEventAst>());
    ListWrapper.forEachWithIndex(ast.directives,
        (DirectiveAst directiveAst, num index) {
      directiveAst.visit(
          this,
          new DirectiveContext(index, boundElementIndex, renderEvents,
              variableNameAndValues, directives));
    });
    var renderEventArray = [];
    renderEvents.forEach((_, eventAst) => renderEventArray.add(eventAst));
    var attrNameAndValues = this._readAttrNameAndValues(directives, ast.attrs);
    this._addProtoElement(ast.isBound(), boundElementIndex, attrNameAndValues,
        variableNameAndValues, renderEventArray, directives, null);
    templateVisitAll(this, ast.children);
    return null;
  }

  dynamic visitEmbeddedTemplate(EmbeddedTemplateAst ast, dynamic context) {
    var boundElementIndex = this.boundElementCount++;
    List<CompileDirectiveMetadata> directives = [];
    ListWrapper.forEachWithIndex(ast.directives,
        (DirectiveAst directiveAst, num index) {
      directiveAst.visit(
          this,
          new DirectiveContext(index, boundElementIndex,
              new Map<String, BoundEventAst>(), [], directives));
    });
    var attrNameAndValues = this._readAttrNameAndValues(directives, ast.attrs);
    var templateVariableBindings = ast.vars
        .map((varAst) => [
              varAst.value.length > 0 ? varAst.value : IMPLICIT_TEMPLATE_VAR,
              varAst.name
            ])
        .toList();
    var nestedProtoView = this.factory.createCompileProtoView(ast.children,
        templateVariableBindings, this.allStatements, this.allProtoViews);
    this._addProtoElement(true, boundElementIndex, attrNameAndValues, [], [],
        directives, nestedProtoView.embeddedTemplateIndex);
    return null;
  }

  _addProtoElement(
      bool isBound,
      boundElementIndex,
      List<List<String>> attrNameAndValues,
      List<List<String>> variableNameAndValues,
      List<BoundEventAst> renderEvents,
      List<CompileDirectiveMetadata> directives,
      num embeddedTemplateIndex) {
    var appProtoEl = null;
    if (isBound) {
      appProtoEl = this.factory.createAppProtoElement(
          boundElementIndex,
          attrNameAndValues,
          variableNameAndValues,
          directives,
          this.allStatements);
    }
    var compileProtoEl = new CompileProtoElement<APP_PROTO_EL>(
        boundElementIndex,
        attrNameAndValues,
        variableNameAndValues,
        renderEvents,
        directives,
        embeddedTemplateIndex,
        appProtoEl);
    this.protoElements.add(compileProtoEl);
  }

  dynamic visitVariable(VariableAst ast, dynamic ctx) {
    return null;
  }

  dynamic visitAttr(AttrAst ast, Map<String, String> attrNameAndValues) {
    attrNameAndValues[ast.name] = ast.value;
    return null;
  }

  dynamic visitDirective(DirectiveAst ast, DirectiveContext ctx) {
    ctx.targetDirectives.add(ast.directive);
    templateVisitAll(this, ast.hostEvents, ctx.hostEventTargetAndNames);
    ast.exportAsVars.forEach((varAst) {
      ctx.targetVariableNameAndValues.add([varAst.name, ctx.index]);
    });
    return null;
  }

  dynamic visitEvent(
      BoundEventAst ast, Map<String, BoundEventAst> eventTargetAndNames) {
    eventTargetAndNames[ast.fullName] = ast;
    return null;
  }

  dynamic visitDirectiveProperty(
      BoundDirectivePropertyAst ast, dynamic context) {
    return null;
  }

  dynamic visitElementProperty(BoundElementPropertyAst ast, dynamic context) {
    return null;
  }
}

List<List<String>> mapToKeyValueArray(Map<String, String> data) {
  var entryArray = [];
  StringMapWrapper.forEach(data, (value, name) {
    entryArray.add([name, value]);
  });
  // We need to sort to get a defined output order

  // for tests and for caching generated artifacts...
  ListWrapper.sort(entryArray,
      (entry1, entry2) => StringWrapper.compare(entry1[0], entry2[0]));
  var keyValueArray = [];
  entryArray.forEach((entry) {
    keyValueArray.add([entry[0], entry[1]]);
  });
  return keyValueArray;
}

String mergeAttributeValue(
    String attrName, String attrValue1, String attrValue2) {
  if (attrName == CLASS_ATTR || attrName == STYLE_ATTR) {
    return '''${ attrValue1} ${ attrValue2}''';
  } else {
    return attrValue2;
  }
}

class DirectiveContext {
  num index;
  num boundElementIndex;
  Map<String, BoundEventAst> hostEventTargetAndNames;
  List<List<dynamic>> targetVariableNameAndValues;
  List<CompileDirectiveMetadata> targetDirectives;
  DirectiveContext(
      this.index,
      this.boundElementIndex,
      this.hostEventTargetAndNames,
      this.targetVariableNameAndValues,
      this.targetDirectives) {}
}

Map<String, dynamic> keyValueArrayToStringMap(
    List<List<dynamic>> keyValueArray) {
  Map<String, String> stringMap = {};
  for (var i = 0; i < keyValueArray.length; i++) {
    var entry = keyValueArray[i];
    stringMap[entry[0]] = entry[1];
  }
  return stringMap;
}

String codeGenDirectivesArray(List<CompileDirectiveMetadata> directives) {
  var expressions = directives
      .map((directiveType) => codeGenType(directiveType.type))
      .toList();
  return '''[${ expressions . join ( "," )}]''';
}

String codeGenTypesArray(List<CompileTypeMetadata> types) {
  var expressions = types.map(codeGenType).toList();
  return '''[${ expressions . join ( "," )}]''';
}

String codeGenViewType(ViewType value) {
  if (IS_DART) {
    return '''${ VIEW_TYPE_MODULE_REF}${ value}''';
  } else {
    return '''${ value}''';
  }
}

String codeGenType(CompileTypeMetadata type) {
  return '''${ moduleRef ( type . moduleUrl )}${ type . name}''';
}

ViewType getViewType(
    CompileDirectiveMetadata component, num embeddedTemplateIndex) {
  if (embeddedTemplateIndex > 0) {
    return ViewType.EMBEDDED;
  } else if (component.type.isHost) {
    return ViewType.HOST;
  } else {
    return ViewType.COMPONENT;
  }
}
