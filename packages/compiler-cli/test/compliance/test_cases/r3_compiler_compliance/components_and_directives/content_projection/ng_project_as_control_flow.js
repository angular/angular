function MyApp_Conditional_1_Template(rf, ctx) {
    if (rf & 1) {
        i0.ɵɵelement(0, "h1");
    }
}

function MyApp_For_3_Template(rf, ctx) {
    if (rf & 1) {
        i0.ɵɵelement(0, "h2");
    }
}

function MyApp_Case_6_Template(rf, ctx) {
    if (rf & 1) {
        i0.ɵɵelement(0, "h3");
    }
}

export class MyApp {
    static ɵcmp = i0.ɵɵdefineComponent({
        type: MyApp,
        selectors: [["my-app"]],
        standalone: false,
        decls: 8,
        vars: 2,
        consts: [[__AttributeMarker.ProjectAs__, ["", "title", ""]]],
        template: function MyApp_Template(rf, ctx) {
            if (rf & 1) {
                i0.ɵɵelementStart(0, "simple");
                i0.ɵɵtemplate(1, MyApp_Conditional_1_Template, 1, 0, "h1", 0);
                i0.ɵɵelementEnd();
                i0.ɵɵelementStart(2, "simple");
                i0.ɵɵrepeater(3, MyApp_For_3_Template, 1, 0, "h2", 0, i0.ɵɵrepeaterTrackByIdentity);
                i0.ɵɵelementEnd();
                i0.ɵɵelementStart(4, "simple");
                i0.ɵɵelementStart(5, "Conditional");
                i0.ɵɵtemplate(6, MyApp_Case_6_Template, 1, 0, "h3", 0);
                i0.ɵɵelementEnd();
                i0.ɵɵelementEnd();
            }
            if (rf & 2) {
                i0.ɵɵadvance(1);
                i0.ɵɵconditional(true ? 1 : -1);
                i0.ɵɵadvance(2);
                i0.ɵɵrepeater([1]);
                i0.ɵɵadvance(3);
                i0.ɵɵconditional(true ? 6 : -1);
            }
        },
        dependencies: [SimpleComponent],
        encapsulation: 2
    });
}
