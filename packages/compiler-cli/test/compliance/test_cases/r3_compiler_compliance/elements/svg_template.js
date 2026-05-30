consts: [["title", "Hello", 1, "my-app"], ["cx", "20", "cy", "30", "r", "50"]],
    template: function MyComponent_Template(rf, ctx) {
      if (rf & 1) {
        $r3$.ɵɵelementStart(0, "div", 0);
        $r3$.ɵɵnamespaceSVG();
        $r3$.ɵɵelementStart(1, "svg");
        $r3$.ɵɵelement(2, "circle", 1);
        $r3$.ɵɵelementEnd();
        $r3$.ɵɵnamespaceHTML();
        $r3$.ɵɵelementStart(3, "p");
        $r3$.ɵɵtext(4, "test");
        $r3$.ɵɵelementEnd()();
      }
    }
