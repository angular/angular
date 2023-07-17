template: function MyComponent_Template(rf, ctx) {
  if (rf & 1) {
    i0.ɵɵelementContainerStart(0);
    i0.ɵɵelementStart(1, "span");
    i0.ɵɵtext(2, "in a ");
    i0.ɵɵelementEnd();
    i0.ɵɵtext(3, "container");
    i0.ɵɵelementContainerEnd();
  }
}