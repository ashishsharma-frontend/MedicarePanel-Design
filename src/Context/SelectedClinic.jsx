/* eslint-disable react-refresh/only-export-components */
/* eslint-disable react/prop-types */
import { createContext, useState, useEffect, useContext } from "react";
import UseClinicsData from "../Hooks/UseClinicsData";
import admin from "../Controllers/admin";
const ClinicContext = createContext();
export const ClinicProvider = ({ children }) => {
  const { clinicsData } = UseClinicsData();
  const [selectedClinic, setSelectedClinic] = useState(() => {
    const storedClinic = localStorage.getItem("selectedClinic");
    return storedClinic ? JSON.parse(storedClinic) : undefined;
  });
  useEffect(() => {
    if (selectedClinic) {
      localStorage.setItem("selectedClinic", JSON.stringify(selectedClinic));
    } else {
      localStorage.removeItem("selectedClinic");
    }
  }, [selectedClinic]);

  useEffect(() => {
    if (admin) {
      if (admin.role.name.toLowerCase() === "clinic") {
        const clinic = clinicsData?.find(
          (clinic) => clinic.id === admin.clinic_id
        );
        setSelectedClinic(clinic);
      } else if (admin.clinic_id) {
        const clinic = clinicsData?.find(
          (clinic) => clinic.id === admin.clinic_id
        );
        setSelectedClinic(clinic);
      } else if (admin.assign_clinic_id) {
        const clinic = clinicsData?.find(
          (clinic) => clinic.id === admin.assign_clinic_id
        );
        setSelectedClinic(clinic);
      }
    }
  }, [clinicsData]);
  return (
    <ClinicContext.Provider value={{ selectedClinic, setSelectedClinic }}>
      {children}
    </ClinicContext.Provider>
  );
};
export const useSelectedClinic = () => {
  return useContext(ClinicContext);
};
