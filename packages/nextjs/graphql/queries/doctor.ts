import graphqlClient from "../client";
import { UseQueryOptions, useQuery } from "@tanstack/react-query";
import { gql } from "graphql-request";

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

const GET_ACCESS_REQUESTS_QUERY = gql`
  query GetDoctorRequests($doctorAddr: String!) {
    # Query the join table instead of the parent permission table
    permissionRecords(where: { permissionId: $doctorAddr }, orderBy: "permissionId", orderDirection: "desc") {
      items {
        id
        status
        duration
        # This pulls the record details for this specific entry
        record {
          id
          description
          patient {
            name
          }
        }
      }
    }
  }
`;

export const useGetDoctorQuery = (
  variables: { id: string },
  options?: Omit<UseQueryOptions<any, Error>, "queryKey" | "queryFn">,
) => {
  return useQuery<any, Error>({
    queryKey: ["GetDoctor", variables.id],
    queryFn: async () => {
      return await graphqlClient.request(GET_DOCTOR_QUERY, variables);
    },
    ...options,
  });
};

export const useSearchPatientQuery = (
  variables: { cardHash: string },
  options?: Omit<UseQueryOptions<any, Error>, "queryKey" | "queryFn">,
) => {
  return useQuery<any, Error>({
    queryKey: ["SearchPatient", variables.cardHash],
    queryFn: async () => {
      return await graphqlClient.request(SEARCH_PATIENT_QUERY, variables);
    },
    ...options,
  });
};

export const useGetPatientRecordsQuery = (
  variables: { cardHash: string; limit: number; offset: number },
  options?: Omit<UseQueryOptions<any, Error>, "queryKey" | "queryFn">,
) => {
  return useQuery<any, Error>({
    queryKey: ["GetPatientRecords", variables.cardHash, variables.limit, variables.offset],
    queryFn: async () => {
      return graphqlClient.request(GET_PATIENT_RECORDS_QUERY, variables);
    },
    ...options,
  });
};

export const useGetDoctorRequestsQuery = (
  variables: { doctorAddr: string },
  options?: Omit<UseQueryOptions<any, Error>, "queryKey" | "queryFn">,
) => {
  return useQuery<any, Error>({
    queryKey: ["GetDoctorRequests", variables.doctorAddr],
    queryFn: async () => {
      return graphqlClient.request(GET_ACCESS_REQUESTS_QUERY, variables);
    },
    ...options,
  });
};
