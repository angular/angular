library examples.src.hello_world.url_expression_files;

import 'package:angular2/angular2.dart'
    show Component, Directive, BaseView, NgElement;

@Component(selector: 'hello-app')
@BaseView(templateUrl: 'template.html')
class HelloCmp {}
