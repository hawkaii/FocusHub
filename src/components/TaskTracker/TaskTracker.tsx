import { useState } from "react";
import { Header } from "./Header";
import { Tasks } from "./Tasks";
import { AddTask } from "./AddTask";
import { IoCloseSharp, IoInformationCircleOutline } from "react-icons/io5";
import { FaUser, FaSignInAlt } from "react-icons/fa";
import { useTask, useToggleTasks } from "@Store";
import { useAuth } from "@App/hooks/useAuth";
import { TaskInfoModal } from "@App/components/TaskTracker/InfoModal";
import { AuthModal } from "@Components/Auth/AuthModal";
import { UserProfile } from "@Components/Auth/UserProfile";

export const TaskTracker = () => {
  const [showAddTask, setShowAddTask] = useState(false);
  const { setIsTasksToggled } = useToggleTasks();
  const { tasks } = useTask();
  const { user } = useAuth();
  const [isTaskInfoModalOpen, setIsTaskInfoModalOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

  return (
    <div className="mb-2 w-72 sm:w-96 rounded-lg border border-gray-200 bg-white/[.96] shadow-md dark:border-gray-700 dark:bg-gray-800/[.96]">
      <div className="handle flex w-full cursor-move justify-between p-2">
        <div className="flex items-center space-x-2">
          <TaskInfoModal isVisible={isTaskInfoModalOpen} onClose={() => setIsTaskInfoModalOpen(false)} />
          <IoInformationCircleOutline
            className="cursor-pointer text-white"
            onClick={() => setIsTaskInfoModalOpen(true)}
          />
          
          {/* Auth/Profile Button */}
          {user ? (
            <FaUser
              className="cursor-pointer text-green-400 hover:text-green-300"
              onClick={() => setIsProfileModalOpen(true)}
              title="Profile & Cloud Sync"
            />
          ) : (
            <FaSignInAlt
              className="cursor-pointer text-blue-400 hover:text-blue-300"
              onClick={() => setIsAuthModalOpen(true)}
              title="Sign in to save tasks to cloud"
            />
          )}
        </div>
        
        <IoCloseSharp
          className="cursor-pointer text-red-500 hover:bg-red-200"
          onClick={() => setIsTasksToggled(false)}
        />
      </div>
      
      <div className="joyRideTaskTracker pb-3 pr-3 pl-3 dark:text-gray-300">
        <Header title="Task Tracker" onAdd={() => setShowAddTask(!showAddTask)} showAdd={showAddTask} />
        {showAddTask && <AddTask />}
        {tasks.length > 0 ? <Tasks tasks={tasks} /> : "No Tasks to Show"}
      </div>

      {/* Auth Modal */}
      <AuthModal isVisible={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />
      
      {/* User Profile Modal */}
      <UserProfile isVisible={isProfileModalOpen} onClose={() => setIsProfileModalOpen(false)} />
    </div>
  );
};