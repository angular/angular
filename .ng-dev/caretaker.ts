import {CaretakerConfig} from '../dev-infra/caretaker/config';

/** The configuration for `ng-dev caretaker` commands. */
export const caretaker: CaretakerConfig = {
  githubQueries: [
    {
      name: 'Merge Queue',
      query: `is:pr is:open status:success label:"action: merge"`,
    },
    {
      name: 'Merge Assistance Queue',
      query: `is:pr is:open status:success label:"action: merge-assistance"`,
    },
    {
      name: 'Primary Triage Queue',
      query: `is:open is:issue no:milestone`,
    }
  ]
};
