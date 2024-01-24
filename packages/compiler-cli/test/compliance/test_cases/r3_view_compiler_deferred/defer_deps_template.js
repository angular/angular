const $TestCmp_Defer_1_DepsFn$ = () => [import("./defer_deps_ext").then(m => m.CmpA), LocalDep];

function TestCmp_Defer_0_Template(rf, ctx) {
	if (rf & 1) {
		i0.ɵɵelement(0, "cmp-a")(1, "local-dep");
	}
}

export class LocalDep {
}

…

function TestCmp_Template(rf, ctx) { if (rf & 1) {
	i0.ɵɵtemplate(0, TestCmp_Defer_0_Template, 2, 0);
	i0.ɵɵdefer(1, 0, $TestCmp_Defer_1_DepsFn$);
	i0.ɵɵdeferOnIdle();
} }