template: function MyComponent_Template(rf, $ctx$) {
	if (rf & 1) {
	  $r3$.ɵɵelement(0, "div");
	  $r3$.ɵɵpipe(1, "stylePipe");
	  $r3$.ɵɵpipe(2, "classPipe");
	}
	if (rf & 2) {
	  $r3$.ɵɵstyleMap($r3$.ɵɵpipeBind1(1, 4, $ctx$.myStyleExp));
	  $r3$.ɵɵclassMap($r3$.ɵɵpipeBind1(2, 6, $ctx$.myClassExp));
	}
  }
  