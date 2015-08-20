library angular2.src.analysis.analyzer_plugin.src.tasks_test;

import 'package:analyzer/file_system/file_system.dart';
import 'package:analyzer/file_system/memory_file_system.dart';
import 'package:analyzer/src/context/cache.dart';
import 'package:analyzer/src/context/context.dart';
import 'package:analyzer/src/generated/engine.dart'
    show AnalysisOptionsImpl, TimestampedData, AnalysisEngine;
import 'package:analyzer/src/generated/sdk.dart';
import 'package:analyzer/src/generated/source.dart';
import 'package:analyzer/src/task/driver.dart';
import 'package:analyzer/task/dart.dart';
import 'package:analyzer/task/model.dart';
import 'package:angular2/src/core/render/api.dart';
import 'package:angular2_analyzer_plugin/src/tasks.dart';
import 'package:test_reflective_loader/test_reflective_loader.dart';
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
  AnalysisContextImpl context;
  Map<AnalysisTarget, CacheEntry> entryMap = <AnalysisTarget, CacheEntry>{};

  AnalysisDriver analysisDriver;

  AnalysisTask task;
  Map<ResultDescriptor<dynamic>, dynamic> outputs;

  CacheEntry getCacheEntry(AnalysisTarget target) {
    return entryMap.putIfAbsent(target, () => new CacheEntry(target));
  }

  void setUp() {
    emptySource = _newSource('/test.dart');
    AnalysisEngine.instance.useTaskModel = true;
    context = new AnalysisContextImpl();

    context.sourceFactory = new SourceFactory(<UriResolver>[
      new DartUriResolver(sdk),
      new ResourceUriResolver(resourceProvider)
    ]);

    analysisDriver = context.driver;
    analysisDriver.taskManager
        .addTaskDescriptor(BuildUnitDirectivesTask.DESCRIPTOR);
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
