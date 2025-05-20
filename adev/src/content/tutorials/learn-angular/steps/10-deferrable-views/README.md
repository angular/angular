# Deferrable Views

Sometimes in app development, you end up with a lot of components that you need to reference in your app, but some of those don't need to be loaded right away for various reasons.

Maybe they are below the visible fold or are heavy components that aren't interacted with until later. In that case, we can load some of those resources later with deferrable views.

Note: Learn more about [deferred loading with @defer in the in-depth guide](/guide/templates/defer).

In this activity, you'll learn how to use deferrable views to defer load a section of your component template.

<hr>

<docs-workflow>

<docs-step title="Add a `@defer` block around the comments component">

In your app, the blog post page has a comment component after the post details.

Wrap the comment component with a `@defer` block to defer load it.

```angular-html
@defer {
  <comments />
}
```

The code above is an example of how to use a basic `@defer` block. By default `@defer` will load the `comments` component when the browser is idle.

</docs-step>

<docs-step title="Add a placeholder">

Add a `@placeholder` block to the `@defer` block. The `@placeholder` block is where you put html that will show before the deferred loading starts. The content in `@placeholder` blocks is eagerly loaded.

<docs-code language="angular-html" highlight="[3,4,5]">
@defer {
  <comments />
} @placeholder {
  <p>Future comments</p>
}
</docs-code>

</docs-step>

<docs-step title="Add a loading block">

Add a `@loading` block to the `@defer` block. The `@loading` block is where you put html that will show _while_ the deferred content is actively being fetched, but hasn't finished yet. The content in `@loading` blocks is eagerly loaded.

<docs-code language="angular-html" highlight="[5,6,7]">
@defer {
  <comments />
} @placeholder {
  <p>Future comments</p>
} @loading {
  <p>Loading comments...</p>
}
</docs-code>

</docs-step>

<docs-step title="Add a minimum duration">

Both `@placeholder` and `@loading` sections have optional parameters to prevent flickering from occurring when loading happens quickly. `@placeholder` has `minimum` and `@loading` has `minimum` and `after`. Add a `minimum` duration to the `@loading` block so it will be rendered for at least 2 seconds.

<docs-code language="angular-html" highlight="[5]">
@defer {
  <comments />
} @placeholder {
  <p>Future comments</p>
} @loading (minimum 2s) {
  <p>Loading comments...</p>
}
</docs-code>

</docs-step>

<docs-step title="Add a viewport trigger">

Deferrable views have a number of trigger options. Add a viewport trigger so the content will defer load once it enters the viewport.

<docs-code language="angular-html" highlight="[1]">
@defer (on viewport) {
  <comments />
}
</docs-code>

</docs-step>

<docs-step title="Add content">

A viewport trigger is best used when you're deferring content that's far enough down the page that it needs to be scrolled to see. So let's add some content to our blog post. You can either write your own, or you can copy the content below and put it inside the `<article>` element.

<docs-code language="html" highlight="[1]">
<article>
  <p>Angular is my favorite framework, and this is why. Angular has the coolest deferrable view feature that makes defer loading content the easiest and most ergonomic it could possibly be. The Angular community is also filled with amazing contributors and experts that create excellent content. The community is welcoming and friendly, and it really is the best community out there.</p>
  <p>I can't express enough how much I enjoy working with Angular. It offers the best developer experience I've ever had. I love that the Angular team puts their developers first and takes care to make us very happy. They genuinely want Angular to be the best framework it can be, and they're doing such an amazing job at it, too. This statement comes from my heart and is not at all copied and pasted. In fact, I think I'll say these exact same things again a few times.</p>
  <p>Angular is my favorite framework, and this is why. Angular has the coolest deferrable view feature that makes defer loading content the easiest and most ergonomic it could possibly be. The Angular community is also filled with amazing contributors and experts that create excellent content. The community is welcoming and friendly, and it really is the best community out there.</p>
  <p>I can't express enough how much I enjoy working with Angular. It offers the best developer experience I've ever had. I love that the Angular team puts their developers first and takes care to make us very happy. They genuinely want Angular to be the best framework it can be, and they're doing such an amazing job at it, too. This statement comes from my heart and is not at all copied and pasted. In fact, I think I'll say these exact same things again a few times.</p>
  <p>Angular is my favorite framework, and this is why. Angular has the coolest deferrable view feature that makes defer loading content the easiest and most ergonomic it could possibly be. The Angular community is also filled with amazing contributors and experts that create excellent content. The community is welcoming and friendly, and it really is the best community out there.</p>
  <p>I can't express enough how much I enjoy working with Angular. It offers the best developer experience I've ever had. I love that the Angular team puts their developers first and takes care to make us very happy. They genuinely want Angular to be the best framework it can be, and they're doing such an amazing job at it, too. This statement comes from my heart and is not at all copied and pasted.</p>
</article>
</docs-code>

Once you've added this code, now scroll down to see the deferred content load once you scroll it into the viewport.

</docs-step>

</docs-workflow>

In the activity, you've learned how to use deferrable views in your applications. Great work. 🙌

There's even more you can do with them, like different triggers, prefetching, and `@error` blocks.

If you would like to learn more, check out the [documentation for Deferrable views](guide/defer).
