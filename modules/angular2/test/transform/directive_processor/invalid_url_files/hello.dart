library test.transform.directive_processor.invalid_url_files.hello;

import 'package:angular2/angular2.dart'
    show Component, Directive, BaseView, NgElement;

@Component(selector: 'hello-app')
@BaseView(
    templateUrl: '/bad/absolute/url.html',
    styleUrls: const ['package:invalid/package.css', 'bad_relative_url.css'])
class HelloCmp {}
