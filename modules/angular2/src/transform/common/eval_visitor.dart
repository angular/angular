library angular2.transform.common.eval_visitor;

import 'package:analyzer/analyzer.dart';

/// Visitor responsible for evaluating constant values we encounter while in
/// the Transformer.
class EvalVisitor extends ConstantEvaluator {
  // Today this does nothing in addition to the Analyzer's
  // [ConstantEvaluator], but in the future this may incorporate
  // Angular-specific logic and abstract away differences in resolved vs.
  // unresolved AST processing.
}
