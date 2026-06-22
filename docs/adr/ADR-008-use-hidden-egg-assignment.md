# ADR-008: Let users choose a Pokémon egg at the beginning

## Status

Accepted

## Context

Each user starts the application with a Pokémon egg. This egg can be leveled up
through completed tasks and visible progress. The egg is therefore a central
motivation mechanic: users should build a conscious connection to their
companion from the beginning and experience progress as personal development.

Random assignment was deliberately not chosen. If one user receives a popular
Pokémon such as Charmander and another user receives a less popular Pokémon
such as Zubat or Rattata, this can feel unfair or frustrating. In a social
context, such unequal assignment could even lead to teasing or bullying. This
would reduce motivation and could cause users to avoid or stop using the
application earlier.

## Alternatives

* Random assignment of a Pokémon egg
* Fixed starter Pokémon for all users
* Random Pokémon is revealed immediately
* User directly chooses a finished starter Pokémon

## Decision

The user chooses a Pokémon egg at the beginning. This egg is assigned to the
user account and can then be leveled up by using the application.

The chosen egg remains part of the progression mechanic: the user accompanies
it over several levels and sees the progress as the result of their own
activity.

## Consequences

* Users have more control over their companion from the beginning.
* The selection reduces frustration caused by random or unfair-feeling
  assignments.
* The bond with the egg is strengthened because the decision was made
  consciously.
* Progression remains intact because the egg is still leveled up through use of
  the app.
* The decision supports a positive and fair user experience.

## Downsides

* The initial selection makes onboarding slightly longer.
* The application must present multiple selectable eggs clearly.
* Part of the random surprise effect is reduced.
