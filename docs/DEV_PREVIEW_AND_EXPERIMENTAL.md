## Releasing APIs before they're fully stable

The Angular team may occasionally seek to release a feature or API without immediately
including this API in Angular's normal support and deprecation category. You can use
one of two labels on such APIs: Developer Preview and Experimental. APIs tagged this way
are not subject to Angular's breaking change and deprecation policy.

Use the sections below to decide whether a pre-stable tag makes sense. 

### Developer Preview

Use "Developer Preview" when:
* The team has relatively high confidence the API will ship as stable.
* The team needs additional community feedback before fully committing to an exact API shape.
* The API may undergo only minor, superficial changes. This can include changes like renaming
  or reordering parameters, but should not include significant conceptual or structural changes.

### Experimental

Use "Experimental" when:
* The team has low-to-medium confidence that the API should exist at all.
* The team needs additional community feedback before deciding to move forward with the API at all.
* The API may undergo significant conceptual or structural changes.
* The API relies on a not-yet-standardized platform feature.
