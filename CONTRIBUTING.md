# Contributing to Angular

We would love for you to contribute to Angular and help make it even better than it is today!
As a contributor, here are the guidelines we would like you to follow:

 - [Code of Conduct](#coc)
 - [Question or Problem?](#question)
 - [Issues and Bugs](#issue)
 - [Feature Requests](#feature)
 - [Submission Guidelines](#submit)
 - [Coding Rules](#rules)
 - [Commit Message Guidelines](#commit)
 - [Signing the CLA](#cla)


## <a name="coc"></a> Code of Conduct

Help us keep Angular open and inclusive.
Please read and follow our [Code of Conduct][coc].


## <a name="question"></a> Got a Question or Problem?

Do not open issues for general support questions as we want to keep GitHub issues for bug reports and feature requests.
Instead, we recommend using [Stack Overflow](https://stackoverflow.com/questions/tagged/angular) to ask support-related questions. When creating a new question on Stack Overflow, make sure to add the `angular` tag.

Stack Overflow is a much better place to ask questions since:

- there are thousands of people willing to help on Stack Overflow
- questions and answers stay available for public viewing so your question/answer might help someone else
- Stack Overflow's voting system assures that the best answers are prominently visible.

To save your and our time, we will systematically close all issues that are requests for general support and redirect people to Stack Overflow.

If you would like to chat about the question in real-time, you can reach out via [the Angular community Discord server][discord].


## <a name="issue"></a> Found a Bug?

If you find a bug in the source code, you can help us by [submitting an issue](#submit-issue) to our [GitHub Repository][github].
Even better, you can [submit a Pull Request](#submit-pr) with a fix.


## <a name="feature"></a> Missing a Feature?
You can *request* a new feature by [submitting an issue](#submit-issue) to our GitHub Repository.
If you would like to *implement* a new feature, please consider the size of the change in order to determine the right steps to proceed:

* For a **Major Feature**, first open an issue and outline your proposal so that it can be discussed.
  This process allows us to better coordinate our efforts, prevent duplication of work, and help you to craft the change so that it is successfully accepted into the project.

  **Note**: Adding a new topic to the documentation, or significantly re-writing a topic, counts as a major feature.

* **Small Features** can be crafted and directly [submitted as a Pull Request](#submit-pr).


## <a name="submit"></a> Submission Guidelines


### <a name="submit-issue"></a> Submitting an Issue

Before you submit an issue, please search the issue tracker. An issue for your problem might already exist and the discussion might inform you of workarounds readily available.

We want to fix all the issues as soon as possible, but before fixing a bug, we need to reproduce and confirm it.
In order to reproduce bugs, we require that you provide a minimal reproduction.
Having a minimal reproducible scenario gives us a wealth of important information without going back and forth to you with additional questions.

A minimal reproduction allows us to quickly confirm a bug (or point out a coding problem) as well as confirm that we are fixing the right problem.

We require a minimal reproduction to save maintainers' time and ultimately be able to fix more bugs.
Often, developers find coding problems themselves while preparing a minimal reproduction.
We understand that sometimes it might be hard to extract essential bits of code from a larger codebase, but we really need to isolate the problem before we can fix it.

Unfortunately, we are not able to investigate / fix bugs without a minimal reproduction, so if we don't hear back from you, we are going to close an issue that doesn't have enough info to be reproduced.

You can file new issues by selecting from our [new issue templates](https://github.com/angular/angular/issues/new/choose) and filling out the issue template.


### <a name="submit-pr"></a> Submitting a Pull Request (PR)

Before you submit your Pull Request (PR) consider the following guidelines:

1. Search [GitHub](https://github.com/angular/angular/pulls) for an open or closed PR that relates to your submission.
   You don't want to duplicate existing efforts.

2. Be sure that an issue describes the problem you're fixing, or documents the design for the feature you'd like to add.
   Discussing the design upfront helps to ensure that we're ready to accept your work.

3. Please sign our [Contributor License Agreement (CLA)](#cla) before sending PRs.
   We cannot accept code without a signed CLA.
   Make sure you author all contributed Git commits with email address associated with your CLA signature.

4. [Fork](https://docs.github.com/en/github/getting-started-with-github/fork-a-repo) the [angular/angular](https://github.com/angular/angular/fork) repo.

5. In your forked repository, make your changes in a new git branch:

     ```shell
     git checkout -b my-fix-branch main
     ```

6. Create your patch, **including appropriate test cases**.

7. Follow our [Coding Rules](#rules).

8. Run the full Angular test suite, as described in the [developer documentation][dev-doc], and ensure that all tests pass.

9. Commit your changes using a descriptive commit message that follows our [commit message conventions][commit-message-guidelines].
   Adherence to these conventions is necessary because release notes are automatically generated from these messages.

     ```shell
     git commit --all
     ```
    Note: the optional commit `--all` command line option will automatically "add" and "rm" edited files.

10. Push your branch to GitHub:

    ```shell
    git push origin my-fix-branch
    ```

11. In GitHub, send a pull request to `angular:main`.

### Reviewing a Pull Request

The Angular team reserves the right not to accept pull requests from community members who haven't been good citizens of the community. Such behavior includes not following the [Angular code of conduct](https://github.com/angular/code-of-conduct) and applies within or outside of Angular managed channels.

#### Addressing review feedback

If we ask for changes via code reviews then:

1. Make the required updates to the code.

2. Re-run the Angular test suites to ensure tests are still passing.

3. Create a fixup commit and push to your GitHub repository (this will update your Pull Request):

    ```shell
    git commit --all --fixup HEAD
    git push
    ```

    For more info on working with fixup commits see [here](./contributing-docs/using-fixup-commits.md).

That's it! Thank you for your contribution!


##### Updating the commit message

A reviewer might often suggest changes to a commit message (for example, to add more context for a change or adhere to our [commit message guidelines][commit-message-guidelines]).
In order to update the commit message of the last commit on your branch:

1. Check out your branch:

    ```shell
    git checkout my-fix-branch
    ```

2. Amend the last commit and modify the commit message:

    ```shell
    git commit --amend
    ```

3. Push to your GitHub repository:

    ```shell
    git push --force-with-lease
    ```

> NOTE:<br />
> If you need to update the commit message of an earlier commit, you can use `git rebase` in interactive mode.
> See the [git docs](https://git-scm.com/docs/git-rebase#_interactive_mode) for more details.


#### After your pull request is merged

After your pull request is merged, you can safely delete your branch and pull the changes from the main (upstream) repository:

* Delete the remote branch on GitHub either through the GitHub web UI or your local shell as follows:

    ```shell
    git push origin --delete my-fix-branch
    ```

* Check out the main branch:

    ```shell
    git checkout main -f
    ```

* Delete the local branch:

    ```shell
    git branch -D my-fix-branch
    ```

* Update your local `main` with the latest upstream version:

    ```shell
    git pull --ff upstream main
    ```


## <a name="rules"></a> Coding Rules
To ensure consistency throughout the source code, keep these rules in mind as you are working:

* All features or bug fixes **must be tested** by one or more specs (unit-tests).
* All public API methods **must be documented**.
* We follow [Google's TypeScript Style Guide][ts-style-guide], but wrap all code at **100 characters**.

   An automated formatter is available, see [building-and-testing-angular.md](./contributing-docs/building-and-testing-angular.md#formatting-your-source-code).


## <a name="commit"></a> Commit Message Guidelines

We have very precise rules over how our Git commit messages must be formatted:
```
<type>(<scope>): <short summary>
```

See [Commit Message Guidelines][commit-message-guidelines] for details.

## <a name="cla"></a> Signing the CLA

Please sign our Contributor License Agreement (CLA) before sending pull requests. For any code
changes to be accepted, the CLA must be signed. It's a quick process, we promise!

* For individuals, we have a [simple click-through form][individual-cla].
* For corporations, we'll need you to
  [print, sign and one of scan+email, fax or mail the form][corporate-cla].

If you have more than one GitHub accounts, or multiple email addresses associated with a single GitHub account, you must sign the CLA using the primary email address of the GitHub account used to author Git commits and send pull requests.

The following documents can help you sort out issues with GitHub accounts and multiple email addresses:

  * https://help.github.com/articles/setting-your-commit-email-address-in-git/
  * https://stackoverflow.com/questions/37245303/what-does-usera-committed-with-userb-13-days-ago-on-github-mean
  * https://help.github.com/articles/about-commit-email-addresses/
  * https://help.github.com/articles/blocking-command-line-pushes-that-expose-your-personal-email-address/




[coc]: https://github.com/angular/code-of-conduct/blob/main/CODE_OF_CONDUCT.md
[corporate-cla]: https://cla.developers.google.com/about/google-corporate
[dev-doc]: ./contributing-docs/building-and-testing-angular.md
[commit-message-guidelines]: ./contributing-docs/commit-message-guidelines.md
[github]: https://github.com/angular/angular
[discord]: https://discord.gg/angular
[individual-cla]: https://cla.developers.google.com/about/google-individual
[ts-style-guide]: https://google.github.io/styleguide/tsguide.html
