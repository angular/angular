import "dart:html";

CssStyleDeclaration getComputedStyle(element, [String pseudoElement]) {
  return element.getComputedStyle(pseudoElement);
}
