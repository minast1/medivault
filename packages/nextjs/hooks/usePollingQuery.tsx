import { useEffect, useRef } from "react";
import { useQuery } from "urql";

const usePollingQuery = (queryOptions: any, interval = 5000) => {
  const [result, reexecuteQuery] = useQuery(queryOptions);

  const timerRef = useRef<any>(null);
  useEffect(() => {
    if (!result.fetching) {
      timerRef.current = setTimeout(() => {
        reexecuteQuery({ networkPolicy: "network-only" });
      }, interval);
    }

    return () => {
      clearInterval(timerRef.current);
    };
  }, [result.fetching, interval, reexecuteQuery]);

  return result;
};

export default usePollingQuery;
