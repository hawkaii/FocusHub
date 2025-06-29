import { useEffect } from "react";
import { FaSpotify } from "react-icons/fa";
import { IoMusicalNotesOutline, IoCloseSharp } from "react-icons/io5";
import { CgNotes } from "react-icons/cg";
import {
  MdOutlineTimer,
  MdWbSunny,
  MdOutlineNoteAdd,
  MdOutlineViewKanban,
} from "react-icons/md";
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
        className="w-10/12 max-w-sm rounded-lg bg-background-primary p-4 text-text-primary shadow-card-hover border border-border-light sm:w-96"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-text-primary">Widget Control</h2>
          <IoCloseSharp 
            className="cursor-pointer text-error hover:text-red-600 transition-colors duration-200" 
            onClick={onClose} 
          />
        </div>
        
        <div className="grid grid-cols-3 gap-3 text-center">
          <div
            onClick={() =>
              toggledToastNotification(isSpotifyShown, setIsSpotifyShown, "Spotify Widget Added", 750, "🎧")
            }
            className={clsx(
              "grid cursor-pointer content-center justify-center gap-2 rounded-lg p-3 transition-all duration-200 border",
              "hover:bg-background-secondary hover:border-accent-orange hover:shadow-md",
              isSpotifyShown 
                ? "bg-accent-orange text-white border-accent-orange shadow-md" 
                : "bg-background-primary border-border-light text-text-primary"
            )}
          >
            <span className="text-sm font-medium">Spotify</span>
            <FaSpotify className="h-6 w-6 mx-auto" />
          </div>
          
          <div
            onClick={() => toggledToastNotification(isMusicShown, setIsMusicShown, "Music Widget Added", 750, "🎧")}
            className={clsx(
              "grid cursor-pointer content-center justify-center gap-2 rounded-lg p-3 transition-all duration-200 border",
              "hover:bg-background-secondary hover:border-accent-orange hover:shadow-md",
              isMusicShown 
                ? "bg-accent-orange text-white border-accent-orange shadow-md" 
                : "bg-background-primary border-border-light text-text-primary"
            )}
          >
            <span className="text-sm font-medium">Chill Music</span>
            <IoMusicalNotesOutline className="h-6 w-6 mx-auto" />
          </div>
          
          <div
            onClick={() =>
              toggledToastNotification(isTasksShown, setIsTasksShown, "Task Tracker Widget Added", 750, "📓")
            }
            className={clsx(
              "grid cursor-pointer content-center justify-center gap-2 rounded-lg p-3 transition-all duration-200 border",
              "hover:bg-background-secondary hover:border-accent-orange hover:shadow-md",
              isTasksShown 
                ? "bg-accent-orange text-white border-accent-orange shadow-md" 
                : "bg-background-primary border-border-light text-text-primary"
            )}
          >
            <span className="text-sm font-medium">Task Tracker</span>
            <CgNotes className="h-6 w-6 mx-auto" />
          </div>
          
          <div
            onClick={() => toggledToastNotification(isTimerShown, setIsTimerShown, "Timer Widget Added", 750, "⏳")}
            className={clsx(
              "grid cursor-pointer content-center justify-center gap-2 rounded-lg p-3 transition-all duration-200 border",
              "hover:bg-background-secondary hover:border-accent-orange hover:shadow-md",
              isTimerShown 
                ? "bg-accent-orange text-white border-accent-orange shadow-md" 
                : "bg-background-primary border-border-light text-text-primary"
            )}
          >
            <span className="text-sm font-medium">Pomodoro Timer</span>
            <MdOutlineTimer className="h-6 w-6 mx-auto" />
          </div>
          
          <div
            onClick={() =>
              toggledToastNotification(isDarkModeShown, setIsDarkModeShown, "Theme Widget Added", 750, "🌙/☀️")
            }
            className={clsx(
              "grid cursor-pointer content-center justify-center gap-2 rounded-lg p-3 transition-all duration-200 border",
              "hover:bg-background-secondary hover:border-accent-orange hover:shadow-md",
              isDarkModeShown 
                ? "bg-accent-orange text-white border-accent-orange shadow-md" 
                : "bg-background-primary border-border-light text-text-primary"
            )}
          >
            <span className="text-sm font-medium">Theme</span>
            <MdWbSunny className="h-6 w-6 mx-auto" />
          </div>
          
          {isDesktop && (
            <div
              onClick={() =>
                toggledToastNotification(
                  isStickyNoteShown,
                  setIsStickyNoteShown,
                  "Sticky Note Widget Added",
                  750,
                  "📝"
                )
              }
              className={clsx(
                "grid cursor-pointer content-center justify-center gap-2 rounded-lg p-3 transition-all duration-200 border",
                "hover:bg-background-secondary hover:border-accent-orange hover:shadow-md",
                isStickyNoteShown 
                  ? "bg-accent-orange text-white border-accent-orange shadow-md" 
                  : "bg-background-primary border-border-light text-text-primary"
              )}
            >
              <span className="text-sm font-medium">Sticky Notes</span>
              <MdOutlineNoteAdd className="h-6 w-6 mx-auto" />
            </div>
          )}
          
          <div
            onClick={() =>
              toggledToastNotification(isWidgetResetShown, setIsWidgetResetShown, "Reset Widget Added", 750, "⏮️")
            }
            className={clsx(
              "grid cursor-pointer content-center justify-center gap-2 rounded-lg p-3 transition-all duration-200 border",
              "hover:bg-background-secondary hover:border-accent-orange hover:shadow-md",
              isWidgetResetShown 
                ? "bg-accent-orange text-white border-accent-orange shadow-md" 
                : "bg-background-primary border-border-light text-text-primary"
            )}
          >
            <span className="text-sm font-medium">Reset</span>
            <VscDebugRestartFrame className="h-6 w-6 mx-auto" />
          </div>
          
          {isDesktop && (
            <div
              onClick={() =>
                toggledToastNotification(
                  isFullscreenShown,
                  setIsFullscreenShown,
                  "Fullscreen Widget Added",
                  750,
                  "📺"
                )
              }
              className={clsx(
                "grid cursor-pointer content-center justify-center gap-2 rounded-lg p-3 transition-all duration-200 border",
                "hover:bg-background-secondary hover:border-accent-orange hover:shadow-md",
                isFullscreenShown 
                  ? "bg-accent-orange text-white border-accent-orange shadow-md" 
                  : "bg-background-primary border-border-light text-text-primary"
              )}
            >
              <span className="text-sm font-medium">Fullscreen</span>
              <BsArrowsFullscreen className="h-6 w-6 mx-auto" />
            </div>
          )}
          
          <div
            onClick={() => toggledToastNotification(isQuoteShown, setIsQuoteShown, "Quote Widget Added", 750, "💬")}
            className={clsx(
              "grid cursor-pointer content-center justify-center gap-2 rounded-lg p-3 transition-all duration-200 border",
              "hover:bg-background-secondary hover:border-accent-orange hover:shadow-md",
              isQuoteShown 
                ? "bg-accent-orange text-white border-accent-orange shadow-md" 
                : "bg-background-primary border-border-light text-text-primary"
            )}
          >
            <span className="text-sm font-medium">Quotes</span>
            <BsFillChatLeftQuoteFill className="h-6 w-6 mx-auto" />
          </div>
          
          <div
            onClick={() =>
              toggledToastNotification(isTwitchShown, setIsTwitchShown, "Twitch Widget Added", 750, "📺")
            }
            className={clsx(
              "grid cursor-pointer content-center justify-center gap-2 rounded-lg p-3 transition-all duration-200 border",
              "hover:bg-background-secondary hover:border-accent-orange hover:shadow-md",
              isTwitchShown 
                ? "bg-accent-orange text-white border-accent-orange shadow-md" 
                : "bg-background-primary border-border-light text-text-primary"
            )}
          >
            <span className="text-sm font-medium">Twitch</span>
            <BsTwitch className="h-6 w-6 mx-auto" />
          </div>
          
          <div
            onClick={() =>
              toggledToastNotification(isYoutubeShown, setIsYoutubeShown, "Youtube Widget Added", 750, "▶️")
            }
            className={clsx(
              "grid cursor-pointer content-center justify-center gap-2 rounded-lg p-3 transition-all duration-200 border",
              "hover:bg-background-secondary hover:border-accent-orange hover:shadow-md",
              isYoutubeShown 
                ? "bg-accent-orange text-white border-accent-orange shadow-md" 
                : "bg-background-primary border-border-light text-text-primary"
            )}
          >
            <span className="text-sm font-medium">Youtube</span>
            <BsYoutube className="h-6 w-6 mx-auto" />
          </div>
          
          <div
            onClick={() =>
              toggledToastNotification(
                isKanbanShown,
                setIsKanbanShown,
                "Kanban board Widget Added",
                750,
                "📃"
              )
            }
            className={clsx(
              "grid cursor-pointer content-center justify-center gap-2 rounded-lg p-3 transition-all duration-200 border",
              "hover:bg-background-secondary hover:border-accent-orange hover:shadow-md",
              isKanbanShown 
                ? "bg-accent-orange text-white border-accent-orange shadow-md" 
                : "bg-background-primary border-border-light text-text-primary"
            )}
          >
            <span className="text-sm font-medium">Kanban board</span>
            <MdOutlineViewKanban className="h-6 w-6 mx-auto" />
          </div>
        </div>
      </div>
    </div>
  );
};