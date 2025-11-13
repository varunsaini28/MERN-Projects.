import { useEffect, useState } from "react";
import { MdOutlineDone } from "react-icons/md";
import { IoClose } from "react-icons/io5";
import { MdModeEditOutline } from "react-icons/md";
import { FaTrash } from "react-icons/fa6";
import { IoClipboardOutline } from "react-icons/io5";
import axios from "axios";

function App() {
  const [newTodo, setNewTodo] = useState("");
  const [todos, setTodos] = useState([]);
  const [editingTodo, setEditingTodo] = useState(null);
  const [editedText, setEditedText] = useState("");
  const [loading, setLoading] = useState(false);

  const addTodo = async (e) => {
    e.preventDefault();
    if (!newTodo.trim()) return;
    setLoading(true);
    try {
      const response = await axios.post("/api/todos", { text: newTodo });
      setTodos([...todos, response.data]);
      setNewTodo("");
    } catch (error) {
      console.log("Error adding todo:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchTodos = async () => {
    setLoading(true);
    try {
      const response = await axios.get("/api/todos");
      setTodos(response.data);
    } catch (error) {
      console.log("Error fetching todos:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTodos();
  }, []);

  const startEditing = (todo) => {
    setEditingTodo(todo._id);
    setEditedText(todo.text);
  };

  const saveEdit = async (id) => {
    if (!editedText.trim()) return;
    setLoading(true);
    try {
      const response = await axios.patch(`/api/todos/${id}`, {
        text: editedText,
      });
      setTodos(todos.map((todo) => (todo._id === id ? response.data : todo)));
      setEditingTodo(null);
    } catch (error) {
      console.log("Error updating todo:", error);
    } finally {
      setLoading(false);
    }
  };

  const deleteTodo = async (id) => {
    setLoading(true);
    try {
      await axios.delete(`/api/todos/${id}`);
      setTodos(todos.filter((todo) => todo._id !== id));
    } catch (error) {
      console.log("Error deleting todo:", error);
    } finally {
      setLoading(false);
    }
  };

  const toggleTodo = async (id) => {
    setLoading(true);
    try {
      const todo = todos.find((t) => t._id === id);
      const response = await axios.patch(`/api/todos/${id}`, {
        completed: !todo.completed,
      });
      setTodos(todos.map((t) => (t._id === id ? response.data : t)));
    } catch (error) {
      console.log("Error toggling todo:", error);
    } finally {
      setLoading(false);
    }
  };

  const completedTodos = todos.filter(todo => todo.completed).length;
  const totalTodos = todos.length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl p-6 md:p-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="p-3 bg-blue-500 rounded-xl shadow-lg">
              <IoClipboardOutline className="text-2xl text-white" />
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-slate-800">
              Task Manager
            </h1>
          </div>
          <p className="text-slate-600 text-sm md:text-base">
            Stay organized and productive
          </p>
        </div>

        {/* Stats */}
        {todos.length > 0 && (
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-4 mb-6 border border-blue-100">
            <div className="flex justify-between items-center text-sm text-slate-700">
              <span>Total Tasks: <strong>{totalTodos}</strong></span>
              <span>Completed: <strong>{completedTodos}</strong></span>
              <span>Progress: <strong>{totalTodos ? Math.round((completedTodos / totalTodos) * 100) : 0}%</strong></span>
            </div>
            <div className="w-full bg-slate-200 rounded-full h-2 mt-2">
              <div 
                className="bg-green-500 h-2 rounded-full transition-all duration-500 ease-out"
                style={{ width: `${totalTodos ? (completedTodos / totalTodos) * 100 : 0}%` }}
              ></div>
            </div>
          </div>
        )}

        {/* Add Todo Form */}
        <form
          onSubmit={addTodo}
          className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 mb-8"
        >
          <div className="flex-1 relative">
            <input
              className="w-full outline-none px-4 py-3 text-slate-700 placeholder-slate-400 border border-slate-200 rounded-xl focus:border-blue-400 focus:ring-4 focus:ring-blue-100 transition-all duration-200 bg-white shadow-sm"
              type="text"
              value={newTodo}
              onChange={(e) => setNewTodo(e.target.value)}
              placeholder="What needs to be done today?"
              required
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="bg-blue-500 hover:bg-blue-600 disabled:bg-blue-300 text-white px-6 py-3 rounded-xl font-semibold cursor-pointer transition-all duration-200 shadow-lg hover:shadow-xl disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Adding...</span>
              </>
            ) : (
              <>
                <span>Add Task</span>
                <MdOutlineDone className="text-lg" />
              </>
            )}
          </button>
        </form>

        {/* Todos List */}
        <div className="space-y-3">
          {loading && todos.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-slate-500">Loading tasks...</p>
            </div>
          ) : todos.length === 0 ? (
            <div className="text-center py-12 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200">
              <IoClipboardOutline className="text-4xl text-slate-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-slate-500 mb-2">
                No tasks yet
              </h3>
              <p className="text-slate-400 text-sm">
                Add a task above to get started
              </p>
            </div>
          ) : (
            <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
              {todos.map((todo) => (
                <div 
                  key={todo._id} 
                  className={`bg-white rounded-xl border-2 transition-all duration-200 hover:shadow-md ${
                    todo.completed 
                      ? 'border-green-200 bg-green-50' 
                      : 'border-slate-100 hover:border-slate-200'
                  }`}
                >
                  {editingTodo === todo._id ? (
                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 p-4">
                      <input
                        className="flex-1 p-3 border rounded-xl border-slate-200 outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-400 text-slate-700 bg-white transition-all duration-200"
                        type="text"
                        value={editedText}
                        onChange={(e) => setEditedText(e.target.value)}
                        autoFocus
                      />
                      <div className="flex gap-2">
                        <button
                          onClick={() => saveEdit(todo._id)}
                          disabled={loading || !editedText.trim()}
                          className="px-4 py-3 bg-green-500 hover:bg-green-600 disabled:bg-green-300 text-white rounded-xl cursor-pointer transition-all duration-200 flex items-center gap-2"
                        >
                          <MdOutlineDone />
                          <span className="hidden sm:inline">Save</span>
                        </button>
                        <button
                          className="px-4 py-3 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-xl cursor-pointer transition-all duration-200 flex items-center gap-2"
                          onClick={() => setEditingTodo(null)}
                        >
                          <IoClose />
                          <span className="hidden sm:inline">Cancel</span>
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4 flex-1 min-w-0">
                          <button
                            onClick={() => toggleTodo(todo._id)}
                            className={`flex-shrink-0 h-6 w-6 border-2 rounded-lg flex items-center justify-center transition-all duration-200 ${
                              todo.completed
                                ? "bg-green-500 border-green-500 text-white shadow-inner"
                                : "border-slate-300 hover:border-blue-400 hover:bg-blue-50"
                            }`}
                          >
                            {todo.completed && <MdOutlineDone className="text-sm" />}
                          </button>
                          <span 
                            className={`text-slate-800 font-medium truncate transition-all duration-200 ${
                              todo.completed ? 'line-through text-slate-500' : ''
                            }`}
                          >
                            {todo.text}
                          </span>
                        </div>
                        <div className="flex gap-1 ml-3">
                          <button
                            className="p-2 text-blue-500 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-all duration-200"
                            onClick={() => startEditing(todo)}
                            title="Edit task"
                          >
                            <MdModeEditOutline />
                          </button>
                          <button
                            onClick={() => deleteTodo(todo._id)}
                            className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-all duration-200"
                            title="Delete task"
                          >
                            <FaTrash />
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {todos.length > 0 && (
          <div className="mt-6 pt-4 border-t border-slate-200">
            <p className="text-center text-slate-500 text-sm">
              {completedTodos} of {totalTodos} tasks completed
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;