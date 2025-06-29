import { NavItem } from "./NavItems";
import { IoMusicalNotesOutline } from "react-icons/io5";
import { IoMenu } from "react-icons/io5";
import { CgNotes } from "react-icons/cg";
import { MdOutlineTimer, MdWbSunny, MdDarkMode, MdOutlineNoteAdd, MdOutlineViewKanban } from "react-icons/md";
import { VscDebugRestartFrame } from "react-icons/vsc";
import { BsArrowsFullscreen, BsFillChatLeftQuoteFill, BsTwitch, BsYoutube } from "react-icons/bs";
import { FaSpotify, FaUser } from "react-icons/fa";
import {
  useToggleMusic,
  useToggleTimer,
  useToggleTasks,
  useSpotifyMusic,
  useDarkToggleStore,
  useFullScreenToggleStore,
  useToggleQuote,
  useStickyNote,
  useToggleStickyNote,
  useToggleWidgetReset,
  useToggleTwitch,
  useToggleYoutube,
  useSideNavOrderStore,
  useToggleKanban,
  useToggleProfile,
} from "@Store";
import { useState, useEffect } from "react";
import useSetDefault from "@App/utils/hooks/useSetDefault";

import { defaultToast } from "@Utils/toast";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import { fullscreenChanged, toggleFullScreen } from "@Utils/fullscreen";
import { DraggableNavItem } from "./DraggableNavItem";

