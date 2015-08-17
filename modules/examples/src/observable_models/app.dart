library benchmarks.src.naive_infinite_scroll.app;

import "package:angular2/src/facade/collection.dart" show List, ListWrapper;
import "package:angular2/directives.dart" show NgIf, NgFor;
import "scroll_area.dart" show ScrollAreaComponent;
import "package:angular2/angular2.dart" show Component, Directive, View, IterableDiffers, SkipSelf, Binding;
import "package:angular2/src/directives/observable_list_diff.dart" show ObservableListDiffFactory;
import 'package:observe/observe.dart' show ObservableList;

createDiffers(IterableDiffers parent) {
  return IterableDiffers.create([const ObservableListDiffFactory()], parent);
}

const binding = const Binding(IterableDiffers,
  toFactory: createDiffers, deps: const [ const[IterableDiffers, const SkipSelf()]]);

@Component(
  selector: "scroll-app",
  bindings: const [binding]
)
@View(directives: const [ScrollAreaComponent, NgIf, NgFor], template: '''
  <div>
    <div style="display: flex">
      <scroll-area id="testArea"></scroll-area>
    </div>
    <div template="ng-if scrollAreas.length > 0">
      <p>Following tables are only here to add weight to the UI:</p>
      <scroll-area template="ng-for #scrollArea of scrollAreas"></scroll-area>
    </div>
  </div>''')
class App {
  List<int> scrollAreas;
  App() {
    var scrollAreas = [];
    for (var i = 0; i < 300; i++) {
      scrollAreas.add(i);
    }
    this.scrollAreas = new ObservableList.from(scrollAreas);
  }
}
