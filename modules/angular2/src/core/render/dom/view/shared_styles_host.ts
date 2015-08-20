import {DOM} from 'angular2/src/core/dom/dom_adapter';
import {Inject, Injectable} from 'angular2/di';
import {SetWrapper} from 'angular2/src/core/facade/collection';
import {DOCUMENT} from '../dom_tokens';

@Injectable()
export class SharedStylesHost {
  protected _styles: string[] = [];
  protected _stylesSet: Set<string> = new Set();

  constructor() {}

  addStyles(styles: string[]) {
    var additions = [];
    styles.forEach(style => {
      if (!SetWrapper.has(this._stylesSet, style)) {
        this._stylesSet.add(style);
        this._styles.push(style);
        additions.push(style);
      }
    });
    this.onStylesAdded(additions);
  }

  protected onStylesAdded(additions: string[]) {}

  getAllStyles(): string[] { return this._styles; }
}

@Injectable()
export class DomSharedStylesHost extends SharedStylesHost {
  private _hostNodes: Set<Node> = new Set();
  constructor(@Inject(DOCUMENT) doc: any) {
    super();
    this._hostNodes.add(doc.head);
  }
  _addStylesToHost(styles: string[], host: Node) {
    for (var i = 0; i < styles.length; i++) {
      var style = styles[i];
      DOM.appendChild(host, DOM.createStyleElement(style));
    }
  }
  addHost(hostNode: Node) {
    this._addStylesToHost(this._styles, hostNode);
    this._hostNodes.add(hostNode);
  }
  removeHost(hostNode: Node) { SetWrapper.delete(this._hostNodes, hostNode); }

  onStylesAdded(additions: string[]) {
    this._hostNodes.forEach((hostNode) => { this._addStylesToHost(additions, hostNode); });
  }
}
