// #docregion , default-initialization
import ApolloClient from 'apollo-client';

const client = new ApolloClient();
export function getClient(): ApolloClient {
  return client;
}
// #enddocregion default-initialization
