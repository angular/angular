# What are deferrable views?

A fully rendered Angular page may contain many different components, directives, and pipes. While certain parts of the page should be shown to the user immediately, there may be portions that can wait to display until later.
Angular's *deferrable views*, using the `@defer` syntax, can help you speed up your application by telling Angular to wait to download the JavaScript for the parts of the page that don't need to be shown right away.

In this activity, you'll learn how to use deferrable views to defer load a section of your component template.

<hr>

<docs-workflow>

<docs-step title="Add a `@defer` block to a section of a template">
In your `app.ts`, wrap the `article-comments` component with a `@defer` block to defer load it.

<docs-code language="angular-html">
@defer {
  <article-comments />
}
</docs-code>

By default, `@defer` loads the `article-comments` component when the browser is idle.

In your browser's developer console, you can see that the `article-comments-component` lazy chunk file is loaded separately (The specific file names may change from run to run):

<docs-code language="markdown">
Initial chunk files | Names                      |  Raw size
chunk-NNSQHFIE.js   | -                          | 769.00 kB | 
main.js             | main                       | 229.25 kB | 

Lazy chunk files    | Names                      |  Raw size
chunk-T5UYXUSI.js   | article-comments-component |   1.84 kB |
</docs-code>

</docs-step>
</docs-workflow>


Great work! You’ve learned the basics of deferrable views.
