export const PERMISSIONS = {
  VIEW_DASHBOARD: "view_dashboard",
  MANAGE_EMPLOYEES: "manage_employees",
  MANAGE_ATTENDANCE: "manage_attendance",
  MANAGE_LEAVE: "manage_leave",
  MANAGE_PAYROLL: "manage_payroll",
};

export function hasPermission(user, permission) {
  if (!user) return false;
  return user.permissions?.includes(permission) || user.role === "admin";
}
