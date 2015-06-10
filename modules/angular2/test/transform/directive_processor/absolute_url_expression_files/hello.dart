library examples.src.hello_world.index_common_dart;

import 'package:angular2/angular2.dart'
    show bootstrap, Component, Directive, View, NgElement;

@Component(selector: 'hello-app')
@View(templateUrl: 'package:other_package/template.html')
class HelloCmp {}
