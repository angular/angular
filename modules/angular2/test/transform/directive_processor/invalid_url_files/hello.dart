library test.transform.directive_processor.url_expression_files.hello;

import 'package:angular2/angular2.dart'
show bootstrap, Component, Directive, View, NgElement;

@Component(selector: 'hello-app')
@View(
    templateUrl: '/bad/absolute/url.html',
    styleUrls: const [
      'package:invalid/package.css',
      'bad_relative_url.css'
    ])
class HelloCmp {}
