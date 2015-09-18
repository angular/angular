library playground.src.hello_world.multiple_style_urls_files;

import 'package:angular2/angular2.dart'
    show Component, Directive, View, NgElement;

@Component(selector: 'hello-app')
@View(
    template: r'''{{greeting}}''',
    styles: const [
      r'''.greeting { .color: blue; }''',
      r'''.hello { .color: red; }''',
    ])
class HelloCmp {}
