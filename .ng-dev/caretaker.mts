import {CaretakerConfig} from '@angular/dev-infra-private/ng-dev';

/** The configuration for `ng-dev caretaker` commands. */
export const caretaker: CaretakerConfig = {
  githubQueries: [
    {
      name: 'Merge Queue',
      query: `is:pr is:open status:success label:"pr: merge ready"`,
    },
    {
      name: 'Triage Queue',
      query: `is:open label:"needs triage"`,
    },
  ],
};
