// NOTE: AttributeMarker.NamespaceURI = 0
// NOTE: AttributeMarker.Classes = 1
consts: [[
  0, "xmlns", "foo", "http://someuri/foo",
  0, "foo", "bar", "baz",
  "title", "Hello",
  0, "foo", "qux", "quacks",
  1, "my-app"]],
template: function MyComponent_Template(rf, ctx) {
  if (rf & 1) {
    $r3$.ɵɵelementStart(0, "div", 0);
    $r3$.ɵɵtext(1, "Hello ");
    $r3$.ɵɵelementStart(2, "b");
    $r3$.ɵɵtext(3, "World");
    $r3$.ɵɵelementEnd();
    $r3$.ɵɵtext(4, "!");
    $r3$.ɵɵelementEnd();
  }
}