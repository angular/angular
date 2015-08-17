library examples.src.hello_world.multiple_style_urls_files;

import 'package:angular2/angular2.dart'
    show Component, Directive, BaseView, NgElement;

@Component(selector: 'hello-app')
@BaseView(
    templateUrl: 'template.html',
    styleUrls: const ['template.css', 'template_other.css'])
class HelloCmp {}
