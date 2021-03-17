# Reviewing Content

Angular developers work best when they have access to accurate and complete documentation. Keeping existing content up-to-date is an essential part of ensuring that all developers have a great documentation experience.

This topic describes how you can help keep Angular content up-to-date by reviewing content.

## Before you begin

You can review content even if you've never contributed to Angular before. However, you may find it helpful to have the [Contributing to Angular](https://github.com/angular/angular/blob/master/CONTRIBUTING.md) guide available if you're filing your first pull request in the repository.

## Reviewing content (`@reviewed`)

All of the task-based guides, tutorials, and conceptual topics that you find on Angular.io support a `@reviewed` tag. When present, this tag is followed by the date representing when a given topic was reviewed for accuracy and completeness. On the published topic, this reviewed information appears at the bottom of the topic; for example, `Last reviewed on` followed by the day of the week, month, day, and year.

<div class="lightbox">
  <img src="generated/images/guide/contributors-guide/last-reviewed.png" alt="Example of the last reviewed date specifying the day of the week, the month, the date, and the year on a page footer.">
</div>

This reviewed date indicates when someone last reviewed the topic to ensure that its contents were accurate.

You can review a topic using either the GitHub user interface or in an editor on your local machine. You can also review any topic that you like. Previous experience in the subject of the topic is helpful, but not required.

**To review a topic:**

1. Navigate to the topic that you want to review.

1. Locate the last reviewed date at the bottom of the topic and verify that the topic meets the [review criteria](#review-criteria).

   If the topic does not have a last reviewed date, you are welcome to add it to the topic. To add a date, use the `YYYY-MM-DD` date format. Example: 
   `@reviewed 2021-03-23`

1. Read through the topic.

1. If the topic requires an update, either [file an issue](https://github.com/angular/angular/blob/master/CONTRIBUTING.md#submit-issue) that describes the update required, or [create a pull request](https://github.com/angular/angular/blob/master/CONTRIBUTING.md#submit-pr) with the update.

1. Update the `@reviewed` tag, either through the [GitHub user interface](guide/updating-content-github-ui) or through Angular's [standard pull request process](https://github.com/angular/angular/blob/master/CONTRIBUTING.md#submit-pr).

{@a review-criteria}
### Review criteria

In general, topics should be reviewed either every six months, or around every major release.
