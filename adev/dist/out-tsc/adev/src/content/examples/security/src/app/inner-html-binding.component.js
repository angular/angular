import {__esDecorate, __runInitializers} from 'tslib';
// #docregion
import {Component} from '@angular/core';
let InnerHtmlBindingComponent = (() => {
  let _classDecorators = [
    Component({
      selector: 'app-inner-html-binding',
      templateUrl: './inner-html-binding.component.html',
    }),
  ];
  let _classDescriptor;
  let _classExtraInitializers = [];
  let _classThis;
  var InnerHtmlBindingComponent = class {
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
      InnerHtmlBindingComponent = _classThis = _classDescriptor.value;
      if (_metadata)
        Object.defineProperty(_classThis, Symbol.metadata, {
          enumerable: true,
          configurable: true,
          writable: true,
          value: _metadata,
        });
      __runInitializers(_classThis, _classExtraInitializers);
    }
    // For example, a user/attacker-controlled value from a URL.
    htmlSnippet = 'Template <script>alert("0wned")</script> <b>Syntax</b>';
  };
  return (InnerHtmlBindingComponent = _classThis);
})();
export {InnerHtmlBindingComponent};
//# sourceMappingURL=inner-html-binding.component.js.map
