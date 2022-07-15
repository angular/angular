# Angular documentation lint tool

The files in this directory support the [Vale](https://vale.sh/) documentation lint tool for use while editing [angular.io](https://angular.io) documentation files.

*Linting* is an automated process that lint tools, or *linters*, perform to identify stylistic errors in program source code.
Vale is a lint tool that performs a similar analysis of documentation source code.
For more information about lint tools, linting, and their history, see [*Lint* in Wikipedia](https://en.wikipedia.org/wiki/Lint_%28software%29).

## Use Vale to lint your documentation
[Vale](https://vale.sh/) is an open source, command line tool that evaluates documentation for style and phrasing. It can help improve readability and the consistency of terminology and voice across a range of topics and contributors.

The lint tool is helpful and has been tailored to the Angular documentation style guide. Unfortunately, it's not as powerful as the grammar and spelling features you find in contemporary document editors. It's just one more tool use along with the reviewers that you're already using to help make it easier to write great documentation.

**To use Vale in your documentation:**

1. [Install Vale](#install-vale-in-your-vs-code-ide) in your VS Code IDE or, if you use a different IDE, see the [Vale documentation](https://vale.sh/docs/vale-cli/installation/) for information about installing and adding it.
2. View the problems in your IDE and fix them.
 
Log any problem you encounter with the documentation linter as [a new docs issue](https://github.com/angular/angular/issues/new?assignees=&labels=&template=3-docs-bug.yaml) in the repo. Give your new issue the `comp: docs` and `docsarea: linter` labels.

## Fixing documentation problems identified by Vale

Vale evaluates a markdown (`.md`) file when you open it in the IDE and each time you save it.

Fixing the problems that Vale identifies can range from simple word substitutions to rewriting sentences or paragraphs.
Keep in mind that the goal is to make your documentation  as clear and easy to read as you can.

To find the best way to fix a problem that Vale identified, it helps to be flexible and keep an open mind. Sometimes, you might need to take a step back from the text to consider alternatives. 
The documentation should be understood by a range of readers, some of whom might not have much experience with Angular or even web development in general.

### Some strategies to apply when editing

These are some tips to help you resolve the issues that the lint tool identifies to help you make your docs easier to read.

Remember that when people are reading documentation, they are often doing so while thinking about other things, such as coding their Angular application. Keeping the docs easy to read, helps them concentrate on their coding.

#### Refer to the style guides

The lint tool tests against the styles found in these style guides. Note not everything mentioned in these guides has a test and that style guides and tests can change over time.

Most style tests include links to relevant sections in these documents for more information.

* [Angular documentation style guide](https://angular.io/guide/docs-style-guide)
* [Google Developer Documentation Style Guide](https://developers.google.com/style)

#### Try splitting up long sentences

Generally, shorter sentences are easier to read than longer ones. Long sentences can occur when trying to say too much at once. Long sentence, as well as parentheses, semi-colons, or a words identified as *too-wordy*, generally require rethinking and rewriting. Consider restructuring a long sentence to break its individual ideas into distinct sentences or bullet points.

#### Try using lists and tables

Sentences that contain comma-separated lists might be clearer if presented as a bulleted-list or table. Changing a list from linear text to bullets can make the items easier to read.

#### Try using more common words

Shorter, more common words are often easier to read than longer ones. This doesn’t mean you need to write down to the audience, technical docs should still be precise. Using uncommon words and jargon makes the content more difficult for more people to understand.

If you think a specific term is required even though it's been flagged as uncommon, try to include a short explanation of the term. You might also try adding some context around its first mention. Linking a term to another section or definition is another option, but consider the disruption that causes to the reader. Sending a reader to another page for a definition can disrupt their concentration on the topic they're reading.

#### Try using fewer words

If you can remove a word and keep the meaning of the sentence, leave it out. If you keep doing this until removing a word changes the meaning, or removes the meaning entirely, put it back in and move on. One common place where this can help is where you see examples of two or three items. Before making them into a bullet list, consider if using only one of the terms conveys the desired meaning. Another option might be to replace a list of items with a single term that refers to all the elements in your list.

#### If all else fails

The style rules generally guide you in the direction of clearer writing, but there can be times when you need to break the rules. If you decide that the best text is something that the linter thinks is a problem, you can mark it as an exception.

If you use these exceptions, please limit the amount of text they exclude from analysis to the fewest lines possible.

The two types of exceptions from linting that you can apply to your document are:

1. **General exceptions** (don't analyze the text)
   
    Surround the lines of text that you don’t want the linter to review with these comments elements:

    ```

    <!-- vale off -->

      Text the linter will not check for any style problem.

    <!-- vale on -->

    ```
    Be sure to leave a blank line before and after each comment.

2. **Style exception** (skip a specific style rule)

    Surround the text that you'd like the linter to ignore a specific style rule with these comments.

    ```
      <!-- vale Style.Rule = NO -->
      <!-- vale Style.Rule = YES --> 
    ```

    Replace `Style.Rule` in the comments with the style and rule from the problem message displayed in the IDE. For example, imagine that you got this problem message and you want to use the word it identified as a problem.

    ```
    Did you really mean 'inlines'? It wasn't found in our dictionary. Vale(Angular.Angular_Spelling) [Ln 24, Col 59]
    ```

    The `Style.Rule` for this message is the text inside the parentheses: `Angular.Angular_Spelling` in this case. To turn off that style test, use the comments shown in this example.

    ```

      <!-- vale Angular.Angular_Spelling = NO -->

      'inlines' won't show up as a problem because 
      the linter won't spell check this text. 

      Remember that the linter won't catch any other
      spelling errors in this block of text either.

      The linter continues to test all other style rules.

      <!-- vale Angular.Angular_Spelling = YES --> 

    ```

## Install Vale in your VS Code IDE

Complete these procedures to install the Vale documentation linter on a MacOS system for the first time.
To install Vale in another IDE or on another operating system, see [Vale documentation](https://vale.sh/docs/vale-cli/installation/).

### Prerequisites
These instructions assume your development computer is a MacOS system.

**Before you proceed make sure that:**

1. You have installed the [`angular/angular` repo](https://github.com/angular/angular).
1. You have a development or writing environment for `angular.io` in the `angular/angular` repo and you can build the `angular.io` docs. For information about creating the authoring environment for `angular.io`, see the [Angular documentation project](https://github.com/bob-watson/angular/tree/doc-linter/aio#angular-documentation-project-httpsangulario)
2. You have [homebrew](https://brew.sh/) installed on your development computer.

### Install Vale for the first time

**On a Mac, locally run these tools:**

1. Open Chrome.
1. Open a command-line tool, such as `terminal`.
1. Open VS Code.

#### Install Vale

**To install Vale, in your command-line tool:**

<!-- vale Angular.WriteGood_Illusions = NO -->
<!-- vale Angular.Angular_CliReference = NO -->

1. Run `brew install vale`.
2. Ensure that Vale is available on your `$PATH` and allow you to stay up to date with new releases.
   1. Get the path to the `vale` application to add as the value for **Vale > Vale CLI : Path**.
   2. In the command-line tool, run `which vale`. Save the returned path for use in the next procedure.
   3. If this command does not return a path, restart your Mac and repeat this step.
3. Update the instance of the `angular` repo on your system.
4. In the command line tool:
   1. Navigate to your `github` workspace directory.
   2. In your `github` workspace, navigate to the `angular/aio/tools/doc-linter` directory.
   3. In the `angular/aio/tools/doc-linter` directory, confirm that you have the `vale.ini` file.
   4. Run `pwd` to get the path to the `vale.ini` file for use the next procedure.

<!-- vale Angular.Angular_CliReference = YES -->
<!-- vale Angular.WriteGood_Illusions = YES -->

#### Install Vale extension for Visual Studio Code

<!-- vale Angular.WriteGood_Illusions = NO -->
<!-- vale Angular.Angular_CliReference = NO -->

**To install the VS Code Vale extension, in VS Code:**

1. Install the `Vale` VS Code extension.
     1. Search for `Vale`.
     2. Install `Vale`.
2. Navigate to **Preferences > Settings**. The **Preferences** menu item is located under the **Code** nav bar on macOS.
3. Navigate to **User > Extensions > Vale**.
4. Update the following Vale extension settings.
     * **Vale > Core : Use CLI**, checked.
     * **Vale > Server : Lint Context**, `0`.
     * **Vale > Server : Provide Fixes**, unchecked.
     * **Vale > Server : Server URL**, leave empty.
     * **Vale > Vale CLI : Config**, enter the full path of the `angular/aio/tools/doc-linter/vale.ini` file.
     * **Vale > Vale CLI : Min Alert Level**, choose `inherited` or `suggestion`.
     * **Vale > Vale CLI  : Path**, enter the full path of the `vale` directory that the `which vale` command returned.
5. Restart VS Code to apply the new values.

<!-- vale Angular.Angular_CliReference = YES -->
<!-- vale Angular.WriteGood_Illusions = YES -->

## Update the Vale command-line tool

To update Vale on your Mac to the latest version, run `brew upgrade vale`.