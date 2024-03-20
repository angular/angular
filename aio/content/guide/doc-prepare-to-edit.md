# Prepare to edit Angular documentation

This topic describes the steps that prepare your local computer to edit and submit Angular documentation.

<div class="alert is-important">

**IMPORTANT**: <br />
To submit changes to the Angular documentation, you must have:

*   A [GitHub][GithubMain] account
*   A signed [Contributor License Agreement][GithubAngularAngularBlobMainContributingSigningTheCla]

</div>

## Complete a contributor's license agreement

Review [Contributing to Angular](https://github.com/angular/angular/blob/main/CONTRIBUTING.md).
These sections are particularly important for documentation contributions:

1.  Read the Angular [Code of conduct](https://github.com/angular/code-of-conduct/blob/main/CODE_OF_CONDUCT.md)
1.  Read the [Submission guidelines](https://github.com/angular/angular/blob/main/CONTRIBUTING.md#-submission-guidelines).

    <div class="alert is-helpful">

    **NOTE**: <br />
    The topics in this section explain these guidelines specifically for documentation contributions.

    </div>

1.  Read and complete the [Contributor license agreement](https://github.com/angular/angular/blob/main/CONTRIBUTING.md#-signing-the-cla) that applies to you.

## Install the required software

To edit, build, and test Angular documentation on your local computer, you need the following software.
The instructions in this section assume that you are using the software in this list to complete the tasks.

Some software in this list, such as the integrated development environment \(IDE\), can be substituted with similar software.
If you use a substitute IDE, you might need to adapt the instructions in this section to your IDE.

For more information about the required software, see [Setting up the local environment and workspace](guide/setup-local).

*   **Version control software**
    *   [Git command line](https://github.com/git-guides/install-git)
    *   [GitHub desktop](https://desktop.github.com) \(optional\)
*   **Integrated development environment**
    *   [Visual Studio Code](https://code.visualstudio.com)
*   **Utility software**
    *   [node.js](https://nodejs.org/en/download)

        Angular requires an [active long-term-support (LTS) or maintenance LTS version](https://nodejs.org/about/releases) of Node.js.

    *   [nvm](https://github.com/nvm-sh/nvm#about)
    *   [Yarn](https://yarnpkg.com/getting-started/install)
    *   [Homebrew](https://brew.sh) for macOS or [Chocolatey](https://chocolatey.org/install) for Windows
    *   [Vale][GithubAngularAngularTreeMainAioToolsDocLinterInstallValeOnYourDevelopmentSystemReadmeMd] \(see note\)

<div class="alert is-important">

**IMPORTANT**: <br />
Wait until after you clone your fork of the [`https://github.com/angular/angular`][GithubAngularAngular] repo to your local computer before you configure Vale settings.

</div>

You can also install other tools and IDE extensions that you find helpful.

## Set up your workspaces

The Angular documentation is stored with the Angular framework code in a GitHub source code repository, also called a *repo*, at:
[https://github.com/angular/angular](https://github.com/angular/angular).
To contribute documentation to Angular, you need:

*   A GitHub account

*   A *fork* of the Angular repo in your personal GitHub account.

    This guide refers to your personal GitHub account as `personal`.
    You must replace `personal` in a GitHub reference with your GitHub username.
    The URL:
    `https://github.com/personal` is not a valid GitHub account.
    For convenience, this documentation uses these shorthand references:
    *   `angular/angular`

        Refers to the Angular repo.
        This is also known as the *upstream* repo.

    *   `personal/angular`

        Refers to your personal fork of the Angular repo.
        Replace `personal` with your GitHub username to identify your specific repo.
        This is also known as the *origin* repo.

*   A *clone* of your `personal/angular` repo on your local computer

GitHub repos are cloned into a `git` workspace on your local computer.
With this workspace and required tools, you can build, edit, and review the documentation from your local computer.

When you can build the documentation from a workspace on your local computer, you are ready to make major changes to the Angular documentation.

For more detailed information about how to set up your workspace, see [Create your repo and workspaces for Angular documentation](#create-your-repo-and-workspace-for-angular-documentation).

For more detailed information about how to build and test the documentation from your local computer, see [Build and test the Angular documentation](#build-and-test-the-angular-documentation).

## Create your repo and workspace for Angular documentation

This section describes how to create the repo and the `git` workspace necessary to edit, test, and submit changes to the Angular documentation.

<div class="alert is-important">

**IMPORTANT**: <br />
Because `git` commands are not beginner friendly, the topics in this section include procedures that should reduce the chance of `git` mishaps.
Fortunately, because you are working in your own account, even if you make a mistake, you can't harm any of the Angular code or documentation.

To follow the procedures in these topics, you must use the repo and directory configuration presented in this topic.
The procedures in these topics are designed to work with this configuration.

If you use a different configuration, the procedures in these topics might not work as expected and you could lose some of your changes.

</div>

The code and documentation for the Angular framework are stored in a public repository, or repo, on [github.com](https://github.com) in the `angular` account.
The path to the Angular repo is [https://github.com/angular/angular](https://github.com/angular/angular), hence the abbreviated name, `angular/angular`.

[GitHub](https://github.com) is a cloud service that hosts many accounts and repositories.
You can imagine the `angular/angular` repo in GitHub as shown in this image.

<div class="lightbox">

<!-- Image source is found in angular/aio/src/assets/images/doc-contribute-images.sketch, in the sketch page that matches this topic's filename -->
<img alt="An image of the angular/angular repo in the github.com cloud service" src="generated/images/guide/doc-prepare-to-edit/github-angular-cloud.png">

</div>

### Fork the `angular/angular` repo to your account

As a public repo, `angular/angular` is available for anyone to read and copy, but not to change.
While only specific accounts have permission to make changes to `angular/angular`, anyone with a GitHub account can request a change to it.
Change requests to `angular/angular` are called *pull requests*.
A pull request is created by one account to ask another account to pull in a change.

Before you can open a pull request, you need a forked copy of `angular/angular` in your personal GitHub account.

To get a forked copy of `angular/angular`, you fork the `angular/angular` repo into your personal GitHub account and end up with the repos shown in the following image.
From the perspective of `personal/angular`, `angular/angular` is the upstream repo and `personal/angular` is the origin repo.

<div class="lightbox">

<!-- Image source is found in angular/aio/src/assets/images/doc-contribute-images.sketch, in the sketch page that matches this topic's filename -->
<img alt="An image of the angular/angular repo in the github.com cloud service that was forked to a personal account" src="generated/images/guide/doc-prepare-to-edit/github-personal-cloud.png">

</div>

#### To fork the angular repo to your account

Perform this procedure in a browser.

1.  Sign into your [GitHub](https://github.com) account.
    If you don't have a GitHub account, [create a new account][GithubJoin] before you continue.

1.  Navigate to [`https://github.com/angular/angular`][GithubAngularAngular].

1.  In [`https://github.com/angular/angular`][GithubAngularAngular], click the **Fork** button near the top-right corner of the page.
    This image is from the top of the [`https://github.com/angular/angular`][GithubAngularAngular] page and shows the **Fork** button.

    <div class="lightbox">

    <img alt="An image of the angular/angular website in github.com that identifies the fork button" src="generated/images/guide/doc-prepare-to-edit/angular-angular-github.png">

    </div>

1.  In **Create a new fork**:
    1.  Accept the default values in **Owner** and **Repository name**.
    1.  Confirm that **Copy the `main` branch only** is checked.
    1.  Click **Create repository**.
        The forking process can take a few minutes.

1.  You now have a copy of the `angular/angular` repo in your GitHub account.

After your fork of `angular/angular` is ready, your browser opens the web page of the forked repo in your GitHub account.
In this image, notice that the account now shows the username of your personal GitHub account instead of the `angular` account.

<div class="lightbox">

<!-- Image source is found in angular/aio/src/assets/images/doc-contribute-images.sketch, in the sketch page that matches this topic's filename -->
<img alt="An image of the personal/angular website in github.com that identifies the fork forked repo" src="generated/images/guide/doc-prepare-to-edit/personal-angular-github.png">

</div>

As a forked repo, your new repo maintains a reference to `angular/angular`.
From your account, `git` considers your `personal/angular` repo as the origin repo and `angular/angular` as the upstream repo.
You can think of this as: your changes originate in the *origin* repo and you send them *upstream* to the `angular/angular` repo.
The message below the repo name in your account, `forked from angular/angular`, contains a link back to the upstream repo.

This relationship comes into play later, such as when you update your `personal/angular` repo and when you open a pull request.

### Create a git workspace on your local computer

A `git` workspace on your local computer is where copies of GitHub repos in the cloud are stored on your local computer. To edit Angular documentation on your local computer, you need a clone of your origin repo, `personal/angular`.

Clone the `personal/angular` repo into the subdirectory for your account, as this illustration shows.
Remember to replace `personal` with your GitHub username.
The `personal/angular` directory in your workspace becomes your `working` directory.
You do your editing in the working directory of your `personal/angular` repo.

<div class="lightbox">

<!-- Image source is found in angular/aio/src/assets/images/doc-contribute-images.sketch, in the sketch page that matches this topic's filename -->
<img alt="An image of the angular repo from the angular and personal accounts in the github.com cloud service as they are cloned into local computer workspaces" src="generated/images/guide/doc-prepare-to-edit/github-clone-img.png">

</div>

Cloning a repo duplicates the repo that's in the cloud on your local computer.
There are procedures to keep the clone on your local computer in sync with the repo in the cloud that are described later.

#### To clone the Angular repo into your workspace

Perform these steps in a command-line tool on your local computer.

1.  Navigate to the `workspace` directory.
    In this example, this is the directory named, `github-projects`.

    <div class="lightbox">

    <!-- Image source is found in angular/aio/src/assets/images/doc-contribute-images.sketch, in the sketch page that matches this topic's filename -->
    <img alt="An image of the project directory on a local computer" src="generated/images/guide/doc-prepare-to-edit/pc-directory-start-img.png">

    </div>

    If this directory isn't on your local computer, create it, and then navigate to it before you continue.

1.  From the workspace directory, run this command to create a directory for the repo from your `personal` account
    Remember to replace `personal` with your GitHub username.

    <code-example format="shell" language="shell">

    mkdir personal

    </code-example>

1.  From the workspace directory, run this command to clone the origin `personal/angular` repo into the `personal` account directory.
    Remember to replace `personal` with your GitHub username.

    <!-- markdownLint-disable MD034 -->

    <code-example format="shell" language="shell">

    git clone https://github.com/personal/angular personal/angular

    </code-example>

    <!-- markdownLint-enable MD034 -->

Your local computer is now configured as shown in the following illustration.

<a id="doc-working-directory"></a>

Your `working` directory is the `personal/angular` directory in your `git` workspace directory.
This directory and its subdirectories have the files that you edit to fix documentation issues.

<div class="lightbox">

<!-- Image source is found in angular/aio/src/assets/images/doc-contribute-images.sketch, in the sketch page that matches this topic's filename -->
<img alt="An image of the working directories on a local computer" src="generated/images/guide/doc-prepare-to-edit/pc-directory-config-img.png">

</div>

### Complete the software installation

After you clone the origin repo on your local computer, run these commands from a command-line tool:

1.  Install the npm modules used by the Angular project.
    In a command line tool on your local computer:

    1.  Navigate to your `git` workspace.
        In this example, this is the `github-projects` directory.

    1.  In your `git` workspace, run this command to navigate to the documentation root directory in your clone of the `personal/angular` repo.
        Remember to replace `personal` with your GitHub username.

        <code-example format="shell" language="shell">

        cd personal/angular

        </code-example>

    1.  Run this command to install the Angular dependencies.

        <code-example format="shell" language="shell">

        yarn

        </code-example>

    1.  Run this command to navigate to the documentation project.

        <code-example format="shell" language="shell">

        cd aio

        </code-example>

    1.  Run this command to install the npm modules for the documentation.

        <code-example format="shell" language="shell">

        yarn

        </code-example>

1.  Locate `angular/aio/tools/doc-linter/vale.ini` in your working directory to use in the next step as the path to the configuration file in the  **Vale:Config** setting.

1.  [Install Vale][GithubAngularAngularTreeMainAioToolsDocLinterInstallValeOnYourDevelopmentSystemReadmeMd] to complete the software installation.

## Build and test the Angular documentation

Angular provides tools to build and test the documentation.
To review your work and before you submit your updates in a pull request, be sure to build, test, and verify your changes using these tools.

<div class="alert is-important">

Note that the instructions found in [https://github.com/angular/angular/blob/main/docs/DEVELOPER.md](https://github.com/angular/angular/blob/main/docs/DEVELOPER.md) are to build and test the Angular framework and not the Angular documentation.

The procedures on this page build only the Angular documentation.
You don't need to build the Angular framework to build the Angular documentation.

</div>

<!-- markdownLint-disable MD033 -->

### To navigate to the Angular documentation directory

Perform these steps from a command-line tool on your local computer.

1.  Navigate to the Angular documentation in the working directory of your account in your `git` workspace on your local computer.
1.  Navigate to your `git` workspace directory.
    In this example, this is the `github-projects` directory.

    1.  Run this command to navigate to the working directory with the `angular` repo you forked to your personal account.
        Remember to replace `personal` with your GitHub username.

        <code-example format="shell" language="shell">

        cd personal/angular

        </code-example>

    1.  Run this command to navigate to the Angular documentation directory.

        <code-example format="shell" language="shell">

        cd aio

        </code-example>

The Angular documentation directory is the root of the Angular documentation files.
These directories in the `angular/aio` directory are where you find the files that are edited the most.

| Directory                     | Files                                                     |
|:---                           |:---                                                       |
|`angular/aio/content`          | Files and other assets used in the Angular documentation  |
|`angular/aio/content/guide`    | The markdown files for most Angular documentation         |
|`angular/aio/content/tutorial` | The markdown files used by the Tour of Heroes tutorial    |

The Angular documentation source has many other directories in `angular/aio` but they don't change often.

### To build and view the Angular documentation on your computer

Perform these steps from a command-line tool on your local computer.

1.  Build the Angular documentation.
    1.  From the Angular documentation directory, run this command:

        <code-example format="shell" language="shell">

        yarn build

        </code-example>

    1.  If building the documentation reports one or more errors, fix the errors and repeat the previous step before you continue.

1.  Start the local documentation server.
    1.  From the documentation directory, run this command:

        <code-example format="shell" language="shell">

        yarn start

        </code-example>

    1.  Open a browser on your local computer and view your documentation at `https://localhost:4200`.
1. Review the documentation in the browser.

### To run the automated tests on the Angular documentation

Perform these steps from a command-line tool on your local computer.

1.  [Navigate to the documentation directory](#to-navigate-to-the-angular-documentation-directory), if you're not already there.
1.  From the documentation directory, run this command to build the documentation before you test it:

    <code-example format="shell" language="shell">

    yarn build

    </code-example>

1.  If building the documentation returns one or more errors, fix those and build the documentation again before you continue.
1.  From the documentation directory, run these commands to start the automated tests that verify the docs are consistent.
    These are most, but not all, of the tests that are performed after you open your pull request.
    Some tests can only be run in the automated testing environment.

    <code-example format="shell" language="shell">

    yarn e2e
    yarn docs-test

    </code-example>

When you run these tests on your documentation updates, be sure to correct any errors before you open a pull request.

## Next steps

After you build the documentation from your forked repo on your local computer and the tests run without error, you are ready to continue.

You have successfully configured your local computer to edit Angular documentation and open pull requests.

Continue to the other topics in this section for information about how to perform other documentation tasks.

<!-- links -->

<!-- external links -->

[GithubJoin]: https://github.com/join "Join GitHub | GitHub"

[GithubMain]: https://github.com "GitHub"

[GithubAngularAngular]: https://github.com/angular/angular "angular/angular | GitHub"

[GithubAngularAngularBlobMainContributingSigningTheCla]: https://github.com/angular/angular/blob/main/CONTRIBUTING.md#-signing-the-cla "Signing the CLA - Contributing to Angular | angular/angular | GitHub"

[GithubAngularAngularTreeMainAioToolsDocLinterInstallValeOnYourDevelopmentSystemReadmeMd]: https://github.com/angular/angular/tree/main/aio/tools/doc-linter/README.md#install-vale-on-your-development-system "Install Vale on your development system - Angular documentation lint tool | angular/angular | Github"

<!-- end links -->

@reviewed 2022-10-12
