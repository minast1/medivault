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

const SEARCH_PATIENT_QUERY = `
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

export { GET_DOCTOR_QUERY, SEARCH_PATIENT_QUERY };
