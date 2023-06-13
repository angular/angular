# Contributors page

We have an official accounting of who is on the Angular Team \(see [this link](/about?group=Angular)\), who are "trusted collaborators" \(see [this link](/about?group=Collaborators)\), and so on.

The `contributors.json` should be maintained to keep our "org chart" in a single consistent place.

## GDE listings

There are two pages:

*   https://developers.google.com/experts/all/technology/angular
    <!-- gkalpak: That URL doesn't seem to work anymore. New URL: https://developers.google.com/programs/experts/directory/ (?) -->

*   [Ours](/about?group=GDE) which is derived from `contributors.json`.

## About the data

*   Keys in `contributors.json` should be GitHub handles. \(Most currently are, but not all.\)
    This will allow us to use GitHub as the default source for things like name, avatar, etc.

*   Keys are sorted in alphabetical order, please keep the sorting order when adding new entries.
*   Pictures are stored in `aio/content/images/bios/<picture-filename>`.

## Processing the data

Install https://stedolan.github.io/jq/ which is amazing.

<code-example format="shell" language="shell">

for handle in &dollar;(jq keys[] --raw-output &lt; aio/content/marketing/contributors.json)
do echo -e "\n&dollar;handle\n---------\n"; curl --silent -H "Authorization: token &dollar;{TOKEN}" https://api.github.com/users/&dollar;handle \
 &verbar; jq ".message,.name,.company,.blog,.bio" --raw-output
done

</code-example>

Relevant scripts are stored in `aio/scripts/contributors/`.
