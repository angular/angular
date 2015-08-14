library angular2.src.analysis.analyzer_plugin.src.tasks_test;

import 'package:analyzer/file_system/file_system.dart';
import 'package:analyzer/file_system/memory_file_system.dart';
import 'package:analyzer/src/context/cache.dart';
import 'package:analyzer/src/generated/engine.dart'
    show AnalysisOptionsImpl, TimestampedData;
import 'package:analyzer/src/generated/resolver.dart';
import 'package:analyzer/src/generated/sdk.dart';
import 'package:analyzer/src/generated/source.dart';
import 'package:analyzer/src/task/dart.dart';
import 'package:analyzer/src/task/driver.dart';
import 'package:analyzer/src/task/general.dart';
import 'package:analyzer/src/task/manager.dart';
import 'package:analyzer/task/dart.dart';
import 'package:analyzer/task/model.dart';
import 'package:angular2/src/render/api.dart';
import 'package:angular2_analyzer_plugin/src/tasks.dart';
import 'package:test_reflective_loader/test_reflective_loader.dart';
import 'package:typed_mock/typed_mock.dart';
import 'package:unittest/unittest.dart';

import 'mock_sdk.dart';

main() {
  groupSep = ' | ';
  defineReflectiveTests(BuildUnitDirectivesTaskTest);
}

@reflectiveTest
class BuildUnitDirectivesTaskTest extends _AbstractDartTaskTest {
  MemoryResourceProvider resourceProvider = new MemoryResourceProvider();

  void test_Component() {
    _addAngularSources();
    Source source = _newSource('/test.dart', r'''
import '/angular2/metadata.dart';

@Component(selector: 'comp-a')
class ComponentA {
}

@Component(selector: 'comp-b')
class ComponentB {
}
''');
    LibrarySpecificUnit target = new LibrarySpecificUnit(source, source);
    _computeResult(target, DIRECTIVES);
    expect(task, new isInstanceOf<BuildUnitDirectivesTask>());
    // validate
    List<DirectiveMetadata> directives = outputs[DIRECTIVES];
    expect(directives, hasLength(2));
    expect(directives[0].selector, 'comp-a');
    expect(directives[1].selector, 'comp-b');
  }

  void test_Directive() {
    _addAngularSources();
    Source source = _newSource('/test.dart', r'''
import '/angular2/metadata.dart';

@Directive(selector: 'deco-a')
class ComponentA {
}

@Directive(selector: 'deco-b')
class ComponentB {
}
''');
    LibrarySpecificUnit target = new LibrarySpecificUnit(source, source);
    _computeResult(target, DIRECTIVES);
    expect(task, new isInstanceOf<BuildUnitDirectivesTask>());
    // validate
    List<DirectiveMetadata> directives = outputs[DIRECTIVES];
    expect(directives, hasLength(2));
    expect(directives[0].selector, 'deco-a');
    expect(directives[1].selector, 'deco-b');
  }

  void _addAngularSources() {
    _newSource('/angular2/metadata.dart', r'''
library angular2.src.core.metadata;

abstract class Directive {
  final String selector;
  final dynamic properties;
  final dynamic hostListeners;
  final List lifecycle;
  const Directive({selector, properties, hostListeners, lifecycle})
  : selector = selector,
    properties = properties,
    hostListeners = hostListeners,
    lifecycle = lifecycle,
    super();
}

class Component extends Directive {
  final String changeDetection;
  final List injectables;
  const Component({selector, properties, events, hostListeners,
      injectables, lifecycle, changeDetection: 'DEFAULT'})
      : changeDetection = changeDetection,
        injectables = injectables,
        super(
            selector: selector,
            properties: properties,
            events: events,
            hostListeners: hostListeners,
            lifecycle: lifecycle);
}

''');
  }
}

class _AbstractDartTaskTest {
  MemoryResourceProvider resourceProvider = new MemoryResourceProvider();
  Source emptySource;

  DartSdk sdk = new MockSdk();
  _MockContext context = new _MockContext();
  Map<AnalysisTarget, CacheEntry> entryMap = <AnalysisTarget, CacheEntry>{};

  TaskManager taskManager = new TaskManager();
  AnalysisDriver analysisDriver;

