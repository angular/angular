library examples.src.hello_world.unusual_component_files;

import 'package:angular2/angular2.dart'
    show Component, Directive, View, NgElement;

@Component(
    selector: 'unusual-comp',
    exportAs: 'ComponentExportAsValue',
    changeDetection: ChangeDetectionStrategy.CheckAlways,
    properties: const ['aProperty'],
    host: const {'hostKey': 'hostValue'},
    events: const ['anEvent'])
@View(templateUrl: 'template.html')
class UnusualComp {}

@Directive(
    selector: 'unusual-directive',
    exportAs: 'DirectiveExportAsValue',
    properties: const ['aDirectiveProperty'],
    host: const {'directiveHostKey': 'directiveHostValue'},
    events: const ['aDirectiveEvent'])
class UnusualDirective {}
