# Defer triggers

While the default options for `@defer` offer great options for lazy loading parts of your components it may still be desirable to further customize the deferred loading experience.

By default, deferred content loads when the browser is idle. You can, however, customize when this loading occurs by specifying a **trigger**. This lets you pick the loading behavior best suited to your component.

Deferrable views offer two types of loading trigger:

<div class="docs-table docs-scroll-track-transparent">
  <table>
    <tr>
      <td><code>on</code></td>
      <td>
        A trigger condition using a trigger from the list of built-in triggers.<br/>
        For example: <code>@defer (on viewport)</code>
      </td>
    </tr>
    <tr>
      <td><code>when</code></td>
      <td>
        A condition as an expression which is evaluated for truthiness. When the expression is truthy, the placeholder is swapped with the lazily loaded content.<br/>
        For example: <code>@defer (when customizedCondition)</code>
      </td>
    </tr>
  </table>
</div>

If the `when` condition evaluates to `false`, the `defer` block is not reverted back to the placeholder. The swap is a one-time operation.

You can define multiple event triggers at once, these triggers will be evaluated as OR conditions.

* Ex: `@defer (on viewport; on timer(2s))`
* Ex: `@defer (on viewport; when customizedCondition)`

In this activity, you'll learn how to use triggers to specify the condition to load the deferrable views.

<hr>

<docs-workflow>

<docs-step title="Add `on hover` trigger">
In your `app.ts`,  add an `on hover` trigger to the `@defer` block.

<docs-code language="angular-html" hightlight="[1]">
@defer (on hover) {
  <article-comments />
} @placeholder (minimum 1s) {
  <p>Placeholder for comments</p>
} @loading (minimum 1s; after 500ms) {
  <p>Loading comments...</p>
} @error {
  <p>Failed to load comments</p>
}
</docs-code>

Now, the page will not render the comments section until you hover its placeholder.
</docs-step>

<docs-step title="Add a 'Show all comments' button">
Next, update the template to include a button with the label "Show all comments". Include a template variable called `#showComments` with the button.

<docs-code language="angular-html" hightlight="[1]">
<button type="button" #showComments>Show all comments</button>

@defer (on hover) {
  <article-comments />
} @placeholder (minimum 1s) {
  <p>Placeholder for comments</p>
} @loading (minimum 1s; after 500ms) {
  <p>Loading comments...</p>
} @error {
  <p>Failed to load comments</p>
}
</docs-code>

NOTE: for more information on [template variables check the documentation](https://angular.dev/guide/templates/reference-variables#).

</docs-step>

<docs-step title="Add `on interaction` trigger">
Update the `@defer` block in the template to use the `on interaction` trigger. Provide the `showComments` template variable as the parameter to `interaction`.

<docs-code language="angular-html" hightlight="[3]">
<button type="button" #showComments>Show all comments</button>

@defer (on hover; on interaction(showComments)) {
  <article-comments />
} @placeholder (minimum 1s) {
  <p>Placeholder for comments</p>
} @loading (minimum 1s; after 500ms) {
  <p>Loading comments...</p>
} @error {
  <p>Failed to load comments</p>
}
</docs-code>

With these changes, the page will wait for one of the following conditions before rendering the comments section:
* User hovers the comments section’s placeholder
* User clicks on the “Show all comments" button

You can reload the page to try out different triggers to render the comments section.
</docs-step>
</docs-workflow>

If you would like to learn more, check out the documentation for [Deferrable View](https://angular.dev/guide/defer).
Keep learning to unlock more of Angular's great features.
