import { useQuery } from "@tanstack/react-query"; // Adjust the import according to your project structure
import { GET } from "../Controllers/ApiControllers";
import admin from "../Controllers/admin";
import { useSelectedClinic } from "../Context/SelectedClinic";

const getAppointments = async (selectedClinic) => {
  const url = `get_appointments?doctor_id=${
    admin.role.name === "Doctor" ? admin.id : ""
  }&clinic_id=${selectedClinic?.id || ""}`;
  const res = await GET(admin.token, url);
  return res.data;
};

const useAppointmentData = () => {
  const { selectedClinic } = useSelectedClinic();
  const {
    isLoading: appointmentsLoading,
    data: appointmentsData,
    error: appointmentsError,
  } = useQuery({
    queryKey: ["dashboard-appointments", selectedClinic],
    queryFn: () => getAppointments(selectedClinic),
  });

  return { appointmentsData, appointmentsLoading, appointmentsError };
};

export default useAppointmentData;
