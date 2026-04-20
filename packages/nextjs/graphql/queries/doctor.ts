import { gql } from "urql";

const GET_DOCTOR_QUERY = gql`
  query ($id: String!) {
    gp(id: $id) {
      id
      institution
      department
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
          items {
            id
          }
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

export const GET_ACCESS_REQUESTS_QUERY = gql`
  query GetAccessRequests {
    # Query the join table instead of the parent permission table
    permissionRecords(orderBy: "permissionId", orderDirection: "desc") {
      items {
        status
        duration
        # This pulls the record details for this specific entry
        record {
          description
          patient {
            name
          }
        }
        # This "reaches back up" to the parent to get the shared info
      }
    }
  }
`;

export { GET_DOCTOR_QUERY, SEARCH_PATIENT_QUERY };
