import { z } from "zod";
import { publicProcedure } from "@/backend/trpc/create-context";

// Define the schema for category data
const CategorySchema = z.object({
  id: z.string(),
  name: z.string(),
  color: z.string(),
  createdAt: z.string(),
});

export default publicProcedure.query(async () => {
  // This is a mock implementation
  // In a real app, you would fetch categories from a database
  
  // For demo purposes, we'll return sample categories
  const categories = [
    {
      id: "cat-1",
      name: "Business Setup",
      color: "#4F46E5",
      createdAt: new Date().toISOString(),
    },
    {
      id: "cat-2",
      name: "Compliance",
      color: "#10B981",
      createdAt: new Date().toISOString(),
    },
    {
      id: "cat-3",
      name: "Finance",
      color: "#F59E0B",
      createdAt: new Date().toISOString(),
    },
  ];

  return {
    categories,
    total: categories.length,
  };
});