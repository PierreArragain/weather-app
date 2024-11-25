import { Box, Typography } from "@mui/material";
import { useRouter } from "next/navigation";
import SearchBar from "../components/search-bar";
import { LocationSuggestionDto } from "../types/location";

interface HomeProps {
  initialData?: LocationSuggestionDto[]; // Si tu souhaites passer des données initiales
}

export default function Home({ initialData }: HomeProps) {
  const router = useRouter();

  const handleSelect = (selectedOption: LocationSuggestionDto | null) => {
    if (selectedOption) {
      const { latitude, longitude } = selectedOption;
      router.push(`/weather/${latitude}/${longitude}`);
    }
  };

  return (
    <Box sx={{ p: 3, maxWidth: 400, margin: "auto", textAlign: "center" }}>
      <Typography variant="h4" gutterBottom>
        Recherchez un lieu pour obtenir la météo
      </Typography>
      <SearchBar onSelect={handleSelect} initialData={initialData} />
    </Box>
  );
}

export async function getServerSideProps() {
  return {
    props: {
      initialData: [],
    },
  };
}
