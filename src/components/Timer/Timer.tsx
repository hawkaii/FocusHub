import { useState, useEffect, useRef } from "react";
import { IoCloseSharp } from "react-icons/io5";
import { Button } from "@Components/Common/Button";
import {
  useToggleTimer,
  useShortBreakTimer,
  useLongBreakTimer,
  usePomodoroTimer,
  useHasStarted,
  useTimer,
  useBreakStarted,
  useAudioVolume,
  useAlarmOption,
  useTimeTracking,
  useTask,
} from "@Store";
import toast from "react-hot-toast";
import { secondsToTime, formatDisplayTime } from "@Utils/utils";
import { successToast } from "@Utils/toast";
import clsx from "clsx";

export const Timer = () => {
  const { shortBreakLength, setShortBreak } = useShortBreakTimer();
  const { longBreakLength, setLongBreak } = useLongBreakTimer();
  const { pomodoroLength, setPomodoroLength } = usePomodoroTimer();
  const { hasStarted, setHasStarted } = useHasStarted();
  const { breakStarted, setBreakStarted } = useBreakStarted();
  const [breakLength, setBreakLength] = useState(shortBreakLength);
  const [timer, setTimer] = useState(60);
  const { setTimerQueue } = useTimer();
  const [timerMinutes, setTimerMinutes] = useState("00");
  const [timerSeconds, setTimerSeconds] = useState("00");
  const [timerIntervalId, setTimerIntervalId] = useState(null);
  const [sessionType, setSessionType] = useState("Session");
  const { setIsTimerToggled } = useToggleTimer();
  const { alarm } = useAlarmOption();
  const { startSession, endSession, updateCurrentSession } = useTimeTracking();
  const { tasks, setPomodoroCounter } = useTask();

  const audioRef = useRef();
  const { audioVolume } = useAudioVolume();
  const updateIntervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    setHasStarted(timerIntervalId !== null);
  }, [timerIntervalId]);

  useEffect(() => {
    if (timer === 0) {
      setTimerQueue(0);
      // @ts-ignore
      audioRef.current.volume = audioVolume;
      // @ts-ignore
      audioRef.current.play();

      // End current session as completed
      endSession(true);

      if (sessionType === "Session") {
        // Completed a pomodoro session - increment counter for active task
        const activeTask = tasks.find(task => task.inProgress);
        if (activeTask) {
          setPomodoroCounter(activeTask.id);
        }

        setSessionType("Break");
        setTimer(breakLength);
        setBreakStarted(true);
        toast(
          t => (
            <div className="flex items-center justify-between">
              <div>Break Mode</div>
              <IoCloseSharp
                className="cursor-pointer text-error hover:text-red-600"
                onClick={() => toast.dismiss(t.id)}
              />
            </div>
          ),
          {
            duration: breakLength * 1000,
            icon: "😇",
            style: {
              borderRadius: "10px",
              padding: "16px",
              background: "#2D3142",
              color: "#fff",
            },
          }
        );
      } else {
        setSessionType("Session");
        setTimer(pomodoroLength);
        setBreakStarted(false);
        setTimerQueue(pomodoroLength);
        toast.dismiss();
        toast(
          t => (
            <div className="flex items-center justify-between">
              <div>Work Mode</div>
              <IoCloseSharp
                className="cursor-pointer text-error hover:text-red-600"
                onClick={() => toast.dismiss(t.id)}
              />
            </div>
          ),
          {
            duration: breakLength * 1000,
            icon: "📚",
            style: {
              borderRadius: "10px",
              padding: "16px",
              background: "#2D3142",
              color: "#fff",
            },
          }
        );
      }
    }
  }, [
    timer,
    sessionType,
    audioVolume,
    endSession,
    tasks,
    setPomodoroCounter,
    breakLength,
    setTimerQueue,
    setBreakStarted,
    pomodoroLength,
  ]);

  useEffect(() => {
    setTimer(pomodoroLength);
  }, [pomodoroLength]);

  useEffect(() => {
    let time = secondsToTime(timer);
    // @ts-ignore
    setTimerMinutes(time[0]);
    // @ts-ignore
    setTimerSeconds(time[1]);
  }, [timer]);

  // Show timer in page title when timer is running
  useEffect(() => {
    if (hasStarted) {
      const icon = sessionType === "Session" ? "⏱" : "☕️";
      // @ts-ignore
      document.title = `FocusHub ${icon}${formatDisplayTime(parseInt(timerMinutes))}:${formatDisplayTime(
        parseInt(timerSeconds)
      )}`;
    } else {
      document.title = "FocusHub";
    }
  }, [hasStarted, timerMinutes, timerSeconds, sessionType]);

  // Cleanup intervals on component unmount
  useEffect(() => {
    return () => {
      if (updateIntervalRef.current) {
        clearInterval(updateIntervalRef.current);
      }
    };
  }, []);

  function toggleCountDown() {
    if (hasStarted) {
      // Pause/Stop mode - end current session
      if (timerIntervalId) {
        clearInterval(timerIntervalId);
      }
      if (updateIntervalRef.current) {
        clearInterval(updateIntervalRef.current);
        updateIntervalRef.current = null;
      }
      setTimerIntervalId(null);

      // End the current session as paused/incomplete
      endSession(false);
    } else {
      // Start mode - begin new session
      const currentSessionType =
        sessionType === "Session" ? "pomodoro" : breakLength === shortBreakLength ? "shortBreak" : "longBreak";
      const plannedDuration = sessionType === "Session" ? pomodoroLength : breakLength;

      // Find the current active task (in progress)
      const activeTask = tasks.find(task => task.inProgress);

      // Start time tracking session
      startSession(currentSessionType, plannedDuration, activeTask?.id);

      // Set up minute-by-minute updates
      updateIntervalRef.current = setInterval(() => {
        updateCurrentSession();
      }, 60000); // Update every minute

      // Create timer interval
      const newIntervalId = setInterval(() => {
        setTimer(prevTime => {
          let newTime = prevTime - 1;
          let time = secondsToTime(newTime);
          // @ts-ignore
          setTimerMinutes(time[0]);
          // @ts-ignore
          setTimerSeconds(time[1]);
          return newTime;
        });
      }, 1000);
      setTimerIntervalId(newIntervalId);
    }
  }

  function handleResetTimer() {
    // @ts-ignore
    audioRef?.current?.load();
    if (timerIntervalId) {
      clearInterval(timerIntervalId);
    }
    if (updateIntervalRef.current) {
      clearInterval(updateIntervalRef.current);
      updateIntervalRef.current = null;
    }
    setTimerIntervalId(null);

    // End current session as incomplete if there was one running
    if (hasStarted) {
      endSession(false);
    }

    setPomodoroLength(pomodoroLength);
    setShortBreak(shortBreakLength);
    setLongBreak(longBreakLength);
    setSessionType("Session");
    setBreakStarted(false);
    setTimer(pomodoroLength);
    setTimerQueue(pomodoroLength);
  }

  function selectBreak(breakLength: number) {
    if (hasStarted) return; // guard against change when running
    if (sessionType == "Break") {
      return;
    }
    setBreakLength(breakLength);
    successToast(`Break Length Set at ${breakLength / 60} minutes`, false);
  }

  return (
    <div
      className={clsx(
        "dwidth mb-2 max-w-sm rounded-lg border shadow-card transition-all duration-200 sm:w-96",
        breakStarted
          ? "border-info bg-blue-50 shadow-card-hover dark:bg-blue-900/30"
          : "border-border-light bg-background-primary",
        "backdrop-blur-sm"
      )}
    >
      <div className="text-center">
        <div className="rounded-t-lg border-b border-border-light p-3">
          <div className="mb-2 flex justify-end">
            <IoCloseSharp
              className="cursor-pointer text-error transition-colors duration-200 hover:text-red-600"
              onClick={() => setIsTimerToggled(false)}
            />
          </div>
          {/* Controls */}
          <div className="mb-4 flex gap-2">
            <div className="flex flex-1">
              <Button
                className={clsx("w-full text-sm", breakLength === shortBreakLength && "ring-2 ring-accent-orange")}
                variant="secondary"
                size="small"
                onClick={() => selectBreak(shortBreakLength)}
                disabled={hasStarted}
              >
                Short Break
              </Button>
            </div>

            <div className="flex flex-1">
              <Button
                className={clsx("w-full text-sm", breakLength === longBreakLength && "ring-2 ring-accent-orange")}
                variant="secondary"
                size="small"
                onClick={() => selectBreak(longBreakLength)}
                disabled={hasStarted}
              >
                Long Break
              </Button>
            </div>
          </div>
          {/* Timer */}
          <div className="mb-4">
            <p className="mb-2 font-medium text-text-secondary">{sessionType}</p>
            <div className="text-6xl font-bold tabular-nums text-text-primary sm:text-8xl">
              {/*// @ts-ignore */}
              {formatDisplayTime(timerMinutes)}:{/*// @ts-ignore */}
              {formatDisplayTime(timerSeconds)}
            </div>
          </div>

          <div className="timer-control flex justify-center gap-3 tabular-nums">
            <Button variant={hasStarted ? "secondary" : "primary"} onClick={() => toggleCountDown()}>
              <p className="tabular-nums">{hasStarted ? "Pause" : "Start"}</p>
            </Button>
            <Button variant="tertiary" onClick={handleResetTimer}>
              <p className="tabular-nums">Reset</p>
            </Button>
          </div>
        </div>
      </div>
      <audio id="beep" preload="auto" ref={audioRef} src={alarm} />
    </div>
  );
};
