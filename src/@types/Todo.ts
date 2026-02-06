export type Todo = {
  id: string;
  text: string;
  completed: boolean;
  createdAt: string;
  userId?: string;
};

export type TodoState = {
  todos: Todo[];
  loading: boolean;
  error: string | null;
};
