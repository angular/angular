# Documentation contributors guide

The topics in this section describe how you can contribute to this documentation.
For information about contributing code to the Angular framework, see [Contributing to Angular][GithubAngularAngularBlobMainContributingMd].

Angular is an open source project that appreciates its community support, especially when it comes to the documentation.

You can update the Angular documentation in these ways:

* [Make a minor change][LocalMakeAMinorChange]
* [Make a major change][LocalMakeAMajorChange]

<div class="alert is-important">

To submit changes to the Angular documentation, you must have:

* A [GitHub][GithubHome] account
* A signed [Contributor License Agreement][GithubAngularAngularContributeCla]

</div>

## Make a minor change

You can make minor changes to a documentation topic without downloading any software.
Many common documentation maintenance tasks require only minor changes to a few words or characters in a topic.
Examples of minor changes include:

* [Correcting a typo or two][LocalMakeAMinorChangeProc]
* [Reviewing a topic and updating its review date][UpdateLastReviewedDate]
* [Adding or updating search keywords][UpdateSearchKeywords]

For more about keeping the documentation up to date, see [Common documentation maintenance tasks][CommonDocTasks].

To make larger changes to the documentation, you must install an Angular development environment on your local computer. You need this environment to edit and test your changes before you submit them. For information about configuring your local computer to make larger documentation updates, see [Preparing to edit the documentation][PrepreToEditDocs].

### To make a minor change to a documentation topic

Perform these steps in a browser.

1. Confirm you have [a signed Contributor License Agreement (CLA)][GoogleClaList] on file. If you don't, [sign a CLA][GithubAngularAngularContributeCla].
2. Log in to [github.com][GithubHome], or if you don't have a GitHub account, [create a new GitHub account][GithubJoin].
3. Navigate to the page in [angular.io][ExtAngularIo] that you want to update.
4. On the page that you want to update,  locate the pencil icon at the top of the page, after the topic's title
5. <img alt="drawing of a pencil used as the topic edit icon" src="generated/images/guide/contributors-guide/edit-icon.png"> Click this icon to open the suggestion page.
6. In the suggestion page, in **Edit file**, update the content to fix the problem. If the fix requires more than correcting a few characters, it might be better to treat this as a [major change][LocalMakeAMajorChange].
7. Click the **Preview** tab to see how your markdown changes look when rendered. Note that this view shows how the markdown renders. It doesn't render the changes with all the styles used in the documentation.
8. After you finish making your changes:
    1. In **Propose changes**, enter a brief description of your changes. The description must start with `docs:` and be 100 characters or less in length. If necessary, you can add more information about the change in the larger edit window below the brief description.
    2. Select **Create a new branch for this commit and start a pull request** and accept the default branch name.
    3. Click **Propose changes** to open a pull request with your updated text.

After you open a pull request, the Angular team reviews your change and merges it into the documentation.
You can follow the progress of your pull request in the pull request's page. You might receive a notification from GitHub if the Angular team has any questions about your change.

## Make a major change

Making major changes or adding new topics to the documentation follows a different workflow. Major changes to a topic require that you build and test your changes before you send them to the Angular team.

These resources provide information about how to set up your local computer to edit, build, and test Angular documentation to make major changes to it.

* [Overview of Angular documentation][DocUpdateOverview]<br />Describes how to configure your local computer to build, edit, and test Angular documentation
* [Documentation style guide][DocStyleGuide]<br />Describes the standards used in the Angular documentation

## Localize Angular documentation in a new language

Localizing Angular documentation is another way to contribute to Angular documentation.
For information about localizing the Angular documentation in a new language, see [Angular localization guidelines][LocAngularDocs].

<!-- links -->

[CommonDocTasks]: guide/doc-tasks "Common documentation maintenance tasks"

[DocStyleGuide]: guide/docs-style-guide "Angular documentation style guide"

[DocUpdateOverview]: guide/doc-update-overview "Overview of Angular documentation editing"

[LocalMakeAMajorChange]: #make-a-major-change "Make a major change"

[LocalMakeAMinorChange]: #make-a-minor-change "Make a minor change"

[LocalMakeAMinorChangeProc]: #to-make-a-minor-change-to-a-documentation-topic "To make a minor change to a documentation topic"

[LocAngularDocs]: guide/localizing-angular "Angular documentation style guide"

[PrepreToEditDocs]: guide/doc-prepare-to-edit "Preparing to edit documentation"

[UpdateLastReviewedDate]: guide/reviewing-content#update-the-last-reviewed-date "Update the last reviewed date"

[UpdateSearchKeywords]: guide/updating-search-keywords "Update search keywords"

<!-- external links -->

[ExtAngularIo]: https://angular.io "Angular"

[GithubAngularAngularContributeCla]: https://github.com/angular/angular/blob/main/CONTRIBUTING.md#-signing-the-cla "Signing the Contributor License Agreement"

[GithubAngularAngularBlobMainContributingMd]: https://github.com/angular/angular/blob/main/CONTRIBUTING.md "Contributing to Angular | angular/angular | Github"

[GithubHome]: https://github.com "GitHub | GitHub"

[GithubJoin]: https://github.com/join "Join GitHub | GitHub"

[GoogleClaList]: https://cla.developers.google.com/clas "Contributor License Agreements"

<!--end links -->

@reviewed 2022-09-30
