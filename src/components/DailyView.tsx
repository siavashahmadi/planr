import { useState } from "react";
import { useTaskStore } from "../store/taskStore";
import { useTasks } from "../hooks/useTasks";
import TaskForm from "./daily/TaskForm";
import TaskItem from "./daily/TaskItem";
import DependencyModal from "./dependencies/DependencyModal";
import type { Task } from "../types/task";

const DailyView = () => {
  const { selectedDate } = useTaskStore();
  const { tasks, loading, error, createTask, updateTask, deleteTask, toggleComplete, reload } =
    useTasks(selectedDate);
  const [depTask, setDepTask] = useState<Task | null>(null);

  const dateObj = new Date(selectedDate + "T00:00:00");
  const dayName = dateObj.toLocaleDateString("en-US", { weekday: "long" });
  const dateLabel = dateObj.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  const sortedTasks = [...tasks].sort((a, b) => {
    if (a.is_completed !== b.is_completed) return a.is_completed ? 1 : -1;
    return 0;
  });

  const completedCount = tasks.filter((t) => t.is_completed).length;

  return (
    <div className="w-full lg:w-80 xl:w-96 flex-shrink-0">
      <div className="bg-white/70 backdrop-blur-sm rounded-xl p-4 shadow-sm">
        <div className="mb-3">
          <div className="text-lg font-semibold text-gray-700">{dayName}</div>
          <div className="text-sm text-gray-400">{dateLabel}</div>
          {tasks.length > 0 && (
            <div className="text-xs text-gray-400 mt-1">
              {completedCount}/{tasks.length} completed
            </div>
          )}
        </div>

        {error && (
          <div className="text-sm text-red-500 bg-red-50 p-2 rounded-lg mb-3">
            {error}
          </div>
        )}

        <div className="space-y-2 mb-3">
          {loading ? (
            <div className="text-center text-gray-400 py-8">Loading...</div>
          ) : sortedTasks.length === 0 ? (
            <div className="text-center text-gray-400 py-8 text-sm">
              No tasks for this day
            </div>
          ) : (
            sortedTasks.map((task) => (
              <TaskItem
                key={task.id}
                task={task}
                onToggleComplete={toggleComplete}
                onUpdate={updateTask}
                onDelete={deleteTask}
                onShowDeps={setDepTask}
              />
            ))
          )}
        </div>

        <TaskForm date={selectedDate} onSubmit={createTask} />
      </div>

      {depTask && (
        <DependencyModal
          task={depTask}
          allTasks={tasks}
          onClose={() => setDepTask(null)}
          onChanged={() => {
            setDepTask(null);
            reload();
          }}
        />
      )}
    </div>
  );
};

export default DailyView;