  AnalysisTask task;
  Map<ResultDescriptor<dynamic>, dynamic> outputs;

  CacheEntry getCacheEntry(AnalysisTarget target) {
    return entryMap.putIfAbsent(target, () => new CacheEntry());
  }

  void setUp() {
    emptySource = _newSource('/test.dart');
    // prepare AnalysisContext
    context.sourceFactory = new SourceFactory(<UriResolver>[
      new DartUriResolver(sdk),
      new ResourceUriResolver(resourceProvider)
    ]);
    // prepare TaskManager
    taskManager.addTaskDescriptor(GetContentTask.DESCRIPTOR);
    // TODO(scheglov) extract into API
    taskManager.addTaskDescriptor(ScanDartTask.DESCRIPTOR);
    taskManager.addTaskDescriptor(ParseDartTask.DESCRIPTOR);
    taskManager.addTaskDescriptor(BuildClassConstructorsTask.DESCRIPTOR);
    taskManager.addTaskDescriptor(BuildCompilationUnitElementTask.DESCRIPTOR);
    taskManager.addTaskDescriptor(BuildLibraryConstructorsTask.DESCRIPTOR);
    taskManager.addTaskDescriptor(BuildLibraryElementTask.DESCRIPTOR);
    taskManager.addTaskDescriptor(BuildPublicNamespaceTask.DESCRIPTOR);
    taskManager.addTaskDescriptor(BuildDirectiveElementsTask.DESCRIPTOR);
    taskManager.addTaskDescriptor(BuildSourceClosuresTask.DESCRIPTOR);
    taskManager.addTaskDescriptor(BuildExportNamespaceTask.DESCRIPTOR);
    taskManager.addTaskDescriptor(BuildEnumMemberElementsTask.DESCRIPTOR);
    taskManager.addTaskDescriptor(BuildFunctionTypeAliasesTask.DESCRIPTOR);
    taskManager.addTaskDescriptor(BuildTypeProviderTask.DESCRIPTOR);
    taskManager.addTaskDescriptor(GatherUsedImportedElementsTask.DESCRIPTOR);
    taskManager.addTaskDescriptor(GatherUsedLocalElementsTask.DESCRIPTOR);
    taskManager.addTaskDescriptor(GenerateHintsTask.DESCRIPTOR);
    taskManager.addTaskDescriptor(ResolveUnitTypeNamesTask.DESCRIPTOR);
    taskManager.addTaskDescriptor(ResolveLibraryTypeNamesTask.DESCRIPTOR);
    taskManager.addTaskDescriptor(ResolveReferencesTask.DESCRIPTOR);
    taskManager.addTaskDescriptor(ResolveVariableReferencesTask.DESCRIPTOR);
    taskManager.addTaskDescriptor(VerifyUnitTask.DESCRIPTOR);
    // Angular specific tasks
    taskManager.addTaskDescriptor(BuildUnitDirectivesTask.DESCRIPTOR);
    // prepare AnalysisDriver
    analysisDriver = new AnalysisDriver(taskManager, context);
  }

  void _computeResult(AnalysisTarget target, ResultDescriptor result) {
    task = analysisDriver.computeResult(target, result);
    expect(task.caughtException, isNull);
    outputs = task.outputs;
  }

  Source _newSource(String path, [String content = '']) {
    File file = resourceProvider.newFile(path, content);
    return file.createSource();
  }
}

class _MockContext extends TypedMock implements ExtendedAnalysisContext {
  AnalysisOptionsImpl analysisOptions = new AnalysisOptionsImpl();
  SourceFactory sourceFactory;
  TypeProvider typeProvider;

  Map<AnalysisTarget, CacheEntry> entryMap = <AnalysisTarget, CacheEntry>{};

  String get name => '_MockContext';

  bool exists(Source source) => source.exists();

  @override
  CacheEntry getCacheEntry(AnalysisTarget target) {
    return entryMap.putIfAbsent(target, () => new CacheEntry());
  }

  TimestampedData<String> getContents(Source source) => source.contents;

  noSuchMethod(Invocation invocation) {
    print('noSuchMethod: ${invocation.memberName}');
    return super.noSuchMethod(invocation);
  }
}
