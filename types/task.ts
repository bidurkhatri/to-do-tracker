export type SubTask = {
  id: string;
  heading?: string;
  description: string;
  bulletPoints?: string[];
  timeline?: string;
  completed: boolean;
};

export type ProgressStep = {
  id: string;
  title: string;
  description?: string;
  completed: boolean;
  dueDate?: string;
};

export type TaskMetadata = {
  contact?: {
    name?: string;
    email?: string;
    phone?: string;
  };
  cost?: string;
  timeline?: string;
  documentsNeeded?: string[];
  contingencies?: string;
  progressTracker?: {
    steps: ProgressStep[];
    currentStep?: string;
  };
};

export type Task = {
  id: string;
  title: string;
  description: string;
  categoryId: string;
  subTasks: SubTask[];
  metadata: TaskMetadata;
  createdAt: string;
  updatedAt: string;
};

export type Category = {
  id: string;
  name: string;
  color: string;
  createdAt: string;
};