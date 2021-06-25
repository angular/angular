/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

/**
 * Builds the `Link` response header to indicate an API response that is suitable
 * for pagination. This follows the specification as outlined within:
 * https://docs.github.com/en/rest/guides/traversing-with-pagination
 */
export function buildGithubPaginationResponseHeader(
    totalPages: number, currentPage: number, baseUrl: string) {
  const links = [`<${baseUrl}?page=1>; rel="first"`, `<${baseUrl}?page=${totalPages}>; rel="last"`];

  if (currentPage < totalPages) {
    links.push(`<${baseUrl}?page=${currentPage + 1}>; rel="next"`);
  }

  // Pages start with `1` as per the Github API specification.
  if (currentPage > 1) {
    links.push(`<${baseUrl}?page=${currentPage - 1}>; rel="prev"`);
  }

  return links.join(',');
}
