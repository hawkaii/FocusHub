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
    <div className="mb-2 w-72 sm:w-96 rounded-lg border border-border-light bg-background-primary/95 shadow-card backdrop-blur-sm">
      <div className="handle flex w-full cursor-move justify-between p-3 border-b border-border-light">
        <div className="flex items-center space-x-2">
          <TaskInfoModal isVisible={isTaskInfoModalOpen} onClose={() => setIsTaskInfoModalOpen(false)} />
          <IoInformationCircleOutline
            className="cursor-pointer text-text-secondary hover:text-accent-orange transition-colors duration-200"
            onClick={() => setIsTaskInfoModalOpen(true)}
          />
        </div>
        
        <IoCloseSharp
          className="cursor-pointer text-error hover:text-red-600 transition-colors duration-200"
          onClick={() => setIsTasksToggled(false)}
        />
      </div>
      
      <div className="joyRideTaskTracker pb-4 pr-4 pl-4 text-text-primary">
        <Header title="Task Tracker" onAdd={() => setShowAddTask(!showAddTask)} showAdd={showAddTask} />
        {showAddTask && <AddTask />}
        {tasks.length > 0 ? <Tasks tasks={tasks} /> : (
          <div className="text-center py-8 text-text-secondary">
            No Tasks to Show
          </div>
        )}
      </div>
    </div>
  );
};