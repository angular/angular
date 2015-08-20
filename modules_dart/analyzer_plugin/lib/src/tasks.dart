library angular2.src.analysis.analyzer_plugin.src.tasks;

import 'package:analyzer/src/generated/ast.dart' hide Directive;
import 'package:analyzer/src/generated/engine.dart';
import 'package:analyzer/src/task/general.dart';
import 'package:analyzer/task/dart.dart';
import 'package:analyzer/task/model.dart';
import 'package:angular2/src/core/render/api.dart';
import 'package:angular2/src/transform/common/directive_metadata_reader.dart';


/// The [RenderDirectiveMetadata]s of a [LibrarySpecificUnit].
final ListResultDescriptor<RenderDirectiveMetadata> DIRECTIVES =
    new ListResultDescriptor<RenderDirectiveMetadata>('ANGULAR2_DIRECTIVES', null);

/// A task that builds [RenderDirectiveMetadata]s for directive classes.
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

    List<RenderDirectiveMetadata> metaList = <RenderDirectiveMetadata>[];
    for (CompilationUnitMember unitMember in unit.declarations) {
      if (unitMember is ClassDeclaration) {
        RenderDirectiveMetadata meta = readDirectiveMetadata(unitMember.metadata);
        if (meta != null) {
          metaList.add(meta);
        }
      }
    }
    outputs[DIRECTIVES] = metaList;
  }

  static Map<String, TaskInput> buildInputs(AnalysisTarget target) {
    return <String, TaskInput>{UNIT_INPUT: RESOLVED_UNIT.of(target)};
  }

  static BuildUnitDirectivesTask createTask(
      AnalysisContext context, AnalysisTarget target) {
    return new BuildUnitDirectivesTask(context, target);
  }
}
