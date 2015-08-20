library angular2.transform.template_compiler.reflection.processor;

import 'package:angular2/src/core/change_detection/parser/ast.dart';
import 'package:angular2/src/core/render/api.dart';
import 'package:angular2/src/transform/template_compiler/view_definition_creator.dart';

import 'model.dart';

class Processor implements CodegenModel {
  /// The names of all requested `getter`s.
  final Set<ReflectiveAccessor> getterNames = new Set<ReflectiveAccessor>();

  /// The names of all requested `setter`s.
  final Set<ReflectiveAccessor> setterNames = new Set<ReflectiveAccessor>();

  /// The names of all requested `method`s.
  final Set<ReflectiveAccessor> methodNames = new Set<ReflectiveAccessor>();

  _NgAstVisitor _visitor;

  Processor() {
    _visitor = new _NgAstVisitor(this);
  }

  void process(ViewDefinitionEntry viewDefEntry, ProtoViewDto protoViewDto) {
    _processViewDefinition(viewDefEntry);
    _processProtoViewDto(protoViewDto);
  }

  /// Extracts the names of necessary getters from the events in host and
  /// dependent [DirectiveMetadata].
  void _processViewDefinition(ViewDefinitionEntry viewDefEntry) {
    // These are necessary even with generated change detectors.
    if (viewDefEntry.hostMetadata != null &&
        viewDefEntry.hostMetadata.events != null) {
      viewDefEntry.hostMetadata.events.forEach((eventName) {
        getterNames.add(
            new ReflectiveAccessor(eventName, isStaticallyNecessary: true));
      });
    }
  }

  void _processProtoViewDto(ProtoViewDto protoViewDto) {
    _visitor.isStaticallyNecessary = false;

    protoViewDto.textBindings.forEach((ast) => ast.visit(_visitor));
    protoViewDto.elementBinders.forEach((binder) {
      binder.propertyBindings.forEach((binding) {
        binding.astWithSource.visit(_visitor);
        setterNames.add(new ReflectiveAccessor(binding.property,
            isStaticallyNecessary: false));
      });

      binder.directives.forEach((directiveBinding) {
        directiveBinding.propertyBindings.values
            .forEach((propBinding) => propBinding.visit(_visitor));
        directiveBinding.propertyBindings.keys.forEach((bindingName) {
          setterNames.add(new ReflectiveAccessor(bindingName,
              isStaticallyNecessary: false));
        });

        directiveBinding.hostPropertyBindings.forEach((elementBinding) {
          elementBinding.astWithSource.visit(_visitor);
          setterNames.add(new ReflectiveAccessor(elementBinding.property,
              isStaticallyNecessary: false));
        });
      });

      binder.eventBindings
          .forEach((eventBinding) => eventBinding.source.visit(_visitor));

      binder.directives.forEach((directiveBinding) {
        directiveBinding.eventBindings
            .forEach((eventBinding) => eventBinding.source.visit(_visitor));
      });

      if (binder.nestedProtoView != null) {
        _processProtoViewDto(binder.nestedProtoView);
      }
    });
  }
}

class _NgAstVisitor extends RecursiveAstVisitor {
  final Processor _result;

  /// Whether any getters or setters recorded are necessary when running
  /// statically. A getter or setter that is necessary only for change detection
  /// is not necessary when running statically because all accesses are handled
  /// by the dedicated change detector classes.
  bool isStaticallyNecessary = false;

  _NgAstVisitor(this._result);

  visitMethodCall(MethodCall ast) {
    _result.methodNames
        .add(new ReflectiveAccessor(ast.name, isStaticallyNecessary: true));
    super.visitMethodCall(ast);
  }

  visitPropertyRead(PropertyRead ast) {
    _result.getterNames.add(new ReflectiveAccessor(ast.name,
        isStaticallyNecessary: isStaticallyNecessary));
    super.visitPropertyRead(ast);
  }

  visitPropertyWrite(PropertyWrite ast) {
    _result.setterNames.add(new ReflectiveAccessor(ast.name,
        isStaticallyNecessary: isStaticallyNecessary));
    super.visitPropertyWrite(ast);
  }

  visitSafeMethodCall(SafeMethodCall ast) {
    _result.methodNames
        .add(new ReflectiveAccessor(ast.name, isStaticallyNecessary: true));
    super.visitSafeMethodCall(ast);
  }

  visitSafePropertyRead(SafePropertyRead ast) {
    _result.getterNames.add(new ReflectiveAccessor(ast.name,
        isStaticallyNecessary: isStaticallyNecessary));
    super.visitSafePropertyRead(ast);
  }
}
