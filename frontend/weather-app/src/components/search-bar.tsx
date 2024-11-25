import { Autocomplete, TextField } from "@mui/material";
import { useState } from "react";
import { LocationSuggestionDto } from "../types/location";

interface SearchBarProps {
  onSelect: (selectedOption: LocationSuggestionDto | null) => void;

  initialData?: LocationSuggestionDto[];
}

export default function SearchBar({ onSelect }: SearchBarProps) {
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [options, setOptions] = useState<LocationSuggestionDto[]>([]);

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

  return (
    <Autocomplete
      options={options}
      getOptionLabel={(option) => `${option.localName}, ${option.name}`}
      onInputChange={(_, value) => handleSearch(value)}
      onChange={(_, selectedOption) => onSelect(selectedOption)}
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
