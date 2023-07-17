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
While Vale helps, it doesn't replace the reviewers that you're currently using to help you write great documentation.

**To use Vale in your documentation:**

1.  [Install Vale][AioToolsDocLinterReadmeInstallValeInYourVsCodeIde] in your Visual Studio Code IDE.
    To install and use Vale in a different IDE, see [Installation][ValeDocsValeCliInstallation].
2.  Fix the problems that Vale identifies in your IDE.

Log any problem you encounter with the documentation linter as a [new docs issue][GithubAngularAngularIssuesNewAssigneesLabelsTemplate3DocsBugYaml] in the repo.
Be sure to specify that this is a linter issue in your description.

## Fix documentation problems identified by Vale

Vale evaluates a markdown \(`.md`\) file when you open it in the IDE and each time you save it. Vale does not review your document as you make changes in it.

When Vale identifies a problem, it can take a simple word substitution or rewriting several sentences or paragraphs to fix it.
Sometimes, you might need to take a step back from the text and consider other alternatives.

To find the best way to fix a problem that Vale identified, think of your reader, be flexible, and keep an open mind.
The documentation should be understood by a range of readers, some of whom might not have much experience with Angular or even web development.

> **Note**
> Remember that when a developer is reading documentation, they are often doing so while thinking about other things, such as coding their Angular application.
> Keeping the docs easy to read, helps developers concentrate on their coding.

These are some tips to help you resolve the issues that the lint tool identifies and to help you make your docs easier to read.

### Refer to the style guides

The lint tool tests against the styles found in these style guides.
Most style tests include links to relevant sections in these documents for more information.

*   [Angular documentation style guide][AioGuideDocsStyleGuide]
*   [Google Developer Documentation Style Guide][GoogleDevelopersStyle]

> **Note**
> Not every style mentioned in the style guides has a test.
> Style guides and the style tests can change.

### Split up long sentences

Generally, shorter sentences are easier to read than longer ones.
Long sentences can occur when you try to say too much at once.
Long sentences, as well as the use of parentheses, semicolons, or words identified as *too-wordy*, generally require rethinking and rewriting.
Consider restructuring a long sentence to break its individual ideas into distinct sentences or bullet points.

### Use lists and tables

Sentences that contain comma-separated lists might be clearer if presented as a bulleted-list or table.
Consider changing a comma-separated list of items in a sentence to a list of bullets to make those list items easier to read.

### Use more common words

Shorter, more common words are generally easier to read than longer ones.
This does not mean you need to write down to the audience. Technical docs should still be precise.
Angular docs are read by many people around the world and should use language that the most people can understand.

If you think a specific term is required even though it has been flagged as uncommon, try to include a short explanation of the term.
Also, try adding some context around its first mention.
Linking a term to another section or definition is also an option, but consider the disruption that causes to the reader before you use it.
If you force a reader to go to another page for a definition, they might lose their concentration on the current topic and their primary goal.

### Use fewer words

If you can remove a word and not lose the meaning of the sentence, leave it out.

One common place where removing words can help is in a list of examples with more than two or three items.
Before you place the items in a bullet list, consider if only one of the items can convey the desired meaning.
Another option might be to replace a list of items with a single term that describes all the elements in your list.

### If all else fails

The style rules generally guide you in the direction of clearer content, but sometimes you might need to break the rules.
If you decide that the best choice for the text conflicts with the linter, mark the text as an exception to linting.

If you use these exceptions, please limit the amount of text that you exclude from analysis to the fewest lines possible.

When necessary, you can apply these exceptions to your content.

1.  **General exception**

    A *general exception* allows you to exclude the specified text from all lint testing.

    To apply a general exception, surround the text that you do not want the linter to test with the HTML
    `comment` elements shown in this example.

    ```markdown

    <!-- vale off -->

    Text the linter does not check for any style problem.

    <!-- vale on -->

    ```

    Be sure to leave a blank line before and after each comment.

2.  **Style exception**

    A *style exception* allows you to exclude text from an individual style test.

    To apply a style exception, surround the text that you do not want the linter to test with these HTML
    `comment` elements. Between these comments, the linter ignores the style test in the comment, but
    still tests for all other styles that are in use.

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
The instructions for installing it into Visual Studio Code on Windows and macOS are summarized here.
For more information, or to install Vale in another IDE or on another operating system, see [Vale installation documentation][ValeDocsValeCliInstallation].

### Prerequisites

Before you proceed, make sure that:

1.  You have cloned the [`angular/angular` repo][GithubAngularAngular] on your system. You can work in a fork of the `angular/angular` repo,
    but it's easier if your Vale installation uses an up-to-date clone of the `angular/angular` repo.
2.  You have a development or writing environment for `angular.io` in the `angular/angular` repo and you can build the `angular.io` docs.
    For information about how to create the authoring environment for `angular.io`, see [Angular documentation project][GithubAngularAngularTreeMainAioAngularDocumentationProjectHttpsangulario].
3.  You have the required package manager installed on your system. If not, install it before continuing.
    * [homebrew][BrewMain] on your macOS system.
    * [chocolatey][Chocolatey] on your Windows system.

### Install the Vale command-line tool

Open the following tools on your development system.

1.  Open a command-line tool:
    * `terminal` on macOS, for example
    * `Windows PowerShell` on Windows
2.  Open Visual Studio Code.

Follow the instructions for the OS on your development system.
To install Vale on a different OS, see [Installation][ValeDocsValeCliInstallation].

#### Install Vale on macOS

In your command-line tool:

<!-- vale Angular.WriteGood_Illusions = NO -->
<!-- vale Angular.Angular_CliReference = NO -->

