library angular2.transform.template_compiler.compile_step_factory;

import 'dart:async';
import 'package:angular2/src/change_detection/parser/parser.dart' as ng;
import 'package:angular2/src/render/api.dart';
import 'package:angular2/src/render/dom/compiler/compile_step.dart';
import 'package:angular2/src/render/dom/compiler/compile_step_factory.dart'
    as base;
import 'package:angular2/src/render/dom/compiler/directive_parser.dart';
import 'package:angular2/src/render/dom/compiler/property_binding_parser.dart';
import 'package:angular2/src/render/dom/compiler/text_interpolation_parser.dart';
import 'package:angular2/src/render/dom/compiler/view_splitter.dart';

class CompileStepFactory implements base.CompileStepFactory {
  final ng.Parser _parser;
  CompileStepFactory(this._parser);

  List<CompileStep> createSteps(
      ViewDefinition template, List<Future> subTaskPromises) {
    return [
      new ViewSplitter(_parser),
      new PropertyBindingParser(_parser),
      new DirectiveParser(_parser, template.directives),
      new TextInterpolationParser(_parser)
    ];
  }
}
