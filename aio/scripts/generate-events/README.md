# Generating data for `angular.io/events`

This document and the contents of this directory contain information and source code related to generating data for the [angular.io Events page](https://angular.io/events).


## Directory contents

The following list gives a brief description of the contents of this directory and their purpose.
For more details see the following sections.

- `apps-script-extension/`:
  The source code for the Apps Script extension that needs to be added to the Google Sheet spreadsheet.
- `index.mjs`:
  The script for retrieving the data from the Firebase database and generating the `events.json` file for angular.io.


## Background

The "Events" page on angular.io has two sections: One for upcoming events and one for past events.

Originally, the events were hard-coded into the page's HTML, which meant that the page had to be updated twice for each event (once to add it to the list of upcoming events and once more to move it to the list of past events).

Later, the setup was changed so that the events were loaded as JSON and passed to an [EventsComponent](../../src/app/custom-elements/events/), which was able to categorize them as "upcoming" or "past" based on the date.
This reduced the maintenance overhead by only requiring one update per event (just to add it to the `events.json` file that was part of the angular.io source code).

However, since the DevRel team had to maintain a separate list of events outside angular.io (in a more suitable format for their needs), that setup still required unnecessary work and resulted in having to manually duplicate the data in two places. Additionally, due to the extra overhead of updating the events list on angular.io (creating a pull request, getting it approved, merged and finally deployed), the events page was often out of date.

This document describes the latest, revised process for generating the events data with the aim of:
- Minimizing the manual overhead.
- Avoiding data duplication.
- Ensuring the freshness of the data on angular.io.
- Minimizing changes to the current DevRel team workflow.


## The current process

This section describes the current setup and process for generating events data for angular.io.


### Overview

In a nutshell, the setup can be summarized as follows:

1. The DevRel team keeps information about events in a Google Sheets spreadsheet (in the appropriate format).
2. An Apps Script extension on the spreadsheet periodically saves the relevant information (such as event names and dates) in a Firebase Realtime Database.
3. There is a script (that can be run periodically) which can query the database and generate `events.json` based on the latest data.


#### Apps Script extension overview

In a nutshell, the Apps Script extension works as follows:

1. An [`onEdit` trigger](https://developers.google.com/apps-script/guides/triggers#onedite) is invoked every time the spreadsheet is edited and checks whether a team allocation sheet was edited.
  If so, it adds the name of the sheet to a list of edited sheets.
2. A [time-driven trigger](https://developers.google.com/apps-script/guides/triggers/installable#time-driven_triggers) is invoked periodically and checks to see if there are any sheets that have been edited since the last invocation.
  If so, it extracts the event data from each edited sheet and updates the Firebase database.

Useful resource: https://stackoverflow.com/questions/53207906/how-to-integrate-firebase-into-google-apps-script-without-using-deprecated-dat#answer-53211786


### How to set up

1. Have a [Google Sheets](https://www.google.com/sheets/about/) spreadsheet for keeping event information.
  The spreadsheet must follow some format requirements in order for the script to be able to extract event information.
  Look at the source code in [apps-script-extension/](./apps-script-extension/) for details, but the main requirements are:
  - There should be a sheet named `XXXX Team Allocation` for each year, where `XXXX` is the year (for example, `2022 Team Allocation`).
  - Each team allocation sheet should have the event dates on the first row (potentially after some empty cells) and the dates should be displayed in the format `M/D` (for example, `4/11` for April 11th).
  - Each team allocation sheet should have the event names on the second row (each under the corresponding date cell).
    Event names can optionally be links pointing to the event's web page.

2. Create an [Apps Script extension](https://developers.google.com/apps-script/guides/sheets) for the aforementioned spreadsheet with the source code from the [apps-script-extension/](./apps-script-extension/) directory.
  To do this, open the spreadsheet, click on `Extensions > Apps Script`, create the necessary files as seen in the source code (with the difference that the `.js` extension must be replaced with `.gs`) and copy the source code.
  For `appsscript.json`, follow the instructions [here](https://developers.google.com/apps-script/concepts/manifests#editing_a_manifest) to make it appear in the in-browser editor.

3. Set up a [time-driven trigger](https://developers.google.com/apps-script/guides/triggers/installable#time-driven_triggers) to run the `updateEventsOnFirebase()` function (found in [persister.gs](./apps-script-extension/persister.js)).
  Adjust the frequency according to your needs.

4. Have a [Firebase project](https://firebase.google.com/) with [Realtime Database](https://firebase.google.com/products/realtime-database) enabled.

5. Follow the instructions [here](https://firebase.google.com/docs/rules/manage-deploy#generate_a_configuration_file) to set up [security rules](https://firebase.google.com/docs/rules) and make sure they are deployed to the Firebase project as needed.
  You can see the database security rules used for this project in [database.rules.json](../../database.rules.json).
  These rules will allow anyone to read the events from the database, but only someone with access to the Firebase project will be able to update the events in the database.
  NOTE: For this project, the rules are deployed as part of the `deploy_aio` CI job.

6. Ensure that the account that was used to create the Google Sheets trigger on step 3 also has access to the Firebase project (otherwise, the trigger will fail to update the database when events change in the spreadsheet).

7. Wire the [index.mjs](./index.mjs) script to run when necessary to generate an updated `events.json` file.
  NOTE: For this project, there is a [GitHub Action](https://github.com/angular/angular/blob/main/.github/workflows/update-events.yml) that periodically runs the script and creates a pull request (if necessary).

8. Ensure that both [constants.gs](./apps-script-extension/constants.js) and [index.mjs](./index.mjs) point to the correct database URL.


### How to update

Although the source code in [apps-script-extension/](./apps-script-extension/) and the actual code used in the spreadsheet are independent, it is advised for versioning purposes to keep the two in sync.
Whenever a change is needed to be made to the Apps Script extension, the change should be applied in both places.


### Trade-offs/Alternatives considered

This section describes trade-offs made and alternative implementations/variations that were considered.

**Trade-offs:**

- The current implementation provides minimal data for each event (name, start date and optionally link to web site).
  Specifically, compared to the previous implementation, data that was dropped includes: end dates, workshop dates (when applicable), mandatory link to web site and optional tooltips (to be shown on hover).
  This decision was made in order to be able to keep the existing workflow/data layout of the DevRel spreadsheet and may be revisited in the future.

**Alternatives considered:**

- We considered using [Cloud Firestore](https://firebase.google.com/products/firestore), which is Firebase's newer database offering, but communicating with it [via REST](https://firebase.google.com/docs/firestore/reference/rest) seemed more involved than with the [Realtime Database](https://firebase.google.com/docs/reference/rest/database).

- We considered updating the database on each edit, since this would avoid the need for a time-driven trigger.
  This proved to be problematic for the following reasons:
  - It is very inefficient to do without debouncing (as there could be multiple consecutive updates in a short time).
  - Debouncing doesn't seem to be possible in Apps Script extensions without using [installable triggers](https://developers.google.com/apps-script/guides/triggers/installable).
    See below on why `installable triggers` proved problematic as well.

- We considered reducing the setup requirements by programmatically adding an [installable trigger](https://developers.google.com/apps-script/guides/triggers/installable) to update the database shortly after an edit.
  This proved problematic, because it would require all users with write access to the spreadsheet to also:
  - Grant authorization for the [firebase.database](https://www.googleapis.com/auth/firebase.database), [script.external_request](https://www.googleapis.com/auth/script.external_request) and [script.scriptapp](https://www.googleapis.com/auth/script.scriptapp) OAuth scopes to the extension.
  - Have access to the Firebase project.

  We decided it would be more "ergonomic" to have someone (for example, the DevRel lead) with access to the Firebase project manually create a time-driven installable trigger.
  This entails an extra step, but is a one-time action, so the overhead is minimal.
