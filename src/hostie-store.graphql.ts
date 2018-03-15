import gql from 'graphql-tag'

export const GQL_ALL_HOSTIES = gql`
  query AllHosties {
    allHosties {
      id,
      key,
      name,
      owner {
        email,
        id,
        name,
      }
    }
  }
`
