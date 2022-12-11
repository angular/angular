# Update search keywords

You can help readers find the topics in the Angular documentation by adding keywords to a topic.
Keywords help readers find topics by relating alternate terms and related concepts to a topic.

In [angular.io](https://angular.io), readers search for content by using:

*   External search, such as by using [google.com](https://google.com)
*   The search box at the top of each page

Each of these methods can be made more effective by adding relevant keywords to the topics.

## To update search keywords in a topic

Perform these steps in a browser.

1.  Navigate to the topic to which you want to add or update search keywords.
1.  Decide what search keywords you'd like to add to the topic.<br />Keywords should be words that relate to the topic and are not found in the topic headings.
1.  Open the topic's **Edit file** page to [make a minor change](guide/contributors-guide-overview#to-make-a-minor-change-to-a-documentation-topic).
1.  Add or update the `@searchKeywords` tag at the end of the topic with your keywords. The `@searchKeywords` tag takes a set of single-word keywords that are separated by spaces. The tag and the keywords must be enclosed in curly brackets. A sample tag is shown here to add these keywords to a page: *route*, *router*, *routing*, and *navigation*.

    <code-example>

    &lcub;&commat;searchKeywords route router routing navigation&rcub;

    </code-example>

1.  [Update or add the `@reviewed` entry](guide/reviewing-content#update-the-last-reviewed-date) at the end of the topic's source code.
1.  Propose your changes as described in [make a minor change](guide/contributors-guide-overview#to-make-a-minor-change-to-a-documentation-topic).

<!-- links -->

<!-- external links -->

<!-- end links -->

@reviewed 2022-12-11
