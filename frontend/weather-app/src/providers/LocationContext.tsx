import React, { createContext, useContext, useState } from "react";
import { LocationSuggestionDto } from "../types/location";

interface LocationContextProps {
  selectedLocation: LocationSuggestionDto | null;
  setSelectedLocation: (location: LocationSuggestionDto | null) => void;
}

const LocationContext = createContext<LocationContextProps | undefined>(
  undefined,
);

export const LocationProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [selectedLocation, setSelectedLocation] =
    useState<LocationSuggestionDto | null>(null);

  return (
    <LocationContext.Provider value={{ selectedLocation, setSelectedLocation }}>
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
