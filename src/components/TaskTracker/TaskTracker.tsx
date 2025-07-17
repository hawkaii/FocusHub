import { useState } from "react";
import { Header } from "./Header";
import { Tasks } from "./Tasks";
import { AddTask } from "./AddTask";
import { IoCloseSharp, IoInformationCircleOutline } from "react-icons/io5";
import { useTask, useToggleTasks } from "@Store";
import { TaskInfoModal } from "@App/components/TaskTracker/InfoModal";

export const TaskTracker = () => {
  const [showAddTask, setShowAddTask] = useState(false);
  const { setIsTasksToggled } = useToggleTasks();
  const { tasks } = useTask();
  const [isTaskInfoModalOpen, setIsTaskInfoModalOpen] = useState(false);

  return (
    <div className="mb-2 w-72 rounded-lg border border-border-light bg-background-primary shadow-card backdrop-blur-sm sm:w-96">
      <div className="handle flex w-full cursor-move justify-between border-b border-border-light p-3">
        <div className="flex items-center space-x-2">
          <TaskInfoModal isVisible={isTaskInfoModalOpen} onClose={() => setIsTaskInfoModalOpen(false)} />
          <IoInformationCircleOutline
            className="cursor-pointer text-text-secondary transition-colors duration-200 hover:text-accent-orange"
            onClick={() => setIsTaskInfoModalOpen(true)}
          />
        </div>

        <IoCloseSharp
          className="cursor-pointer text-error transition-colors duration-200 hover:text-red-600"
          onClick={() => setIsTasksToggled(false)}
        />
      </div>

      <div className="joyRideTaskTracker pb-4 pl-4 pr-4 text-text-primary">
        <Header title="Task Tracker" onAdd={() => setShowAddTask(!showAddTask)} showAdd={showAddTask} />
        {showAddTask && <AddTask />}
        {tasks.length > 0 ? (
          <Tasks tasks={tasks} />
        ) : (
          <div className="py-8 text-center text-text-secondary">No Tasks to Show</div>
        )}
      </div>
    </div>
  );
};
