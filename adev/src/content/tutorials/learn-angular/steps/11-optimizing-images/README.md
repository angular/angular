# Optimizing images

Images are a big part of many applications, and can be a major contributor to application performance problems, including low [Core Web Vitals](https://web.dev/explore/learn-core-web-vitals) scores.

Image optimization can be a complex topic, but Angular handles most of it for you, with the `NgOptimizedImage` directive.

Note: Learn more about [image optimization with NgOptimizedImage in the in-depth guide](/guide/image-optimization).

In this activity, you'll learn how to use `NgOptimizedImage` to ensure your images are loaded efficiently.

<hr>

<docs-workflow>

<docs-step title="Import the NgOptimizedImage directive">

In order to leverage the `NgOptimizedImage` directive, first import it from the `@angular/common` library and add it to the component `imports` array.

```ts
import {NgOptimizedImage} from '@angular/common';

@Component({
  imports: [NgOptimizedImage],
  ...
})
```

</docs-step>

<docs-step title="Update the src attribute to be ngSrc">

To enable the `NgOptimizedImage` directive, swap out the `src` attribute for `ngSrc`. This applies for both static image sources (i.e., `src`) and dynamic image sources (i.e., `[src]`).

<docs-code language="angular-ts" highlight="[[9], [13]]">
import {NgOptimizedImage} from '@angular/common';

@Component({
template: `     ...
    <li>
      Static Image:
      <img ngSrc="/assets/logo.svg" alt="Angular logo" width="32" height="32" />
    </li>
    <li>
      Dynamic Image:
      <img [ngSrc]="logoUrl" [alt]="logoAlt" width="32" height="32" />
    </li>
    ...
  `,
imports: [NgOptimizedImage],
})
</docs-code>

</docs-step>

<docs-step title="Add width and height attributes">

Note that in the above code example, each image has both `width` and `height` attributes. In order to prevent [layout shift](https://web.dev/articles/cls), the `NgOptimizedImage` directive requires both size attributes on each image.

In situations where you can't or don't want to specify a static `height` and `width` for images, you can use [the `fill` attribute](https://web.dev/articles/cls) to tell the image to act like a "background image", filling its containing element:

```angular-html
<div class="image-container"> //Container div has 'position: "relative"'
  <img ngSrc="www.example.com/image.png" fill />
</div>
```

NOTE: For the `fill` image to render properly, its parent element must be styled with `position: "relative"`, `position: "fixed"`, or `position: "absolute"`.

</docs-step>

<docs-step title="Prioritize important images">

One of the most important optimizations for loading performance is to prioritize any image which might be the ["LCP element"](https://web.dev/articles/optimize-lcp), which is the largest on-screen graphical element when the page loads. To optimize your loading times, make sure to add the `priority` attribute to your "hero image" or any other images that you think could be an LCP element.

```ts
<img ngSrc="www.example.com/image.png" height="600" width="800" priority />
```

</docs-step>

<docs-step title="Optional: Use an image loader">

`NgOptimizedImage` allows you to specify an [image loader](guide/image-optimization#configuring-an-image-loader-for-ngoptimizedimage), which tells the directive how to format URLs for your images. Using a loader allows you to define your images with short, relative URLs:

```ts
providers: [
  provideImgixLoader('https://my.base.url/'),
]
```

Final URL will be 'https://my.base.url/image.png'

```angular-html
<img ngSrc="image.png" height="600" width="800" />
```

Image loaders are for more than just convenience--they allow you to use the full capabilities of `NgOptimizedImage`. Learn more about these optimizations and the built-in loaders for popular CDNs [here](guide/image-optimization#configuring-an-image-loader-for-ngoptimizedimage).

</docs-step>

</docs-workflow>

By adding this directive to your workflow, your images are now loading using best practices with the help of Angular 🎉

If you would like to learn more, check out the [documentation for `NgOptimizedImage`](guide/image-optimization). Keep up the great work and let's learn about routing next.
