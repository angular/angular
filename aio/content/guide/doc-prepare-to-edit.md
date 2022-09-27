# Preparing to edit Angular documentation

This topic describes the steps that prepare your local computer to edit and submit Angular documentation.

<div class="alert is-important">

To submit changes to the Angular documentation, you must have:

* A [GitHub][GithubHome] account
* A signed [Contributor License Agreement][GithubAngularAngularContributeCla]

</div>

## Complete a contributor's license agreement

Review [Contributing to Angular](https://github.com/angular/angular/blob/main/CONTRIBUTING.md).
These sections are particularly important for documentation contributions:

1. Read the Angular [Code of conduct](https://github.com/angular/code-of-conduct/blob/main/CODE_OF_CONDUCT.md)
2. Read the [Submission guidelines](https://github.com/angular/angular/blob/main/CONTRIBUTING.md#-submission-guidelines).
    Note that the topics in this section explain these guidelines specifically for documentation contributions.
3. Read and complete the [Contributor license agreement](https://github.com/angular/angular/blob/main/CONTRIBUTING.md#-signing-the-cla) that applies to you.

## Install the required software

To edit, build, and test Angular documentation on your local computer, you need the following software.
The instructions in this section assume that you are using the software in this list to complete the tasks.
Some software in this list, such as the integrated development environment (IDE), can be substituted with similar software.
If you use a substitute program, you might need to adapt the instructions in this section to your IDE.

For more information about the required software, see [Setting up the local environment and workspace](guide/setup-local).

* **Version control software**
  * [Git command line](https://github.com/git-guides/install-git)
  * [GitHub desktop](https://desktop.github.com/) (optional)
* **Integrated development environment**
  * [Visual Studio Code](https://code.visualstudio.com/)
* **Utility software**
  * [node.js](https://nodejs.org/en/download/)<br />Angular requires an [active long-term-support (LTS) or maintenance LTS version](https://nodejs.org/about/releases) of Node.js.
  * [Yarn](https://yarnpkg.com/getting-started/install)
  * [Homebrew](https://brew.sh/) (macOS) or [Chocolatey](https://chocolatey.org/install) (Windows)
  * [Vale][GithubAngularAngularTreeMainAioToolsDocLinterInstallValeOnYourDevelopmentSystemReadmeMd] (see note)

<div class="alert is-important">

Wait until after you clone the [`https://github.com/angular/angular`][GithubAngularRepo] repo to your local computer before you configure Vale settings.

</div>

You can also install other tools and IDE extensions that you find helpful.

## Set up your workspaces

The Angular documentation is stored with the Angular framework code in a GitHub source code repository (also called a *repo*) at: [https://github.com/angular/angular](https://github.com/angular/angular). To contribute documentation to Angular, you need:

* A GitHub account
* A *clone* of the Angular repo on GitHub at: [https://github.com/angular/angular](https://github.com/angular/angular). For convenience, this documentation refers to this repo as the `angular/angular` repo or just `angular/angular`.
* A *fork* of the Angular repo in your personal GitHub account. This guide refers to your personal GitHub account as `personal`. You must replace `personal` in a GitHub reference with your GitHub username. The URL: `https://github.com/personal` is not a valid GitHub repo. For convenience, this documentation refers to your personal fork of `angular/angular` as `personal/angular`.
* A *clone* of your `personal/angular` repo.

The clones of the GitHub repos are made into a `git` *workspace* on your local computer.
With this workspace and required tools, you can build, edit, and review the documentation from your local computer.

When you can build the documentation from a workspace on your local computer, you are ready to make major changes to the Angular documentation.

For more detailed information about how to set up your workspace, see [Create your repo and workspaces for Angular documentation](#create-your-repo-and-workspaces-for-angular-documentation).

For more detailed information about how to build and test the documentation from your local computer, see [Build and test the Angular documentation](#build-and-test-the-angular-documentation).

## Create your repo and workspaces for Angular documentation

This section describes how to create the repos and the `git` workspace that is necessary to edit, test, and submit changes to the Angular documentation.

<div class="alert is-important">

Because `git` commands are not beginner friendly, the topics in this section include procedures that should reduce the chance of `git` mishaps.
Fortunately, because you are working in your own account, even if you make a mistake, you can't harm any of the Angular code or documentation.

To follow the procedures in these topics, you must use the repo and directory configuration presented in this topic.
The procedures in these topics are designed to work with this configuration.

If you use a different configuration, the procedures in these topics might not work as expected and you could lose some of your changes.

</div>

Angular's code and documentation are stored in a *public repository*, or *repo*, on [github.com](https://github.com) in the `angular` account. The path to the Angular repo is [https://github.com/angular/angular](https://github.com/angular/angular), hence the abbreviated name, `angular/angular`.

[GitHub](https://github.com) is a cloud service that hosts many accounts and repositories.
You can imagine the `angular/angular` repo in GitHub as shown in this image.

<img alt="An image of the angular/angular repo in the github.com cloud service" src="generated/images/guide/doc-prepare-to-edit/github-angular-cloud.png">

### Fork the angular repo to your account

As a public repo, `angular/angular` is available for anyone to read and copy, but not to change.
While only specific accounts have permission to make changes to `angular/angular`, anyone can suggest a change to it.
Change requests to `angular/angular` are called *pull requests*. A pull request is created by one account to ask another account to pull in a change.

Before you can open a pull request, you need a *forked* copy of `angular/angular` in your personal GitHub account.
To get a *forked* copy of `angular/angular`, you *fork* the `angular/angular` repo into your personal GitHub account and end up with the repos shown in the following image.
From the perspective of `personal/angular`, `angular/angular` is the *upstream* repo and `personal/angular` is the *origin* repo.

<img alt="An image of the angular/angular repo in the github.com cloud service that was forked to a personal account" src="generated/images/guide/doc-prepare-to-edit/github-personal-cloud.png">

#### To fork the angular repo to your account

Perform this procedure in a browser.

1.  Sign in to your [GitHub](https://github.com) account.
    If you don't have a GitHub account, [create a new account][GithubJoin] before you continue.
2.  Navigate to [`https://github.com/angular/angular`][GithubAngularRepo].
3.  In [`https://github.com/angular/angular`][GithubAngularRepo], click the **Fork** button near the top-right corner of the page.
This image is from the top of the [`https://github.com/angular/angular`][GithubAngularRepo] page and shows the **Fork** button.

    <img alt="An image of the angular/angular website in github.com that identifies the fork button" src="generated/images/guide/doc-prepare-to-edit/angular-angular-github.png">

4. In **Create a new fork**:
    1.  Accept the default values in **Owner** and **Repository name**.
    2.  Confirm that **Copy the `main` branch only** is checked.
    3.  Click **Create repository**. The forking process can take a few minutes.
5.  You now have a copy of the `angular/angular` repo in your GitHub account.

After your fork of `angular/angular` is ready, your browser opens the web page of the forked repo in your GitHub account.
In this image, notice that the account now shows the username of your personal GitHub account instead of the `angular` account.

<img alt="An image of the personal/angular website in github.com that identifies the fork forked repo" src="generated/images/guide/doc-prepare-to-edit/personal-angular-github.png">

As a forked repo, your new repo maintains a reference to `angular/angular`. From your account, `git` considers your `personal/angular` repo as the *origin* repo and `angular/angular` as the *upstream* repo.
You can think of this as: your changes originate in the *origin* repo and you send the *upstream* to the `angular/angular` repo, if that help you tell them apart.
The message below the repo name in your account, **forked from angular/angular**, contains a link back to the *upstream* repo.

This relationship comes into play later, such as when you update your `personal/angular` repo and when you open a pull request.

### Create a git workspace on your local computer

A `git` *workspace* on your local computer is where copies of GitHub repos in the cloud are stored on your local computer. To edit Angular documentation, you need to clone two repos in your workspace:

* A clone of the original, *upstream* repo, `angular/angular`
* A clone of your forked, *origin* repo, `personal/angular`

The clone of your forked, *origin* repo, `personal/angular` is made into your *working directory*.
You do your editing in the working directory of your `personal/angular` repo.
The clone of the `angular/angular` repo is kept as a reference.

In this example, the clones are made into the `github-projects` workspace directory as shown in this illustration.

<img alt="An image of the project directory on a local computer" src="generated/images/guide/doc-prepare-to-edit/pc-folder-start-img.png">

In the `github-projects` workspace directory, create a subdirectory for each account:

* angular
* *personal*

The `angular/angular` repo and the `personal/angular` repo are each *cloned* into the subdirectory for their account, as this illustration shows.
Cloning a repo duplicates the repo that's in the cloud on your local computer.
There are procedures to keep the clone on your local computer in sync with the repo in the cloud that are described later.

<img alt="An image of the angular repo from the angular and personal accounts in the github.com cloud service as they are cloned into local computer workspaces" src="generated/images/guide/doc-prepare-to-edit/github-clone-img.png">

#### To clone the Angular repos into your workspace

Perform these steps in a command-line tool on your local computer.

1. Navigate to the workspace directory. In this example, this is the `github-projects` directory. If this directory isn't on your local computer, create it, and then navigate to it before you continue.
2. In the workspace directory, run this command to create a directory for the repo from the `angular` account.

    <code-example language="shell">

    mkdir angular

    </code-example>

3. From the workspace directory, run this command to create a directory for the repo from your `personal` account. Remember to replace `personal` with your GitHub username.

    <code-example language="shell">

    mkdir personal

    </code-example>

4. From the workspace directory, run this command to clone the *upstream* repo, `angular/angular`, into the `angular` account directory.

    <!-- markdownLint-disable MD034 -->

    <code-example language="shell">

    git clone https://github.com/angular/angular angular/angular

    </code-example>

    <!-- markdownLint-enable MD034 -->

5. From the workspace directory, run this command to clone the *origin* repo, `personal/angular`, into the `personal` account directory. Remember to replace `personal` with your GitHub username.

    <!-- markdownLint-disable MD034 -->

    <code-example language="shell">

    git clone https://github.com/personal/angular personal/angular

    </code-example>

    <!-- markdownLint-enable MD034 -->

Your personal computer is now configured as shown in the following illustration.
Your clones have the current source code from each repository.

<a id="doc-working-directory" />

Your *working directory* is the `personal/angular` directory in your `git` workspace directory.
This is the directory that has the files that you edit to fix documentation issues.

<img alt="An image of the working directories on a personal computer" src="generated/images/guide/doc-prepare-to-edit/pc-folder-config-img.png">

### Complete the software installation

After you clone the *upstream* and *origin* repos on your local computer, run these commands from a command-line tool:

1. Install the npm modules used by the Angular project. In a command line tool on your local computer:
   1. Navigate to your `git` workspace. In this example, this is the `github-projects` directory.
   2. In your `git` workspace, run this command to navigate to your clone of the `angular/angular` repo.

        <code-example language="shell">

        cd angular/angular

        </code-example>

   3. Run this command to install the npm modules.

        <code-example language="shell">

        yarn install

        </code-example>

2. [Install Vale][GithubAngularAngularTreeMainAioToolsDocLinterInstallValeOnYourDevelopmentSystemReadmeMd] to complete the software installation.

## Build and test the Angular documentation

Angular provides tools to build and test the documentation. To review your work and before you submit your updates in a pull request, be sure to build, test, and verify your changes using these tools.

<div class="alert is-important">

Note that the instructions found in [https://github.com/angular/angular/blob/main/docs/DEVELOPER.md](https://github.com/angular/angular/blob/main/docs/DEVELOPER.md) are to build and test the Angular *framework* and not the Angular *documentation*.

The procedures on this page build only the Angular documentation.
You don't need to build the Angular *framework* to build the Angular *documentation*.

</div>

<!-- markdownLint-disable MD033 -->

<h3 id="to-navigate-to-the-angular-documentation-directory" class="no-toc">To navigate to the Angular documentation directory</h3>

Perform these steps from a command-line tool on your local computer.

1. Navigate to the Angular documentation in the working directory of your account in your `git` workspace on your local computer.
   1. Navigate to your `git` workspace directory. In this example, this is the `github-projects` directory.
   2. Run this command to navigate to the working directory with the `angular` repo you forked to your personal account. Remember to replace `personal` with your GitHub username.

      <code-example language="shell">

      cd personal/angular

      </code-example>

   3. Run this command to navigate to the Angular documentation directory.

      <code-example language="shell">

      cd aio

      </code-example>

<h3 class="no-toc">To build and view the Angular documentation on your computer</h3>

Perform these steps from a command-line tool on your local computer.

1. Build the Angular documentation
   1. From the Angular documentation directory, run this command:

       <code-example language="shell">

       yarn build

       </code-example>

   2. If building the documentation reports one or more errors, fix the errors and repeat the previous step before you continue.
2. Start the documentation server.
   1. From the documentation directory, run this command:

      <code-example language="shell">

      yarn serve-and-sync

      </code-example>

   2. Open a browser on your local computer and view your documentation at [`https://localhost:4200`][AngularLocalhost].
3. Review the documentation in the browser.

<h3 class="no-toc">To run the automated tests on the Angular documentation</h3>

Perform these steps from a command-line tool on your local computer.

1. [Navigate to the documentation directory](#to-navigate-to-the-angular-documentation-directory), if you're not already there.

2. From the documentation directory, run this command to build the documentation before you test it:

    <code-example language="shell">

    yarn build

    </code-example>

3. If building the documentation returns one or more errors, fix those and build the documentation again before you continue.
4. From the documentation directory, run this command to start the automated tests that verify the docs are consistent. These are most (but not all) of the tests that are performed after you open your pull request. Some tests can only be run in the CI/CD environment.

    <code-example language="shell">

    yarn e2e

    </code-example>

When you run these tests on your documentation updates, be sure to correct any errors before you open a pull request.

## Next steps

After you build the documentation from your forked repo on your local computer and the tests run without error, you are ready to continue.

You have successfully configured your local computer to edit Angular documentation and open pull requests.

Continue to the other topics in this section for information about how to perform other documentation tasks.

<!-- links -->

<!-- external links -->

[GithubAngularAngularContributeCla]: https://github.com/angular/angular/blob/main/CONTRIBUTING.md#-signing-the-cla "Signing the Contributor License Agreement"

[GithubHome]: https://github.com "GitHub | GitHub"

[GithubJoin]: https://github.com/join "Join GitHub | GitHub"

[GithubAngularRepo]: https://github.com/angular/angular "angular/angular | GitHub"

[GithubAngularAngularTreeMainAioToolsDocLinterInstallValeOnYourDevelopmentSystemReadmeMd]: https://github.com/angular/angular/tree/main/aio/tools/doc-linter/README.md#install-vale-on-your-development-system "Install Vale on your development system - Angular documentation lint tool | angular/angular | Github"

[AngularLocalhost]: http://localhost:4200 "Angular.io on localhost"

<!-- end links -->

@reviewed 2022-09-30
