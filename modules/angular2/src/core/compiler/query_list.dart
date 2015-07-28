library angular2.src.core.compiler.query_list;

import 'dart:collection';

/**
 * An iterable and observable live list of components in the DOM.
 *
 * A QueryList contains a live list of child directives in the DOM of a directive.
 * The directives are kept in depth-first pre-order traversal of the DOM.
 *
 * The `QueryList` is iterable, therefore it can be used in both javascript code with `for..of` loop
 * as well as in template with `*ng-for="of"` directive.
 *
 * QueryList is updated as part of the change-detection cycle of a directive. Since change detection
 * happens after construction of a directive, QueryList will always be empty when observed in the
 * constructor.
 *
 *
 * NOTE: In the future this class will implement an `Observable` interface. For now it uses a plain
 * list of observable callbacks.
 *
 * # Example:
 *
 * Assume that `<tabs>` component would like to get a list its children which are `<pane>`
 * components as shown in this example:
 *
 * ```html
 * <tabs>
 *   <pane title="Overview">...</pane>
 *   <pane *ng-for="#o of objects" [title]="o.title">{{o.text}}</pane>
 * </tabs>
 * ```
 *
 * In the above example the list of `<tabs>` elements needs to get a list of `<pane>` elements so
 * that it could render tabs with the correct titles and in the correct order.
 *
 * A possible solution would be for a `<pane>` to inject `<tabs>` component and then register itself
 * with `<tabs>` component's on `hydrate` and deregister on `dehydrate` event. While a reasonable
 * approach, this would only work partialy since `*ng-for` could rearrange the list of `<pane>`
 * components which would not be reported to `<tabs>` component and thus the list of `<pane>`
 * components would be out of sync with respect to the list of `<pane>` elements.
 *
 * A preferred solution is to inject a `QueryList` which is a live list of directives in the
 * component`s light DOM.
 *
 * ```javascript
 * @Component(
 *   selector: 'tabs'
 * )
 * @View(
 *  template: `
 *    <ul>
 *      <li *ng-for="#pane of panes">{{pane.title}}</li>
 *    </ul>
 *    <content></content>
 *  `
 * )
 * class Tabs {
 *   QueryList<Pane> panes;
 *
 *   constructor(@Query(Pane) QueryList<Pane> this.panes) { }
 * }
 *
 * @Component(
 *   selector: 'pane',
 *   properties: ['title']
 * )
 * @View(...)
 * class Pane {
 *   String title;
 * }
 * ```
 */
class QueryList<T> extends Object
    with IterableMixin<T> {
  List<T> _results = [];
  List _callbacks = [];
  bool _dirty = false;

  Iterator<T> get iterator => _results.iterator;

  void reset(List<T> newList) {
    _results = newList;
    _dirty = true;
  }

  void add(T obj) {
    _results.add(obj);
    _dirty = true;
  }

  // TODO(rado): hook up with change detection after #995.
  void fireCallbacks() {
    if (_dirty) {
      _callbacks.forEach((c) => c());
      _dirty = false;
    }
  }

  void onChange(callback) {
    _callbacks.add(callback);
  }

  void removeCallback(callback) {
    _callbacks.remove(callback);
  }

  int get length => _results.length;
  T get first => _results.first;
  T get last => _results.last;
  String toString() {
    return _results.toString();
  }

  List map(fn(T)) {
    // Note: we need to return a list instead of iterable to match JS.
    return this._results.map(fn).toList();
  }
}