1.  Run `brew install vale` to install Vale.
2.  Get the path to the `vale` application to use as the value of the **Vale > Vale CLI : Path** setting.
    1.  In the command-line tool, run `which vale`.
        Save the returned path for use in the next procedure.

    2.  If this command does not return a path, restart macOS and repeat this step.
3.  Get the path to the configuration file, `vale.ini`, to use in the **Vale > Vale CLI : Config** setting.
    1.  In the command-line tool, navigate to your `git` working directory with the `angular/angular` repo.
    2.  Run `git pull` to update the repo.
    3.  In your clone of the `angular/angular` repo, navigate to the `aio/tools/doc-linter` directory.
    4.  In the `aio/tools/doc-linter` directory, confirm that you have the `vale.ini` file.
    5.  Run `pwd` to get the full path to `vale.ini` to use in the next procedure.

<!-- vale Angular.Angular_CliReference = YES -->
<!-- vale Angular.WriteGood_Illusions = YES -->

#### Install Vale on Windows

In your command-line tool:

<!-- vale Angular.WriteGood_Illusions = NO -->
<!-- vale Angular.Angular_CliReference = NO -->

1.  Run `choco install vale` to install Vale.
2.  Get the path to the `vale` application to use as the value of the **Vale > Vale CLI : Path** setting.
    1.  In the command-line tool, run `where vale.exe`.
        Save the returned path for use in the next procedure.

    2.  If this command does not return a path, restart Windows and repeat this step.
3.  Get the path to the configuration file, `vale.ini`, to use in the **Vale > Vale CLI : Config** setting.
    1.  In the command-line tool, navigate to your `git` working directory with the `angular/angular` repo.
    2.  Run `git pull` to update the repo.
    3.  In your clone of the `angular/angular` repo, navigate to the `aio\tools\doc-linter` directory.
    4.  In the `aio\tools\doc-linter` directory, confirm that you have the `vale.ini` file.
    5.  Run `cd` to get the full path to `vale.ini` to use in the next procedure.

<!-- vale Angular.Angular_CliReference = YES -->
<!-- vale Angular.WriteGood_Illusions = YES -->

### Install the Vale extension for Visual Studio Code

This procedure is the same for macOS and Windows.
To install Vale in a different IDE, see [Installation][ValeDocsValeCliInstallation].

<!-- vale Angular.WriteGood_Illusions = NO -->
<!-- vale Angular.Angular_CliReference = NO -->

**To install and configure the Visual Studio Code Vale extension:**

1.  In Visual Studio Code, go to the **Extensions** pane.
2.  In the Visual Studio Code **Extensions** pane:
    1.  In the search box, enter `Vale`.
    2.  In the Vale extension entry, choose, **Install**.
3.  Access the settings in Visual Studio Code for the Vale extension.
    *   On macOS, in the **Code** menu, choose **Preferences**, and then choose **Settings**.
    *   On Windows, in the **File** menu, choose **Preferences**, and then choose **Settings**.
4.  In the **User** settings, navigate to  **Extensions > Vale**.
5.  Update the Vale extension settings as shown.
    *   **Vale : Config**, enter the full path to `vale.ini` from the preceding procedure and append the `vale.ini` filename.
    *   **Vale : Min Alert Level**, choose `inherited` or `suggestion`.
    *   **Vale : Path**, enter the full path of the `vale` application that `which vale` or `where vale.exe` returned in a preceding step.
6.  Restart Visual Studio Code to apply the new settings.

<!-- vale Angular.Angular_CliReference = YES -->
<!-- vale Angular.WriteGood_Illusions = YES -->

### Known issues with the Visual Studio Code extension

If you're having problems with the `0.15.0` version of the Vale extension to Visual Studio Code, try:

1. Uninstalling version `0.15.0` of the Vale extension.
2. Installing version `0.14.2` of the Vale extension.

If you're using version `0.14.2`, the Vale extension settings to use are:

<!-- vale Angular.WriteGood_Illusions = NO -->
<!-- vale Angular.Angular_CliReference = NO -->

*   **Vale > Core : Use CLI**, checked.
*   **Vale > Server : Lint Context**, `0`.
*   **Vale > Server : Provide Fixes**, unchecked.
*   **Vale > Server : Server URL**, leave empty.
*   **Vale > Vale CLI : Config**, enter the full path to `vale.ini` from the preceding procedure and append the `vale.ini` filename.
*   **Vale > Vale CLI : Min Alert Level**, choose `inherited` or `suggestion`.
*   **Vale > Vale CLI  : Path**, enter the full path of the `vale` application that `which vale` or `where vale.exe` returned in a preceding step.

<!-- vale Angular.Angular_CliReference = YES -->
<!-- vale Angular.WriteGood_Illusions = YES -->

## Update the Vale command-line tool

* To update Vale on macOS to the latest version, in your command-line tool, run `brew upgrade vale`.

* To update Vale on Windows to the latest version, in a PowerShell window, run `choco update vale`.

## Update the Vale style tests

The style tests are stored in your local clone of the [`angular/angular` repo][GithubAngularAngular] and
are updated automatically when you pull the latest code to your system.
If you're using another branch or fork of the `angular/angular` repo, be sure to also update that branch or fork.

<!-- links -->

[AioGuideDocsStyleGuide]: https://angular.io/guide/docs-style-guide "Angular documentation style guide | Angular"

[AioMain]: https://angular.io "Angular"

[AioToolsDocLinterReadmeInstallValeInYourVsCodeIde]: #install-vale-on-your-development-system "Install Vale | "

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