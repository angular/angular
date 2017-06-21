// #docregion , network-initialization
import ApolloClient, { createNetworkInterface } from 'apollo-client';

const client = new ApolloClient({
  networkInterface: createNetworkInterface({
    uri: 'http://my-api.graphql.com'
  })
});

export function getClient(): ApolloClient {
  return client;
}
// #enddocregion network-initialization
