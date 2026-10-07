# /out/sanitization.ngtypecheck.ts
```ts
/**
 * TCB for /sanitization.ts
 * @generated
 */

import * as i0 from './sanitization';

/*tcb1*/
function _tcb1(this: i0.HostBindingLinkDir) {
  if (true) {
  }
  if (true /*hostBindingsBlockGuard*/) {
    this.evil /*122,126*/ /*122,126*/;
    this.evil /*144,148*/ /*144,148*/;
    this.evil /*172,176*/ /*172,176*/;
  }
}

/*tcb2*/
function _tcb2(this: i0.HostBindingImageDir) {
  if (true) {
  }
  if (true /*hostBindingsBlockGuard*/) {
    this.evil /*322,326*/ /*322,326*/;
    this.evil /*350,354*/ /*350,354*/;
    this.nonEvil /*371,378*/ /*371,378*/;
  }
}

/*tcb3*/
function _tcb3(this: i0.HostBindingIframeDir) {
  if (true) {
  }
  if (true /*hostBindingsBlockGuard*/) {
    this.evil /*554,558*/ /*554,558*/;
    this.evil /*582,586*/ /*582,586*/;
    this.evil /*603,607*/ /*603,607*/;
    this.evil /*628,632*/ /*628,632*/;
    this.nonEvil /*664,671*/ /*664,671*/;
  }
}

/*tcb4*/
function _tcb4(this: i0.HostBindingSvgAnimateDir) {
  if (true) {
  }
  if (true /*hostBindingsBlockGuard*/) {
    this.evil /*868,872*/ /*868,872*/;
  }
}

/*tcb5*/
function _tcb5(this: i0.HostBindingCustomSrcdocDir) {
  if (true) {
  }
  if (true /*hostBindingsBlockGuard*/) {
    this.evil /*1023,1027*/ /*1023,1027*/;
  }
}

/*tcb6*/
function _tcb6(this: i0.HostBindingCustomSrcDir) {
  if (true) {
  }
  if (true /*hostBindingsBlockGuard*/) {
    this.evil /*1174,1178*/ /*1174,1178*/;
  }
}

/*tcb7*/
function _tcb7(this: i0.HostBindingCustomDataDir) {
  if (true) {
  }
  if (true /*hostBindingsBlockGuard*/) {
    this.evil /*1324,1328*/ /*1324,1328*/;
  }
}

```

