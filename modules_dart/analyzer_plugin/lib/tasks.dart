library angular2.src.analysis.analyzer_plugin.tasks;

import 'package:analyzer/src/generated/error.dart';
import 'package:analyzer/task/model.dart';

/// The analysis errors associated with a target.
/// The value combines errors represented by multiple other results.
final CompositeResultDescriptor<List<AnalysisError>> HTML_ERRORS =
    new CompositeResultDescriptor<List<AnalysisError>>('ANGULAR_HTML_ERRORS');
