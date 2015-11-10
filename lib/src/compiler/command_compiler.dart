library angular2.src.compiler.command_compiler;

import "package:angular2/src/facade/lang.dart"
    show isPresent, isBlank, Type, isString, StringWrapper, IS_DART;
import "package:angular2/src/facade/collection.dart"
    show SetWrapper, StringMapWrapper, ListWrapper;
import "package:angular2/src/core/linker/template_commands.dart"
    show
        TemplateCmd,
        TextCmd,
        NgContentCmd,
        BeginElementCmd,
        EndElementCmd,
        BeginComponentCmd,
        EndComponentCmd,
        EmbeddedTemplateCmd,
        CompiledComponentTemplate;
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
    show CompileTypeMetadata, CompileDirectiveMetadata;
import "source_module.dart" show SourceExpressions, SourceExpression, moduleRef;
import "package:angular2/src/core/metadata/view.dart" show ViewEncapsulation;
import "util.dart"
    show
        escapeSingleQuoteString,
        codeGenConstConstructorCall,
        codeGenValueFn,
        MODULE_SUFFIX;
import "package:angular2/src/core/di.dart" show Injectable;

var TEMPLATE_COMMANDS_MODULE_REF = moduleRef(
    '''package:angular2/src/core/linker/template_commands${ MODULE_SUFFIX}''');
const IMPLICIT_TEMPLATE_VAR = "\$implicit";
const CLASS_ATTR = "class";
const STYLE_ATTR = "style";

@Injectable()
class CommandCompiler {
  List<TemplateCmd> compileComponentRuntime(
      CompileDirectiveMetadata component,
      List<TemplateAst> template,
      List<Function> changeDetectorFactories,
      Function componentTemplateFactory) {
    var visitor = new CommandBuilderVisitor(
        new RuntimeCommandFactory(
            component, componentTemplateFactory, changeDetectorFactories),
        0);
    templateVisitAll(visitor, template);
    return visitor.result;
  }

  SourceExpression compileComponentCodeGen(
      CompileDirectiveMetadata component,
      List<TemplateAst> template,
      List<String> changeDetectorFactoryExpressions,
      Function componentTemplateFactory) {
    var visitor = new CommandBuilderVisitor(
        new CodegenCommandFactory(component, componentTemplateFactory,
            changeDetectorFactoryExpressions),
        0);
    templateVisitAll(visitor, template);
    return new SourceExpression([], codeGenArray(visitor.result));
  }
}

abstract class CommandFactory<R> {
  R createText(String value, bool isBound, num ngContentIndex);
  R createNgContent(num index, num ngContentIndex);
  R createBeginElement(
      String name,
      List<String> attrNameAndValues,
      List<String> eventTargetAndNames,
      List<String> variableNameAndValues,
      List<CompileDirectiveMetadata> directives,
      bool isBound,
      num ngContentIndex);
  R createEndElement();
  R createBeginComponent(
      String name,
      List<String> attrNameAndValues,
      List<String> eventTargetAndNames,
      List<String> variableNameAndValues,
      List<CompileDirectiveMetadata> directives,
      ViewEncapsulation encapsulation,
      num ngContentIndex);
  R createEndComponent();
  R createEmbeddedTemplate(
      num embeddedTemplateIndex,
      List<String> attrNameAndValues,
      List<String> variableNameAndValues,
      List<CompileDirectiveMetadata> directives,
      bool isMerged,
      num ngContentIndex,
      List<R> children);
}

class RuntimeCommandFactory implements CommandFactory<TemplateCmd> {
  CompileDirectiveMetadata component;
  Function componentTemplateFactory;
  List<Function> changeDetectorFactories;
  RuntimeCommandFactory(this.component, this.componentTemplateFactory,
      this.changeDetectorFactories) {}
  List<Type> _mapDirectives(List<CompileDirectiveMetadata> directives) {
    return directives.map((directive) => directive.type.runtime).toList();
  }

  TemplateCmd createText(String value, bool isBound, num ngContentIndex) {
    return new TextCmd(value, isBound, ngContentIndex);
  }

  TemplateCmd createNgContent(num index, num ngContentIndex) {
    return new NgContentCmd(index, ngContentIndex);
  }

