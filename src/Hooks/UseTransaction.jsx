import { useQuery } from "@tanstack/react-query"; // Adjust the import according to your project structure
import { GET } from "../Controllers/ApiControllers";
import admin from "../Controllers/admin";
import { useSelectedClinic } from "../Context/SelectedClinic";

const useTransactionData = () => {
  const { selectedClinic } = useSelectedClinic();
  const fetchTransactions = async () => {
    const res = await GET(
      admin.token,
      `get_all_transaction?clinic_id=${selectedClinic?.id || ""}`
    );
    return res.data;
  };
  const {
    isLoading: transactionsLoading,
    data: transactionsData,
    error: transactionsError,
  } = useQuery({
    queryKey: ["main-transactions", selectedClinic?.id],
    queryFn: fetchTransactions,
  });

  return { transactionsData, transactionsLoading, transactionsError };
};

export default useTransactionData;
