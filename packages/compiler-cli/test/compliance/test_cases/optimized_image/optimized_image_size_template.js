import * as i0 from "@angular/core";
import * as i1 from "path/to/my/file-with-size.jpg" with { loader: "image-file" };
export class MyApp {
}
MyApp.ɵfac = function MyApp_Factory(t) { return new (t || MyApp)(); };
MyApp.ɵcmp = /*@__PURE__*/ $r3$.ɵɵdefineComponent({
  …
  consts: [["ngLocalSrc",i1.default, "width", "100", "height", "200"]],
  template: function MyApp_Template(rf, ctx) {
    …
  },
  …
});
…
$r3$.ɵsetClassMetadata(MyApp, …);
