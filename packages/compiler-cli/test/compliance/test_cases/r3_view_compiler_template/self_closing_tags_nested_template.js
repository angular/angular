template: function App_Template(rf, ctx) {
  if (rf & 1) {
    …
    i0.ɵɵelementStart(0, "my-comp", 0);
    i0.ɵɵtext(1, "Before");
    i0.ɵɵelement(2, "my-comp", 1);
    i0.ɵɵtext(3, "After");
    i0.ɵɵelementEnd();
    …
  }
}
