import gql from 'graphql-tag'

export const GQL_CURRENT_USER = gql`
  query CurrentUser{
    user {
      email,
      id,
      name,
      nickname,
    }
  }
`
