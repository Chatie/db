import gql from 'graphql-tag'

export const GQL_FRAGMENT_HOSTIE = gql`
  fragment Hostie on Hostie {
    id,
    token,
    name,
    note,

    status,
    system,

    owner {
      email,
      id,
      name,
    }
  }
`

export const GQL_QUERY_ALL_HOSTIES = gql`
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
        token,
      },
    }
  }

  ${GQL_FRAGMENT_HOSTIE}
`

export const GQL_DELETE_HOSTIE = gql`
  mutation DeleteHostie($id: ID!) {
    deleteHostie(id: $id) {
      id,
    }
  }
`

export const GQL_CREATE_HOSTIE = gql`
  mutation CreateHostie(
    $token:   String!
    $name:    String!,
    $ownerId: ID!,
  ) {
    createHostie(
      token:    $token,
      name:     $name,
      ownerId:  $ownerId,
    ) {
      ...Hostie,
    }
  }

  ${GQL_FRAGMENT_HOSTIE}
`

export const GQL_UPDATE_HOSTIE = gql`
  mutation UpdateHostie(
    $id: ID!,
    $name: String,
    $note: String,
  ) {
    updateHostie(
      id:   $id,
      name: $name,
      note: $note,
    ) {
      ...Hostie,
    }
  }

  ${GQL_FRAGMENT_HOSTIE}
`
