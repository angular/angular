# Updating search keywords

In documentation, being able to find the content you need is equally as important as the content itself. In [angular.io](https://angular.io/), users can discover content in several ways, including:

* Organic search results, such as through [google.com](https://google.com/)
* The left navigation bar, also known as sidenav
* Using the search box in the header

You can help improve the documentation experience by adding search keywords to a given topic. Updating search keywords can help bring users to the content they need faster.

## Before you begin

You can update search keywords for a topic even if you've never contributed to Angular before. However, you may find it helpful to have the [Contributing to Angular](https://github.com/angular/angular/blob/master/CONTRIBUTING.md) guide available if you're filing your first pull request in the repository.

## Updating search keywords

To update search keywords:

1. Navigate to the topic to which you want to update search keywords.

1. Decide what search keywords you'd like to add to the topic. For information on how to format keywords, see [Search keywords format](#format).

1. Update the `@searchKeywords` tag, either through the [GitHub user interface](guide/updating-content-github-ui) or through Angular's [standard pull request process](https://github.com/angular/angular/blob/master/CONTRIBUTING.md#submit-pr).

  If a topic does not have a `@searchKeywords` tag, you can add it to the end of the topic.

{@a format}
## Search keywords format

You add search keywords to a topic using the `@searchKeywords` tag. This tag takes a set of single words, separated by spaces. The tag and the keywords must be enclosed in curly brackets (`{...}`). For example:

<code-example>
  &#123;@searchKeywords route router routing navigation&#125;
</code-example>
