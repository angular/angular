# Angular documentation lint tool

The files in this directory support the [Vale][ValeMain] documentation lint tool for use while you edit [angular.io][AioMain] documentation files.

*Linting* is an automated process that lint tools, or *linters*, perform to identify stylistic errors in program source code.
Vale is a lint tool that performs a similar analysis of documentation source code.
For more information about lint tools, linting, and their history, see [*Lint* in Wikipedia][WikipediaWikiLintSoftware].

## Use Vale to lint your documentation

[Vale][ValeMain] is an open source, command-line tool that reviews writing style and phrases in your documentation.
You can add it to your integrated development environment \(IDE\) or code editor to test your documentation edits before you submit your pull request.
Using it can help improve the documentation's readability and the consistency of terminology and voice across a range of topics and contributors.

The lint tool is helpful and has been tailored to the Angular documentation style guide.
Unfortunately, it is not as powerful as the grammar and spelling features you find in contemporary document editors.
As such, a human reviewer could still find errors that Vale didn't flag.
While Vale helps, it doesn't replace the reviewers that you're currently using to help you write great documentation.

**To use Vale in your documentation:**

1.  [Install Vale][AioToolsDocLinterReadmeInstallValeInYourVsCodeIde] in your Visual Studio Code IDE.
    To install and use Vale in a different IDE, see [Installation][ValeDocsValeCliInstallation].
2.  Fix the problems that Vale identifies in your IDE.
 
Log any problem you encounter with the documentation linter as a [new docs issue][GithubAngularAngularIssuesNewAssigneesLabelsTemplate3DocsBugYaml] in the repo.
Be sure to specify that this is a linter issue in your description.

## Fix documentation problems identified by Vale

Vale evaluates a markdown \(`.md`\) file when you open it in the IDE and each time you save it. Vale doesn't review your document as you make changes in it.

When Vale identifies a problem, it can take a simple word substitution or rewriting several sentences or paragraphs to fix it.
Sometimes, you might need to take a step back from the text and consider other alternatives.

To find the best way to fix a problem that Vale identified, think of your reader, be flexible, and keep an open mind.
The documentation should be understood by a range of readers, some of whom might not have much experience with Angular or even web development in general.

> Remember that when a developer is reading documentation, they are often doing so while thinking about other things, such as coding an Angular application.
> Keeping the docs easy to read, lets the developers concentrate on their coding.

These are some tips to help you resolve the issues that the lint tool identifies and to help you make your docs easier to read.

### Refer to the style guides

The lint tool tests against the styles found in these style guides.

> **NOTE**: <br />
> Not everything mentioned in the style guides have a test.
> Style guides and tests may change and evolve.

Most style tests include links to relevant sections in these documents for more information.

*   [Angular documentation style guide][AioGuideDocsStyleGuide]
*   [Google Developer Documentation Style Guide][GoogleDevelopersStyle]

### Split up long sentences

Generally, shorter sentences are easier to read than longer ones.
Long sentences occur when you try to say too much at once.
Long sentences, as well as the use of parentheses, semi-colons, or a words identified as *too-wordy*, generally require rethinking and rewriting.
Consider restructuring a long sentence to break its individual ideas into distinct sentences or bullet points.

### Use lists and tables

Sentences that contain comma-separated lists might be clearer if presented as a bulleted-list or table.
Consider changing a list of items in a sentence to a list of bullets to make those list items easier to read.

### Use more common words

Shorter, more common words are generally easier to read than longer ones.
This does not mean you need to write down to the audience. Technical docs should still be precise.
Angular docs are read by many people around the world and should use language that the most people can understand.

If you think a specific term is required even though it is been flagged as uncommon, try to include a short explanation of the term.
Also try adding some context around its first mention.
Linking a term to another section or definition is also an option, but consider the disruption that causes to the reader before you use it.
If you force a reader to go to another page for a definition, they may lose concentration on the current topic and their primary goal.

### Use fewer words

If you remove a word and are able to keep the meaning of the sentence, leave it out.
If you keep removing words until the change affects and breaks the intended meaning, the last word and continue reviewing the text.

One common place where removing words is helpful is where you see examples of two or three items.
Before you place the items in a bullet list, consider if only one of the items can convey the desired meaning.
Another option might be to replace a list of items with a single term that describes all the elements in your list.

### If all else fails

The style rules generally guide you in the direction of clearer content, but sometimes you might need to break the rules.
If you decide that the best choice for the text conflicts with the linter, mark the text as an exception to linting.

If you use these exceptions, please limit the amount of text that you exclude from analysis to the fewest lines possible.

When necessary, you can apply these exceptions to your content.

