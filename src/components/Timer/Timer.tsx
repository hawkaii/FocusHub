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
} from "@Store";
import { useAuth } from "@App/hooks/useAuth";
import { useRealtimeAnalytics } from "@App/hooks/useRealtimeAnalytics";
import toast from "react-hot-toast";
import { secondsToTime, formatDisplayTime } from "@Utils/utils";
import { successToast } from "@Utils/toast";
import { calculateDuration } from "@Utils/timeUtils";
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
  const [sessionStartTime, setSessionStartTime] = useState<Date | null>(null);
  const { setIsTimerToggled } = useToggleTimer();
  const { alarm } = useAlarmOption();
  const { user } = useAuth();
  const { addSession } = useRealtimeAnalytics();

  const audioRef = useRef();
  const { audioVolume } = useAudioVolume();

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
      
      // Save completed session to analytics
      if (sessionStartTime && user) {
        const endTime = new Date();
        const duration = calculateDuration(sessionStartTime, endTime);
        
        addSession({
          userId: user.uid,
          startTime: sessionStartTime,
          endTime,
          duration,
          type: sessionType === "Session" ? 'work' : (breakLength === shortBreakLength ? 'short-break' : 'long-break'),
          completed: true,
        });
      }
      
      if (sessionType === "Session") {
        setSessionType("Break");
        setTimer(breakLength);
        setBreakStarted(true);
        setSessionStartTime(new Date()); // Start tracking break time
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
        setSessionStartTime(new Date()); // Start tracking work time
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
  }, [timer, sessionType, audioVolume, sessionStartTime, user, addSession, breakLength, shortBreakLength, pomodoroLength]);

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
      document.title = `FocusStation ${icon}${formatDisplayTime(parseInt(timerMinutes))}:${formatDisplayTime(
        parseInt(timerSeconds)
      )}`;
    } else {
      document.title = "FocusStation";
    }
  }, [hasStarted, timerMinutes, timerSeconds, sessionType]);

  function toggleCountDown() {
    if (hasStarted) {
      // Pausing - save incomplete session if user is authenticated
      if (sessionStartTime && user) {
        const endTime = new Date();
        const duration = calculateDuration(sessionStartTime, endTime);
        
        // Only save if session was longer than 30 seconds
        if (duration > 30) {
          addSession({
            userId: user.uid,
            startTime: sessionStartTime,
            endTime,
            duration,
            type: sessionType === "Session" ? 'work' : (breakLength === shortBreakLength ? 'short-break' : 'long-break'),
            completed: false, // Mark as incomplete since it was paused
          });
        }
      }
      
      // started mode
      if (timerIntervalId) {
        clearInterval(timerIntervalId);
      }
      setTimerIntervalId(null);
      setSessionStartTime(null);
    } else {
      // Starting - record start time
      setSessionStartTime(new Date());
      
      // stopped mode
      // create accurate date timer with date
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
    // Save incomplete session if there was one running
    if (sessionStartTime && user && hasStarted) {
      const endTime = new Date();
      const duration = calculateDuration(sessionStartTime, endTime);
      
      // Only save if session was longer than 30 seconds
      if (duration > 30) {
        addSession({
          userId: user.uid,
          startTime: sessionStartTime,
          endTime,
          duration,
          type: sessionType === "Session" ? 'work' : (breakLength === shortBreakLength ? 'short-break' : 'long-break'),
          completed: false, // Mark as incomplete since it was reset
        });
      }
    }
    
    // @ts-ignore
    audioRef?.current?.load();
    if (timerIntervalId) {
      clearInterval(timerIntervalId);
    }
    setTimerIntervalId(null);
    setSessionStartTime(null);
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
        "dwidth sm:w-96 mb-2 max-w-sm rounded-lg border shadow-card transition-all duration-200",
        breakStarted 
          ? "bg-blue-50 border-info shadow-card-hover dark:bg-blue-900/30" 
          : "bg-background-primary border-border-light",
        "backdrop-blur-sm"
      )}
    >
      <div className="text-center">
        <div className="rounded-t-lg p-3 border-b border-border-light">
          <div className="flex justify-end mb-2">
            <IoCloseSharp
              className="cursor-pointer text-error hover:text-red-600 transition-colors duration-200"
              onClick={() => setIsTimerToggled(false)}
            />
          </div>
          {/* Controls */}
          <div className="flex gap-2 mb-4">
            <div className="flex flex-1">
              <Button
                className={clsx(
                  "w-full text-sm",
                  breakLength === shortBreakLength && "ring-2 ring-accent-orange"
                )}
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
                className={clsx(
                  "w-full text-sm",
                  breakLength === longBreakLength && "ring-2 ring-accent-orange"
                )}
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
            <p className="text-text-secondary font-medium mb-2">{sessionType}</p>
            <div className="text-6xl font-bold tabular-nums text-text-primary sm:text-8xl">
              {/*// @ts-ignore */}
              {formatDisplayTime(timerMinutes)}:{/*// @ts-ignore */}
              {formatDisplayTime(timerSeconds)}
            </div>
          </div>

          <div className="timer-control tabular-nums flex gap-3 justify-center">
            <Button
              variant={hasStarted ? "secondary" : "primary"}
              onClick={() => toggleCountDown()}
            >
              <p className="tabular-nums">{hasStarted ? "Pause" : "Start"}</p>
            </Button>
            <Button
              variant="tertiary"
              onClick={handleResetTimer}
            >
              <p className="tabular-nums">Reset</p>
            </Button>
          </div>
        </div>
      </div>
      <audio id="beep" preload="auto" ref={audioRef} src={alarm} />
    </div>
  );
};