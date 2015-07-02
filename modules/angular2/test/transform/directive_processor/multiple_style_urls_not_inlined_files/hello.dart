library examples.src.hello_world.index_common_dart;

import 'package:angular2/angular2.dart'
    show bootstrap, Component, Directive, View, NgElement;

@Component(selector: 'hello-app')
@View(
    templateUrl: 'package:a/template.html',
    styleUrls: const ['package:a/template.css', 'package:a/template_other.css'])
class HelloCmp {}
