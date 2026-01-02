import { Restaurant } from "@/types/restaurant";
import { EXPO_PUBLIC_APPWRITE_DATABASE_ID } from "@/utils/constants";
import { getErrorMessage } from "@/utils/helper";
import { Query } from "appwrite";
import { uniqBy } from "lodash";
import { useEffect, useState } from "react";
import { useAppWrite } from "./useAppWrite";

export default function useMyRestaurants({
  shouldFetch,
  currentPage,
  setShouldFetch,
  onError,
}: {
  shouldFetch: boolean;
  currentPage: number;
  setShouldFetch: (value: boolean) => void;
  onError: () => void;
}) {
  const { client, loggedInUser, databases } = useAppWrite();
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);

    if (!client || !loggedInUser || !shouldFetch || currentPage < 1) {
      setShouldFetch(false);
      setLoading(false);
      return;
    }

    if (currentPage === 1) {
      setShouldFetch(false);
      setRestaurants([]);
      setError(null);
    }

    // Initial fetch
    const fetchDocs = async () => {
      const restaurants: Restaurant[] = [];

      try {
        const rows = await databases.listRows({
          databaseId: EXPO_PUBLIC_APPWRITE_DATABASE_ID,
          tableId: "restaurants", // or your table name
          queries: [
            Query.equal("users", loggedInUser.$id),
            Query.limit(20),
            Query.offset(currentPage === 1 ? 0 : (currentPage - 1) * 20),
            Query.orderDesc("$createdAt"),
          ],
        });

        if (rows.rows && rows.rows.length > 0) {
          for (const row of rows.rows) {
            restaurants.push({
              $id: row.$id,
              name: row.name,
              url: row.url,
              address: row.address,
              image: row.image || null,
              status: row.status,
              coordinates: row.coordinates || null,
            });
          }
        }

        setRestaurants((prevRestaurants) => {
          let updatedRestaurants = [...prevRestaurants];

          if (restaurants && restaurants.length > 0) {
            updatedRestaurants.push(...restaurants);
          }

          updatedRestaurants = uniqBy(updatedRestaurants, "$id");

          return updatedRestaurants;
        });
        setError(null);
      } catch (err) {
        onError();
        const errorMessage = getErrorMessage(err);
        setError(errorMessage);
      }

      setLoading(false);
    };

    fetchDocs();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [client, loggedInUser, currentPage, databases, shouldFetch]);

  return { restaurants, loading, error };
}
