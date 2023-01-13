# Resolve documentation linter messages

This topic describes different ways to resolve common messages that the documentation linter produces.

## Anatomy of a documentation linter message

This is an example of a message produced by the documentation linter.

<div class="lightbox">

<img alt="sample of a lint message" src="generated/images/guide/docs-lint-errors/sample-lint-error.png">

</div>

A documentation linter message contains these elements.
Starting from the top line:

<!-- vale Angular.Angular_Spelling = NO -->
<!-- vale Angular.Google_Spacing = NO -->
<!-- vale Angular.Google_We = NO -->

*   The severity.
    One of these icons indicates the severity of the message:

    *   **Error** \(A red `x` in a circle\)
        Errors must be corrected before the file can be merged.

        <div class="lightbox">

        <img alt="documentation style error icon" src="generated/images/guide/docs-lint-errors/lint-error-icon.png">

        </div>

    *   **Warning** \(A yellow exclamation mark in a triangle\)
        Warnings should be corrected before the file is merged.

        <div class="lightbox">

        <img alt="documentation style warning icon" src="generated/images/guide/docs-lint-errors/lint-warn-icon.png">

        </div>

    *   **Info** \(A blue lower-case `i` in a circle\)
        Informational messages should be corrected before the file is merged.

        <div class="lightbox">

        <img alt="documentation style info icon" src="generated/images/guide/docs-lint-errors/lint-info-icon.png">

        </div>

*   The style rule message.
    The style rule message in this example is:

    <code-example language="none" hideCopy>

    Did you really mean 'sdfdsfsdfdfssd'? It wasn't found in our dictionary.

    </code-example>

*   The style reference.
    Some references are linked to a style guide topic that explains the rule.
    The style reference in this example is:

    <code-example language="none" hideCopy>

    Vale(Angular.Angular_Spelling)

    </code-example>

*   The location of the problem text in the document identified by source line and column as precisely as possible.
    Some messages might not have the exact location of the text that triggered the message.
    The location in this example is:

    <code-example language="none" hideCopy>

    [Ln 8, Col 1]

    </code-example>

*   The style test definition file that produced the message, which is linked to the file.
    The style test definition in this example is:

    <code-example language="none" hideCopy>

    Angular_Spelling.yml[Ln 1, Col 1]: View rule

    </code-example>

<!-- vale Angular.Google_We = YES -->
<!-- vale Angular.Google_Spacing = YES -->
<!-- vale Angular.Angular_Spelling = YES -->

## Strategies to improve your documentation

These tips can help you improve your documentation and remove documentation linter messages.

### Refer to the style guides

The lint tool tests against the styles found in these style guides.
Most style tests include links to relevant sections in these documents for more information.

*   [Angular documentation style guide][AioGuideDocsStyleGuide]
*   [Google Developer Documentation Style Guide][GoogleDevelopersStyle]

<div class="alert is-helpful">

Not every style mentioned in the style guides has a test.
Style guides and the style tests can change.

</div>

### Split up long sentences

Generally, shorter sentences are easier to read than longer ones.
Long sentences can occur when you try to say too much at once.
Long sentences, as well as the use of parentheses, semicolons, or words identified as `too-wordy`, generally require rethinking and rewriting.

Consider restructuring a long sentence to break its individual ideas into distinct sentences or bullet points.

### Use lists and tables

Sentences that contain comma-separated lists might be clearer if presented as a bulleted-list or table.

Consider changing a comma-separated list of items in a sentence to a list of bullets to make those list items easier to read.

### Use more common words

Shorter, more common words are generally easier to read than longer ones.
This does not mean you need to write down to the audience.
Technical docs should still be precise.
Angular docs are read by many people around the world and should use language that the most people can understand.

If you think a specific term is required even though it has been flagged as uncommon, try to include a short explanation of the term.
Also, try adding some context around its first mention.

Linking a term to another section or topic is also an option, but consider the disruption that causes to the reader before you use it.
If you force a reader to go to another page for a definition, they might lose their concentration on the current topic and their primary goal.

### Use fewer words

If you can remove a word and not lose the meaning of the sentence, leave it out.

One common place where removing words can help is in a list of examples with more than two or three items.
Before you place the items in a bullet list, consider if only one of the items can convey the desired meaning.
Another option might be to replace a list of items with a single term that describes all the elements in your list.

## More about specific documentation linter messages

Most documentation linter messages are self-explanatory and include a link to supplementary documentation.
Some messages identify areas in that the documentation might need more thought.
The following types of messages often occur in areas of the text that should be reconsidered and rewritten to improve the text and remove the message.

### A word is `too-wordy` or should be replaced by another

Generally, technical documentation should use a simple and consistent vocabulary to be understood by a wide audience.
Words that trigger this message are usually words for which there's a simpler way to convey the same thought.

<!-- vale Angular.Google_Spacing = NO -->
<!-- vale Angular.Google_Headings = NO -->
<!-- vale Angular.Google_Ellipses = NO -->
<!-- vale Angular.WriteGood_TooWordy = NO -->

<!-- markdownlint-disable-file MD026 -->

#### Angular.WriteGood_TooWordy - See if you can rewrite the sentence...

