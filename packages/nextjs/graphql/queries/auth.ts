import graphqlClient from "../client";
import { UseQueryOptions, useQuery } from "@tanstack/react-query";
import { gql } from "graphql-request";

export const CHECK_USER_QUERY = gql`
  query CheckUser($id: String!) {
    patient(id: $id) {
      id
    }
    gp(id: $id) {
      id
    }
  }
`;

export type CheckUserQueryVariables = {
  id: string;
};

export type CheckUserQueryResponse = {
  patient?: { id: string } | null;
  gp?: { id: string } | null;
};

export const useCheckUserQuery = (
  variables: CheckUserQueryVariables,
  options?: Omit<UseQueryOptions<CheckUserQueryResponse, Error>, "queryKey" | "queryFn">,
) => {
  return useQuery<CheckUserQueryResponse, Error>({
    queryKey: ["CheckUser", variables.id],
    queryFn: async () => {
      return await graphqlClient.request<CheckUserQueryResponse>(CHECK_USER_QUERY, variables);
    },
    ...options,
  });
};
