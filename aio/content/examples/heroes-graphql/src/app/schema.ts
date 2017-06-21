// #docregion
export const typeDefinitions = `
# the model
type Hero {
  id: Int!
  name: String!
}

# The schema allows the following queries:
type Query {
  heroes(search: String): [Hero]

  hero(heroId: Int!): Hero
}

# This schema allows the following mutation:
type Mutation {
  updateHero (
    id: Int!
    name: String!
  ): Hero

  addHero (
    heroName: String!
  ): Hero

  deleteHero (
    id: Int!
  ): Hero
}

# Tell the server which types represent the root query and root mutation types.
# By convention, they are called RootQuery and RootMutation.
schema {
  query: Query
  mutation: Mutation
}
`;
