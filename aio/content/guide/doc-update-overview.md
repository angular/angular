# Overview of Angular documentation editorial workflow

This section describes the process of making major changes to the Angular documentation.
It also describes how Angular documentation is stored, built, revised, and tested.

The following diagram illustrates the workflow for revising Angular documentation.
The steps are summarized below and described in the topics of this section.

<div class="lightbox">

<!-- Image source is found in angular/aio/src/assets/images/doc-contribute-images.sketch, in the sketch page that matches this topic's filename -->
<img alt="A block diagram that shows the steps in the writing workflow" src="generated/images/guide/doc-update-overview/writing-workflow.png">

</div>

## Prepare to edit the docs

You perform this step one time to prepare your local computer to update the Angular documentation.

For more information about how to prepare to edit the docs, see [Preparing to edit documentation](guide/doc-prepare-to-edit).

## Select a documentation issue

The first step in resolving a documentation issue is to select one to fix.
The issue that you fix can be one from the [list of documentation issues](https://github.com/angular/angular/issues?q=is%3Aissue+is%3Aopen+label%3A%22comp%3A+docs%22) in the `angular/angular` repo or one you create.

For more information about how to select an issue to fix, see [Selecting a documentation issue](guide/doc-select-issue).

### Create a documentation issue

If you want to fix a problem that has not already been described in an issue, [open a documentation issue](https://github.com/angular/angular/issues/new?assignees=&labels=&template=3-docs-bug.yaml) before you start.
When you can relate an issue to your pull request, reviewers can understand the problem better when they review your pull request.

### Create a working branch

After you select an issue to resolve, create a `working` branch in the `working` directory on your local computer.
You need to make your changes in this branch to save and test them while you edit.
After you fix the issue, you use this branch when you open the pull request for your solution to be merged into `angular/angular`.

For more information about how to create a `working` branch, see [Starting to edit a documentation topic](guide/doc-update-start).

## Revise topics

In your `working` branch, you edit and create the documentation topics necessary to resolve the issue.
You perform most of this work in your integrated development environment \(IDE\).

For more information about how to revise a documentation topic, see [Revising a documentation topic](guide/doc-editing).

### Resolve lint errors

Each time you save your edits to a documentation topic, the documentation linter reviews your topic.
It reports the problems it finds in your topic to your IDE.
To prevent delays later in the pull request process, you should correct these problems as they are reported.
The documentation linter errors must be corrected before you open the pull request to pass the pull request review.
Having lint errors in a topic can prevent the pull request from being approved for merging.

For more information about how to resolve lint problems in a documentation topic, see [Resolving documentation linter messages](guide/docs-lint-errors).

### Test your changes

As you edit documentation topics to resolve the issue you selected, you want to build a local version of the updated documentation.
This is the easiest way to review your changes in the same context as the documentation's users.

You can also run some of the automated tests on your local computer to catch other errors.
Running these tests on your local computer before you open a pull request speeds up the pull-request approval process.

For more information about how to build and test your changes before you open a pull request, see [Building and testing documentation](guide/doc-build-test).

## Prepare your pull request

To make your documentation changes ready to be added to the `angular/angular` repo, there are a few things to do before you open a pull request.
For example, to make your pull request easy to review and approve, the commits and commit messages in your `working` branch must be formatted correctly.

For information about how to prepare your branch for a pull request, see [Preparing documentation for a pull request](guide/doc-pr-prep).

### Open your pull request

Opening a documentation pull request sends your changes to the Angular reviewers who are familiar with the topic.
To be processed correctly, pull requests for `angular/angular` must be formatted correctly and contain specific information.

For information about how to format a pull request for your documentation update, see [Opening a documentation pull request](guide/doc-pr-open).

### Update your pull request

You might get feedback about your pull request that requires you to revise the topic.
Because the pull-request process is designed for all Angular code, as well as the documentation, this process might seem intimidating the first time.

For information about how to update your topics and respond to feedback on your changes, see [Updating a documentation pull request in progress](guide/doc-pr-update).

## Clean up after merge

After your pull request is approved and merged into `angular/angular`, it becomes part of the official Angular documentation.
At that point, your changes are now in the `main` branch of `angular/angular`.
This means that you can safely delete your `working` branch.

It is generally a good practice to delete `working` branches after their changes are merged into the `main` branch of `angular/angular`.
This prevents your personal fork from collecting lots of branches that could be confusing in the future.

For information about how to clean up safely after your pull request is merged, see [Finishing up a documentation pull request](guide/doc-edit-finish).

<!-- links -->

<!-- external links -->

<!-- end links -->

@reviewed 2022-10-12
