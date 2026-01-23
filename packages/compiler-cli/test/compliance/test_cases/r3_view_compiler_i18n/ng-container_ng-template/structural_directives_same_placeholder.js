function MyComponent_div_2_Template(rf, ctx) {
  if (rf & 1) {
    i0.ɵɵi18nStart(0, 0, 1);
    i0.ɵɵelement(1, "div");
    i0.ɵɵi18nEnd();
  }
}
function MyComponent_div_3_div_2_Template(rf, ctx) {
  if (rf & 1) {
    i0.ɵɵi18nStart(0, 0, 3);
    i0.ɵɵelement(1, "div");
    i0.ɵɵi18nEnd();
  }
}
function MyComponent_div_3_Template(rf, ctx) {
  if (rf & 1) {
    i0.ɵɵi18nStart(0, 0, 2);
    i0.ɵɵelementStart(1, "div");
    i0.ɵɵtemplate(2, MyComponent_div_3_div_2_Template, 2, 0, "div", 1);
    i0.ɵɵelementEnd();
    i0.ɵɵi18nEnd();
  }
  if (rf & 2) {
    const $ctx_r1$ = i0.ɵɵnextContext();
    i0.ɵɵadvance(2);
    i0.ɵɵproperty("ngIf", $ctx_r1$.someFlag);
  }
}
function MyComponent_img_4_Template(rf, ctx) {
  if (rf & 1) {
    i0.ɵɵi18nStart(0, 0, 4);
    i0.ɵɵelement(1, "img");
    i0.ɵɵi18nEnd();
  }
}
function MyComponent_img_5_Template(rf, ctx) {
  if (rf & 1) {
    i0.ɵɵi18nStart(0, 0, 5);
    i0.ɵɵelement(1, "img");
    i0.ɵɵi18nEnd();
  }
}
…
decls: 6,
vars: 4,
consts: () => {
  __i18nMsgWithPostprocess__('{$startTagDiv}Content{$closeTagDiv}{$startTagDiv}{$startTagDiv}Content{$closeTagDiv}{$closeTagDiv}{$tagImg}{$tagImg}', [['closeTagDiv', String.raw`[\uFFFD/#1:1\uFFFD\uFFFD/*2:1\uFFFD|\uFFFD/#1:3\uFFFD\uFFFD/*2:3\uFFFD|\uFFFD/#1:2\uFFFD\uFFFD/*3:2\uFFFD]`], ['startTagDiv', String.raw`[\uFFFD*2:1\uFFFD\uFFFD#1:1\uFFFD|\uFFFD*3:2\uFFFD\uFFFD#1:2\uFFFD|\uFFFD*2:3\uFFFD\uFFFD#1:3\uFFFD]`], ['tagImg', String.raw`[\uFFFD*4:4\uFFFD\uFFFD/*4:4\uFFFD\uFFFD#1:4\uFFFD\uFFFD/#1:4\uFFFD\uFFFD*4:4\uFFFD\uFFFD/*4:4\uFFFD|\uFFFD*5:5\uFFFD\uFFFD/*5:5\uFFFD\uFFFD#1:5\uFFFD\uFFFD/#1:5\uFFFD\uFFFD*5:5\uFFFD\uFFFD/*5:5\uFFFD]`]], {original_code: {closeTagDiv: '</div>', startTagDiv: '<div *ngIf=\"someFlag\">', tagImg: '<img *ngIf=\"someOtherFlag\" />' }}, {}, [])
  return [i18n_0, [4, "ngIf"]];
},
template: function MyComponent_Template(rf, ctx) {
  if (rf & 1) {
    i0.ɵɵelementStart(0, "div");
    i0.ɵɵi18nStart(1, 0);
    i0.ɵɵtemplate(2, MyComponent_div_2_Template, 2, 0, "div", 1)(3, MyComponent_div_3_Template, 3, 1, "div", 1)(4, MyComponent_img_4_Template, 2, 0, "img", 1)(5, MyComponent_img_5_Template, 2, 0, "img", 1);
    i0.ɵɵi18nEnd();
    i0.ɵɵelementEnd();
  }
  if (rf & 2) {
    i0.ɵɵadvance(2);
    i0.ɵɵproperty("ngIf", ctx.someFlag);
    i0.ɵɵadvance();
    i0.ɵɵproperty("ngIf", ctx.someFlag);
    i0.ɵɵadvance();
    i0.ɵɵproperty("ngIf", ctx.someOtherFlag);
    i0.ɵɵadvance();
    i0.ɵɵproperty("ngIf", ctx.someOtherFlag);
  }
}
