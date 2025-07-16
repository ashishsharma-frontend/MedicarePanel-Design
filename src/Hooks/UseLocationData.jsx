import { useQuery } from "@tanstack/react-query"; // Adjust the import according to your project structure
import { GET } from "../Controllers/ApiControllers";
import admin from "../Controllers/admin";

const fetchCountries = async () => {
  const res = await GET(admin.token, `get_country`);
  return res.data || [];
};

const fetchStates = async () => {
  const res = await GET(admin.token, `get_states`);
  return res.data || [];
};

const fetchCities = async () => {
  const res = await GET(admin.token, `get_city`);
  return res.data || [];
};

const useLocationData = () => {
  const {
    isLoading: countriesLoading,
    data: countries,
    error: countriesError,
  } = useQuery({
    queryKey: ["countries-data"],
    queryFn: fetchCountries,
  });

  const {
    isLoading: statesLoading,
    data: states,
    error: statesError,
  } = useQuery({
    queryKey: ["states-data"],
    queryFn: fetchStates,
  });

  const {
    isLoading: citiesLoading,
    data: cities,
    error: citiesError,
  } = useQuery({
    queryKey: ["cities-data"],
    queryFn: fetchCities,
  });

  const isLoading = countriesLoading || statesLoading || citiesLoading;
  const error = countriesError || statesError || citiesError;

  return {
    countries,
    states,
    cities,
    isLoading,
    error,
  };
};

export default useLocationData;
