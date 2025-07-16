import { useQuery } from "@tanstack/react-query"; // Adjust the import according to your project structure
import { GET } from "../Controllers/ApiControllers";
import admin from "../Controllers/admin";
import { useSelectedClinic } from "../Context/SelectedClinic";

const usePatientData = () => {
  const { selectedClinic } = useSelectedClinic();

  const fetchPatientData = async () => {
    const res = await GET(
      admin.token,
      `get_patients?clinic_id=${selectedClinic?.id || ""}`
    );
    return res.data;
  };
  const {
    isLoading: patientsLoading,
    data: patientsData,
    error: patientsError,
  } = useQuery({
    queryKey: ["patients", selectedClinic?.id],
    queryFn: fetchPatientData,
  });

  return { patientsData, patientsLoading, patientsError };
};

export default usePatientData;
