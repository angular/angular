library angular2.src.analysis.analyzer_plugin.src.tasks;

import 'package:analyzer/src/generated/ast.dart' hide Directive;
import 'package:analyzer/src/generated/element.dart';
import 'package:analyzer/src/generated/engine.dart';
import 'package:analyzer/src/generated/source.dart';
import 'package:analyzer/src/generated/utilities_general.dart';
import 'package:analyzer/src/task/general.dart';
import 'package:analyzer/task/dart.dart';
import 'package:analyzer/task/model.dart';
import 'package:angular2/src/core/annotations/annotations.dart';
import 'package:angular2/src/core/compiler/compiler.dart';
import 'package:angular2/src/core/compiler/element_injector.dart';
import 'package:angular2/src/reflection/reflection.dart';
import 'package:angular2/src/render/api.dart';

/**
 * The [DirectiveMetadata]s of a [LibrarySpecificUnit].
 */
final ListResultDescriptor<DirectiveMetadata> DIRECTIVES =
    new ListResultDescriptor<DirectiveMetadata>('ANGULAR2_DIRECTIVES', null);

/**
 * A task that builds [DirectiveMetadata]s for directive classes.
 */
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
    reflector.reflectionCapabilities = _EmptyReflectionCapabilities.INSTANCE;
    CompilationUnit unit = getRequiredInput(UNIT_INPUT);
    List<DirectiveMetadata> directives = <DirectiveMetadata>[];
    for (CompilationUnitMember unitMember in unit.declarations) {
      if (unitMember is ClassDeclaration) {
        DirectiveBinding directiveBinding = _createDirectiveBinding(unitMember);
        if (directiveBinding != null) {
          DirectiveMetadata directive =
              Compiler.buildRenderDirective(directiveBinding);
          directives.add(directive);
        }
      }
    }
    outputs[DIRECTIVES] = directives;
  }

  static Map<String, TaskInput> buildInputs(LibrarySpecificUnit target) {
    return <String, TaskInput>{UNIT_INPUT: RESOLVED_UNIT.of(target)};
  }

  static BuildUnitDirectivesTask createTask(
      AnalysisContext context, LibrarySpecificUnit target) {
    return new BuildUnitDirectivesTask(context, target);
  }

  /**
   * Returns an Angular [Directive] that corresponds to the given [node].
   * Returns `null` if not an Angular annotation.
   */
  static Directive _createDirective(Annotation node) {
    // TODO(scheglov) add support for all arguments
    if (_isAngularAnnotation(node, 'Component')) {
      String selector = _getNamedArgument(node, 'selector');
      return new Component(selector: selector);
    }
    if (_isAngularAnnotation(node, 'Decorator')) {
      String selector = _getNamedArgument(node, 'selector');
      return new Decorator(selector: selector);
    }
    return null;
  }

  /**
   * Returns a new [DirectiveBinding] for the given [clazz].
   * Returns `null` if [clazz] is not annotated with an Angular directive.
   */
  static DirectiveBinding _createDirectiveBinding(ClassDeclaration clazz) {
    for (Annotation annotationNode in clazz.metadata) {
      Directive directive = _createDirective(annotationNode);
      if (directive != null) {
        Type type = new StaticType(clazz);
        return DirectiveBinding.createFromType(type, directive);
      }
    }
    return null;
  }

  /**
   * Returns the value of an argument with the given [name].
   * Returns `null` if not found or cannot be evaluated statically.
   */
  static Object _getNamedArgument(Annotation node, String name) {
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

  /**
   * Returns `true` is the given [node] is resolved to a creation of an Angular
   * annotation class with the given [name].
   */
  static bool _isAngularAnnotation(Annotation node, String name) {
    if (node.element is ConstructorElement) {
      ClassElement clazz = node.element.enclosingElement;
      return clazz.library.name ==
              'angular2.src.core.annotations.annotations' &&
          clazz.name == name;
    }
    return null;
  }
}

/**
 * A static [Type] implementation.
 */
class StaticType implements Type {
  final String name;
  final Source librarySource;
  final Source unitSource;

  factory StaticType(ClassDeclaration node) {
    ClassElement element = node.element;
    return new StaticType._(
        element.name, element.library.source, element.source);
  }

  StaticType._(this.name, this.librarySource, this.unitSource);

  @override
  int get hashCode {
    int hash = 0;
    hash = JenkinsSmiHash.combine(hash, name.hashCode);
    hash = JenkinsSmiHash.combine(librarySource.hashCode, unitSource.hashCode);
    return JenkinsSmiHash.finish(hash);
  }

  @override
  bool operator ==(other) {
    return other is StaticType &&
        other.name == name &&
        other.librarySource == librarySource &&
        other.unitSource == unitSource;
  }

  @override
  String toString() => 'StaticType $name in $unitSource of $librarySource';
}

/**
 * An implementation of (untyped) [ReflectionCapabilities] that does nothing.
 */
class _EmptyReflectionCapabilities {
  static final _EmptyReflectionCapabilities INSTANCE =
      new _EmptyReflectionCapabilities();

  List annotations(Type type) {
    throw "Cannot find reflection information on $type";
  }

  Function factory(Type type) {
    return null;
  }

  GetterFn getter(String name) {
    throw "Cannot find getter ${name}";
  }

  MethodFn method(String name) {
    throw "Cannot find method ${name}";
  }

  List parameters(Type type) {
    return [];
  }

  SetterFn setter(String name) {
    throw "Cannot find setter ${name}";
  }
}
