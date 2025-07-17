import { useEffect } from "react";
import { FaSpotify } from "react-icons/fa";
import { IoMusicalNotesOutline, IoCloseSharp } from "react-icons/io5";
import { CgNotes } from "react-icons/cg";
import { MdOutlineTimer, MdWbSunny, MdOutlineNoteAdd, MdOutlineViewKanban } from "react-icons/md";
import { VscDebugRestartFrame } from "react-icons/vsc";
import { BsArrowsFullscreen, BsFillChatLeftQuoteFill, BsTwitch, BsYoutube } from "react-icons/bs";
import clsx from "clsx";

import {
  useToggleMusic,
  useToggleTimer,
  useToggleTasks,
  useSpotifyMusic,
  useToggleQuote,
  useDarkToggleStore,
  useToggleStickyNote,
  useFullScreenToggleStore,
  useToggleWidgetReset,
  useToggleTwitch,
  useToggleYoutube,
  useToggleKanban,
} from "@Store";
import useMediaQuery from "@Utils/hooks/useMediaQuery";
import { toggledToastNotification } from "@Utils/toast";

export const WidgetControlModal = ({ isVisible = false, onClose }) => {
  const { isMusicShown, setIsMusicShown } = useToggleMusic();
  const { isSpotifyShown, setIsSpotifyShown } = useSpotifyMusic();
  const { isTimerShown, setIsTimerShown } = useToggleTimer();
  const { isStickyNoteShown, setIsStickyNoteShown } = useToggleStickyNote();
  const { isTasksShown, setIsTasksShown } = useToggleTasks();
  const { isDarkModeShown, setIsDarkModeShown } = useDarkToggleStore();
  const { isFullscreenShown, setIsFullscreenShown } = useFullScreenToggleStore();
  const { isQuoteShown, setIsQuoteShown } = useToggleQuote();
  const { isWidgetResetShown, setIsWidgetResetShown } = useToggleWidgetReset();
  const { isTwitchShown, setIsTwitchShown } = useToggleTwitch();
  const { isYoutubeShown, setIsYoutubeShown } = useToggleYoutube();
  const { isKanbanShown, setIsKanbanShown } = useToggleKanban();

  const isDesktop = useMediaQuery("(min-width: 641px)");

  const keydownHandler = ({ key }) => {
    switch (key) {
      case "Escape":
        onClose();
        break;
      default:
    }
  };

  useEffect(() => {
    document.addEventListener("keydown", keydownHandler);
    return () => document.removeEventListener("keydown", keydownHandler);
  });

  return !isVisible ? null : (
    <div className="modal" onClick={onClose}>
      <div
        className="w-10/12 max-w-sm rounded-lg border border-border-light bg-background-primary p-4 text-text-primary shadow-card-hover sm:w-96"
        onClick={e => e.stopPropagation()}
      >
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-text-primary">Widget Control</h2>
          <IoCloseSharp
            className="cursor-pointer text-error transition-colors duration-200 hover:text-red-600"
            onClick={onClose}
          />
        </div>

        <div className="grid grid-cols-3 gap-3 text-center">
          <div
            onClick={() =>
              toggledToastNotification(isSpotifyShown, setIsSpotifyShown, "Spotify Widget Added", 750, "🎧")
            }
            className={clsx(
              "grid cursor-pointer content-center justify-center gap-2 rounded-lg border p-3 transition-all duration-200",
              "hover:border-accent-orange hover:bg-background-secondary hover:shadow-md",
              isSpotifyShown
                ? "border-accent-orange bg-accent-orange text-white shadow-md"
                : "border-border-light bg-background-primary text-text-primary"
            )}
          >
            <span className="text-sm font-medium">Spotify</span>
            <FaSpotify className="mx-auto h-6 w-6" />
          </div>

          <div
            onClick={() => toggledToastNotification(isMusicShown, setIsMusicShown, "Music Widget Added", 750, "🎧")}
            className={clsx(
              "grid cursor-pointer content-center justify-center gap-2 rounded-lg border p-3 transition-all duration-200",
              "hover:border-accent-orange hover:bg-background-secondary hover:shadow-md",
              isMusicShown
                ? "border-accent-orange bg-accent-orange text-white shadow-md"
                : "border-border-light bg-background-primary text-text-primary"
            )}
          >
            <span className="text-sm font-medium">Chill Music</span>
            <IoMusicalNotesOutline className="mx-auto h-6 w-6" />
          </div>

          <div
            onClick={() =>
              toggledToastNotification(isTasksShown, setIsTasksShown, "Task Tracker Widget Added", 750, "📓")
            }
            className={clsx(
              "grid cursor-pointer content-center justify-center gap-2 rounded-lg border p-3 transition-all duration-200",
              "hover:border-accent-orange hover:bg-background-secondary hover:shadow-md",
              isTasksShown
                ? "border-accent-orange bg-accent-orange text-white shadow-md"
                : "border-border-light bg-background-primary text-text-primary"
            )}
          >
            <span className="text-sm font-medium">Task Tracker</span>
            <CgNotes className="mx-auto h-6 w-6" />
          </div>

          <div
            onClick={() => toggledToastNotification(isTimerShown, setIsTimerShown, "Timer Widget Added", 750, "⏳")}
            className={clsx(
              "grid cursor-pointer content-center justify-center gap-2 rounded-lg border p-3 transition-all duration-200",
              "hover:border-accent-orange hover:bg-background-secondary hover:shadow-md",
              isTimerShown
                ? "border-accent-orange bg-accent-orange text-white shadow-md"
                : "border-border-light bg-background-primary text-text-primary"
            )}
          >
            <span className="text-sm font-medium">Pomodoro Timer</span>
            <MdOutlineTimer className="mx-auto h-6 w-6" />
          </div>

          <div
            onClick={() =>
              toggledToastNotification(isDarkModeShown, setIsDarkModeShown, "Theme Widget Added", 750, "🌙/☀️")
            }
            className={clsx(
              "grid cursor-pointer content-center justify-center gap-2 rounded-lg border p-3 transition-all duration-200",
              "hover:border-accent-orange hover:bg-background-secondary hover:shadow-md",
              isDarkModeShown
                ? "border-accent-orange bg-accent-orange text-white shadow-md"
                : "border-border-light bg-background-primary text-text-primary"
            )}
          >
            <span className="text-sm font-medium">Theme</span>
            <MdWbSunny className="mx-auto h-6 w-6" />
          </div>

          {isDesktop && (
            <div
              onClick={() =>
                toggledToastNotification(isStickyNoteShown, setIsStickyNoteShown, "Sticky Note Widget Added", 750, "📝")
              }
              className={clsx(
                "grid cursor-pointer content-center justify-center gap-2 rounded-lg border p-3 transition-all duration-200",
                "hover:border-accent-orange hover:bg-background-secondary hover:shadow-md",
                isStickyNoteShown
                  ? "border-accent-orange bg-accent-orange text-white shadow-md"
                  : "border-border-light bg-background-primary text-text-primary"
              )}
            >
              <span className="text-sm font-medium">Sticky Notes</span>
              <MdOutlineNoteAdd className="mx-auto h-6 w-6" />
            </div>
          )}

          <div
            onClick={() =>
              toggledToastNotification(isWidgetResetShown, setIsWidgetResetShown, "Reset Widget Added", 750, "⏮️")
            }
            className={clsx(
              "grid cursor-pointer content-center justify-center gap-2 rounded-lg border p-3 transition-all duration-200",
              "hover:border-accent-orange hover:bg-background-secondary hover:shadow-md",
              isWidgetResetShown
                ? "border-accent-orange bg-accent-orange text-white shadow-md"
                : "border-border-light bg-background-primary text-text-primary"
            )}
          >
            <span className="text-sm font-medium">Reset</span>
            <VscDebugRestartFrame className="mx-auto h-6 w-6" />
          </div>

          {isDesktop && (
            <div
              onClick={() =>
                toggledToastNotification(isFullscreenShown, setIsFullscreenShown, "Fullscreen Widget Added", 750, "📺")
              }
              className={clsx(
                "grid cursor-pointer content-center justify-center gap-2 rounded-lg border p-3 transition-all duration-200",
                "hover:border-accent-orange hover:bg-background-secondary hover:shadow-md",
                isFullscreenShown
                  ? "border-accent-orange bg-accent-orange text-white shadow-md"
                  : "border-border-light bg-background-primary text-text-primary"
              )}
            >
              <span className="text-sm font-medium">Fullscreen</span>
              <BsArrowsFullscreen className="mx-auto h-6 w-6" />
            </div>
          )}

          <div
            onClick={() => toggledToastNotification(isQuoteShown, setIsQuoteShown, "Quote Widget Added", 750, "💬")}
            className={clsx(
              "grid cursor-pointer content-center justify-center gap-2 rounded-lg border p-3 transition-all duration-200",
              "hover:border-accent-orange hover:bg-background-secondary hover:shadow-md",
              isQuoteShown
                ? "border-accent-orange bg-accent-orange text-white shadow-md"
                : "border-border-light bg-background-primary text-text-primary"
            )}
          >
            <span className="text-sm font-medium">Quotes</span>
            <BsFillChatLeftQuoteFill className="mx-auto h-6 w-6" />
          </div>

          <div
            onClick={() => toggledToastNotification(isTwitchShown, setIsTwitchShown, "Twitch Widget Added", 750, "📺")}
            className={clsx(
              "grid cursor-pointer content-center justify-center gap-2 rounded-lg border p-3 transition-all duration-200",
              "hover:border-accent-orange hover:bg-background-secondary hover:shadow-md",
              isTwitchShown
                ? "border-accent-orange bg-accent-orange text-white shadow-md"
                : "border-border-light bg-background-primary text-text-primary"
            )}
          >
            <span className="text-sm font-medium">Twitch</span>
            <BsTwitch className="mx-auto h-6 w-6" />
          </div>

          <div
            onClick={() =>
              toggledToastNotification(isYoutubeShown, setIsYoutubeShown, "Youtube Widget Added", 750, "▶️")
            }
            className={clsx(
              "grid cursor-pointer content-center justify-center gap-2 rounded-lg border p-3 transition-all duration-200",
              "hover:border-accent-orange hover:bg-background-secondary hover:shadow-md",
              isYoutubeShown
                ? "border-accent-orange bg-accent-orange text-white shadow-md"
                : "border-border-light bg-background-primary text-text-primary"
            )}
          >
            <span className="text-sm font-medium">Youtube</span>
            <BsYoutube className="mx-auto h-6 w-6" />
          </div>

          <div
            onClick={() =>
              toggledToastNotification(isKanbanShown, setIsKanbanShown, "Kanban board Widget Added", 750, "📃")
            }
            className={clsx(
              "grid cursor-pointer content-center justify-center gap-2 rounded-lg border p-3 transition-all duration-200",
              "hover:border-accent-orange hover:bg-background-secondary hover:shadow-md",
              isKanbanShown
                ? "border-accent-orange bg-accent-orange text-white shadow-md"
                : "border-border-light bg-background-primary text-text-primary"
            )}
          >
            <span className="text-sm font-medium">Kanban board</span>
            <MdOutlineViewKanban className="mx-auto h-6 w-6" />
          </div>
        </div>
      </div>
    </div>
  );
};
