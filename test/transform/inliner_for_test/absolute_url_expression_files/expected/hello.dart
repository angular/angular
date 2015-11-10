library playground.src.hello_world.absolute_url_expression_files;

import 'package:angular2/angular2.dart'
    show Component, Directive, View, NgElement;

@Component(selector: 'hello-app')
@View(
    template: r'''{{greeting}}''',
    styles: const [r'''.greeting { .color: blue; }''',])
class HelloCmp {}

@Injectable() hello() {}
