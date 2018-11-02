Deals with the creation of generated factory files.

Generated factory files create a catch-22 in ngtsc. Their contents depends on static analysis of the current program, yet they're also importable from the current program. This importability gives rise to the requirement that the contents of the generated file must be known before program creation, so that imports of it are valid. However, until the program is created, the analysis to determine the contents of the generated file cannot take place.

ngc used to get away with this because the analysis phase did not depend on program creation but on the metadata collection / global analysis process.

ngtsc is forced to take a different approach. A lightweight analysis pipeline which does not rely on the ts.TypeChecker (and thus can run before the program is created) is used to estimate the contents of a generated file, in a way that allows the program to be created. A transformer then operates on this estimated file during emit and replaces the estimated contents with accurate information.

It is important that this estimate be an overestimate, as type-checking will always be run against the estimated file, and must succeed in every case where it would have succeeded with accurate info.

This directory contains the utilities for generating, updating, and incorporating these factory files into a ts.Program.
