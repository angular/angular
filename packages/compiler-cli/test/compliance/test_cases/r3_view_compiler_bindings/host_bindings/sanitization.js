import { Directive } from "@angular/core";
import * as i0 from "@angular/core";
export class HostBindingLinkDir {
  evil = "evil";
  static ɵfac = function HostBindingLinkDir_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || HostBindingLinkDir)();
  };
  static ɵdir = /*@__PURE__*/ i0.ɵɵdefineDirective({
    type: HostBindingLinkDir,
    selectors: [["a", "hostBindingLinkDir", ""]],
    hostVars: 3,
    hostBindings: function HostBindingLinkDir_HostBindings(rf, ctx) {
      if (rf & 2) {
        i0.ɵɵdomProperty("innerHTML", ctx.evil, i0.ɵɵsanitizeHtml)(
          "href",
          ctx.evil,
          i0.ɵɵsanitizeUrlOrResourceUrl
        );
        i0.ɵɵattribute("style", ctx.evil, i0.ɵɵsanitizeStyle);
      }
    }
  });
}
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) &&
    i0.ɵsetClassMetadata(
      HostBindingLinkDir,
      [
        {
          type: Directive,
          args: [
            {
              selector: "a[hostBindingLinkDir]",
              host: {
                "[innerHtml]": "evil",
                "[href]": "evil",
                "[attr.style]": "evil"
              }
            }
          ]
        }
      ],
      null,
      null
    );
})();
export class HostBindingImageDir {
  evil = "evil";
  nonEvil = "nonEvil";
  static ɵfac = function HostBindingImageDir_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || HostBindingImageDir)();
  };
  static ɵdir = /*@__PURE__*/ i0.ɵɵdefineDirective({
    type: HostBindingImageDir,
    selectors: [["img", "hostBindingImgDir", ""]],
    hostVars: 3,
    hostBindings: function HostBindingImageDir_HostBindings(rf, ctx) {
      if (rf & 2) {
        i0.ɵɵdomProperty("innerHTML", ctx.evil, i0.ɵɵsanitizeHtml)(
          "src",
          ctx.nonEvil,
          i0.ɵɵsanitizeUrlOrResourceUrl
        );
        i0.ɵɵattribute("style", ctx.evil, i0.ɵɵsanitizeStyle);
      }
    }
  });
}
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) &&
    i0.ɵsetClassMetadata(
      HostBindingImageDir,
      [
        {
          type: Directive,
          args: [
            {
              selector: "img[hostBindingImgDir]",
              host: {
                "[innerHtml]": "evil",
                "[attr.style]": "evil",
                "[src]": "nonEvil"
              }
            }
          ]
        }
      ],
      null,
      null
    );
})();
export class HostBindingIframeDir {
  evil = "evil";
  nonEvil = "nonEvil";
  static ɵfac = function HostBindingIframeDir_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || HostBindingIframeDir)();
  };
  static ɵdir = /*@__PURE__*/ i0.ɵɵdefineDirective({
    type: HostBindingIframeDir,
    selectors: [["iframe", "hostBindingIframeDir", ""]],
    hostVars: 5,
    hostBindings: function HostBindingIframeDir_HostBindings(rf, ctx) {
      if (rf & 2) {
        i0.ɵɵdomProperty("innerHTML", ctx.evil, i0.ɵɵsanitizeHtml)(
          "src",
          ctx.evil,
          i0.ɵɵsanitizeUrlOrResourceUrl
        )("sandbox", ctx.evil, i0.ɵɵvalidateAttribute);
        i0.ɵɵattribute("style", ctx.evil, i0.ɵɵsanitizeStyle)(
          "attributeName",
          ctx.nonEvil,
          i0.ɵɵvalidateAttribute
        );
      }
    }
  });
}
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) &&
    i0.ɵsetClassMetadata(
      HostBindingIframeDir,
      [
        {
          type: Directive,
          args: [
            {
              selector: "iframe[hostBindingIframeDir]",
              host: {
                "[innerHtml]": "evil",
                "[attr.style]": "evil",
                "[src]": "evil",
                "[sandbox]": "evil",
                "[attr.attributeName]": "nonEvil"
              }
            }
          ]
        }
      ],
      null,
      null
    );
})();
export class HostBindingSvgAnimateDir {
  evil = "evil";
  static ɵfac = function HostBindingSvgAnimateDir_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || HostBindingSvgAnimateDir)();
  };
  static ɵdir = /*@__PURE__*/ i0.ɵɵdefineDirective({
    type: HostBindingSvgAnimateDir,
    selectors: [["animateMotion", "hostBindingSvgAnimateDir", ""]],
    hostVars: 1,
    hostBindings: function HostBindingSvgAnimateDir_HostBindings(rf, ctx) {
      if (rf & 2) {
        i0.ɵɵattribute("attributeName", ctx.evil, i0.ɵɵvalidateAttribute);
      }
    }
  });
}
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) &&
    i0.ɵsetClassMetadata(
      HostBindingSvgAnimateDir,
      [
        {
          type: Directive,
          args: [
            {
              selector: "animateMotion[hostBindingSvgAnimateDir]",
              host: {
                "[attr.attributeName]": "evil"
              }
            }
          ]
        }
      ],
      null,
      null
    );
})();
export class HostBindingCustomSrcdocDir {
  evil = "evil";
  static ɵfac = function HostBindingCustomSrcdocDir_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || HostBindingCustomSrcdocDir)();
  };
  static ɵdir = /*@__PURE__*/ i0.ɵɵdefineDirective({
    type: HostBindingCustomSrcdocDir,
    selectors: [["safe-srcdoc-carrier"]],
    hostVars: 1,
    hostBindings: function HostBindingCustomSrcdocDir_HostBindings(rf, ctx) {
      if (rf & 2) {
        i0.ɵɵattribute("srcdoc", ctx.evil, i0.ɵɵsanitizeHtml);
      }
    }
  });
}
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) &&
    i0.ɵsetClassMetadata(
      HostBindingCustomSrcdocDir,
      [
        {
          type: Directive,
          args: [
            {
              selector: "safe-srcdoc-carrier",
              host: {
                "[attr.srcdoc]": "evil"
              }
            }
          ]
        }
      ],
      null,
      null
    );
})();
export class HostBindingCustomSrcDir {
  evil = "evil";
  static ɵfac = function HostBindingCustomSrcDir_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || HostBindingCustomSrcDir)();
  };
  static ɵdir = /*@__PURE__*/ i0.ɵɵdefineDirective({
    type: HostBindingCustomSrcDir,
    selectors: [["safe-src-carrier"]],
    hostVars: 1,
    hostBindings: function HostBindingCustomSrcDir_HostBindings(rf, ctx) {
      if (rf & 2) {
        i0.ɵɵattribute("src", ctx.evil, i0.ɵɵsanitizeUrlOrResourceUrl);
      }
    }
  });
}
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) &&
    i0.ɵsetClassMetadata(
      HostBindingCustomSrcDir,
      [
        {
          type: Directive,
          args: [
            {
              selector: "safe-src-carrier",
              host: {
                "[attr.src]": "evil"
              }
            }
          ]
        }
      ],
      null,
      null
    );
})();
export class HostBindingCustomDataDir {
  evil = "evil";
  static ɵfac = function HostBindingCustomDataDir_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || HostBindingCustomDataDir)();
  };
  static ɵdir = /*@__PURE__*/ i0.ɵɵdefineDirective({
    type: HostBindingCustomDataDir,
    selectors: [["safe-data-carrier"]],
    hostVars: 1,
    hostBindings: function HostBindingCustomDataDir_HostBindings(rf, ctx) {
      if (rf & 2) {
        i0.ɵɵattribute("data", ctx.evil, i0.ɵɵsanitizeUrlOrResourceUrl);
      }
    }
  });
}
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) &&
    i0.ɵsetClassMetadata(
      HostBindingCustomDataDir,
      [
        {
          type: Directive,
          args: [
            {
              selector: "safe-data-carrier",
              host: {
                "[attr.data]": "evil"
              }
            }
          ]
        }
      ],
      null,
      null
    );
})();
