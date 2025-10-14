import {__esDecorate, __runInitializers} from 'tslib';
// #docplaster
// #docregion
import {Component, inject} from '@angular/core';
import {DomSanitizer} from '@angular/platform-browser';
let BypassSecurityComponent = (() => {
  let _classDecorators = [
    Component({
      selector: 'app-bypass-security',
      templateUrl: './bypass-security.component.html',
    }),
  ];
  let _classDescriptor;
  let _classExtraInitializers = [];
  let _classThis;
  var BypassSecurityComponent = class {
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
      BypassSecurityComponent = _classThis = _classDescriptor.value;
      if (_metadata)
        Object.defineProperty(_classThis, Symbol.metadata, {
          enumerable: true,
          configurable: true,
          writable: true,
          value: _metadata,
        });
      __runInitializers(_classThis, _classExtraInitializers);
    }
    dangerousUrl;
    trustedUrl;
    dangerousVideoUrl;
    videoUrl;
    // #docregion trust-url
    sanitizer = inject(DomSanitizer);
    constructor() {
      // javascript: URLs are dangerous if attacker controlled.
      // Angular sanitizes them in data binding, but you can
      // explicitly tell Angular to trust this value:
      this.dangerousUrl = 'javascript:alert("Hi there")';
      this.trustedUrl = this.sanitizer.bypassSecurityTrustUrl(this.dangerousUrl);
      // #enddocregion trust-url
      this.updateVideoUrl('PUBnlbjZFAI');
    }
    // #docregion trust-video-url
    updateVideoUrl(id) {
      // Appending an ID to a YouTube URL is safe.
      // Always make sure to construct SafeValue objects as
      // close as possible to the input data so
      // that it's easier to check if the value is safe.
      this.dangerousVideoUrl = 'https://www.youtube.com/embed/' + id;
      this.videoUrl = this.sanitizer.bypassSecurityTrustResourceUrl(this.dangerousVideoUrl);
    }
  };
  return (BypassSecurityComponent = _classThis);
})();
export {BypassSecurityComponent};
//# sourceMappingURL=bypass-security.component.js.map
