/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

export default `
<a name="<%- version %>"></a>
# <%- version %><% if (title) { %> "<%- title %>"<% } %> (<%- dateStamp %>)

<%_
const commitsInChangelog = commits.filter(includeInReleaseNotes());
for (const group of asCommitGroups(commitsInChangelog)) {
_%>

### <%- group.title %>
| Commit | Description |
| -- | -- |
<%_
  for (const commit of group.commits) {
_%>
| <%- commitToLink(commit) %> | <%- replaceCommitHeaderPullRequestNumber(commit.header) %> |
<%_
  }
}
_%>

<%_
const breakingChanges = commits.filter(contains('breakingChanges'));
if (breakingChanges.length) {
_%>
## Breaking Changes

<%_
  for (const group of asCommitGroups(breakingChanges)) {
_%>
### <%- group.title %>

<%_
    for (const commit of group.commits) {
_%>
<%- commit.breakingChanges[0].text %>

<%_
    }
  }
}
_%>

<%_
const deprecations = commits.filter(contains('deprecations'));
if (deprecations.length) {
_%>
## Deprecations
<%_
  for (const group of asCommitGroups(deprecations)) {
_%>
### <%- group.title %>

<%_
    for (const commit of group.commits) {
_%>
<%- commit.deprecations[0].text %>
<%_
    }
  }
}
_%>

<%_
const botsAuthorName = ['dependabot[bot]', 'Renovate Bot'];
const authors = commits
  .filter(unique('author'))
  .map(c => c.author)
  .filter(a => !botsAuthorName.includes(a))
  .sort();
if (authors.length === 1) {
_%>
## Special Thanks:
<%- authors[0]%>
<%_
}
if (authors.length > 1) {
_%>
## Special Thanks:
<%- authors.slice(0, -1).join(', ') %> and <%- authors.slice(-1)[0] %>
<%_
}
_%>
`;
