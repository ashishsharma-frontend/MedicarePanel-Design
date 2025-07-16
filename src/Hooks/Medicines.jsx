import { useQuery } from "@tanstack/react-query"; // Adjust the import according to your project structure
import { GET } from "../Controllers/ApiControllers";
import admin from "../Controllers/admin";
import { useSelectedClinic } from "../Context/SelectedClinic";

const getData = async (clinicID) => {
  const res = await GET(
    admin.token,
    `get_prescribe_medicines?clinic_id=${clinicID}`
  );
  console.log(res)
  if (res.response !== 200) {
    throw new Error(res.message);
  }
  return res.data;
};

const useMedicineData = () => {
  const { selectedClinic } = useSelectedClinic();
  const {
    isLoading: medicinesLoading,
    data: medicinesData,
    error: medicinesError,
  } = useQuery({
    queryKey: ["medicines" , selectedClinic?.id],
    queryFn: () => getData(selectedClinic?.id || ""),
  });

  return { medicinesData, medicinesLoading, medicinesError };
};

export default useMedicineData;
