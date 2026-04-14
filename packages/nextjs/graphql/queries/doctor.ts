import { gql } from "urql";

const GET_DOCTOR_QUERY = gql`
  query ($id: String!) {
    gp(id: $id) {
      id
      institution
      name
    }
  }
`;

const SEARCH_PATIENT_QUERY = gql`
  query GetPatientByCard($cardHash: String!) {
    patients(where: { cardHash: $cardHash }) {
      items {
        id
        did
        pubKey
        name
        cardHash
        records {
          totalCount
        }
      }
    }
  }
`;

export const GET_PATIENT_RECORDS_QUERY = gql`
  query GetPatientRecords($cardHash: String!, $limit: Int!, $offset: Int!) {
    patients(where: { cardHash: $cardHash }) {
      items {
        id
        name
        records(limit: $limit, offset: $offset, orderBy: "timestamp", orderDirection: "desc") {
          items {
            id
            category
            isVerified
            description
            timestamp
            doctor {
              name
              institution
            }
          }
          totalCount
          pageInfo {
            hasNextPage
            hasPreviousPage
            startCursor
            endCursor
          }
        }
      }
    }
  }
`;

export { GET_DOCTOR_QUERY, SEARCH_PATIENT_QUERY };
