# Migration to LegacyShadowDom

Previously, Shadow DOM encapsulation allowed styles to leak into components, and did not follow the spec. 

The `LegacyShadowDom` encapsulation mode was introduced so that you can preserve this behaviour while migrating to the new Shadow DOM encapsulation which only applies styles inside the shadowhost that are imported/defined by your component.

The updated `ShadowDom` encapsulation mode follows the Shadow DOM spec, and styles not declared by the component will not be pulled in . As this would have been a breaking change, the `LegacyShadowDom` encapsulation mode was introduced to allow you to migrate your application without breaking existing styling.

This schematic migrates any current `ShadowDom` encapsulation to `LegacyShadowDom` encapsulation. You can then choose to use the updated `ShadowDom` encapsulation mode if you do not rely on the external styles it was injecting, or 
if you have fixed any ui issues by moving styles into the style declarations directly imported by the component.

`LegacyShadowDom` encapsulation is not recommended for new applications, and should only be used if you are migrating an existing application that relies on the old behaviour, it is deprecated and will
be removed in a future release.

Run the schematic using the following command:

<docs-code language="shell">

ng generate @angular/core:shadowdom-migration

</docs-code>


#### Before

<docs-code language="typescript">

<!-- Before -->
encapsulation: ViewEncapsulation.ShadowDom

<!-- After -->
encapsulation: ViewEncapsulation.LegacyShadowDom

</docs-code>