export const SideNav = () => {
  const { isDark, toggleDarkMode } = useDarkToggleStore();
  const { isFullscreen } = useFullScreenToggleStore();
  const [active, setActive] = useState(false);
  const { isMusicToggled, setIsMusicToggled } = useToggleMusic();
  const { isKanbanToggled, setIsKanbanToggled } = useToggleKanban();
  const { isTimerToggled, setIsTimerToggled } = useToggleTimer();
  const { isTasksToggled, setIsTasksToggled } = useToggleTasks();
  const { isSpotifyToggled, setIsSpotifyToggled } = useSpotifyMusic();
  const { isQuoteToggled, setIsQuoteToggled } = useToggleQuote();
  const { isTwitchToggled, setIsTwitchToggled } = useToggleTwitch();
  const { isYoutubeToggled, setIsYoutubeToggled } = useToggleYoutube();
  const { isProfileToggled, setIsProfileToggled } = useToggleProfile();

  const { isTimerShown } = useToggleTimer();
  const { isStickyNoteShown } = useToggleStickyNote();
  const { isTasksShown } = useToggleTasks();
  const { isMusicShown } = useToggleMusic();
  const { isKanbanShown } = useToggleKanban();
  const { isSpotifyShown } = useSpotifyMusic();
  const { isDarkModeShown } = useDarkToggleStore();
  const { isFullscreenShown } = useFullScreenToggleStore();
  const { isQuoteShown } = useToggleQuote();
  const { isWidgetResetShown } = useToggleWidgetReset();
  const { isTwitchShown } = useToggleTwitch();
  const { isYoutubeShown } = useToggleYoutube();
  const { isProfileShown } = useToggleProfile();

  const { sideNavOrder, setSideNavOrder } = useSideNavOrderStore();

  const { stickyNotes, addStickyNote } = useStickyNote();
  const setDefault = useSetDefault();

  useEffect(() => {
    document.addEventListener("fullscreenchange", fullscreenChanged);
    document.addEventListener("keyup", function (e) {
      if (e.key === "F11" || (e.key === "Escape" && document.fullscreenElement)) {
        toggleFullScreen();
      }
    });
  }, []);

  function toggleDefaultPositions() {
    setDefault();
    defaultToast("Positions reset");
  }

  function addNewStickyNote() {
    addStickyNote("");
  }

  function toggleNavBar() {
    setActive(oldDate => !oldDate);
  }

  let theme = isDark ? <MdWbSunny className="h-6 w-6" /> : <MdDarkMode className="h-6 w-6" />;

  const sideNavItems = [
    {
      id: "1",
      content: <IoMusicalNotesOutline className="h-6 w-6" />,
      tooltipTitle: "Lofi Music",
      isToggled: isMusicToggled,
      setToggled: setIsMusicToggled,
      toggleString: "Music Toggled",
      toggleIcon: "🎵",
      isShown: isMusicShown,
    },
    {
      id: "2",
      content: <FaSpotify className="h-6 w-6" />,
      tooltipTitle: "Spotify",
      isToggled: isSpotifyToggled,
      setToggled: setIsSpotifyToggled,
      toggleString: "Spotify Toggled",
      toggleIcon: "🎧",
      isShown: isSpotifyShown,
    },
    {
      id: "3",
      content: <CgNotes className="h-6 w-6" />,
      tooltipTitle: "Task Tracker",
      isToggled: isTasksToggled,
      setToggled: setIsTasksToggled,
      toggleString: "Task Toggled",
      toggleIcon: "📓",
      isShown: isTasksShown,
    },
    {
      id: "4",
      content: <MdOutlineTimer className="h-6 w-6" />,
      tooltipTitle: "Pomodoro Timer",
      isToggled: isTimerToggled,
      setToggled: setIsTimerToggled,
      toggleString: "Timer Toggled",
      toggleIcon: "⏳",
      isShown: isTimerShown,
    },
    {
      id: "5",
      content: <MdOutlineNoteAdd className="h-6 w-6" />,
      tooltipTitle: "Sticky Note",
      isToggled: stickyNotes.length > 0,
      setToggled: addNewStickyNote,
      toggleString: "Sticky Note Toggled",
      toggleIcon: "📝",
      isShown: isStickyNoteShown,
    },
    {
      id: "6",
      content: <VscDebugRestartFrame className="h-6 w-6" />,
      tooltipTitle: "Reset Positions",
      isToggled: false,
      setToggled: toggleDefaultPositions,
      toggleString: "Reset Toggled",
      toggleIcon: "⏪",
      isShown: isWidgetResetShown,
    },
    {
      id: "7",
      content: theme,
      tooltipTitle: "Theme",
      isToggled: isDark,
      setToggled: toggleDarkMode,
      toggleString: "Theme Toggled",
      toggleIcon: "🌙",
      isShown: isDarkModeShown,
    },
    {
      id: "8",
      content: <BsFillChatLeftQuoteFill className="h-6 w-6" />,
      tooltipTitle: "Quotes",
      isToggled: isQuoteToggled,
      setToggled: setIsQuoteToggled,
      toggleString: "Quotes Toggled",
      toggleIcon: "💬",
      isShown: isQuoteShown,
    },
    {
      id: "9",
      content: <BsTwitch className="h-6 w-6" />,
      tooltipTitle: "Twitch Stream",
      isToggled: isTwitchToggled,
      setToggled: setIsTwitchToggled,
      toggleString: "Twitch Toggled",
      toggleIcon: "📺",
      isShown: isTwitchShown,
    },
    {
      id: "10",
      content: <BsArrowsFullscreen className="h-6 w-6" />,
      tooltipTitle: "Fullscreen",
      isToggled: isFullscreen,
      setToggled: toggleFullScreen,
      toggleString: "Fullscreen Toggled",
      toggleIcon: "",
      isShown: isFullscreenShown,
    },
    {
      id: "11",
      content: <MdOutlineViewKanban className="h-6 w-6" />,
      tooltipTitle: "Kanban",
      isToggled: isKanbanToggled,
      setToggled: setIsKanbanToggled,
      toggleString: "Kanban Toggled",
      toggleIcon: "📃",
      isShown: isKanbanShown,
    },
    {
      id: "12",
      content: <BsYoutube className="h-6 w-6" />,
      tooltipTitle: "Youtube Video",
      isToggled: isYoutubeToggled,
      setToggled: setIsYoutubeToggled,
      toggleString: "Youtube Toggled",
      toggleIcon: "▶️",
      isShown: isYoutubeShown,
    },
    {
      id: "13",
      content: <FaUser className="h-6 w-6" />,
      tooltipTitle: "Profile & Analytics",
      isToggled: isProfileToggled,
      setToggled: setIsProfileToggled,
      toggleString: "Profile Toggled",
      toggleIcon: "👤",
      isShown: isProfileShown,
    },
  ];

  // a little function to help us with reordering the result
  const reorder = (list: number[], startIndex: number, endIndex: number): number[] => {
    const result = Array.from(list);
    const [removed] = result.splice(startIndex, 1);
    result.splice(endIndex, 0, removed);
    return result;
  };

  function onDragEnd(result) {
    // dropped outside the list
    if (!result.destination) {
      return;
    }

    setSideNavOrder(reorder(sideNavOrder, result.source.index, result.destination.index));
  }

  return (
    <div className="sideNav absolute flex p-2">
      <aside className="flex flex-col overflow-hidden rounded-lg shadow-card bg-background-primary border border-border-light">
        <ul>
          <div className="sm:hidden">
            <NavItem onClick={toggleNavBar} shown={true}>
              <IoMenu className="h-6 w-6" />
            </NavItem>
          </div>
          <DragDropContext onDragEnd={onDragEnd}>
            <Droppable droppableId="droppable">
              {(provided, snapshot) => (
                <div {...provided.droppableProps} ref={provided.innerRef}>
                  {sideNavOrder &&
                    sideNavOrder.map &&
                    sideNavOrder.map((id, index) => {
                      const item = sideNavItems[id];
                      if (!item) return;

                      return (
                        <Draggable
                          key={item.id}
                          draggableId={item.id}
                          index={index}
                          disableInteractiveElementBlocking="true"
                        >
                          {(provided, snapshot) => (
                            <div ref={provided.innerRef} {...provided.draggableProps} {...provided.dragHandleProps}>
                              <DraggableNavItem active={active} item={item} />
                            </div>
                          )}
                        </Draggable>
                      );
                    })}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </DragDropContext>
        </ul>
      </aside>
    </div>
  );
};