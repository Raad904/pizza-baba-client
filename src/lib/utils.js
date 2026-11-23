export { cn } from "cn";

// Only admin-approved menu items are shown to customers
// (Browse Menu, Home carousel, Home categories).
export const isApprovedItem = (item) =>
  String(item?.status || "").toLowerCase() === "approved";
