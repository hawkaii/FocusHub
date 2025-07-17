import { useState } from "react";
import { FaUser, FaSignOutAlt, FaCloud, FaDownload, FaUpload } from "react-icons/fa";
import { IoCloseSharp } from "react-icons/io5";
import { useAuth } from "@App/hooks/useAuth";
import { useCloudTasks } from "@App/hooks/useCloudTasks";
import { useTask } from "@Store";
import { Button } from "@Components/Common/Button";
import { successToast } from "@Utils/toast";

interface UserProfileProps {
  isVisible: boolean;
  onClose: () => void;
}

export const UserProfile = ({ isVisible, onClose }: UserProfileProps) => {
  const { user, signOut } = useAuth();
  const { tasks, removeAllTasks, addTask } = useTask();
  const { cloudTasks, syncToCloud, loadFromCloud, syncing } = useCloudTasks();
  const [loading, setLoading] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    onClose();
    successToast("Signed out successfully", false);
  };

  const handleSyncToCloud = async () => {
    await syncToCloud(tasks);
  };

  const handleLoadFromCloud = async () => {
    setLoading(true);
    try {
      const cloudTasksData = await loadFromCloud();

      // Clear local tasks and load cloud tasks
      removeAllTasks();

      cloudTasksData.forEach(task => {
        addTask(task.description, task.pomodoro, false);
      });

      successToast("Tasks loaded from cloud successfully", false);
    } catch (error) {
      console.error("Error loading from cloud:", error);
    } finally {
      setLoading(false);
    }
  };

  if (!isVisible || !user) return null;

  return (
    <div className="modal" onClick={onClose}>
      <div
        className="w-full max-w-md rounded-lg bg-white p-6 text-gray-800 shadow-md dark:bg-gray-800 dark:text-gray-300"
        onClick={e => e.stopPropagation()}
      >
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center">
            <FaUser className="mr-2" />
            <div>
              <h2 className="text-xl font-bold">Profile</h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">{user.email}</p>
            </div>
          </div>
          <IoCloseSharp className="cursor-pointer text-red-500 hover:bg-red-200" onClick={onClose} />
        </div>

        <div className="space-y-4">
          <div className="border-t pt-4">
            <h3 className="mb-2 flex items-center font-semibold">
              <FaCloud className="mr-2" />
              Cloud Sync
            </h3>
            <p className="mb-3 text-sm text-gray-600 dark:text-gray-400">
              Local tasks: {tasks.length} | Cloud tasks: {cloudTasks.length}
            </p>

            <div className="space-y-2">
              <Button
                onClick={handleSyncToCloud}
                variant="primary"
                className="flex w-full items-center justify-center"
                disabled={syncing}
              >
                <FaUpload className="mr-2" />
                {syncing ? "Syncing..." : "Sync to Cloud"}
              </Button>

              <Button
                onClick={handleLoadFromCloud}
                variant="secondary"
                className="flex w-full items-center justify-center"
                disabled={loading}
              >
                <FaDownload className="mr-2" />
                {loading ? "Loading..." : "Load from Cloud"}
              </Button>
            </div>
          </div>

          <div className="border-t pt-4">
            <Button onClick={handleSignOut} variant="danger" className="flex w-full items-center justify-center">
              <FaSignOutAlt className="mr-2" />
              Sign Out
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