1.  **General exception**

    A general exception allows you to exclude the specified text from all lint testing.

    To apply a general exception, surround the lines of text that you do not want the linter to test with these comments elements:

    ```markdown
    <!-- vale off -->

    Text the linter does not check for any style problem.

    <!-- vale on -->
    ```

    Be sure to leave a blank line before and after each comment.

2.  **Style exception**

    A style exception allows you to exclude testing the specified text for a specific style rule.

    To apply a style exception, surround the text that you do not want the linter to test for that style rule with these comments.
    Between these comment, the linter still tests the other styles that are in use.

    ```markdown
    <!-- vale Style.Rule = NO -->
    <!-- vale Style.Rule = YES --> 
    ```

    Replace `Style.Rule` in the comments with the style and rule from the problem message displayed in the IDE.
    For example, imagine that you got this problem message and you want to use the word it identified as a problem.

    ```markdown
    Did you really mean 'inlines'?  It was not found in our dictionary. Vale(Angular.Angular_Spelling) [Ln 24, Col 59]
    ```

    The `Style.Rule` for this message is the text inside the parentheses: `Angular.Angular_Spelling` in this case.
    To turn off that style test, use the comments shown in this example.

    ```markdown

    <!-- vale Angular.Angular_Spelling = NO -->

    'inlines' does not display a problem because the linter does not spell check this text.

    Remember that the linter does not catch any other spelling errors in this block of text.

    The linter continues to test all other style rules.

    <!-- vale Angular.Angular_Spelling = YES -->

    ```

## Install Vale on your development system

Complete these procedures to install the Vale documentation linter on your development system.

Vale can be installed on Windows, macOS, and Linux, and it can be integrated into many IDEs.
The instructions for installing it into Visual Studio Code Windows and macOS are summarized here.
For more information, or to install Vale in another IDE or on another operating system, see [Vale installation documentation][ValeDocsValeCliInstallation].

### Prerequisites

Before you proceed, make sure that:

1.  You have cloned the [`angular/angular` repo][GithubAngularAngular] on your system. You can work in a fork of the `angular/angular` repo, 
    but it's easier if your Vale installation uses an up-to-date clone of the `main` branch of the `angular/angular` repo.
2.  You have a development or writing environment for `angular.io` in the `angular/angular` repo and you are able to build the `angular.io` docs.
    For information about how to create the authoring environment for `angular.io`, see [Angular documentation project][GithubAngularAngularTreeMainAioAngularDocumentationProjectHttpsangulario].
3.  You have the required package manager installed on your system. If you don't, install it before continuing. 
    * [homebrew][BrewMain] installed on your macOS system.
    * [chocolatey][Chocolatey] on your Windows system.

### Install the Vale command-line tool

Open the following tools on your development system.

1.  Open Chrome.
2.  Open a command-line tool:
    * `terminal` on macOS, for example
    * `Windows PowerShell` on Windows
3.  Open Visual Studio Code.

Follow the instructions for the OS that your development system uses.
To install Vale on a different OS, see [Installation][ValeDocsValeCliInstallation].

#### Install Vale on macOS

In your command-line tool:

<!-- vale Angular.WriteGood_Illusions = NO -->
<!-- vale Angular.Angular_CliReference = NO -->

1.  Run `brew install vale`
2.  Ensure that Vale is available on your `$PATH`. To do this:
    1.  Get the path to the `vale` application to add as the value for **Vale > Vale CLI : Path**.
    2.  In the command-line tool, run `which vale`.
        Save the returned path for use in the next procedure.

    3.  If this command does not return a path, restart macOS and repeat this step.
3.  Update the clone of the `angular` repo on your system. To do this, in the command-line tool:
    1.  Navigate to your `github` workspace.
    2.  In your `github` workspace, navigate to the `angular/aio/tools/doc-linter` directory.
    3.  In the `angular/aio/tools/doc-linter` directory, confirm that you have the `vale.ini` file.
    4.  Run `pwd` to get the path to the `vale.ini` file for use in the next procedure.

<!-- vale Angular.Angular_CliReference = YES -->
<!-- vale Angular.WriteGood_Illusions = YES -->

#### Install Vale on Windows

In your command-line tool:

<!-- vale Angular.WriteGood_Illusions = NO -->
<!-- vale Angular.Angular_CliReference = NO -->

1.  Run `choco install vale`.
2.  Ensure that Vale is available on your `PATH`. To do this:
    1.  Get the path to the `vale` application to add as the value for **Vale > Vale CLI : Path**.
    2.  In the command-line tool, run `where vale.exe`.
        Save the returned path for use in the next procedure.

    3.  If this command does not return a path, restart Windows and repeat this step.
