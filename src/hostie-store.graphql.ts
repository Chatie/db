import gql from 'graphql-tag'

export const GQL_FRAGMENT_HOSTIE = gql`
  fragment Hostie on Hostie {
    id,
    key,
    name,
    owner {
      email,
      id,
      name,
    }
  }
`

export const GQL_ALL_HOSTIES = gql`
  query AllHosties {
    allHosties {
      ...Hostie
    }
  }

  ${GQL_FRAGMENT_HOSTIE}
`

export const GQL_SUBSCRIBE_HOSTIE = gql`
  subscription SubscribeHostie{
    Hostie {
      mutation,
      node {
        ...Hostie,
      },
      previousValues {
        id,
        key,
      },
    }
  }

  ${GQL_FRAGMENT_HOSTIE}
`