# /out/sanitization.ts
```ts
import { Directive } from '@angular/core';
// @ts-ignore
import * as i0 from '@angular/core';

export class HostBindingLinkDir {
  evil = 'evil';
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<HostBindingLinkDir, never> =
    function HostBindingLinkDir_Factory(__ngFactoryType__: any): any {
      return new (__ngFactoryType__ || HostBindingLinkDir)();
    };
  // @ts-ignore
  static ɵdir: i0.ɵɵDirectiveDeclaration<
    HostBindingLinkDir,
    'a[hostBindingLinkDir]',
    never,
    {},
    {},
    never,
    never,
    true,
    never
  > = /*@__PURE__*/ i0.ɵɵdefineDirective({
    type: HostBindingLinkDir,
    selectors: [['a', 'hostBindingLinkDir', '']],
    hostVars: 3,
    hostBindings: function HostBindingLinkDir_HostBindings(rf: number, ctx: any): any {
      if (rf & 2) {
        i0.ɵɵdomProperty('innerHTML', ctx.evil, i0.ɵɵsanitizeHtml)(
          'href',
          ctx.evil,
          i0.ɵɵsanitizeUrlOrResourceUrl,
        );
        i0.ɵɵattribute('style', ctx.evil, i0.ɵɵsanitizeStyle);
      }
    },
  });
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(
        HostBindingLinkDir,
        [
          {
            type: Directive,
            args: [
              {
                selector: 'a[hostBindingLinkDir]',
                host: {
                  '[innerHtml]': 'evil',
                  '[href]': 'evil',
                  '[attr.style]': 'evil',
                },
              },
            ],
          },
        ],
        null,
        null,
      );
  }
}

export class HostBindingImageDir {
  evil = 'evil';
  nonEvil = 'nonEvil';
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<HostBindingImageDir, never> =
    function HostBindingImageDir_Factory(__ngFactoryType__: any): any {
      return new (__ngFactoryType__ || HostBindingImageDir)();
    };
  // @ts-ignore
  static ɵdir: i0.ɵɵDirectiveDeclaration<
    HostBindingImageDir,
    'img[hostBindingImgDir]',
    never,
    {},
    {},
    never,
    never,
    true,
    never
  > = /*@__PURE__*/ i0.ɵɵdefineDirective({
    type: HostBindingImageDir,
    selectors: [['img', 'hostBindingImgDir', '']],
    hostVars: 3,
    hostBindings: function HostBindingImageDir_HostBindings(rf: number, ctx: any): any {
      if (rf & 2) {
        i0.ɵɵdomProperty('innerHTML', ctx.evil, i0.ɵɵsanitizeHtml)(
          'src',
          ctx.nonEvil,
          i0.ɵɵsanitizeUrlOrResourceUrl,
        );
        i0.ɵɵattribute('style', ctx.evil, i0.ɵɵsanitizeStyle);
      }
    },
  });
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(
        HostBindingImageDir,
        [
          {
            type: Directive,
            args: [
              {
                selector: 'img[hostBindingImgDir]',
                host: {
                  '[innerHtml]': 'evil',
                  '[attr.style]': 'evil',
                  '[src]': 'nonEvil',
                },
              },
            ],
          },
        ],
        null,
        null,
      );
  }
}

export class HostBindingIframeDir {
  evil = 'evil';
  nonEvil = 'nonEvil';
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<HostBindingIframeDir, never> =
    function HostBindingIframeDir_Factory(__ngFactoryType__: any): any {
      return new (__ngFactoryType__ || HostBindingIframeDir)();
    };
  // @ts-ignore
  static ɵdir: i0.ɵɵDirectiveDeclaration<
    HostBindingIframeDir,
    'iframe[hostBindingIframeDir]',
    never,
    {},
    {},
    never,
    never,
    true,
    never
  > = /*@__PURE__*/ i0.ɵɵdefineDirective({
    type: HostBindingIframeDir,
    selectors: [['iframe', 'hostBindingIframeDir', '']],
    hostVars: 5,
    hostBindings: function HostBindingIframeDir_HostBindings(rf: number, ctx: any): any {
      if (rf & 2) {
        i0.ɵɵdomProperty('innerHTML', ctx.evil, i0.ɵɵsanitizeHtml)(
          'src',
          ctx.evil,
          i0.ɵɵsanitizeUrlOrResourceUrl,
        )('sandbox', ctx.evil, i0.ɵɵvalidateAttribute);
        i0.ɵɵattribute('style', ctx.evil, i0.ɵɵsanitizeStyle)(
          'attributeName',
          ctx.nonEvil,
          i0.ɵɵvalidateAttribute,
        );
      }
    },
  });
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(
        HostBindingIframeDir,
        [
          {
            type: Directive,
            args: [
              {
                selector: 'iframe[hostBindingIframeDir]',
                host: {
                  '[innerHtml]': 'evil',
                  '[attr.style]': 'evil',
                  '[src]': 'evil',
                  '[sandbox]': 'evil',
                  '[attr.attributeName]': 'nonEvil',
                },
              },
            ],
          },
        ],
        null,
        null,
      );
  }
}

export class HostBindingSvgAnimateDir {
  evil = 'evil';
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<HostBindingSvgAnimateDir, never> =
    function HostBindingSvgAnimateDir_Factory(__ngFactoryType__: any): any {
      return new (__ngFactoryType__ || HostBindingSvgAnimateDir)();
    };
  // @ts-ignore
  static ɵdir: i0.ɵɵDirectiveDeclaration<
    HostBindingSvgAnimateDir,
    'animateMotion[hostBindingSvgAnimateDir]',
    never,
    {},
    {},
    never,
    never,
    true,
    never
  > = /*@__PURE__*/ i0.ɵɵdefineDirective({
    type: HostBindingSvgAnimateDir,
    selectors: [['animateMotion', 'hostBindingSvgAnimateDir', '']],
    hostVars: 1,
    hostBindings: function HostBindingSvgAnimateDir_HostBindings(rf: number, ctx: any): any {
      if (rf & 2) {
        i0.ɵɵattribute('attributeName', ctx.evil, i0.ɵɵvalidateAttribute);
      }
    },
  });
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(
        HostBindingSvgAnimateDir,
        [
          {
            type: Directive,
            args: [
              {
                selector: 'animateMotion[hostBindingSvgAnimateDir]',
                host: {
                  '[attr.attributeName]': 'evil',
                },
              },
            ],
          },
        ],
        null,
        null,
      );
  }
}

export class HostBindingCustomSrcdocDir {
  evil = 'evil';
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<HostBindingCustomSrcdocDir, never> =
    function HostBindingCustomSrcdocDir_Factory(__ngFactoryType__: any): any {
      return new (__ngFactoryType__ || HostBindingCustomSrcdocDir)();
    };
  // @ts-ignore
  static ɵdir: i0.ɵɵDirectiveDeclaration<
    HostBindingCustomSrcdocDir,
    'safe-srcdoc-carrier',
    never,
    {},
    {},
    never,
    never,
    true,
    never
  > = /*@__PURE__*/ i0.ɵɵdefineDirective({
    type: HostBindingCustomSrcdocDir,
    selectors: [['safe-srcdoc-carrier']],
    hostVars: 1,
    hostBindings: function HostBindingCustomSrcdocDir_HostBindings(rf: number, ctx: any): any {
      if (rf & 2) {
        i0.ɵɵattribute('srcdoc', ctx.evil, i0.ɵɵsanitizeHtml);
      }
    },
  });
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(
        HostBindingCustomSrcdocDir,
        [
          {
            type: Directive,
            args: [
              {
                selector: 'safe-srcdoc-carrier',
                host: {
                  '[attr.srcdoc]': 'evil',
                },
              },
            ],
          },
        ],
        null,
        null,
      );
  }
}

export class HostBindingCustomSrcDir {
  evil = 'evil';
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<HostBindingCustomSrcDir, never> =
    function HostBindingCustomSrcDir_Factory(__ngFactoryType__: any): any {
      return new (__ngFactoryType__ || HostBindingCustomSrcDir)();
    };
  // @ts-ignore
  static ɵdir: i0.ɵɵDirectiveDeclaration<
    HostBindingCustomSrcDir,
    'safe-src-carrier',
    never,
    {},
    {},
    never,
    never,
    true,
    never
  > = /*@__PURE__*/ i0.ɵɵdefineDirective({
    type: HostBindingCustomSrcDir,
    selectors: [['safe-src-carrier']],
    hostVars: 1,
    hostBindings: function HostBindingCustomSrcDir_HostBindings(rf: number, ctx: any): any {
      if (rf & 2) {
        i0.ɵɵattribute('src', ctx.evil, i0.ɵɵsanitizeUrlOrResourceUrl);
      }
    },
  });
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(
        HostBindingCustomSrcDir,
        [
          {
            type: Directive,
            args: [
              {
                selector: 'safe-src-carrier',
                host: {
                  '[attr.src]': 'evil',
                },
              },
            ],
          },
        ],
        null,
        null,
      );
  }
}

export class HostBindingCustomDataDir {
  evil = 'evil';
  // @ts-ignore
  static ɵfac: i0.ɵɵFactoryDeclaration<HostBindingCustomDataDir, never> =
    function HostBindingCustomDataDir_Factory(__ngFactoryType__: any): any {
      return new (__ngFactoryType__ || HostBindingCustomDataDir)();
    };
  // @ts-ignore
  static ɵdir: i0.ɵɵDirectiveDeclaration<
    HostBindingCustomDataDir,
    'safe-data-carrier',
    never,
    {},
    {},
    never,
    never,
    true,
    never
  > = /*@__PURE__*/ i0.ɵɵdefineDirective({
    type: HostBindingCustomDataDir,
    selectors: [['safe-data-carrier']],
    hostVars: 1,
    hostBindings: function HostBindingCustomDataDir_HostBindings(rf: number, ctx: any): any {
      if (rf & 2) {
        i0.ɵɵattribute('data', ctx.evil, i0.ɵɵsanitizeUrlOrResourceUrl);
      }
    },
  });
  static {
    (typeof ngDevMode === 'undefined' || ngDevMode) &&
      i0.ɵsetClassMetadata(
        HostBindingCustomDataDir,
        [
          {
            type: Directive,
            args: [
              {
                selector: 'safe-data-carrier',
                host: {
                  '[attr.data]': 'evil',
                },
              },
            ],
          },
        ],
        null,
        null,
      );
  }
}

```