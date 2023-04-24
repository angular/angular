# Review documentation

You can review the Angular documentation, even if you have never contributed to Angular before.
Reviewing the Angular documentation provides a valuable contribution to the community.

Finding and reporting issues in the documentation helps the community know that the content is up to date.
Even if you don't find any problems, seeing that a document has been reviewed recently, gives readers confidence in the content.

This topic describes how you can review and update the Angular documentation to help keep it up to date.

<!-- markdownLint-disable MD001 -->
<!-- markdownLint-disable MD033 -->

#### To review a topic in angular.io

Perform these steps in a browser.

1.  [Find a topic to review](#find-topics-to-review) by:
    1.  Finding a topic with a **Last reviewed** date that is six months or more in the past.
    1.  Finding a topic that has no **Last reviewed** date.
    1.  Finding a topic that you've read recently.
1.  Review the topic for errors or inaccuracies.
1.  Complete the review.
    1.  If the topic looks good:
        1.  [Update or add the `@reviewed` entry](#update-the-last-reviewed-date) at the end of the topic's source code.
        1.  [Make a minor change to a documentation topic](/guide/contributors-guide-overview#to-make-a-minor-change-to-a-documentation-topic) to publish the new reviewed date.

    1.  If you find an error that you don't feel comfortable fixing:
        1.  [Open a docs issue in GitHub](https://github.com/angular/angular/issues/new?assignees=&labels=&template=3-docs-bug.yaml).
        1.  [Update or add the `@reviewed` entry](#update-the-last-reviewed-date) at the end of the topic's source code.
        1.  [Make a minor change to a documentation topic](/guide/contributors-guide-overview#to-make-a-minor-change-to-a-documentation-topic) to publish the new reviewed date.

    1.  If you find an error that needs only a minor change:
        1.  [Update or add the `@reviewed` entry](#update-the-last-reviewed-date) at the end of the topic's source code.
        1.  [Make a minor change to a documentation topic](/guide/contributors-guide-overview#to-make-a-minor-change-to-a-documentation-topic) to fix the error and save the new reviewed date.

    1.  If you find an error that needs major changes:
        1.  Address the error:
            1.  [Make a major change](guide/contributors-guide-overview#make-a-major-change), if you're comfortable, or
            1.  [Open a docs issue in GitHub](https://github.com/angular/angular/issues/new?assignees=&labels=&template=3-docs-bug.yaml).
        1.  Whether you fix the error or open a new issue, [update or add the `@reviewed` entry](#update-the-last-reviewed-date) at the end of the topic's source code.
        1.  [Make a minor change to a documentation topic](/guide/contributors-guide-overview#to-make-a-minor-change-to-a-documentation-topic) to save the new reviewed date.

## Find topics to review

You can review any topic in the Angular documentation, but these are the topics that benefit most from your review.

### Topics that have not been reviewed in over six months

At the bottom of some topics, there's a date that shows when the topic was last reviewed.
If that date is over six months ago, the topic is ready for a review.

This is an example of a **Last reviewed** date from the bottom of a topic.
You can also see an example of this at the end of this topic.

<div class="lightbox">

<img alt="Example of the last reviewed date entry showing the date the topic was reviewed as month, day, and year" src="generated/images/guide/contributors-guide/last-reviewed.png">

</div>

### Topics that have never been reviewed

If a topic doesn't have a **Last reviewed** date at the bottom, it has never been reviewed.
You can review such a topic and add a new **Last reviewed** date after you review it.

### Topics that you know have a problem

If you know of a topic that has an error or inaccuracy, you can review it and make corrections during your review. If you don't feel comfortable fixing an error during your review, [open a docs issue in GitHub](https://github.com/angular/angular/issues/new?assignees=&labels=&template=3-docs-bug.yaml).
Be sure to add or update the **Last reviewed** date after you review the topic. Whether you fix the error or just open an issue, you still reviewed the topic.

## Update the last reviewed date

After you review a topic, whether you change it or not, update the topic's **Last reviewed** date.
The **Last reviewed** text at the bottom of the topic is created by the `@reviewed` tag followed by the date you reviewed the topic.

This is an example of an `@reviewed` tag at the end of the topic's source code as it appears in a code editor.

<code-example>

@reviewed 2022-09-08

</code-example>

The date is formatted as `YYYY-MM-DD` where:

* `YYYY` is the current year
* `MM` is the two-digit number of the current month with a leading zero if the month is 01 (January) through 09 (September)
* `DD` is the two-digit number of the current day of the month with a leading zero if the day is 01-09.

For example:

| Review date | `@reviewed` tag | Resulting text displayed in the docs
|:--- |:--- |:---
| January 12, 2023 | `@reviewed 2023-01-12` | *Last reviewed on Thu Jan 12, 2023*
| November 3, 2022 | `@reviewed 2022-11-03` | *Last reviewed on Fri Nov 03, 2022*

## Reviewing and updating a topic

These are the actions you can take after you review a topic.

### The topic is accurate and has no errors

If the topic is accurate and has no errors, [make a minor change](/guide/contributors-guide-overview#to-make-a-minor-change-to-a-documentation-topic) to [update the **Last reviewed** date](#update-the-last-reviewed-date) at the bottom of the page. You can use the GitHub user interface to edit the topic's source code.

### The topic requires minor changes

If the topic has minor errors, you can fix them when you [make a minor change](/guide/contributors-guide-overview#to-make-a-minor-change-to-a-documentation-topic). Remember to [update the **Last reviewed** date](#update-the-last-reviewed-date) at the bottom of the page when you fix the error. For a minor change, you can use the GitHub user interface in a browser to edit the topic's source code.

### The topic requires major changes

If the topic requires major changes, you can [make a major change](guide/contributors-guide-overview#make-a-major-change), or [open a docs issue in GitHub](https://github.com/angular/angular/issues/new?assignees=&labels=&template=3-docs-bug.yaml). You shouldn't make major changes in the GitHub user interface because it doesn't allow you to test them before you submit them.

Whether you make the changes the topic needs or open a docs issue, you should still [update the **Last reviewed** date](#update-the-last-reviewed-date). You can use the GitHub user interface in the browser if you only want to update the **Last reviewed** date.

<!-- links -->

<!-- external links -->

<!-- end links -->

@reviewed 2022-12-11
