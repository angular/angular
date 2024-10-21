
const _c0 = [[["", "card-title", ""]], [["", "card-content", ""]]];
const _c1 = ["[card-title]", "[card-content]"];
const _c2 = ["*"];
// ...
selectors: [["card"]],
standalone: false,
ngContentSelectors: _c1,
decls: 3,
vars: 0,
template: function Card_Template(rf, ctx) {
	if (rf & 1) {
		i0.ɵɵprojectionDef(_c0);
		i0.ɵɵprojection(0);
		i0.ɵɵtext(1, " --- ");
		i0.ɵɵprojection(2, 1);
	}
}
// ...
selectors: [["card-with-title"]],
standalone: false,
ngContentSelectors: _c2,
decls: 4,
vars: 0,
consts: [["ngProjectAs", "[card-title]", 5, ["", "card-title", ""]]],
template: function CardWithTitle_Template(rf, ctx) {
	if (rf & 1) {
		i0.ɵɵprojectionDef();
		i0.ɵɵelementStart(0, "card")(1, "h1", 0);
		i0.ɵɵtext(2, "Title");
		i0.ɵɵelementEnd();
		i0.ɵɵprojection(3, 0, ["ngProjectAs", "[card-content]", 5, ["", "card-content", ""]]);
		i0.ɵɵelementEnd();
	}
}
// ...
selectors: [["app"]],
standalone: false,
decls: 2,
vars: 0,
template: function App_Template(rf, ctx) {
	if (rf & 1) {
		i0.ɵɵelementStart(0, "card-with-title");
		i0.ɵɵtext(1, "content");
		i0.ɵɵelementEnd();
	}
}