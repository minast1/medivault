import graphqlClient from "../client";
import { UseQueryOptions, useQuery } from "@tanstack/react-query";
import { gql } from "graphql-request";

const GET_PATIENT_QUERY = gql`
  query ($id: String!) {
    patient(id: $id) {
      id
      name
      cardHash
    }
  }
`;

const GET_ACCESS_REQUESTS_QUERY = gql`
  query GePatienttAccessRequests($patientAddr: String!) {
    # Query the join table instead of the parent permission table
    permissionRecords(
      where: { AND: [{ patientId: $patientAddr }, { status: pending }] }
      orderBy: "permissionId"
      orderDirection: "desc"
    ) {
      items {
        id
        status
        urgency
        duration
        # This pulls the record details for this specific entry
        record {
          id
          description
          patient {
            name
          }
          doctor {
            name
            institution
            department
          }
        }
      }
    }
  }
`;

export const useGetPatientQuery = (
  variables: { id: string },
  options?: Omit<UseQueryOptions<any, Error>, "queryKey" | "queryFn">,
) => {
  return useQuery<any, Error>({
    queryKey: ["GetPatient", variables.id],
    queryFn: async () => {
      return graphqlClient.request(GET_PATIENT_QUERY, variables);
    },
    ...options,
  });
};

export const useGetAccessRequestsQuery = (
  variables: { patientAddr: string },
  options?: Omit<UseQueryOptions<any, Error>, "queryKey" | "queryFn">,
) => {
  return useQuery<any, Error>({
    queryKey: ["GetPatientAccessRequests", variables.patientAddr],
    queryFn: async () => {
      return await graphqlClient.request(GET_ACCESS_REQUESTS_QUERY, variables);
    },
    ...options,
  });
};
