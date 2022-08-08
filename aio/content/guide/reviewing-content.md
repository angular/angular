# Reviewing documentation

You can review the Angular documentation, even if you never contributed to Angular before.

Angular developers work best when they have access to accurate and complete documentation.
Keeping existing documentation up-to-date is an essential part of ensuring that all developers have a great development experience.

This topic describes how you can help keep the Angular documentation up-to-date by reviewing and updating it.

## Before you begin

Review the [Documentation contributor guide][AioDocContributorGuide] to get ready to review to update the documentation.
The *Documentation contributor guide* describes how to prepare to update a documentation topic.

You can edit a topic in the GitHub web interface or in your favorite code editor or integrated development environment (IDE).
In either case, you want to edit in your own fork of the Angular source code repo.

To review a documentation topic, you want to be able to edit the topic.
Even if you don't find any problem, you want to update the `@reviewed` tag at the end of the topic before you finish.

## Finding topics to review

Find topic a topic that has not been reviewed in the past six months.

At the bottom of some topics, there's an `@reviewed` tag that shows the date it was last reviewed.
This is an example of such a tag taken from the bottom of a topic.

<div class="lightbox">

<img alt="Example of the last reviewed date entry showing the date the topic was reviewed as month, day, and year" src="generated/images/guide/contributors-guide/last-reviewed.png">

</div>

## Reviewing and updating a topic

To review a topic, use either the GitHub user interface or directly edit the source markdown file of the topic on your own computer.

Feel free to review any topic in which you have interest.
Experience with the subject matter is helpful, but not required to provide copy edits.

**To review and update a documentation topic:**

1.  In your web browser, navigate to the topic that you want to review.
2.  Locate the last reviewed date at the bottom of the topic. Verify that the topic has not been reviewed within the past six months.
3.  Read through the topic.
4.  If the topic requires an update, you can:
    *  [File an issue][GithubAngularAngularBlobMainContributingMdSubmitIssue] that describes the update required.
    *  Fix the issue and [create a pull request][GithubAngularAngularBlobMainContributingMdSubmitPr] with the update.
5.  If the topic is accurate and doesn't need any revision, update, or add the `@reviewed` tag followed by the date you reviewed the topic. You can do this:
    * By using the [GitHub user interface][AioGuideUpdatingContentGithubUi]
    * By editing the file on your computer and creating a [standard pull request process][GithubAngularAngularBlobMainContributingMdSubmitPr] for Angular.

<!-- links -->

[AioDocContributorGuide]: guide/contributors-guide-overview "Documentation contributors guide | Angular"

[AioGuideReviewingContentReviewCriteria]: guide/reviewing-content#review-criteria "Review criteria - Reviewing content | Angular"

[AioGuideUpdatingContentGithubUi]: guide/updating-content-github-ui "Updating topics through the GitHub user interface | Angular"

<!-- external links -->

[GithubAngularAngularBlobMainContributingMd]: https://github.com/angular/angular/blob/main/CONTRIBUTING.md "Contributing to Angular | angular/angular | Github"
[GithubAngularAngularBlobMainContributingMdSubmitIssue]: https://github.com/angular/angular/blob/main/CONTRIBUTING.md#submit-issue "Submitting an Issue - Contributing to Angular | angular/angular | GitHub"
[GithubAngularAngularBlobMainContributingMdSubmitPr]: https://github.com/angular/angular/blob/main/CONTRIBUTING.md#submit-pr "Submitting a Pull Request (PR) - Contributing to Angular | angular/angular | GitHub"

<!-- end links -->

@reviewed 2022-08-08
