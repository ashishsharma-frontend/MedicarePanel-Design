import { useQuery } from "@tanstack/react-query"; // Adjust the import according to your project structure
import { GET } from "../Controllers/ApiControllers";
import admin from "../Controllers/admin";
import { useSelectedClinic } from "../Context/SelectedClinic";

const getData = async (clinic) => {
  const res = await GET(
    admin.token,
    `get_users/page?clinic_id=${clinic?.id || ""}`
  );
  return res.data;
};

const useUserData = () => {
  const { selectedClinic } = useSelectedClinic();
  const {
    isLoading: usersLoading,
    data: usersData,
    error: usersError,
  } = useQuery({
    queryKey: ["users" , selectedClinic],
    queryFn: () => getData(selectedClinic),
  });

  return { usersData, usersLoading, usersError };
};

export default useUserData;
