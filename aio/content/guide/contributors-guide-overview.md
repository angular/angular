# Documentation contributors guide

<!-- markdownLint-disable MD001 -->

The topics in this section describe how you can contribute to this documentation.
For information about contributing code to the Angular framework, see [Contributing to Angular][GithubAngularAngularBlobMainContributingMd].

Angular is an open source project that appreciates its community support, especially when it comes to the documentation.

You can update the Angular documentation in these ways:

*   [Make a minor change][AioGuideContributorsGuideOverviewMakeAMinorChange]
*   [Make a major change][AioGuideContributorsGuideOverviewMakeAMajorChange]

<div class="alert is-important">

**IMPORTANT**:<br />
To submit changes to the Angular documentation, you must have:

*   A [GitHub][GithubMain] account
*   A signed [Contributor License Agreement][GithubAngularAngularBlobMainContributingMdSigningTheCla]

</div>

## Make a minor change

You can make minor changes to a documentation topic without downloading any software.
Many common documentation maintenance tasks require only minor changes to a few words or characters in a topic.
Examples of minor changes include:

*   [Correcting a typo or two][AioGuideContributorGuideOverviewToMakeAMinorChangeToADocumentationTopic]
*   [Reviewing a topic and updating its review date][AioGuideReviewingContentUpdateTheLastReviewedDate]
*   [Adding or updating search keywords][AioGuideUpdatingSearchKeywords]

For more about keeping the documentation up to date, see [Common documentation maintenance tasks][AioGuideDocTasks].

To make larger changes to the documentation, you must install an Angular development environment on your local computer.
You need this environment to edit and test your changes before you submit them.
For information about configuring your local computer to make larger documentation updates, see [Preparing to edit the documentation][AioGuideDocPrepareToEdit].

<!-- markdownLint-disable MD033 -->

#### To make a minor change to a documentation topic

Perform these steps in a browser.

1.  Confirm you have a [signed Contributor License Agreement (CLA)][GoogleDeveloperClaClas] on file.
    If you don't, [sign a CLA][GithubAngularAngularBlobMainContributingMdSigningTheCla].

1.  Sign into [github.com][GithubMain], or if you don't have a GitHub account, [create a new GitHub account][GithubJoin].
1.  Navigate to the page in [angular.io][AngularMain] that you want to update.
1.  On the page that you want to update, locate this pencil icon to the right of the topic's title

    <div class="lightbox">

    <img alt="drawing of a pencil used as the topic edit icon" src="generated/images/guide/contributors-guide/edit-icon.png">

    </div>

1.  Click this icon to open the suggestion page.
1.  In the suggestion page, in **Edit file**, update the content to fix the problem.
    If the fix requires more than correcting a few characters, it might be better to treat this as a [major change][AioGuideContributorsGuideOverviewMakeAMajorChange].

1.  Click the **Preview** tab to see how your markdown changes look when rendered.
    This view shows how the markdown renders.
    It won't look exactly like the documentation page because it doesn't display the text with the styles used in the documentation.

1.  After you finish making your changes:
    1.  In **Propose changes**, enter a brief description of your changes that starts with `docs:` and is 100 characters or less in length.
        If necessary, you can add more information about the change in the larger edit window below the brief description.

    1.  Select **Create a new branch for this commit and start a pull request** and accept the default branch name.
    1.  Click **Propose changes** to open a pull request with your updated text.

After you open a pull request, the Angular team reviews your change and merges it into the documentation.
You can follow the progress of your pull request in the pull request's page.
You might receive a notification from GitHub if the Angular team has any questions about your change.

## Make a major change

Making major changes or adding new topics to the documentation follows a different workflow.
Major changes to a topic require that you build and test your changes before you send them to the Angular team.

These topics provide information about how to set up your local computer to edit, build, and test Angular documentation to make major changes to it.

*   [Overview of the Angular documentation editorial workflow][AioGuideDocUpdateOverview]

    Describes how to configure your local computer to build, edit, and test Angular documentation

*   [Documentation style guide][AioGuideDocStyleGuide]

    Describes the standards used in the Angular documentation

## Localize Angular documentation in a new language

Localizing Angular documentation is another way to contribute to Angular documentation.
For information about localizing the Angular documentation in a new language, see [Angular localization guidelines][AioGuideLocalizingAngular].

<!-- links -->

[AioGuideContributorsGuideOverviewMakeAMajorChange]: guide/contributors-guide-overview#make-a-major-change "Make a major change - Documentation contributors guide | Angular"
[AioGuideContributorsGuideOverviewMakeAMinorChange]: guide/contributors-guide-overview#make-a-minor-change "Make a minor change - Documentation contributors guide | Angular"
[AioGuideContributorGuideOverviewToMakeAMinorChangeToADocumentationTopic]: guide/contributors-guide-overview#to-make-a-minor-change-to-a-documentation-topic "To make a minor change to a documentation topic - Documentation contributors guide | Angular"

[AioGuideDocPrepareToEdit]: guide/doc-prepare-to-edit "Preparing to edit documentation | Angular"

[AioGuideDocStyleGuide]: guide/docs-style-guide "Angular documentation style guide | Angular"

[AioGuideDocTasks]: guide/doc-tasks "Common documentation maintenance tasks | Angular"

[AioGuideDocUpdateOverview]: guide/doc-update-overview "Overview of Angular documentation editing | Angular"

[AioGuideLocalizingAngular]: guide/localizing-angular "Angular documentation style guide | Angular"

[AioGuideReviewingContentUpdateTheLastReviewedDate]: guide/reviewing-content#update-the-last-reviewed-date "Update the last reviewed date - Test a documentation update | Angular"

[AioGuideUpdatingSearchKeywords]: guide/updating-search-keywords "Updating search keywords | Angular"

<!-- external links -->

[AngularMain]: https://angular.io "Angular"

[GithubAngularAngularBlobMainContributingMd]: https://github.com/angular/angular/blob/main/CONTRIBUTING.md "Contributing to Angular | angular/angular | GitHub"
[GithubAngularAngularBlobMainContributingMdSigningTheCla]: https://github.com/angular/angular/blob/main/CONTRIBUTING.md#-signing-the-cla "Signing the CLA - Contributing to Angular | angular/angular | GitHub"

[GithubMain]: https://github.com "GitHub"

[GithubJoin]: https://github.com/join "Join GitHub | GitHub"

[GoogleDeveloperClaClas]: https://cla.developers.google.com/clas "Contributor License Agreements | Google Open Source"

<!--end links -->

@reviewed 2022-12-11
