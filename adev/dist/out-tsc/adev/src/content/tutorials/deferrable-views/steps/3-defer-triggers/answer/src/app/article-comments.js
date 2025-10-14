import {__esDecorate, __runInitializers} from 'tslib';
import {Component} from '@angular/core';
let ArticleComments = (() => {
  let _classDecorators = [
    Component({
      selector: 'article-comments',
      template: `
    <h2>Comments</h2>
    <p class="comment">
      Building for the web is fantastic!
    </p>
    <p class="comment">
      The new template syntax is great
    </p>
    <p class="comment">
      I agree with the other comments!
    </p>
  `,
      styles: [
        `
    .comment {
      padding: 15px;
      margin-left: 30px;
      background-color: paleturquoise;
      border-radius: 20px;
    }
  `,
      ],
    }),
  ];
  let _classDescriptor;
  let _classExtraInitializers = [];
  let _classThis;
  var ArticleComments = class {
    static {
      _classThis = this;
    }
    static {
      const _metadata =
        typeof Symbol === 'function' && Symbol.metadata ? Object.create(null) : void 0;
      __esDecorate(
        null,
        (_classDescriptor = {value: _classThis}),
        _classDecorators,
        {kind: 'class', name: _classThis.name, metadata: _metadata},
        null,
        _classExtraInitializers,
      );
      ArticleComments = _classThis = _classDescriptor.value;
      if (_metadata)
        Object.defineProperty(_classThis, Symbol.metadata, {
          enumerable: true,
          configurable: true,
          writable: true,
          value: _metadata,
        });
      __runInitializers(_classThis, _classExtraInitializers);
    }
  };
  return (ArticleComments = _classThis);
})();
export {ArticleComments};
//# sourceMappingURL=article-comments.js.map
