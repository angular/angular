const _c0 = ["projected"];
const _c1 = ["span"];
const _c2 = ["*"];
…
static ɵfac: $r3$.ɵɵFactoryDeclaration<TestCmp, never> = function TestCmp_Factory(__ngFactoryType__: any) {
  return new (__ngFactoryType__ || TestCmp)();
};

static ɵcmp: $r3$.ɵɵComponentDeclaration<TestCmp, "test-cmp", never, {}, {}, ["projected"], ["*"], true, never> = /*@__PURE__*/
  $r3$.ɵɵdefineComponent({
    type: TestCmp,
    selectors: [["test-cmp"]],
    contentQueries: function TestCmp_ContentQueries(rf: number, ctx: any, dirIndex: number) {
      if (rf & 1) {
        $r3$.ɵɵcontentQuery(dirIndex, _c0, 4);
      }
      if (rf & 2) {
        let _t: any;
        $r3$.ɵɵqueryRefresh(_t = $r3$.ɵɵloadQuery()) && (ctx.projected = _t);
      }
    },
    viewQuery: function TestCmp_Query(rf: number, ctx: any) {
      if (rf & 1) {
        $r3$.ɵɵviewQuery(_c1, 5);
      }
      if (rf & 2) {
        let _t: any;
        $r3$.ɵɵqueryRefresh(_t = $r3$.ɵɵloadQuery()) && (ctx.span = _t.first);
      }
    },
    ngContentSelectors: _c2,
    decls: 3,
    vars: 0,
    consts: [["span", ""]],
    template: function TestCmp_Template(rf: number, ctx: any) {
      if (rf & 1) {
        $r3$.ɵɵprojectionDef();
        $r3$.ɵɵdomElementStart(0, "span", null, 0);
        $r3$.ɵɵprojection(2);
        $r3$.ɵɵdomElementEnd();
      }
    },
    encapsulation: 2
  });
…
