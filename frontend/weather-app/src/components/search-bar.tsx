import { Autocomplete, TextField } from "@mui/material";
import { useState } from "react";
import { useLocation } from "../providers/location-context";
import { LocationSuggestionDto } from "../types/location";

interface SearchBarProps {
  onSelect: (selectedOption: LocationSuggestionDto | null) => void;

  initialData?: LocationSuggestionDto[];
}

export default function SearchBar({ onSelect }: SearchBarProps) {
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [options, setOptions] = useState<LocationSuggestionDto[]>([]);
  const { setSelectedLocation, selectedLocation } = useLocation();

  const handleSearch = async (searchTerm: string) => {
    setSearchTerm(searchTerm);
    const locale = typeof window !== "undefined" ? navigator.language : "en";

    if (searchTerm.length > 2) {
      try {
        const response = await fetch(
          `/api/location/search?location=${searchTerm}&locale=${
            locale.split("-")[0]
          }`,
        );
        const data = await response.json();
        setOptions(data);
      } catch (error) {
        setOptions([]);
      }
    } else {
      setOptions([]);
    }
  };

  const handleSelect = (selectedOption: LocationSuggestionDto | null) => {
    setSelectedLocation(selectedOption);
    onSelect(selectedOption);
  };

  return (
    <Autocomplete
      options={options}
      getOptionLabel={(option) => `${option.localName}, ${option.name}`}
      onInputChange={(_, value) => handleSearch(value)}
      onChange={(_, selectedOption) => handleSelect(selectedOption)}
      renderInput={(params) => (
        <TextField
          {...params}
          label="Search location"
          variant="outlined"
          fullWidth
        />
      )}
    />
  );
}
