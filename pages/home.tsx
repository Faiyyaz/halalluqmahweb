import useRestaurants from "@/hooks/useRestaurants";
import { useEffect, useState } from "react";

export default function Home() {
  const [searchTerm, setSearchTerm] = useState<string | null>(null);
  const [shouldSearch, setShouldSearch] = useState(false);
  const [currentPage, setCurrentPage] = useState<number>(1);

  const { restaurants, loading, error } = useRestaurants({
    searchTerm,
    shouldSearch,
    setShouldSearch,
    currentPage,
    onError: () => {
      setShouldSearch(false);
      if (currentPage > 1) {
        setCurrentPage(currentPage - 1);
      }
    },
  });

  return (
    <div className="flex flex-col">
      {restaurants.map((restaurant) => (
        <div key={restaurant.$id}>{restaurant.name}</div>
      ))}
      <input onChange={(e) => setSearchTerm(e.target.value)} />
      <button
        disabled={!searchTerm || searchTerm?.trim() === ""}
        onClick={() => setShouldSearch(true)}
      >
        Search
      </button>
    </div>
  );
}
