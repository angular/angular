import * as i0 from "@angular/core";
import * as i1 from "./path/to/my/file.jpg" with { loader: "image-file" };

export class MyApp {
}
MyApp.ɵfac = function MyApp_Factory(t) { return new (t || MyApp)(); };
MyApp.ɵcmp = /*@__PURE__*/ i0.ɵɵdefineComponent({
  …
  consts: [["ngLocalSrc", i1.default, "test", "baz", "fill", "", 1, "foobar"]],
  template: function MyApp_Template(rf, ctx) {
    …
  },
  …
});
…
$r3$.ɵsetClassMetadata(MyApp, …);
