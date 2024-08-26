# Angular Documentation Authoring Guidelines

## Before you start

Before you start writing documentation, review Google's
[Tech Writing One](https://developers.google.com/tech-writing/one),
[Tech Writing Two](https://developers.google.com/tech-writing/two),
[Inclusive Documentation](https://developers.google.com/style/inclusive-documentation), and
[Tech Writing for Accessibility](https://developers.google.com/tech-writing/accessibility).

## Writing style goals

The audience we're targeting is **Developers who have worked on at least one web project before.**
This means that we assume knowledge of general web platform technologies such as HTML,
TypeScript, JavaScript, and CSS.

Orient content around **developer intents**. Ask yourself _"What is the developer trying to
accomplish?"_

Prefer simple, casual language while remaining technically precise.

Avoid excessive preambles and hand-holding. **Let the code examples speak for
themselves**

Explain things without requiring knowledge of other parts of Angular where possible. Sometimes
this is impossible. For example, you have to know something about change detection for lifecycle
hooks to make sense. When additional knowledge is necessary, link to the corresponding topics.

Prefer framework-agnostic terminology (e.g. "DOM", "HTML", etc.) when it makes sense, compared to
framework-specific terms like "view" or "template". _Do_ use the framework-specific terms when they
would be more technically correct.

## Content types

### In-depth guides

Example: [Components](https://angular.dev/guide/components).

* In-depth guides attempt to be **fully and completely comprehensive**.
* Include recommendations and best practices in their relevant topics.
* In-depth guides are not meant to be read start-to-finish. Expect developers to jump to a
  specific topic based on what they're trying to learn/accomplish in the moment
* **No step-by-step instructions**

### Tutorials

Tutorials are primarily focused on task-based, step-by-step instructions towards a specific goal.

## Common pitfalls

Several of these pitfalls are covered
in [Tech Writing One](https://developers.google.com/tech-writing/one) and
[Tech Writing Two](https://developers.google.com/tech-writing/two), but we repeat them here
because they are _very_ common.

| Pitfall                                                    | Explanation                                                                                                                                                                                                                                               | ❌ Bad example                                                               | ✅ Good example                                                                                                  |
|------------------------------------------------------------|-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|-----------------------------------------------------------------------------|-----------------------------------------------------------------------------------------------------------------|
| **First person language**                                  | Prefer second person language ("you"), including imperative language.                                                                                                                                                                                     | "We can use the `afterRender` function to register a callback."             | "Use the `afterRender` function to register a callback."                                                        |
| **Past or future tense**                                   | Always use present tense. This is especially common for future tense with "will".                                                                                                                                                                         | "The query will return an instance of the component."                       | "The query returns an instance of the component"                                                                |
| [**Passive voice**][active-voice]                          | Prefer active voice. This often involves changing the order of words in a sentence or making a sentence imperative.                                                                                                                                       | "Your template is compiled to JavaScript by Angular."                       | "Angular compiles your template to JavaScript."                                                                 |
| **Mixed content types**                                    | Guides should explain a topic, while tutorials walk readers through a set of step-by-step instructions. Avoid mixing these two content types.                                                                                                             | "To define styles for a component, first..."                                | "Components include CSS styles via the `styles` and `styleUrl` properties."                                     |
| **Topic scope creep**                                      | Each topic should stay focused on one specific subject matter. Don't explain concepts that are better explained elsewhere, especially for web platform behaviors that are best explained by more general sites like [MDN](https://developer.mozilla.org). |                                                                             |                                                                                                                 |
| **Nested treatments**                                      | angular.dev supports several custom treatments like callouts, alerts, pills, etc. Do not nest these treatments. Do not use these treatments inside table cells.                                                                                           |                                                                             |                                                                                                                 |
| **Lists that should be tables**                            | Any collection of items that includes more than one piece of information should be a table instead of a bulleted list.                                                                                                                                    |                                                                             |                                                                                                                 |
| **Non-descriptive links**                                  | The text of a link should describe the linked content. This is an important accessibility consideration.                                                                                                                                                  | "Report all security vulnerabilities [here](https://bughunters.google.com). | "Report all security vulnerabilities to [Google's Vulnerability Bounty Portal](https://bughunters.google.com)." |
| **Making statements relative to a specific point in time** | Docs should describe the framework as it exists _now_, never relative to a specific point in time. Docs should avoid referring to anything as "new" or "recent". Docs should avoid mentioning "upcoming" or "future" changes.                             | "Angular v18 recently introduced fallback content for ng-content."          | "The ng-content element allows you to..."                                                                       |

[active-voice]: https://developers.google.com/tech-writing/one/active-voice

## Including and referencing code in documentation

* All code examples should
  follow [our team naming practices](https://github.com/angular/angular/blob/main/contributing-docs/coding-standards.md)
* Use descriptive examples grounded in realistic scenarios
    * **Generally avoid** generic or abstract names like "Comp", "Example", "Hello world", "prop1",
      etc.
    * **Generally prefer** examples that reflect realistic scenarios for
      developers, `UserProfile`, `CustomSlider`, etc.
* Avoid pluralizing inline code blocks. You can often accomplish this by adding another noun for
  what the referenced symbol is.
    * **❌ Bad:**: "List all of your `@Injectable`s in the constructor."
    * **✅ Good**: "List all your `@Injectable` dependencies in the constructor"
* Prefer the term "error" over "exception" when talking about JavaScript code (because the JS
  object is named `Error`).
* Code examples that use buttons, inputs, links, etc. must follow accessibility best practices
    * All buttons and form controls must have labels
    * Content images must have alt text
    * Any custom UI controls should have appropriate ARIA attributes
    * Any styling should meet WCAG contrast ratio guidelines

## Content treatments and when to use them

* **Callouts**
    * Use callouts for a brief aside that offers more context on a topic that's not strictly
      necessary to understanding the main content
    * Never put multiple callouts next to each other or in proximity (such as separated
      by one a line or two of text)
    * Never put a callout inside another element, such as a card or table cell
* **Alerts**
    * Use sparingly to call attention to a very brief but relevant point
    * Never put multiple alerts next to each other or in proximity (such as separated by
      one a line or two of text)
    * Never put an alert inside another element, such as a card or table cell
* **Cards**
    * Never nest callouts or alerts inside of cards
* **Pills**
    * Use pills sparingly for a collection of related links, typically at the end of a section or
      article
