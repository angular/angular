library angular2.src.compiler.source_module;

import "package:angular2/src/facade/lang.dart" show StringWrapper, isBlank;

var MODULE_REGEXP = new RegExp(r'#MODULE\[([^\]]*)\]');
String moduleRef(moduleUrl) {
  return '''#MODULE[${ moduleUrl}]''';
}

class SourceModule {
  String moduleUrl;
  String sourceWithModuleRefs;
  SourceModule(this.moduleUrl, this.sourceWithModuleRefs) {}
  SourceWithImports getSourceWithImports() {
    var moduleAliases = {};
    List<List<String>> imports = [];
    var newSource = StringWrapper.replaceAllMapped(
        this.sourceWithModuleRefs, MODULE_REGEXP, (match) {
      var moduleUrl = match[1];
      var alias = moduleAliases[moduleUrl];
      if (isBlank(alias)) {
        if (moduleUrl == this.moduleUrl) {
          alias = "";
        } else {
          alias = '''import${ imports . length}''';
          imports.add([moduleUrl, alias]);
        }
        moduleAliases[moduleUrl] = alias;
      }
      return alias.length > 0 ? '''${ alias}.''' : "";
    });
    return new SourceWithImports(newSource, imports);
  }
}

class SourceExpression {
  List<String> declarations;
  String expression;
  SourceExpression(this.declarations, this.expression) {}
}

class SourceExpressions {
  List<String> declarations;
  List<String> expressions;
  SourceExpressions(this.declarations, this.expressions) {}
}

class SourceWithImports {
  String source;
  List<List<String>> imports;
  SourceWithImports(this.source, this.imports) {}
}
