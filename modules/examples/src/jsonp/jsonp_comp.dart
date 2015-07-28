library examples.src.jsonp.jsonp_comp;

import "package:angular2/angular2.dart" show Component, View, NgFor;
import "package:http/http.dart" show Jsonp;
import "package:angular2/src/facade/async.dart" show ObservableWrapper;

@Component(selector: "jsonp-app")
@View(
    directives: const [NgFor],
    template: '''
    <h1>people</h1>
    <ul class="people">
      <li *ng-for="#person of people">
        hello, {{person[\'name\']}}
      </li>
    </ul>
  ''')
class JsonpCmp {
  Object people;
  JsonpCmp(Jsonp jsonp) {
    ObservableWrapper.subscribe(
        jsonp.get("./people.json?callback=JSONP_CALLBACK"),
        (res) => this.people = res.json().toList());
  }
}
