import { z } from "zod";
import { publicProcedure } from "@/backend/trpc/create-context";

// Define the schema for task data
const TaskSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string(),
  categoryId: z.string(),
  subTasks: z.array(
    z.object({
      id: z.string(),
      description: z.string(),
      timeline: z.string().optional(),
      completed: z.boolean(),
    })
  ),
  metadata: z.object({
    contact: z
      .object({
        name: z.string().optional(),
        email: z.string().optional(),
        phone: z.string().optional(),
      })
      .optional(),
    cost: z.string().optional(),
    timeline: z.string().optional(),
    documentsNeeded: z.array(z.string()).optional(),
    contingencies: z.string().optional(),
    progressTracker: z.string().optional(),
  }),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export default publicProcedure
  .input(
    z.object({
      filter: z.enum(["all", "completed", "inProgress"]).optional().default("all"),
      search: z.string().optional(),
      categoryId: z.string().optional(),
    })
  )
  .query(async ({ input }) => {
    // This is a mock implementation
    // In a real app, you would fetch tasks from a database
    
    // For demo purposes, we'll return a sample task
    const tasks = [
      {
        id: "sample-task-1",
        title: "Sample Task from Backend",
        description: "This task is fetched from the backend API",
        categoryId: "cat-1",
        subTasks: [
          {
            id: "subtask-1",
            description: "First subtask",
            completed: true,
          },
          {
            id: "subtask-2",
            description: "Second subtask",
            timeline: "2 days",
            completed: false,
          },
        ],
        metadata: {
          contact: {
            name: "API Service",
            email: "api@example.com",
          },
          timeline: "1 week",
        },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ];

    // Apply filters
    let filteredTasks = tasks;
    
    if (input.filter === "completed") {
      filteredTasks = tasks.filter(task => 
        task.subTasks.length > 0 && task.subTasks.every(st => st.completed)
      );
    } else if (input.filter === "inProgress") {
      filteredTasks = tasks.filter(task => 
        task.subTasks.length === 0 || !task.subTasks.every(st => st.completed)
      );
    }
    
    if (input.search) {
      const searchLower = input.search.toLowerCase();
      filteredTasks = filteredTasks.filter(task => 
        task.title.toLowerCase().includes(searchLower) ||
        task.description.toLowerCase().includes(searchLower)
      );
    }
    
    if (input.categoryId) {
      filteredTasks = filteredTasks.filter(task => 
        task.categoryId === input.categoryId
      );
    }

    return {
      tasks: filteredTasks,
      total: tasks.length,
      filtered: filteredTasks.length,
    };
  });