/**
 * The configuration for `ng-dev caretaker` commands.
 *
 * @type { import("@angular/ng-dev").CaretakerConfig }
 */
export const caretaker = {
  g3SyncConfigPath: './.ng-dev/google-sync-config.json',
  githubQueries: [
    {
      name: 'Merge Queue',
      query: `is:pr is:open label:"action: merge"`,
    },
    {
      name: 'Merge Assistance Queue',
      query: `is:pr is:open label:"merge: caretaker note" label:"action: merge"`,
    },
    {
      name: 'Initial Triage Queue',
      query: `is:open no:milestone -draft:true`,
    },
  ],
  hasEmeaCaretaker: true,
};
