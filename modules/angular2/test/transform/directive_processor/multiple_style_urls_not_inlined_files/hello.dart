library examples.src.hello_world.multiple_style_urls_not_inlined_files;

import 'package:angular2/angular2.dart'
    show Component, Directive, View, NgElement;

@Component(selector: 'hello-app')
@View(
    templateUrl: 'package:a/template.html',
    styleUrls: const ['package:a/template.css', 'package:a/template_other.css'])
class HelloCmp {}
