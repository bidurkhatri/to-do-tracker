import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Task, Category, SubTask, ProgressStep } from '@/types/task';
import { generateId } from '@/utils/helpers';

interface TaskState {
  tasks: Task[];
  categories: Category[];
  
  // Task actions
  addTask: (task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => string;
  updateTask: (id: string, task: Partial<Omit<Task, 'id' | 'createdAt' | 'updatedAt'>>) => void;
  deleteTask: (id: string) => void;
  
  // Subtask actions
  toggleSubTask: (taskId: string, subTaskId: string) => void;
  addSubTask: (taskId: string, subTask: Omit<SubTask, 'id' | 'completed'>) => void;
  updateSubTask: (taskId: string, subTaskId: string, subTask: Partial<Omit<SubTask, 'id'>>) => void;
  deleteSubTask: (taskId: string, subTaskId: string) => void;
  
  // Progress tracker actions
  updateProgressStep: (taskId: string, stepId: string, completed: boolean) => void;
  
  // Category actions
  addCategory: (category: Omit<Category, 'id' | 'createdAt'>) => string;
  updateCategory: (id: string, category: Partial<Omit<Category, 'id' | 'createdAt'>>) => void;
  deleteCategory: (id: string) => void;
  
  // Helpers
  getTasksByCategory: (categoryId: string) => Task[];
  getTaskProgress: (taskId: string) => number;
  getCategoryProgress: (categoryId: string) => number;
  searchTasks: (query: string) => Task[];
  
  // Reset
  resetStore: () => void;
}

export const useTaskStore = create<TaskState>()(
  persist(
    (set, get) => ({
      tasks: [],
      categories: [],
      
      // Task actions
      addTask: (task) => {
        const id = generateId();
        const now = new Date().toISOString();
        
        set((state) => ({
          tasks: [
            ...state.tasks,
            {
              ...task,
              id,
              createdAt: now,
              updatedAt: now,
            },
          ],
        }));
        
        return id;
      },
      
      updateTask: (id, updatedTask) => {
        set((state) => ({
          tasks: state.tasks.map((task) =>
            task.id === id
              ? {
                  ...task,
                  ...updatedTask,
                  updatedAt: new Date().toISOString(),
                }
              : task
          ),
        }));
      },
      
      deleteTask: (id) => {
        set((state) => ({
          tasks: state.tasks.filter((task) => task.id !== id),
        }));
      },
      
      // Subtask actions
      toggleSubTask: (taskId, subTaskId) => {
        set((state) => {
          const task = state.tasks.find(t => t.id === taskId);
          if (!task) return state;
          
          // Find the subtask
          const subTask = task.subTasks.find(st => st.id === subTaskId);
          if (!subTask) return state;
          
          // Toggle the subtask
          const updatedSubTasks = task.subTasks.map(st => 
            st.id === subTaskId ? { ...st, completed: !st.completed } : st
          );
          
          // Check if all subtasks are now completed
          const allCompleted = updatedSubTasks.every(st => st.completed);
          
          // If we have a progress tracker and all subtasks are completed,
          // also mark all progress steps as completed
          let updatedMetadata = { ...task.metadata };
          if (allCompleted && task.metadata.progressTracker) {
            updatedMetadata = {
              ...task.metadata,
              progressTracker: {
                ...task.metadata.progressTracker,
                steps: task.metadata.progressTracker.steps.map(step => ({ ...step, completed: true }))
              }
            };
          }
          
          return {
            tasks: state.tasks.map(t => 
              t.id === taskId 
                ? { 
                    ...t, 
                    subTasks: updatedSubTasks,
                    metadata: updatedMetadata,
                    updatedAt: new Date().toISOString() 
                  } 
                : t
            )
          };
        });
      },
      
      addSubTask: (taskId, subTask) => {
        set((state) => ({
          tasks: state.tasks.map((task) =>
            task.id === taskId
              ? {
                  ...task,
                  subTasks: [
                    ...task.subTasks,
                    {
                      ...subTask,
                      id: generateId(),
                      completed: false,
                    },
                  ],
                  updatedAt: new Date().toISOString(),
                }
              : task
          ),
        }));
      },
      
      updateSubTask: (taskId, subTaskId, updatedSubTask) => {
        set((state) => ({
          tasks: state.tasks.map((task) =>
            task.id === taskId
              ? {
                  ...task,
                  subTasks: task.subTasks.map((subTask) =>
                    subTask.id === subTaskId
                      ? { ...subTask, ...updatedSubTask }
                      : subTask
                  ),
                  updatedAt: new Date().toISOString(),
                }
              : task
          ),
        }));
      },
      
      deleteSubTask: (taskId, subTaskId) => {
        set((state) => ({
          tasks: state.tasks.map((task) =>
            task.id === taskId
              ? {
                  ...task,
                  subTasks: task.subTasks.filter(
                    (subTask) => subTask.id !== subTaskId
                  ),
                  updatedAt: new Date().toISOString(),
                }
              : task
          ),
        }));
      },
      
      // Progress tracker actions
      updateProgressStep: (taskId, stepId, completed) => {
        set((state) => {
          const task = state.tasks.find(t => t.id === taskId);
          if (!task || !task.metadata.progressTracker) return state;
          
          const updatedSteps = task.metadata.progressTracker.steps.map(step => 
            step.id === stepId ? { ...step, completed } :