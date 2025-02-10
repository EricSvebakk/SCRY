
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
// import type { Pokemon }

export const someApi = createApi({
  reducerPath: "someApi",
  baseQuery: fetchBaseQuery({ baseUrl: "someapiroute" }),
  endpoints: (builder) => ({
    getSomething: builder.query<number, String>({
      query: (name) => ""
    })
  })
})

export const { useGetSomethingQuery } = someApi