  TemplateCmd createBeginElement(
      String name,
      List<String> attrNameAndValues,
      List<String> eventTargetAndNames,
      List<String> variableNameAndValues,
      List<CompileDirectiveMetadata> directives,
      bool isBound,
      num ngContentIndex) {
    return new BeginElementCmd(
        name,
        attrNameAndValues,
        eventTargetAndNames,
        variableNameAndValues,
        this._mapDirectives(directives),
        isBound,
        ngContentIndex);
  }

  TemplateCmd createEndElement() {
    return new EndElementCmd();
  }

  TemplateCmd createBeginComponent(
      String name,
      List<String> attrNameAndValues,
      List<String> eventTargetAndNames,
      List<String> variableNameAndValues,
      List<CompileDirectiveMetadata> directives,
      ViewEncapsulation encapsulation,
      num ngContentIndex) {
    var nestedTemplateAccessor = this.componentTemplateFactory(directives[0]);
    return new BeginComponentCmd(
        name,
        attrNameAndValues,
        eventTargetAndNames,
        variableNameAndValues,
        this._mapDirectives(directives),
        encapsulation,
        ngContentIndex,
        nestedTemplateAccessor);
  }

  TemplateCmd createEndComponent() {
    return new EndComponentCmd();
  }

  TemplateCmd createEmbeddedTemplate(
      num embeddedTemplateIndex,
      List<String> attrNameAndValues,
      List<String> variableNameAndValues,
      List<CompileDirectiveMetadata> directives,
      bool isMerged,
      num ngContentIndex,
      List<TemplateCmd> children) {
    return new EmbeddedTemplateCmd(
        attrNameAndValues,
        variableNameAndValues,
        this._mapDirectives(directives),
        isMerged,
        ngContentIndex,
        this.changeDetectorFactories[embeddedTemplateIndex],
        children);
  }
}

class CodegenCommandFactory implements CommandFactory<Expression> {
  CompileDirectiveMetadata component;
  Function componentTemplateFactory;
  List<String> changeDetectorFactoryExpressions;
  CodegenCommandFactory(this.component, this.componentTemplateFactory,
      this.changeDetectorFactoryExpressions) {}
  Expression createText(String value, bool isBound, num ngContentIndex) {
    return new Expression(
        '''${ codeGenConstConstructorCall ( TEMPLATE_COMMANDS_MODULE_REF + "TextCmd" )}(${ escapeSingleQuoteString ( value )}, ${ isBound}, ${ ngContentIndex})''');
  }

  Expression createNgContent(num index, num ngContentIndex) {
    return new Expression(
        '''${ codeGenConstConstructorCall ( TEMPLATE_COMMANDS_MODULE_REF + "NgContentCmd" )}(${ index}, ${ ngContentIndex})''');
  }

  Expression createBeginElement(
      String name,
      List<String> attrNameAndValues,
      List<String> eventTargetAndNames,
      List<String> variableNameAndValues,
      List<CompileDirectiveMetadata> directives,
      bool isBound,
      num ngContentIndex) {
    var attrsExpression = codeGenArray(attrNameAndValues);
    return new Expression(
        '''${ codeGenConstConstructorCall ( TEMPLATE_COMMANDS_MODULE_REF + "BeginElementCmd" )}(${ escapeSingleQuoteString ( name )}, ${ attrsExpression}, ''' +
            '''${ codeGenArray ( eventTargetAndNames )}, ${ codeGenArray ( variableNameAndValues )}, ${ codeGenDirectivesArray ( directives )}, ${ isBound}, ${ ngContentIndex})''');
  }

  Expression createEndElement() {
    return new Expression(
        '''${ codeGenConstConstructorCall ( TEMPLATE_COMMANDS_MODULE_REF + "EndElementCmd" )}()''');
  }

  Expression createBeginComponent(
      String name,
      List<String> attrNameAndValues,
      List<String> eventTargetAndNames,
      List<String> variableNameAndValues,
      List<CompileDirectiveMetadata> directives,
      ViewEncapsulation encapsulation,
      num ngContentIndex) {
    var attrsExpression = codeGenArray(attrNameAndValues);
    return new Expression(
        '''${ codeGenConstConstructorCall ( TEMPLATE_COMMANDS_MODULE_REF + "BeginComponentCmd" )}(${ escapeSingleQuoteString ( name )}, ${ attrsExpression}, ''' +
            '''${ codeGenArray ( eventTargetAndNames )}, ${ codeGenArray ( variableNameAndValues )}, ${ codeGenDirectivesArray ( directives )}, ${ codeGenViewEncapsulation ( encapsulation )}, ${ ngContentIndex}, ${ this . componentTemplateFactory ( directives [ 0 ] )})''');
  }