<!-- vale Angular.WriteGood_TooWordy = YES -->
<!-- vale Angular.Google_Ellipses = YES -->
<!-- vale Angular.Google_Headings = YES -->
<!-- vale Angular.Google_Spacing = YES -->

Words identified by this style test can usually be replaced by simpler words.
If not, sentences with these words should be revised to use simpler language and avoid the word in the message.

The following table has some common words detected by this type of message and simpler words to try in their place.

<!-- vale Angular.WriteGood_TooWordy = NO -->

| `Too-wordy` word     | Simpler replacement |
|:--                   |:--                  |
| `accelerate`         | `speed up`            |
| `accomplish`         | `perform` or `finish` |
| `acquire`            | `get`                 |
| `additional`         | `more`                |
| `adjustment`         | `change`              |
| `advantageous`       | `beneficial`          |
| `consequently`       | `as a result`         |
| `designate`          | `assign`              |
| `equivalent`         | `the same`            |
| `exclusively`        | `only`                |
| `for the most part`  | `generally`           |
| `have a tendency to` | `tend to`             |
| `in addition`        | `furthermore`         |
| `modify`             | `change` or `update`  |
| `monitor`            | `observe`             |
| `necessitate`        | `require`             |
| `one particular`     | `one`                 |
| `point in time`      | `moment`              |
| `portion`            | `part`                |
| `similar to`         | `like`                |
| `validate`           | `verify`              |
| `whether or not`     | `whether`             |

<!-- vale Angular.WriteGood_TooWordy = YES -->

<!-- vale Angular.Google_Headings = NO -->

#### `WordList` messages

<!-- vale Angular.Google_Headings = YES -->

The messages about words detected by these style tests generally suggest a better alternative.
While the word you used would probably be understood, it most likely triggered this message for one of the following reasons:

*   The suggested works better in a screen-reader context
*   The word that you used could produce an unpleasant response in the reader
*   The suggested word is simpler, shorter, or easier for more people to understand
*   The word you used has other possible variations.
    The suggested word is the variation to use in the documentation to be consistent.

<!-- vale Angular.Angular_Spelling = NO -->

### `Proselint` messages

The Proselint style tests test for words that are jargon or that could be offensive to some people.

<!-- vale Angular.Angular_Spelling = YES -->

Rewrite the text to replace the jargon or offensive language with more inclusive language.

### `Starting a sentence` messages

Some words, such as *so* and *there is/are*, aren't necessary at the beginning of a sentence.
Sentences that start with the words identified by this message can usually be made shorter, simpler, and clearer by rewriting them without those openings.

### Cliches

Cliches should be replaced by more literal text.

Cliches make it difficult for people who don't understand English to understand the documentation.
When cliches are translated by online tools such as Google Translate, they can produce confusing results.

## If all else fails

The style rules generally guide you in the direction of clearer content, but sometimes you might need to break the rules.
If you decide that the best choice for the text conflicts with the linter, mark the text as an exception to linting.

The documentation linter checks only the content that is rendered as text.
It does not test code-formatted text.
One common source of false problems is code references that are not formatted as code.

If you use these exceptions, please limit the amount of text that you exclude from analysis to the fewest lines possible.

When necessary, you can apply these exceptions to your content.

1.  **General exception**

    A general exception allows you to exclude the specified text from all lint testing.

    To apply a general exception, surround the text that you do not want the linter to test with the HTML
    `comment` elements shown in this example.

    <code-example format="html" language="html">

    &lt;!-- vale off --&gt;

    Text the linter does not check for any style problem.

    &lt;!-- vale on --&gt;

    </code-example>

    Be sure to leave a blank line before and after each comment.

1.  **Style exception**

    A style exception allows you to exclude text from an individual style test.

    To apply a style exception, surround the text that you do not want the linter to test with these HTML
    `comment` elements.
    Between these comments, the linter ignores the style test in the comment, but
    still tests for all other styles that are in use.

    <code-example format="html" language="html">

    &lt;!-- vale Style.Rule = NO --&gt;
    &lt;!-- vale Style.Rule = YES --&gt;

    </code-example>

    Replace `Style.Rule` in the comments with the style rule reference from the problem message displayed in the IDE.
    For example, imagine that you got this problem message and you want to use the word it identified as a problem.

    <code-example format="html" language="html">

    Did you really mean 'inlines'?  It was not found in our dictionary. Vale(Angular.Angular_Spelling) [Ln 24, Col 59]
    Angular_Spelling.yml[Ln 1, Col 1]: View rule

    </code-example>

    The `Style.Rule` for this message is the text inside the parentheses: `Angular.Angular_Spelling` in this case.
    To turn off that style test, use the comments shown in this example.

    <code-example format="html" language="html">

    &lt;!-- vale Angular.Angular_Spelling = NO --&gt;

    'inlines' does not display a problem because this text is not spell-checked.
    Remember that the linter does not check any spelling in this block of text.
    The linter continues to test all other style rules.

    &lt;!-- vale Angular.Angular_Spelling = YES --&gt;

    </code-example>

<!-- links -->

[AioGuideDocsStyleGuide]: https://angular.io/guide/docs-style-guide "Angular documentation style guide | Angular"

<!-- external links -->

[GoogleDevelopersStyle]: https://developers.google.com/style "About this guide | Google developer documentation style guide | Google Developers"

<!-- end links -->

@reviewed 2022-10-12
