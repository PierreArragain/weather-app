import DeleteIcon from "@mui/icons-material/Delete";
import { Box, Button, Typography } from "@mui/material";
import { LocationSuggestionDto } from "../types/location";

interface FavoriteListProps {
  favorites: LocationSuggestionDto[];
  onSelect: (selectedOption: LocationSuggestionDto | null) => void;
  onDelete: (favorite: LocationSuggestionDto) => void;
}

const FavoriteList: React.FC<FavoriteListProps> = ({
  favorites,
  onSelect,
  onDelete,
}) => {
  const handleDelete = async (favorite: LocationSuggestionDto) => {
    try {
      const response = await fetch(
        `/api/location/${favorite.latitude}/${favorite.longitude}`,
        {
          method: "DELETE",
        },
      );

      if (response.ok) {
        onDelete(favorite);
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
          <Box display="flex" component="li" key={favorite.name} sx={{ mb: 1 }}>
            <Button variant="text" onClick={() => onSelect(favorite)}>
              {favorite.name}
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
