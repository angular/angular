Implements Angular's custom-element API, which enables you to package components as
[custom elements](https://developer.mozilla.org/en-US/docs/Web/Web_Components/Using_custom_elements).

A custom element extends HTML by allowing you to define a tag whose content is created and controlled by JavaScript code. The browser maintains a `CustomElementRegistry` of defined custom elements (also called Web Components), which maps an instantiable JavaScript class to an HTML tag.

The `createCustomElement()` function provides a bridge from Angular's component interface and change detection functionality to the built-in DOM API. 

For more information, see [Angular Elements Overview](guide/elements).