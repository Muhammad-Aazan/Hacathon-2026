import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getItems,
  getItemById,
  createItem,
  updateItem,
  deleteItem,
} from "../api/items.api";
import toast from "react-hot-toast";

// ─── Query Hook: Get Paginated/Filtered Items ───────────────────────────────────
export const useItems = (params = {}) => {
  return useQuery({
    queryKey: ["items", params],
    queryFn: async () => {
      const res = await getItems(params);
      return res.data; // { success, data: items, pagination }
    },
    keepPreviousData: true,
  });
};

// ─── Query Hook: Get Single Item ───────────────────────────────────────────────
export const useItem = (id) => {
  return useQuery({
    queryKey: ["item", id],
    queryFn: async () => {
      const res = await getItemById(id);
      return res.data?.data || res.data;
    },
    enabled: Boolean(id),
  });
};

// ─── Mutation Hook: Create Item ────────────────────────────────────────────────
export const useCreateItem = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (newItemData) => {
      const res = await createItem(newItemData);
      return res.data?.data || res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["items"] });
      toast.success("Item created successfully! 🎉");
    },
    onError: (err) => {
      const msg =
        err.response?.data?.errors?.[0]?.message ||
        err.response?.data?.message ||
        "Failed to create item";
      toast.error(msg);
    },
  });
};

// ─── Mutation Hook: Update Item ────────────────────────────────────────────────
export const useUpdateItem = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }) => {
      const res = await updateItem(id, data);
      return res.data?.data || res.data;
    },
    onSuccess: (updated) => {
      queryClient.invalidateQueries({ queryKey: ["items"] });
      queryClient.invalidateQueries({ queryKey: ["item", updated._id] });
      toast.success("Item updated successfully!");
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || "Failed to update item");
    },
  });
};

// ─── Mutation Hook: Delete Item ────────────────────────────────────────────────
export const useDeleteItem = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id) => {
      const res = await deleteItem(id);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["items"] });
      toast.success("Item deleted successfully!");
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || "Failed to delete item");
    },
  });
};
