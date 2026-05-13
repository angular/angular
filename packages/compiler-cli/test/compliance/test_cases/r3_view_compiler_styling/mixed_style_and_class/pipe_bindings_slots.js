template: function MyComponent_Template(rf, $ctx$) {
  if (rf & 1) {
    $r3$.ɵɵelementStart(0, "div");
    $r3$.ɵɵpipe(1, "pipe");
    $r3$.ɵɵpipe(2, "pipe");
    $r3$.ɵɵpipe(3, "pipe");
    $r3$.ɵɵpipe(4, "pipe");
    $r3$.ɵɵtext(5);
    $r3$.ɵɵelementEnd();
  }
  if (rf & 2) {
    $r3$.ɵɵstyleMap($r3$.ɵɵpipeBind2(1, 11, $ctx$.myStyleExp, 1000));
    $r3$.ɵɵclassMap($r3$.ɵɵcloneObject(23, _c0));
    $r3$.ɵɵstyleProp("bar", $r3$.ɵɵpipeBind2(2, 14, $ctx$.barExp, 3000))("baz", $r3$.ɵɵpipeBind2(3, 17, $ctx$.bazExp, 4000));
    $r3$.ɵɵclassProp("foo", $r3$.ɵɵpipeBind2(4, 20, $ctx$.fooExp, 2000));
    $r3$.ɵɵadvance(5);
   $r3$.ɵɵtextInterpolate1(" ", $ctx$.item);
  }
}
