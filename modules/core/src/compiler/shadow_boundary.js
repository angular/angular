import {StyleElement, Element, DOM, document} from 'facade/dom';
import {Set, SetWrapper, List, ListWrapper} from 'facade/collection';
import {isBlank, isPresent} from 'facade/lang';

/**
 * The root of the application has a ShadowBoundary attached.
 * When Shadow DOM is supported by browser (the polyfill is not used), all
 * the components using the native strategy have a ShadowBoundary on their
 * shadow root.
 *
 * [ShadowBoundary] is responsible for inserting style elements.
 */
export class ShadowBoundary {
  _insertedStyles: Set<StyleElement>;
  _root;
  _lastStyle: StyleElement;

  constructor(root) {
    this._root = root;
    this._insertedStyles = null;
    this._lastStyle = null;
  }

  insertStyles(styles: List<StyleElement>, prepend: boolean = false) {
    if (styles.length === 0) return;
    var newStyles = this._newStyles(styles);
    if (newStyles.length === 0) return;
    var clonedStyles = ListWrapper.map(styles, function(style) {
      return DOM.clone(style);
    });
    if (isBlank(this._lastStyle)) {
      this._insertFirstStyles(clonedStyles);
    } else {
      this._insertStyles(clonedStyles, prepend);
    }
    this._addInsertedStyles(newStyles);
  }

  _insertFirstStyles(styles: List<StyleElement>) {
    for (var i = styles.length - 1; i >= 0; i--) {
      this._insertFrontNode(styles[i]);
    }
    this._lastStyle = ListWrapper.last(styles);
  }

  _insertStyles(styles: List<StyleElement>, prepend: boolean) {
    if (prepend) {
      for (var i = styles.length - 1; i >= 0; i--) {
        this._insertFrontNode(styles[i]);
      }
    } else {
      for (var i = styles.length - 1; i >= 0; i--) {
        DOM.insertAfter(this._lastStyle, styles[i]);
      }
      this._lastStyle = ListWrapper.last(styles);
    }
  }

  // Insert the style element as the first child or _root
  _insertFrontNode(style: StyleElement) {
    var firstChild = DOM.firstChild(this._root);
    if (isPresent(firstChild)) {
      DOM.insertBefore(firstChild, style);
    } else {
      DOM.appendChild(this._root, style);
    }
  }

  // Filters out already inserted style elements
  _newStyles(styles: List<StyleElement>): List<StyleElement> {
    if (isBlank(this._insertedStyles)) {
      return styles;
    }
    return ListWrapper.filter(styles, (style) => {
      return !SetWrapper.has(this._insertedStyles, style);
    })
  }

  _addInsertedStyles(styles: List<StyleElement>) {
    if (isBlank(this._insertedStyles)) {
      this._insertedStyles = SetWrapper.create();
    }
    SetWrapper.addAll(this._insertedStyles , styles);
  }
}

export class DefaultShadowBoundary extends ShadowBoundary {
  constructor() {
    super(document.head);
  }
}
