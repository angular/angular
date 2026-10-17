import { Component } from "@angular/core";
import * as i0 from "@angular/core";
export class MyComponent {
  evil = "evil";
  nonEvil = "nonEvil";
  static ɵfac = function MyComponent_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || MyComponent)();
  };
  static ɵcmp = /*@__PURE__*/ i0.ɵɵdefineComponent({
    type: MyComponent,
    selectors: [["my-component"]],
    decls: 16,
    vars: 20,
    consts: [
      [3, "innerHtml"],
      [3, "href"],
      [3, "src"],
      [3, "sandbox"],
      [3, "innerHTMLChange", "innerHTML"],
      [3, "srcdocChange", "srcdoc"],
      [3, "srcChange", "src"],
      [3, "dataChange", "data"],
      [3, "hrefChange", "href"],
      [3, "sandboxChange", "sandbox"]
    ],
    template: function MyComponent_Template(rf, ctx) {
      if (rf & 1) {
        i0.ɵɵdomElement(0, "div", 0)(1, "link", 1)(2, "div")(3, "img", 2)(4, "iframe", 3)(
          5,
          "a",
          1
        )(6, "div");
        i0.ɵɵdomElementStart(7, "div", 4);
        i0.ɵɵtwoWayListener(
          "innerHTMLChange",
          function MyComponent_Template_div_innerHTMLChange_7_listener($event) {
            i0.ɵɵtwoWayBindingSet(ctx.evil, $event) || (ctx.evil = $event);
            return $event;
          }
        );
        i0.ɵɵdomElementEnd();
        i0.ɵɵdomElementStart(8, "div", 4);
        i0.ɵɵtwoWayListener(
          "innerHTMLChange",
          function MyComponent_Template_div_innerHTMLChange_8_listener($event) {
            i0.ɵɵtwoWayBindingSet(ctx.evil, $event) || (ctx.evil = $event);
            return $event;
          }
        );
        i0.ɵɵdomElementEnd();
        i0.ɵɵdomElementStart(9, "iframe", 5);
        i0.ɵɵtwoWayListener(
          "srcdocChange",
          function MyComponent_Template_iframe_srcdocChange_9_listener($event) {
            i0.ɵɵtwoWayBindingSet(ctx.evil, $event) || (ctx.evil = $event);
            return $event;
          }
        );
        i0.ɵɵdomElementEnd();
        i0.ɵɵdomElementStart(10, "iframe", 5);
        i0.ɵɵtwoWayListener(
          "srcdocChange",
          function MyComponent_Template_iframe_srcdocChange_10_listener($event) {
            i0.ɵɵtwoWayBindingSet(ctx.evil, $event) || (ctx.evil = $event);
            return $event;
          }
        );
        i0.ɵɵdomElementEnd();
        i0.ɵɵdomElementStart(11, "img", 6);
        i0.ɵɵtwoWayListener(
          "srcChange",
          function MyComponent_Template_img_srcChange_11_listener($event) {
            i0.ɵɵtwoWayBindingSet(ctx.evil, $event) || (ctx.evil = $event);
            return $event;
          }
        );
        i0.ɵɵdomElementEnd();
        i0.ɵɵdomElementStart(12, "iframe", 6);
        i0.ɵɵtwoWayListener(
          "srcChange",
          function MyComponent_Template_iframe_srcChange_12_listener($event) {
            i0.ɵɵtwoWayBindingSet(ctx.evil, $event) || (ctx.evil = $event);
            return $event;
          }
        );
        i0.ɵɵdomElementEnd();
        i0.ɵɵdomElementStart(13, "object", 7);
        i0.ɵɵtwoWayListener(
          "dataChange",
          function MyComponent_Template_object_dataChange_13_listener($event) {
            i0.ɵɵtwoWayBindingSet(ctx.evil, $event) || (ctx.evil = $event);
            return $event;
          }
        );
        i0.ɵɵdomElementEnd();
        i0.ɵɵdomElementStart(14, "link", 8);
        i0.ɵɵtwoWayListener(
          "hrefChange",
          function MyComponent_Template_link_hrefChange_14_listener($event) {
            i0.ɵɵtwoWayBindingSet(ctx.evil, $event) || (ctx.evil = $event);
            return $event;
          }
        );
        i0.ɵɵdomElementEnd();
        i0.ɵɵdomElementStart(15, "iframe", 9);
        i0.ɵɵtwoWayListener(
          "sandboxChange",
          function MyComponent_Template_iframe_sandboxChange_15_listener($event) {
            i0.ɵɵtwoWayBindingSet(ctx.evil, $event) || (ctx.evil = $event);
            return $event;
          }
        );
        i0.ɵɵdomElementEnd();
      }
      if (rf & 2) {
        i0.ɵɵdomProperty("innerHTML", ctx.evil, i0.ɵɵsanitizeHtml);
        i0.ɵɵadvance();
        i0.ɵɵdomProperty("href", ctx.evil, i0.ɵɵsanitizeResourceUrl);
        i0.ɵɵadvance();
        i0.ɵɵattribute("style", ctx.evil, i0.ɵɵsanitizeStyle);
        i0.ɵɵadvance();
        i0.ɵɵdomProperty("src", ctx.nonEvil);
        i0.ɵɵadvance();
        i0.ɵɵdomProperty("sandbox", ctx.evil, i0.ɵɵvalidateAttribute);
        i0.ɵɵadvance();
        i0.ɵɵdomProperty("href", i0.ɵɵinterpolate2("", ctx.evil, "", ctx.evil), i0.ɵɵsanitizeUrl);
        i0.ɵɵadvance();
        i0.ɵɵattribute("style", i0.ɵɵinterpolate2("", ctx.evil, "", ctx.evil), i0.ɵɵsanitizeStyle);
        i0.ɵɵadvance();
        i0.ɵɵtwoWayProperty("innerHTML", ctx.evil, i0.ɵɵsanitizeHtml);
        i0.ɵɵadvance();
        i0.ɵɵtwoWayProperty("innerHTML", ctx.evil, i0.ɵɵsanitizeHtml);
        i0.ɵɵadvance();
        i0.ɵɵtwoWayProperty("srcdoc", ctx.evil, i0.ɵɵsanitizeHtml);
        i0.ɵɵadvance();
        i0.ɵɵtwoWayProperty("srcdoc", ctx.evil, i0.ɵɵsanitizeHtml);
        i0.ɵɵadvance();
        i0.ɵɵtwoWayProperty("src", ctx.evil);
        i0.ɵɵadvance();
        i0.ɵɵtwoWayProperty("src", ctx.evil, i0.ɵɵsanitizeResourceUrl);
        i0.ɵɵadvance();
        i0.ɵɵtwoWayProperty("data", ctx.evil, i0.ɵɵsanitizeResourceUrl);
        i0.ɵɵadvance();
        i0.ɵɵtwoWayProperty("href", ctx.evil, i0.ɵɵsanitizeResourceUrl);
        i0.ɵɵadvance();
        i0.ɵɵtwoWayProperty("sandbox", ctx.evil, i0.ɵɵvalidateAttribute);
      }
    },
    encapsulation: 2
  });
}
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) &&
    i0.ɵsetClassMetadata(
      MyComponent,
      [
        {
          type: Component,
          args: [
            {
              selector: "my-component",
              template: `
    <div [innerHtml]="evil"></div>
    <link [href]="evil" />
    <div [attr.style]="evil"></div>
    <img [src]="nonEvil" />
    <iframe [sandbox]="evil"></iframe>
    <a href="{{evil}}{{evil}}"></a>
    <div attr.style="{{evil}}{{evil}}"></div>
    <div [(innerHTML)]="evil"></div>
    <div bindon-innerHTML="evil"></div>
    <iframe [(srcdoc)]="evil"></iframe>
    <iframe bindon-srcdoc="evil"></iframe>
    <img [(src)]="evil" />
    <iframe [(src)]="evil"></iframe>
    <object [(data)]="evil"></object>
    <link [(href)]="evil" />
    <iframe [(sandbox)]="evil"></iframe>
  `
            }
          ]
        }
      ],
      null,
      null
    );
})();
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) &&
    i0.ɵsetClassDebugInfo(MyComponent, {
      className: "MyComponent",
      filePath: "sanitization.ts",
      lineNumber: 24
    });
})();
