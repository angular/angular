# Dynamic component loader

Component templates are not always fixed.
An application might need to load new components at runtime.
This cookbook shows you how to add components dynamically.

See the <live-example name="dynamic-component-loader"></live-example> of the code in this cookbook.

<a id="dynamic-loading"></a>

## Rendering components dynamically

The following example shows how to build a dynamic ad banner.

The hero agency is planning an ad campaign with several different ads cycling through the banner.
New ad components are added frequently by several different teams.
This makes it impractical to use a template with a static component structure.

Instead, you need a way to load a new component without a fixed reference to the component in the ad banner's template.

The `NgComponentOutlet` directive can be used to instantiate components and insert them into the current view. This directive allows you to provide a component class that should be rendered, as well as component inputs to be used during initialization.

<code-example header="src/app/ad-banner.component.ts" path="dynamic-component-loader/src/app/ad-banner.component.ts" region="component"></code-example>

The `AdBannerComponent` class injects the `AdService` service and requests a list of ads. 
The "current ad" index is set to `0` initially to indicate that the first ad should be displayed. 
When a user clicks the "Next" button, the index is increased by one. 
Once the index reaches the length of the ads array, the index is reset back to `0`.

In the template, the `currentAd` getter is used to retrieve a current ad. 
If the value changes, Angular picks it up and reflects the changes in the UI.

## Different components from the service

Components returned from the `AdService` service and used in `NgComponentOutlet` in the `AdBannerComponent` template can be different. 
Angular detects if a component class has changed and updates the UI accordingly.

Here are two sample components and the service providing them with their inputs:

<code-tabs>
    <code-pane header="hero-job-ad.component.ts" path="dynamic-component-loader/src/app/hero-job-ad.component.ts"></code-pane>
    <code-pane header="hero-profile.component.ts" path="dynamic-component-loader/src/app/hero-profile.component.ts"></code-pane>
    <code-pane header="ad.service.ts" path="dynamic-component-loader/src/app/ad.service.ts"></code-pane>
</code-tabs>

<a id="final-ad-baner"></a>

## Final ad banner

The final ad banner looks like this:

<div class="lightbox">

<img alt="Ads" src="generated/images/guide/dynamic-component-loader/ads-example.gif">

</div>

See the <live-example name="dynamic-component-loader"></live-example>.

<!-- links -->

<!-- external links -->

<!-- end links -->

@reviewed 2023-04-18
