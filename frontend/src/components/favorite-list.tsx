import { LocationOn } from "@mui/icons-material";
import DeleteIcon from "@mui/icons-material/Delete";
import { Box, Button, Typography } from "@mui/material";
import { useLocation } from "../providers/location-context";
import { LocationSuggestionDto } from "../types/location";

interface FavoriteListProps {
  favorites: LocationSuggestionDto[];
  onSelect: (selectedOption: LocationSuggestionDto | null) => void;
}

const FavoriteList: React.FC<FavoriteListProps> = ({ favorites, onSelect }) => {
  const { removeFavorite } = useLocation();

  const handleDelete = async (favorite: LocationSuggestionDto) => {
    try {
      const response = await fetch(
        `/api/location/${favorite.latitude}/${favorite.longitude}`,
        {
          method: "DELETE",
        },
      );

      if (response.ok) {
        removeFavorite(favorite);
      } else {
        console.error("Error while deleting favorite");
      }
    } catch (error) {
      console.error("Network error:", error);
    }
  };

  return (
    <Box sx={{ mt: 3 }}>
      <Typography variant="h6" gutterBottom>
        Vos lieux favoris
      </Typography>
      <Box component="ul" sx={{ listStyle: "none", padding: 0 }}>
        {favorites.map((favorite) => (
          <Box
            display="flex"
            component="li"
            key={favorite.name}
            sx={{ mb: 1, borderRadius: 2, border: "1px solid #ccc" }}
            justifyContent="space-between"
          >
            <Button
              startIcon={<LocationOn />}
              variant="text"
              onClick={() => onSelect(favorite)}
            >
              {favorite.localName}
            </Button>
            <Button
              variant="text"
              color="error"
              onClick={() => handleDelete(favorite)}
            >
              <DeleteIcon />
            </Button>
          </Box>
        ))}
      </Box>
    </Box>
  );
};

export default FavoriteList;
