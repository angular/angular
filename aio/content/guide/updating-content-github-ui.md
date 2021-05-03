# Updating topics through the GitHub user interface

This topic describes how to submit pull requests to the Angular repository using GitHub's user interface. If you are unfamiliar with [Git](https://git-scm.com/), you might find this process easier for making changes.

<div class="alert is-important">

   Using the GitHub user interface for updates is recommended only for small changes to one file at a time, such as fixing typos, [updating the review date](guide/reviewing-content) or [updating search keywords](guide/updating-search-keywords).

</div>

**To update a topic through the GitHub user interface:**

1. Navigate to the topic for which you want to file a pull request.

1. Click the edit icon at the top of the topic.

   <div class="lightbox">
    <img src="generated/images/guide/contributors-guide/edit-icon.png" alt="The edit icon for an Angular topic.">
   </div>

   A GitHub page appears, displaying the source of the topic.

1. Update the topic.

1. At the bottom of the screen, update the **Commit changes** box with a description of the change. Use the format `docs: <short-description-of-change>`, where `<short-description-of-change>` briefly describes your change. Keep the description under 100 characters. For example:

  `docs: fix typo in Tour of Heroes pt.1`

1. Verify that the **create new branch** option is selected, then click **Commit changes**.

  A Pull Request screen opens.

1. Fill out the form in the Pull Request screen. At a minimum, put an `x` in the **Docs have been added / updated** option and the **Documentation content changes** option.

1. Click **Create pull request**.

At this point, your pull request is added to a list of current requests, which the documentation team reviews weekly.
