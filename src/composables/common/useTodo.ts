import { ref, computed } from 'vue';

export interface Todo {
  id: number;
  title: string;
  description?: string;
  completed: boolean;
  priority: 'low' | 'medium' | 'high';
  dueDate?: string;
}

/**
 * 待办事项管理 Composable
 */
export function useTodo() {
  const todos = ref<Todo[]>([]);

  // 待办数量
  const todoCount = computed(() => todos.value.filter(todo => !todo.completed).length);

  // 添加待办
  const addTodo = (todo: Omit<Todo, 'id'>) => {
    const newTodo: Todo = {
      id: Date.now(),
      ...todo,
    };
    todos.value.push(newTodo);
  };

  // 完成待办
  const completeTodo = (id: number) => {
    const todo = todos.value.find(t => t.id === id);
    if (todo) {
      todo.completed = true;
    }
  };

  // 删除待办
  const deleteTodo = (id: number) => {
    const index = todos.value.findIndex(t => t.id === id);
    if (index > -1) {
      todos.value.splice(index, 1);
    }
  };

  // 获取待办列表
  const getTodos = (filter?: 'all' | 'active' | 'completed') => {
    if (!filter || filter === 'all') {
      return todos.value;
    }
    return todos.value.filter(todo => (filter === 'active' ? !todo.completed : todo.completed));
  };

  return {
    todos,
    todoCount,
    addTodo,
    completeTodo,
    deleteTodo,
    getTodos,
  };
}
