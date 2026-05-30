function MyComponent_img_2_Template(rf, ctx) {
  if (rf & 1) {
    i0.ɵɵi18nStart(0, 0, 1);
    i0.ɵɵelement(1, "img");
    i0.ɵɵi18nEnd();
  }
}
function MyComponent_other_component_3_Template(rf, ctx) {
  if (rf & 1) {
    i0.ɵɵi18nStart(0, 0, 2);
    i0.ɵɵelement(1, "other-component");
    i0.ɵɵi18nEnd();
  }
}
function MyComponent_4_ng_template_1_Template(rf, ctx) {
  if (rf & 1) {
    i0.ɵɵi18n(0, 0, 4);
  }
}
function MyComponent_4_Template(rf, ctx) {
  if (rf & 1) {
    i0.ɵɵi18nStart(0, 0, 3);
    i0.ɵɵtemplate(1, MyComponent_4_ng_template_1_Template, 1, 0, "ng-template");
    i0.ɵɵi18nEnd();
  }
}
function MyComponent_ng_container_5_Template(rf, ctx) {
  if (rf & 1) {
    i0.ɵɵi18nStart(0, 0, 5);
    i0.ɵɵelementContainer(1);
    i0.ɵɵi18nEnd();
  }
}
function MyComponent_ng_content_6_Template(rf, ctx) {
  if (rf & 1) {
    i0.ɵɵi18nStart(0, 0, 6);
    i0.ɵɵprojection(1, 0, ["*ngIf", "flag"]);
    i0.ɵɵi18nEnd();
  }
}
…
decls: 7,
vars: 5,
consts: () => {
  __i18nMsgWithPostprocess__('{$tagImg}{$startTagOtherComponent}{$closeTagOtherComponent}{$startTagNgTemplate}{$closeTagNgTemplate}{$startTagNgContainer}{$closeTagNgContainer}{$startTagNgContent}{$closeTagNgContent}', [['closeTagNgContainer', String.raw`\uFFFD/#1:5\uFFFD\uFFFD/*5:5\uFFFD`], ['closeTagNgContent', String.raw`\uFFFD/#1:6\uFFFD\uFFFD/*6:6\uFFFD`], ['closeTagNgTemplate', String.raw`[\uFFFD/*1:4\uFFFD|\uFFFD/*4:3\uFFFD]`], ['closeTagOtherComponent', String.raw`\uFFFD/#1:2\uFFFD\uFFFD/*3:2\uFFFD`], ['startTagNgContainer', String.raw`\uFFFD*5:5\uFFFD\uFFFD#1:5\uFFFD`], ['startTagNgContent', String.raw`\uFFFD*6:6\uFFFD\uFFFD#1:6\uFFFD`], ['startTagNgTemplate', String.raw`[\uFFFD*4:3\uFFFD|\uFFFD*1:4\uFFFD]`], ['startTagOtherComponent', String.raw`\uFFFD*3:2\uFFFD\uFFFD#1:2\uFFFD`], ['tagImg', String.raw`\uFFFD*2:1\uFFFD\uFFFD/*2:1\uFFFD\uFFFD#1:1\uFFFD\uFFFD/#1:1\uFFFD\uFFFD*2:1\uFFFD\uFFFD/*2:1\uFFFD`]], {original_code: { 'closeTagNgContainer': '<ng-container *ngIf=\"flag\" />', 'closeTagNgContent': '<ng-content *ngIf=\"flag\" />', 'closeTagNgTemplate': '<ng-template *ngIf=\"flag\" />', 'closeTagOtherComponent': '<other-component *ngIf=\"flag\" />', 'startTagNgContainer': '<ng-container *ngIf=\"flag\" />', 'startTagNgContent': '<ng-content *ngIf=\"flag\" />', 'startTagNgTemplate': '<ng-template *ngIf=\"flag\" />', 'startTagOtherComponent': '<other-component *ngIf=\"flag\" />', 'tagImg': '<img *ngIf=\"flag\" />'}}, {}, [])
  return [$i18n_0$, [4, "ngIf"]];
},
template: function MyComponent_Template(rf, ctx) {
  if (rf & 1) {
    i0.ɵɵprojectionDef();
    i0.ɵɵelementStart(0, "div");
    i0.ɵɵi18nStart(1, 0);
    i0.ɵɵtemplate(2, MyComponent_img_2_Template, 2, 0, "img", 1)(3, MyComponent_other_component_3_Template, 2, 0, "other-component", 1)(4, MyComponent_4_Template, 2, 0, null, 1)(5, MyComponent_ng_container_5_Template, 2, 0, "ng-container", 1)(6, MyComponent_ng_content_6_Template, 2, 0, "ng-content", 1);
    i0.ɵɵi18nEnd();
    i0.ɵɵelementEnd();
  }
  if (rf & 2) {
    i0.ɵɵadvance(2);
    i0.ɵɵproperty("ngIf", ctx.flag);
    i0.ɵɵadvance();
    i0.ɵɵproperty("ngIf", ctx.flag);
    i0.ɵɵadvance();
    i0.ɵɵproperty("ngIf", ctx.flag);
    i0.ɵɵadvance();
    i0.ɵɵproperty("ngIf", ctx.flag);
    i0.ɵɵadvance();
    i0.ɵɵproperty("ngIf", ctx.flag);
  }
}
