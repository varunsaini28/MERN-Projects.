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
  const [isLoading, setIsLoading] = useState(false);

  const addTodo = async (e) => {
    e.preventDefault();
    if (!newTodo.trim()) return;
    setIsLoading(true);
    try {
      const response = await axios.post("/api/todos", { text: newTodo });
      setTodos([...todos, response.data]);
      setNewTodo("");
    } catch (error) {
      console.log("Error adding todo:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchTodos = async () => {
    setIsLoading(true);
    try {
      const response = await axios.get("/api/todos");
      setTodos(response.data);
    } catch (error) {
      console.log("Error fetching todos:", error);
    } finally {
      setIsLoading(false);
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
    setIsLoading(true);
    try {
      const response = await axios.patch(`/api/todos/${id}`, {
        text: editedText,
      });
      setTodos(todos.map((todo) => (todo._id === id ? response.data : todo)));
      setEditingTodo(null);
    } catch (error) {
      console.log("Error updating todo:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const deleteTodo = async (id) => {
    setIsLoading(true);
    try {
      await axios.delete(`/api/todos/${id}`);
      setTodos(todos.filter((todo) => todo._id !== id));
    } catch (error) {
      console.log("Error deleting todo:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleTodo = async (id) => {
    setIsLoading(true);
    try {
      const todo = todos.find((t) => t._id === id);
      const response = await axios.patch(`/api/todos/${id}`, {
        completed: !todo.completed,
      });
      setTodos(todos.map((t) => (t._id === id ? response.data : t)));
    } catch (error) {
      console.log("Error toggling todo:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const completedTodos = todos.filter(todo => todo.completed).length;
  const totalTodos = todos.length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl p-8 transition-all duration-300 hover:shadow-2xl">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="flex justify-center items-center mb-4">
            <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-3 rounded-2xl shadow-lg">
              <IoClipboardOutline className="text-3xl text-white" />
            </div>
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
            Task Manager
          </h1>
          <p className="text-gray-500 text-lg">Stay organized and productive</p>
          
          {/* Progress Stats */}
          {totalTodos > 0 && (
            <div className="mt-6 bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-4 border border-blue-100">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-gray-600">Progress</span>
                <span className="text-sm font-bold text-blue-600">
                  {completedTodos}/{totalTodos} completed
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-gradient-to-r from-green-400 to-blue-500 h-2 rounded-full transition-all duration-500 ease-out"
                  style={{ width: totalTodos > 0 ? `${(completedTodos / totalTodos) * 100}%` : '0%' }}
                ></div>
              </div>
            </div>
          )}
        </div>

        {/* Add Todo Form */}
        <form
          onSubmit={addTodo}
          className="flex items-center gap-3 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 p-4 rounded-2xl shadow-sm mb-8 transition-all duration-300 hover:shadow-md"
        >
          <input
            className="flex-1 outline-none px-4 py-3 text-gray-700 placeholder-gray-500 bg-transparent text-lg font-medium"
            type="text"
            value={newTodo}
            onChange={(e) => setNewTodo(e.target.value)}
            placeholder="✏️ What needs to be done?"
            required
          />
          <button
            type="submit"
            disabled={isLoading}
            className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white px-6 py-3 rounded-xl font-semibold cursor-pointer transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none shadow-lg"
          >
            {isLoading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              "Add Task"
            )}
          </button>
        </form>

        {/* Todos List */}
        <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
          {todos.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-gray-400 text-6xl mb-4">📝</div>
              <p className="text-gray-500 text-lg font-medium">No tasks yet</p>
              <p className="text-gray-400">Add a task above to get started!</p>
            </div>
          ) : (
            todos.map((todo) => (
              <div 
                key={todo._id} 
                className={`group bg-white border rounded-2xl p-5 transition-all duration-300 hover:shadow-lg ${
                  todo.completed 
                    ? 'border-green-200 bg-green-50' 
                    : 'border-gray-200 hover:border-blue-200'
                } ${editingTodo === todo._id ? 'ring-2 ring-blue-500 ring-opacity-50' : ''}`}
              >
                {editingTodo === todo._id ? (
                  <div className="flex items-center gap-3">
                    <input
                      className="flex-1 p-4 border-2 border-blue-300 rounded-xl outline-none focus:ring-2 focus:ring-blue-400 text-gray-700 bg-white font-medium text-lg shadow-inner"
                      type="text"
                      value={editedText}
                      onChange={(e) => setEditedText(e.target.value)}
                      autoFocus
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={() => saveEdit(todo._id)}
                        disabled={isLoading}
                        className="p-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl hover:shadow-lg transition-all duration-300 transform hover:scale-105 disabled:opacity-50"
                      >
                        <MdOutlineDone className="text-xl" />
                      </button>
                      <button
                        className="p-3 bg-gradient-to-r from-gray-400 to-gray-500 text-white rounded-xl hover:shadow-lg transition-all duration-300 transform hover:scale-105"
                        onClick={() => setEditingTodo(null)}
                      >
                        <IoClose className="text-xl" />
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4 flex-1 min-w-0">
                      <button
                        onClick={() => toggleTodo(todo._id)}
                        disabled={isLoading}
                        className={`flex-shrink-0 h-7 w-7 border-2 rounded-xl flex items-center justify-center transition-all duration-300 transform hover:scale-110 ${
                          todo.completed
                            ? "bg-gradient-to-r from-green-400 to-emerald-500 border-transparent text-white shadow-lg"
                            : "border-gray-300 hover:border-blue-400 hover:shadow-md bg-white"
                        }`}
                      >
                        {todo.completed && <MdOutlineDone className="text-lg" />}
                      </button>
                      <span 
                        className={`text-lg font-medium transition-all duration-300 ${
                          todo.completed 
                            ? 'text-gray-500 line-through decoration-2' 
                            : 'text-gray-800'
                        } truncate`}
                      >
                        {todo.text}
                      </span>
                    </div>
                    <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <button
                        className="p-3 text-blue-500 hover:text-blue-700 rounded-xl hover:bg-blue-50 transition-all duration-300 transform hover:scale-110"
                        onClick={() => startEditing(todo)}
                      >
                        <MdModeEditOutline className="text-xl" />
                      </button>
                      <button
                        onClick={() => deleteTodo(todo._id)}
                        disabled={isLoading}
                        className="p-3 text-red-500 hover:text-red-700 rounded-xl hover:bg-red-50 transition-all duration-300 transform hover:scale-110 disabled:opacity-50"
                      >
                        <FaTrash className="text-lg" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))
          )}
        </div>

        {/* Footer Stats */}
        {todos.length > 0 && (
          <div className="mt-8 pt-6 border-t border-gray-200">
            <div className="flex justify-between items-center text-sm text-gray-500">
              <span>Total tasks: <strong className="text-gray-700">{totalTodos}</strong></span>
              <span>Completed: <strong className="text-green-600">{completedTodos}</strong></span>
              <span>Pending: <strong className="text-orange-600">{totalTodos - completedTodos}</strong></span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;