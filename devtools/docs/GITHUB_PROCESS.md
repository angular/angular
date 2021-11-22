<a name="conversation-locking"></a>
# Automatic conversation locking
Closed issues and pull requests are locked automatically after 30 days of inactivity.

## I want to comment on a locked conversation, what should I do?
When an issue has been closed and inactive for over 30 days, the original context is likely outdated.
If you encounter a similar or related issue in the current version, please open a new issue and
provide up-to-date reproduction instructions.

## Why lock conversations?
Automatically locking closed, inactive issues guides people towards filing new issues with updated
context rather than commenting on a "resolved" issue that contains out-of-date or unrelated
information. As an example, someone may comment "I'm still having this issue", but without
providing any of the additional information the team needs to investigate.

<a name="feature-request"></a>
# Feature request process

To manage the requests we receive at scale, we introduced automation in our feature request
management process. After we triage an issue and we identify it as a feature request, it goes
through several steps.

## Manual review

First, we manually review the issue to see if it aligns with any of the existing roadmap efforts. If
it does, we prioritize it accordingly. Alternatively, we keep it open and our feature request bot
initiates a voting process.

## Voting phase

To include the community in the feature request process, we open voting for a fixed length of time.
Anyone can cast a vote for the request with a thumbs-up (👍) reaction on the original issue description.
When a feature request reaches 20 or more upvotes, we formally consider the feature request.
Alternatively, the bot closes the request.

**For issues that are 60+ days old**: The voting phase is 20 days

**For new issues**: The voting phase is 60 days

## Consideration phase

If the feature request receives 20 or more thumbs-up (👍) votes on the original issue description
(during the voting phase described above), we verify the Angular team can afford to maintain the
feature and whether it aligns with the long-term vision of Angular. If the answers to both of these
questions are yes, we prioritize the request, alternatively we close it with an explanation of our
decision.

## Diagram

<p align="center" width="100%">
  <img src="./images/feature-request-automation.png" alt="Feature Request Automation">
</p>

## What if I want to implement the feature to help the Angular team?

Often implementing the feature as an separate package is a better option. Building an external
package rather than including the functionality in Angular helps with:

- Keeping the framework's runtime smaller and simpler
- Makes the learning journey of developers getting started with Angular smoother
- Reduces maintainers burden and the complexity of the source code
