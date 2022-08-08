# Documentation contributor guide

The topics in this section describe how you can contribute to this documentation.
For information about contributing only code to the Angular framework, see [Contributing to Angular][GithubAngularAngularBlobMainContributingMd].

Angular, an open source project, depends on its community, especially when it comes to the documentation.
The more the community contributes to the documentation, the better the documentation becomes.
Input from you helps both new and experienced Angular developers.

<div class="alert is-important">

You must have a GitHub account to propose a minor change or review and edit the documentation.

</div>

## Propose a minor change

You can propose minor changes to a documentation topic without downloading any software. Choose the pencil icon&nbsp;<img alt="drawing of a pencil used as the topic edit icon" src="generated/images/guide/contributors-guide/edit-icon.png" > at the top of the page, to the right of the topic title to enter your suggestion.

## Review and edit documentation topics

This section describes how to make larger contributions to the documentation.

### Before you start

The following steps set up your local computer to contribute documentation content.

1.  Sign into your account on GitHub.
    If you don't have an account on GitHub, [create a new account][GithubJoin] before you continue.
2.  In your browser, navigate to [https://github.com/angular/angular][GithubAngular].
3.  In your browser, fork the `angular/angular` repo into your GitHub account.
    1.  From [https://github.com/angular/angular][GithubAngular] in the browser, choose the **Fork** button near the top-right corner of the page.
    2.  If asked, choose to create a fork to contribute to the original project.
4.  On the computer that you want to edit, clone your fork of the `angular` repo.
5.  In the `angular/aio` directory of your cloned repo, locally build and view the documentation.
    1.  Run the following commands.
        To learn more, see [Angular documentation project][GithubAngularAngularBlobMainAioReadmeMd].

        <code-example format="shell" language="shell">

        yarn

        </code-example>

        <code-example format="shell" language="shell">

        yarn setup

        </code-example>

        <code-example format="shell" language="shell">

        yarn build

        </code-example>

        <code-example format="shell" language="shell">

        yarn start

        </code-example>

        <div class="callout is-helpful">

        **NOTE**: <br/>
        If you have any errors or issues with your yarn install, just re-run the `yarn` command.

        </div>

    2.  In your browser, navigate to [http://localhost:4200][AngularLocalhost]
    3.  Review your local build of the Angular framework documentation.

After you can see your local build of the Angular framework documentation on your own system, you are ready to review and edit it. The following sections help you with the next steps.

### Before you edit the documentation

The following steps prepare you to edit the Angular documentation successfully:

1.  Review [Contributing to Angular][GithubAngularAngularBlobMainContributingMd].
2.  Install [the documentation linter][GithubAngularAngularTreeMainAioToolsDocLinterInstallValeOnYourDevelopmentSystemReadmeMd].

### Ways to contribute to Angular documentation

<div class="card-container">
  <a href="guide/reviewing-content" class="docs-card" title="Reviewing content">
    <section>Review content</section>
    <p>Keep Angular content up-to-date by reviewing topics for accuracy.</p>
    <p class="card-footer">Help keep content up to date</p>
  </a>
  <a href="guide/updating-search-keywords" class="docs-card" title="Updating search keywords">
    <section>Update search keywords</section>
    <p>Help Angular developers by improving the search keywords for existing topics.</p>
    <p class="card-footer">Improve documentation search</p>
  </a>
  <a href="guide/updating-content-github-ui" class="docs-card" title="Updating content through GitHub">
    <section>Update content through GitHub</section>
    <p>Learn how to make documentation changes through the GitHub UI.</p>
    <p class="card-footer">Contribute to Angular in your browser</p>
  </a>
</div>

### More resources for contributing to documentation

<div class="card-container">
  <a href="guide/docs-style-guide" class="docs-card" title="Documentation Style Guide">
    <section>Documentation style guide</section>
    <p>Review the syntax and styles used within the Angular documentation set.</p>
    <p class="card-footer">Get to know the writing style</p>
  </a>
  <a href="guide/localizing-angular" class="docs-card" title="Angular localization guidelines">
    <section>Angular localization guidelines</section>
    <p>Learn about the guidelines for localizing Angular documentation.</p>
    <p class="card-footer">Localize documentation</p>
  </a>
</div>

<!-- links -->

<!-- external links -->

[GithubJoin]: https://github.com/join "Join GitHub | GitHub"

[GithubAngular]: https://github.com/angular/angular "angular/angular | GitHub"

[GithubAngularAngularBlobMainAioReadmeMd]: https://github.com/angular/angular/blob/main/aio/README.md "Angular documentation project (https://angular.io) | angular/angular | Github"

[GithubAngularAngularBlobMainContributingMd]: https://github.com/angular/angular/blob/main/CONTRIBUTING.md "Contributing to Angular | angular/angular | Github"

[GithubAngularAngularTreeMainAioToolsDocLinterInstallValeOnYourDevelopmentSystemReadmeMd]: https://github.com/angular/angular/tree/main/aio/tools/doc-linter/README.md#install-vale-on-your-development-system "Install Vale on your development system - Angular documentation lint tool | angular/angular | Github"

[AngularLocalhost]: http://localhost:4200 "Angular.io on localhost"

<!--end links -->

@reviewed 2022-08-08
