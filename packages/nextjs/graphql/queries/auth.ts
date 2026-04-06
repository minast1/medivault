import { gql } from "urql";

const CHECK_USER_QUERY = gql`
  query CheckUser($id: String!) {
    patient(id: $id) {
      id
    }
    gp(id: $id) {
      id
    }
  }
`;

export { CHECK_USER_QUERY };