  Expression createEndComponent() {
    return new Expression(
        '''${ codeGenConstConstructorCall ( TEMPLATE_COMMANDS_MODULE_REF + "EndComponentCmd" )}()''');
  }

  Expression createEmbeddedTemplate(
      num embeddedTemplateIndex,
      List<String> attrNameAndValues,
      List<String> variableNameAndValues,
      List<CompileDirectiveMetadata> directives,
      bool isMerged,
      num ngContentIndex,
      List<Expression> children) {
    return new Expression(
        '''${ codeGenConstConstructorCall ( TEMPLATE_COMMANDS_MODULE_REF + "EmbeddedTemplateCmd" )}(${ codeGenArray ( attrNameAndValues )}, ${ codeGenArray ( variableNameAndValues )}, ''' +
            '''${ codeGenDirectivesArray ( directives )}, ${ isMerged}, ${ ngContentIndex}, ${ this . changeDetectorFactoryExpressions [ embeddedTemplateIndex ]}, ${ codeGenArray ( children )})''');
  }
}

dynamic visitAndReturnContext(
    TemplateAstVisitor visitor, List<TemplateAst> asts, dynamic context) {
  templateVisitAll(visitor, asts, context);
  return context;
}

class CommandBuilderVisitor<R> implements TemplateAstVisitor {
  CommandFactory<R> commandFactory;
  num embeddedTemplateIndex;
  List<R> result = [];
  num transitiveNgContentCount = 0;
  CommandBuilderVisitor(this.commandFactory, this.embeddedTemplateIndex) {}
  List<String> _readAttrNameAndValues(
      List<CompileDirectiveMetadata> directives, List<TemplateAst> attrAsts) {
    var attrs = keyValueArrayToMap(visitAndReturnContext(this, attrAsts, []));
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

  dynamic visitNgContent(NgContentAst ast, dynamic context) {
    this.transitiveNgContentCount++;
    this.result.add(
        this.commandFactory.createNgContent(ast.index, ast.ngContentIndex));
    return null;
  }

  dynamic visitEmbeddedTemplate(EmbeddedTemplateAst ast, dynamic context) {
    this.embeddedTemplateIndex++;
    var childVisitor = new CommandBuilderVisitor(
        this.commandFactory, this.embeddedTemplateIndex);
    templateVisitAll(childVisitor, ast.children);
    var isMerged = childVisitor.transitiveNgContentCount > 0;
    var variableNameAndValues = [];
    ast.vars.forEach((varAst) {
      variableNameAndValues.add(varAst.name);
      variableNameAndValues
          .add(varAst.value.length > 0 ? varAst.value : IMPLICIT_TEMPLATE_VAR);
    });
    var directives = [];
    ListWrapper.forEachWithIndex(ast.directives,
        (DirectiveAst directiveAst, num index) {
      directiveAst.visit(this, new DirectiveContext(index, [], [], directives));
    });
    this.result.add(this.commandFactory.createEmbeddedTemplate(
        this.embeddedTemplateIndex,
        this._readAttrNameAndValues(directives, ast.attrs),
        variableNameAndValues,
        directives,
        isMerged,
        ast.ngContentIndex,
        childVisitor.result));
    this.transitiveNgContentCount += childVisitor.transitiveNgContentCount;
    this.embeddedTemplateIndex = childVisitor.embeddedTemplateIndex;
    return null;
  }

  dynamic visitElement(ElementAst ast, dynamic context) {
    var component = ast.getComponent();
    var eventTargetAndNames = visitAndReturnContext(this, ast.outputs, []);
    var variableNameAndValues = [];
    if (isBlank(component)) {
      ast.exportAsVars.forEach((varAst) {
        variableNameAndValues.add(varAst.name);
        variableNameAndValues.add(null);
      });
    }
    var directives = [];
    ListWrapper.forEachWithIndex(ast.directives,
        (DirectiveAst directiveAst, num index) {
      directiveAst.visit(
          this,
          new DirectiveContext(
              index, eventTargetAndNames, variableNameAndValues, directives));
    });
    eventTargetAndNames = removeKeyValueArrayDuplicates(eventTargetAndNames);
    var attrNameAndValues = this._readAttrNameAndValues(directives, ast.attrs);
    if (isPresent(component)) {
      this.result.add(this.commandFactory.createBeginComponent(
          ast.name,
          attrNameAndValues,
          eventTargetAndNames,
          variableNameAndValues,
          directives,
          component.template.encapsulation,
          ast.ngContentIndex));
      templateVisitAll(this, ast.children);
      this.result.add(this.commandFactory.createEndComponent());
    } else {
      this.result.add(this.commandFactory.createBeginElement(
          ast.name,
          attrNameAndValues,
          eventTargetAndNames,
          variableNameAndValues,
          directives,
          ast.isBound(),
          ast.ngContentIndex));
      templateVisitAll(this, ast.children);
      this.result.add(this.commandFactory.createEndElement());
    }
    return null;
  }

  dynamic visitVariable(VariableAst ast, dynamic ctx) {
    return null;
  }

  dynamic visitAttr(AttrAst ast, List<String> attrNameAndValues) {
    attrNameAndValues.add(ast.name);
    attrNameAndValues.add(ast.value);
    return null;
  }

  dynamic visitBoundText(BoundTextAst ast, dynamic context) {
    this
        .result
        .add(this.commandFactory.createText(null, true, ast.ngContentIndex));
    return null;
  }

  dynamic visitText(TextAst ast, dynamic context) {
    this.result.add(
        this.commandFactory.createText(ast.value, false, ast.ngContentIndex));
    return null;
  }

  dynamic visitDirective(DirectiveAst ast, DirectiveContext ctx) {
    ctx.targetDirectives.add(ast.directive);
    templateVisitAll(this, ast.hostEvents, ctx.eventTargetAndNames);
    ast.exportAsVars.forEach((varAst) {
      ctx.targetVariableNameAndValues.add(varAst.name);
      ctx.targetVariableNameAndValues.add(ctx.index);
    });
    return null;
  }

  dynamic visitEvent(BoundEventAst ast, List<String> eventTargetAndNames) {
    eventTargetAndNames.add(ast.target);
    eventTargetAndNames.add(ast.name);
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

List<String> removeKeyValueArrayDuplicates(List<String> keyValueArray) {
  var knownPairs = new Set();
  var resultKeyValueArray = [];
  for (var i = 0; i < keyValueArray.length; i += 2) {
    var key = keyValueArray[i];
    var value = keyValueArray[i + 1];
    var pairId = '''${ key}:${ value}''';
    if (!SetWrapper.has(knownPairs, pairId)) {
      resultKeyValueArray.add(key);
      resultKeyValueArray.add(value);
      knownPairs.add(pairId);
    }
  }
  return resultKeyValueArray;
}

Map<String, String> keyValueArrayToMap(List<String> keyValueArr) {
  Map<String, String> data = {};
  for (var i = 0; i < keyValueArr.length; i += 2) {
    data[keyValueArr[i]] = keyValueArr[i + 1];
  }
  return data;
}

List<String> mapToKeyValueArray(Map<String, String> data) {
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
    keyValueArray.add(entry[0]);
    keyValueArray.add(entry[1]);
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
  List<String> eventTargetAndNames;
  List<dynamic> targetVariableNameAndValues;
  List<CompileDirectiveMetadata> targetDirectives;
  DirectiveContext(this.index, this.eventTargetAndNames,
      this.targetVariableNameAndValues, this.targetDirectives) {}
}

class Expression {
  String value;
  Expression(this.value) {}
}

String escapeValue(dynamic value) {
  if (value is Expression) {
    return value.value;
  } else if (isString(value)) {
    return escapeSingleQuoteString(value);
  } else if (isBlank(value)) {
    return "null";
  } else {
    return '''${ value}''';
  }
}

String codeGenArray(List<dynamic> data) {
  var base = '''[${ data . map ( escapeValue ) . toList ( ) . join ( "," )}]''';
  return IS_DART ? '''const ${ base}''' : base;
}

String codeGenDirectivesArray(List<CompileDirectiveMetadata> directives) {
  var expressions = directives
      .map((directiveType) =>
          '''${ moduleRef ( directiveType . type . moduleUrl )}${ directiveType . type . name}''')
      .toList();
  var base = '''[${ expressions . join ( "," )}]''';
  return IS_DART ? '''const ${ base}''' : base;
}

String codeGenViewEncapsulation(ViewEncapsulation value) {
  if (IS_DART) {
    return '''${ TEMPLATE_COMMANDS_MODULE_REF}${ value}''';
  } else {
    return '''${ value}''';
  }
}
