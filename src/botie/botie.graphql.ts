import gql from 'graphql-tag'

export const GQL_FRAGMENT_BOTIE = gql`
  fragment Botie on Botie {
    id,
    token,
    name,
    note,
    status,
    owner {
      email,
      id,
      name,
    }
  }
`

export const GQL_QUERY_ALL_BOTIES = gql`
  query AllBoties {
    allBoties {
      ...Botie
    }
  }

  ${GQL_FRAGMENT_BOTIE}
`

export const GQL_SUBSCRIBE_BOTIE = gql`
  subscription SubscribeBotie{
    Botie {
      mutation,
      node {
        ...Botie,
      },
      previousValues {
        id,
      },
    }
  }

  ${GQL_FRAGMENT_BOTIE}
`

export const GQL_DELETE_BOTIE = gql`
  mutation DeleteBotie($id: ID!) {
    deleteBotie(id: $id) {
      id,
    }
  }
`

export const GQL_CREATE_BOTIE = gql`
  mutation CreateBotie(
    $token:     String!
    $name:    String!,
    $ownerId: ID!,
  ) {
    createBotie(
      token:      $token,
      name:     $name,
      ownerId:  $ownerId,
    ) {
      ...Botie,
    }
  }

  ${GQL_FRAGMENT_BOTIE}
`

export const GQL_UPDATE_BOTIE = gql`
  mutation UpdateBotie(
    $id: ID!,
    $name: String,
    $note: String,
  ) {
    updateBotie(
      id:   $id,
      name: $name,
      note: $note,
    ) {
      ...Botie,
    }
  }

  ${GQL_FRAGMENT_BOTIE}
`
