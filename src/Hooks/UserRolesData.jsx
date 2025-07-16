import { useQuery } from "@tanstack/react-query";
import { GET } from "../Controllers/ApiControllers";
import admin from "../Controllers/admin";

const getData = async () => {
  const res = await GET(admin.token, `get_roles`);
  if (!res.data) return [];

  const userRole = admin.role?.name?.toLowerCase() || "";

  const filteredRoles = res.data.filter((item) => {
    const roleName = item.name?.toLowerCase();

    // Exclude certain roles based on user role
    if (userRole === "super admin") {
      return roleName !== "super admin";
    }

    if (userRole === "clinic") {
      return (
        roleName !== "super admin" &&
        roleName !== "clinic" &&
        item.is_super_admin_role === 0
      );
    }

    return (
      !["super admin", "clinic"].includes(roleName) &&
      item.is_super_admin_role === 0
    );
  });

  return filteredRoles;
};

const useRolesData = () => {
  const {
    isLoading: rolesLoading,
    data: Roles,
    error: rolesError,
  } = useQuery({
    queryKey: ["Roles"],
    queryFn: getData,
  });

  return { Roles, rolesLoading, rolesError };
};

export default useRolesData;
