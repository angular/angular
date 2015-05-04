library angular2.src.analysis.analyzer_plugin.src.tasks;

import 'package:analyzer/src/generated/ast.dart' hide Directive;
import 'package:analyzer/src/generated/element.dart';
import 'package:analyzer/src/generated/engine.dart';
import 'package:analyzer/src/task/general.dart';
import 'package:analyzer/task/dart.dart';
import 'package:analyzer/task/model.dart';
import 'package:angular2/src/core/annotations/annotations.dart';
import 'package:angular2/src/render/api.dart';

/// The [DirectiveMetadata]s of a [LibrarySpecificUnit].
final ListResultDescriptor<DirectiveMetadata> DIRECTIVES =
    new ListResultDescriptor<DirectiveMetadata>('ANGULAR2_DIRECTIVES', null);

/// A task that builds [DirectiveMetadata]s for directive classes.
class BuildUnitDirectivesTask extends SourceBasedAnalysisTask {
  static const String UNIT_INPUT = 'UNIT_INPUT';

  static final TaskDescriptor DESCRIPTOR = new TaskDescriptor(
      'BuildUnitDirectivesTask', createTask, buildInputs,
      <ResultDescriptor>[DIRECTIVES]);

  BuildUnitDirectivesTask(AnalysisContext context, AnalysisTarget target)
      : super(context, target);

  @override
  TaskDescriptor get descriptor => DESCRIPTOR;

  @override
  void internalPerform() {
    CompilationUnit unit = getRequiredInput(UNIT_INPUT);
    List<DirectiveMetadata> metaList = <DirectiveMetadata>[];
    for (CompilationUnitMember unitMember in unit.declarations) {
      if (unitMember is ClassDeclaration) {
        for (Annotation annotationNode in unitMember.metadata) {
          Directive directive = _createDirective(annotationNode);
          if (directive != null) {
            DirectiveMetadata meta = new DirectiveMetadata(
                type: _getDirectiveType(directive),
                selector: directive.selector);
            metaList.add(meta);
          }
        }
      }
    }
    outputs[DIRECTIVES] = metaList;
  }

  /// Returns an Angular [Directive] that corresponds to the given [node].
  /// Returns `null` if not an Angular annotation.
  Directive _createDirective(Annotation node) {
    // TODO(scheglov) add support for all arguments
    if (_isAngularAnnotation(node, 'Component')) {
      String selector = _getNamedArgument(node, 'selector');
      return new Component(selector: selector);
    }
    if (_isAngularAnnotation(node, 'Directive')) {
      String selector = _getNamedArgument(node, 'selector');
      return new Directive(selector: selector);
    }
    return null;
  }

  int _getDirectiveType(Directive directive) {
    if (directive is Component) {
      return DirectiveMetadata.COMPONENT_TYPE;
    }
    return DirectiveMetadata.DIRECTIVE_TYPE;
  }

  /// Returns the value of an argument with the given [name].
  /// Returns `null` if not found or cannot be evaluated statically.
  Object _getNamedArgument(Annotation node, String name) {
    if (node.arguments != null) {
      List<Expression> arguments = node.arguments.arguments;
      for (Expression argument in arguments) {
        if (argument is NamedExpression &&
            argument.name != null &&
            argument.name.label != null &&
            argument.name.label.name == name) {
          Expression expression = argument.expression;
          if (expression is SimpleStringLiteral) {
            return expression.value;
          }
        }
      }
    }
    return null;
  }

  /// Returns `true` is the given [node] is resolved to a creation of an Angular
  /// annotation class with the given [name].
  bool _isAngularAnnotation(Annotation node, String name) {
    if (node.element is ConstructorElement) {
      ClassElement clazz = node.element.enclosingElement;
      return clazz.library.name ==
              'angular2.src.core.annotations.annotations' &&
          clazz.name == name;
    }
    return null;
  }

  static Map<String, TaskInput> buildInputs(LibrarySpecificUnit target) {
    return <String, TaskInput>{UNIT_INPUT: RESOLVED_UNIT.of(target)};
  }

  static BuildUnitDirectivesTask createTask(
      AnalysisContext context, LibrarySpecificUnit target) {
    return new BuildUnitDirectivesTask(context, target);
  }
}
