import { useQuery } from "@tanstack/react-query"; // Adjust the import according to your project structure
import { GET } from "../Controllers/ApiControllers";
import admin from "../Controllers/admin";
import { useSelectedClinic } from "../Context/SelectedClinic";

const fetchDoctorData = async (selectedClinic) => {
  const res = await GET(
    admin.token,
    `get_doctor?active=1&clinic_id=${selectedClinic?.id || ""}`
  );

  return res.data;
};

const useDoctorData = () => {
  const { selectedClinic } = useSelectedClinic();
  const {
    isLoading: doctorsLoading,
    data: doctorsData,
    error: doctorsError,
  } = useQuery({
    queryKey: ["doctors", "dashboard", selectedClinic],
    queryFn: () => fetchDoctorData(selectedClinic),
  });

  return { doctorsData, doctorsLoading, doctorsError };
};

export default useDoctorData;
