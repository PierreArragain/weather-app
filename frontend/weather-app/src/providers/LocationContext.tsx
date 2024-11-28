import React, { createContext, useContext, useEffect, useState } from "react";
import { LocationSuggestionDto } from "../types/location";

interface LocationContextProps {
  selectedLocation: LocationSuggestionDto | null;
  setSelectedLocation: (location: LocationSuggestionDto | null) => void;
  favorites: LocationSuggestionDto[];
  addFavorite: (favorite: LocationSuggestionDto) => void;
  removeFavorite: (favorite: LocationSuggestionDto) => void;
}

const LocationContext = createContext<LocationContextProps | undefined>(
  undefined,
);

export const LocationProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [selectedLocation, setSelectedLocation] =
    useState<LocationSuggestionDto | null>(null);
  const [favorites, setFavorites] = useState<LocationSuggestionDto[]>([]);

  useEffect(() => {
    // Fetch favorites from API or local storage
    const fetchFavorites = async () => {
      try {
        const response = await fetch("/api/location/user-favorites", {
          credentials: "include",
        });
        const data = await response.json();
        setFavorites(data);
      } catch (error) {
        console.error("Failed to fetch favorites:", error);
      }
    };

    fetchFavorites();
  }, []);

  const addFavorite = (favorite: LocationSuggestionDto) => {
    setFavorites((prevFavorites) => [...prevFavorites, favorite]);
  };

  const removeFavorite = (favorite: LocationSuggestionDto) => {
    setFavorites((prevFavorites) =>
      prevFavorites.filter((fav) => fav.id !== favorite.id),
    );
  };

  return (
    <LocationContext.Provider
      value={{
        selectedLocation,
        setSelectedLocation,
        favorites,
        addFavorite,
        removeFavorite,
      }}
    >
      {children}
    </LocationContext.Provider>
  );
};

export const useLocation = () => {
  const context = useContext(LocationContext);
  if (!context) {
    throw new Error("useLocation must be used within a LocationProvider");
  }
  return context;
};
