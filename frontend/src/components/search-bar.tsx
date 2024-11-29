import SearchIcon from "@mui/icons-material/Search";
import {
  Box,
  InputAdornment,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  TextField,
} from "@mui/material";
import { useRef, useState } from "react";
import { useLocation } from "../providers/location-context";
import { LocationSuggestionDto } from "../types/location";

interface SearchBarProps {
  onSelect: (selectedOption: LocationSuggestionDto | null) => void;
}

export default function SearchBar({ onSelect }: SearchBarProps) {
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [options, setOptions] = useState<LocationSuggestionDto[]>([]);
  const [isFocused, setIsFocused] = useState<boolean>(false);
  const { setSelectedLocation } = useLocation();
  const debounceTimeout = useRef<NodeJS.Timeout>();

  const handleSearch = async (query: string) => {
    if (query.length > 1) {
      const locale = typeof window !== "undefined" ? navigator.language : "en";
      try {
        const response = await fetch(
          `/api/location/search?location=${query}&locale=${locale.split("-")[0]}`,
        );
        const data = await response.json();
        setOptions(data);
      } catch (error) {
        console.error("Search error :", error);
        setOptions([]);
      }
    } else {
      setOptions([]);
    }
  };

  const handleInputChange = (query: string) => {
    setSearchTerm(query);
    if (debounceTimeout.current) {
      clearTimeout(debounceTimeout.current);
    }
    debounceTimeout.current = setTimeout(() => handleSearch(query), 300);
  };

  const handleSelect = (selectedOption: LocationSuggestionDto) => {
    setSelectedLocation(selectedOption);
    onSelect(selectedOption);
    setSearchTerm(selectedOption.localName);
    setOptions([]);
    setIsFocused(false);
  };

  return (
    <Box sx={{ position: "relative", width: "100%" }}>
      <TextField
        label="Search location"
        slotProps={{
          input: {
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          },
        }}
        variant="outlined"
        fullWidth
        value={searchTerm}
        onChange={(e) => handleInputChange(e.target.value)}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setTimeout(() => setIsFocused(false), 200)}
      />

      {isFocused && options.length > 0 && (
        <List
          sx={{
            position: "absolute",
            top: "100%",
            left: 0,
            right: 0,
            bgcolor: "background.paper",
            boxShadow: 1,
            maxHeight: 200,
            overflowY: "auto",
            zIndex: 10,
          }}
        >
          {options.map((option) => (
            <ListItem key={option.id} disablePadding>
              <ListItemButton onClick={() => handleSelect(option)}>
                <ListItemText primary={`${option.localName}, ${option.name}`} />
              </ListItemButton>
            </ListItem>
          ))}
        </List>
      )}
    </Box>
  );
}
