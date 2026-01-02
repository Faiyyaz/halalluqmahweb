import { Restaurant } from "@/types/restaurant";
import { EXPO_PUBLIC_APPWRITE_DATABASE_ID } from "@/utils/constants";
import { getErrorMessage } from "@/utils/helper";
import { Query } from "appwrite";
import { uniqBy } from "lodash";
import { useEffect, useState } from "react";
import { useAppWrite } from "./useAppWrite";

export default function useRestaurants({
  searchTerm,
  shouldSearch,
  currentPage,
  onError,
  setShouldSearch,
}: {
  searchTerm?: string | null | undefined;
  shouldSearch: boolean;
  currentPage: number;
  setShouldSearch: (value: boolean) => void;
  onError: () => void;
}) {
  const { client, loggedInUser, databases } = useAppWrite();
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);

    if (
      !client ||
      !loggedInUser ||
      !searchTerm?.trim() ||
      !shouldSearch ||
      currentPage < 1
    ) {
      setLoading(false);
      setShouldSearch(false);
      return;
    }

    if (currentPage === 1) {
      setError(null);
      setRestaurants([]);
      setShouldSearch(false);
    }

    // Initial fetch
    const fetchDocs = async () => {
      const restaurants: Restaurant[] = [];

      try {
        const rows = await databases.listRows({
          databaseId: EXPO_PUBLIC_APPWRITE_DATABASE_ID,
          tableId: "restaurants", // or your table name
          queries: [
            Query.equal("status", "approved"),
            Query.contains("searchTerm", searchTerm || ""),
            Query.limit(20),
            Query.offset(currentPage === 1 ? 0 : (currentPage - 1) * 20),
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

        if (currentPage === 1 && restaurants.length === 0) {
          setError("No halal restaurants found");
        } else {
          setError(null);
        }
      } catch (err) {
        onError();
        const errorMessage = getErrorMessage(err);
        setError(errorMessage);
      }

      setLoading(false);
    };

    fetchDocs();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [client, loggedInUser, searchTerm, shouldSearch, currentPage, databases]);

  return { restaurants, loading, error };
}
