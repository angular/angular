import {ListWrapper, MapWrapper} from 'angular2/src/core/facade/collection';

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
 * @Component({
 *   selector: 'tabs'
 * })
 * @View({
 *  template: `
 *    <ul>
 *      <li *ng-for="#pane of panes">{{pane.title}}</li>
 *    </ul>
 *    <content></content>
 *  `
 * })
 * class Tabs {
 *   panes: QueryList<Pane>
 *
 *   constructor(@Query(Pane) panes:QueryList<Pane>) {
 *     this.panes = panes;
 *   }
 * }
 *
 * @Component({
 *   selector: 'pane',
 *   properties: ['title']
 * })
 * @View(...)
 * class Pane {
 *   title:string;
 * }
 * ```
 */
export class QueryList<T> {
  protected _results: Array < T >= [];
  protected _callbacks: Array < () => void >= [];
  protected _dirty: boolean = false;

  reset(newList: T[]): void {
    this._results = newList;
    this._dirty = true;
  }

  add(obj: T): void {
    this._results.push(obj);
    this._dirty = true;
  }

  fireCallbacks(): void {
    if (this._dirty) {
      ListWrapper.forEach(this._callbacks, (c) => c());
      this._dirty = false;
    }
  }

  onChange(callback: () => void): void { this._callbacks.push(callback); }

  removeCallback(callback: () => void): void { ListWrapper.remove(this._callbacks, callback); }

  toString(): string { return this._results.toString(); }

  get length(): number { return this._results.length; }
  get first(): T { return ListWrapper.first(this._results); }
  get last(): T { return ListWrapper.last(this._results); }

  map<U>(fn: (item: T) => U): U[] { return this._results.map(fn); }

  [Symbol.iterator](): any { return this._results[Symbol.iterator](); }
}
