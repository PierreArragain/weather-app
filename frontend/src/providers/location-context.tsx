import { useRouter } from "next/router";
import React, { createContext, useContext, useEffect, useState } from "react";
import { LocationSuggestionDto } from "../types/location";

interface LocationContextProps {
  selectedLocation: LocationSuggestionDto | null;
  setSelectedLocation: (location: LocationSuggestionDto | null) => void;
  favorites: LocationSuggestionDto[];
  addFavorite: (favorite: LocationSuggestionDto) => void;
  removeFavorite: (favorite: LocationSuggestionDto) => void;
  fetchFavorites: () => void;
  handleSelect: (selectedOption: LocationSuggestionDto | null) => void;
}

const LocationContext = createContext<LocationContextProps | undefined>(
  undefined,
);

export const LocationProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const router = useRouter();
  const [selectedLocation, setSelectedLocation] =
    useState<LocationSuggestionDto | null>(null);
  const [favorites, setFavorites] = useState<LocationSuggestionDto[]>([]);

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

  const addFavorite = (favorite: LocationSuggestionDto) => {
    setFavorites((prevFavorites) => [...prevFavorites, favorite]);
  };

  const removeFavorite = (favorite: LocationSuggestionDto) => {
    setFavorites((prevFavorites) =>
      prevFavorites.filter((fav) => fav.id !== favorite.id),
    );
  };

  const handleSelect = (selectedOption: LocationSuggestionDto | null) => {
    if (selectedOption) {
      const { latitude, longitude } = selectedOption;
      setSelectedLocation(selectedOption);
      router.push(`/weather/forecast?lat=${latitude}&lon=${longitude}`);
    }
  };

  useEffect(() => {
    fetchFavorites();
  }, []);

  return (
    <LocationContext.Provider
      value={{
        selectedLocation,
        setSelectedLocation,
        favorites,
        addFavorite,
        removeFavorite,
        fetchFavorites,
        handleSelect,
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