3.  Update the clone of the `angular` repo on your system.
4.  In the command-line tool:
    1.  Navigate to your `github` workspace.
    2.  In your `github` workspace, navigate to the `angular\aio\tools\doc-linter` directory.
    3.  In the `angular\aio\tools\doc-linter` directory, confirm that you have the `vale.ini` file.
    4.  Run `cd` to get the path to the `vale.ini` file for use in the next procedure.

<!-- vale Angular.Angular_CliReference = YES -->
<!-- vale Angular.WriteGood_Illusions = YES -->

### Install the Vale extension for Visual Studio Code

This procedure is the same for macOS and Windows.
To install Vale in a different IDE, see [Installation][ValeDocsValeCliInstallation].

> **Note:** <br />
> The style tests used by Vale are stored in your clone of the `angular/angular` repo.
> For best results, use the `main` branch of the `angular/angular` repo when you set the path of `vale.ini` in the IDE extension settings.
> While the style tests don't change frequently, if you reference a fork or another branch of that repo,
> you might miss an update to the style tests if it falls behind the `angular/angular` repo.

<!-- vale Angular.WriteGood_Illusions = NO -->
<!-- vale Angular.Angular_CliReference = NO -->

**To install the Visual Studio Code Vale extension, in Visual Studio Code:**

1.  Install the `Vale` Visual Studio Code extension.
    1.  Search for `Vale`.
    2.  Install `Vale`.
2.  Navigate to **Preferences > Settings**.
    
    > **NOTE** <br />
    > On macOS, the **Preferences** menu item is located under the **Code** nav-bar.

3.  Navigate to **User > Extensions > Vale**.
4.  Update the following Vale extension settings.
    *   **Vale > Core : Use CLI**, checked.
    *   **Vale > Server : Lint Context**, `0`.
    *   **Vale > Server : Provide Fixes**, unchecked.
    *   **Vale > Server : Server URL**, leave empty.
    *   **Vale > Vale CLI : Config**, enter the full path to `vale.ini` from the preceding procedure.
    *   **Vale > Vale CLI : Min Alert Level**, choose `inherited` or `suggestion`.
    *   **Vale > Vale CLI  : Path**, enter the full path of the `vale` directory that the `which vale` or `where vale.exe` command returned.
5.  Restart Visual Studio Code to apply the new values.

<!-- vale Angular.Angular_CliReference = YES -->
<!-- vale Angular.WriteGood_Illusions = YES -->

## Update the Vale command-line tool

* To update Vale on macOS to the latest version, in your command-line tool, run `brew upgrade vale`.

* To update Vale on Windows to the latest version, in a PowerShell window, run `choco update vale`.

## Update the Vale style tests

The style tests are stored in the `main` branch of the [`angular/angular` repo][GithubAngularAngular] and are updated automatically when you pull the latest code to your system.
If your configuration refers to a branch or a fork of the `angular/angular` repo, be sure to update that branch or fork as well.

<!-- links -->

[AioGuideDocsStyleGuide]: https://angular.io/guide/docs-style-guide "Angular documentation style guide | Angular"

[AioMain]: https://angular.io "Angular"

[AioToolsDocLinterReadmeInstallValeInYourVsCodeIde]: #install-vale-in-your-vs-code-ide "Install Vale | "

<!-- external links -->

[BrewMain]: https://brew.sh "homebrew"

[Chocolatey]: https://chocolatey.org/ "Chocolatey"

[GithubAngularAngular]: https://github.com/angular/angular "angular/angular | GitHub"

[GithubAngularAngularIssuesNewAssigneesLabelsTemplate3DocsBugYaml]: https://github.com/angular/angular/issues/new?assignees=&labels=&template=3-docs-bug.yaml "Issue: Docs or angular.io Bug Report | angular/angular | GitHub"

[GithubAngularAngularTreeMainAioAngularDocumentationProjectHttpsangulario]: https://github.com/angular/angular/tree/main/aio#angular-documentation-project-httpsangulario "Angular documentation project [AioMain] | angular/angular/aio | GitHub"

[GoogleDevelopersStyle]: https://developers.google.com/style "About this guide | Google developer documentation style guide | Google Developers"

[ValeDocsValeCliInstallation]: https://vale.sh/docs/vale-cli/installation "Installation | Vale.sh"

[ValeMain]: https://vale.sh "Vale.sh"

[WikipediaWikiLintSoftware]: https://en.wikipedia.org/wiki/Lint_%28software%29 "Lint (software) | Wikipedia"

<!-- end links -->

<!-- @reviewed 2022-07-15 -->

