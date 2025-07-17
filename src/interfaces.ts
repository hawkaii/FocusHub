export interface IAudioVolume {
  audioVolume: number;
  setAudioVolume: (audioVolume: number) => void;
}

export interface IAlarmOption {
  alarm: string;
  setAlarm: (alarmPath: string) => void;
}

export interface ITimer {
  timerQueue: number;
  setTimerQueue: (newTime: number) => void;
}

export interface IPomodoroCounter {
  pomodoroCounts: number;
  setPomodoroCounter: () => void;
}

export interface IToggleSettings {
  isSettingsToggled: boolean;
  setIsSettingsToggled: (isSettingsToggled: boolean) => void;
}

export interface IPosTimerSettings {
  timerSettingsPosX: number;
  timerSettingsPosY: number;
  setTimerSettingsPos: (X: number, Y: number) => void;
  setTimerSettingsPosDefault: () => void;
}

export interface IHasStarted {
  hasStarted: boolean;
  setHasStarted: (hasStarted: boolean) => void;
}

export interface IBreakStarted {
  breakStarted: boolean;
  setBreakStarted: (breakStarted: boolean) => void;
}

export interface IShortBreakTime {
  shortBreakLength: number;
  defaultShortBreakLength: () => void;
  setShortBreak: (value: number) => void;
}

export interface ILongBreakTime {
  longBreakLength: number;
  defaultLongBreakLength: () => void;
  setLongBreak: (value: number) => void;
}

export interface IPomodoroTime {
  pomodoroLength: number;
  defaultPomodoroLength: () => void;
  setPomodoroLength: (value: number) => void;
}

export interface IStickyNote {
  id: number;
  text: string;
  color: string;
  stickyNotesPosX: number;
  stickyNotesPosY: number;
}

export interface IStickyNoteState {
  stickyNotes: IStickyNote[];
  addStickyNote: (text: string) => void;
  editNote: (id: number, newProp: string, newValue: string) => void;
  removeNote: (id: number) => void;
  setStickyNotesPos: (id: number, X: number, Y: number) => void;
}

export interface IToggleStickyNote {
  isStickyNoteShown: boolean;
  setIsStickyNoteShown: (isStickyNoteShown: boolean) => void;
}

export enum ColorOptions {
  Yellow = "#feff9c",
  Green = "#d1fae5",
  Pink = "#f6ccd7",
  Purple = "#e0bbff",
  Blue = "#a7cdfa",
}

export interface ITask {
  id: string;
  description: string;
  inProgress: boolean;
  completed: boolean;
  pomodoro: number;
  pomodoroCounter: number;
  alerted: boolean;
  menuToggled: boolean;
}

export interface ITaskState {
  tasks: ITask[];
  addTask: (description: string, count: number, isBreak: boolean) => void;
  renameTask: (id: string, newName: string) => void;
  removeTask: (id: string) => void;
  removeAllTasks: () => void;
  toggleInProgressState: (id: string, flag: boolean) => void;
  setCompleted: (id: string, flag: boolean) => void;
  setPomodoroCounter: (id: string) => void;
  alertTask: (id: string, flag: boolean) => void;
  setPomodoro: (id: string, newVal: number) => void;
  toggleMenu: (id: string, flag: boolean) => void;
}

export interface IKanbanBoard {
  columns: Array<{
    id: string;
    title: string;
    tasks: Array<{
      id: string;
      name: string;
    }>;
  }>;
}

export interface IKanbanBoardState {
  board: IKanbanBoard;
  setColumns: (columns: any) => void;
}

export interface ISongTask {
  id: string;
  artist: string;
  link: string;
}

export interface ISongState {
  song: ISongTask;
  setSong: (songID: string) => void;
  toggledSong: string;
  setToggledSong: (toggledSong: string) => void;
}

export interface IBackground {
  backgroundColor: string;
  backgroundId: number;
  setBackgroundId: (backgroundId: number) => void;
  setBackgroundColor: (color: string) => void;
}

export interface IToggleTasks {
  isTasksToggled: boolean;
  setIsTasksToggled: (isTasksToggled: boolean) => void;
  isTasksShown: boolean;
  setIsTasksShown: (isTasksShown: boolean) => void;
}

export interface IToggleKanban {
  isKanbanToggled: boolean;
  setIsKanbanToggled: (isKanbanToggled: boolean) => void;
  isKanbanShown: boolean;
  setIsKanbanShown: (isKanbanShown: boolean) => void;
}

export interface IPosKanban {
  kanbanPosX: number;
  kanbanPosY: number;
  setKanbanPos: (X: number, Y: number) => void;
  setKanbanPosDefault: () => void;
}

export interface IPosTask {
  taskPosX: number;
  taskPosY: number;
  setTaskPos: (X: number, Y: number) => void;
  setTaskPosDefault: () => void;
}

export interface IToggleMusic {
  isMusicToggled: boolean;
  setIsMusicToggled: (isMusicToggled: boolean) => void;
  isMusicShown: boolean;
  setIsMusicShown: (isMusicShown: boolean) => void;
}

export interface IPosMusic {
  musicPosX: number;
  musicPosY: number;
  setMusicPos: (X: number, Y: number) => void;
  setMusicPosDefault: () => void;
}

export interface IToggleSpotify {
  isSpotifyToggled: boolean;
  setIsSpotifyToggled: (isSpotifyToggled: boolean) => void;
  isSpotifyShown: boolean;
  setIsSpotifyShown: (isSpotifyShown: boolean) => void;
}

export interface IPosSpotify {
  spotifyPosX: number;
  spotifyPosY: number;
  setSpotifyPos: (X: number, Y: number) => void;
  setSpotifyPosDefault: () => void;
}

export interface IToggleTimer {
  isTimerToggled: boolean;
  setIsTimerToggled: (isTimerToggled: boolean) => void;
  isTimerShown: boolean;
  setIsTimerShown: (isTimerShown: boolean) => void;
}

export interface IPosTimer {
  timerPosX: number;
  timerPosY: number;
  setTimerPos: (X: number, Y: number) => void;
  setTimerPosDefault: () => void;
}

export interface IDarkModeState {
  isDark: boolean;
  toggleDarkMode: () => void;
  isDarkModeShown: boolean;
  setIsDarkModeShown: (isDarkModeShown: boolean) => void;
}

export interface IFullscreenState {
  isFullscreen: boolean;
  toggleFullscreenMode: () => void;
  isFullscreenShown: boolean;
  setIsFullscreenShown: (isFullscreenShown: boolean) => void;
}

export interface IToggleQuote {
  isQuoteToggled: boolean;
  setIsQuoteToggled: (isQuoteToggled: boolean) => void;
  isQuoteShown: boolean;
  setIsQuoteShown: (isQuoteShown: boolean) => void;
}

export interface IPosQuote {
  quotePosX: number;
  quotePosY: number;
  setQuotePos: (X: number, Y: number) => void;
  setQuotePosDefault: () => void;
}

export interface IToggleWidgetReset {
  isWidgetResetShown: boolean;
  setIsWidgetResetShown: (isWidgetResetShown: boolean) => void;
}

export interface IToggleTwitch {
  isTwitchToggled: boolean;
  setIsTwitchToggled: (isTwitchToggled: boolean) => void;
  isTwitchShown: boolean;
  setIsTwitchShown: (isTwitchShown: boolean) => void;
}

export interface IPosTwitch {
  twitchPosX: number;
  twitchPosY: number;
  setTwitchPos: (X: number, Y: number) => void;
  setTwitchPosDefault: () => void;
}

export interface IToggleYoutube {
  isYoutubeToggled: boolean;
  setIsYoutubeToggled: (isYoutubeToggled: boolean) => void;
  isYoutubeShown: boolean;
  setIsYoutubeShown: (isYoutubeShown: boolean) => void;
}

export interface IPosYoutube {
  youtubePosX: number;
  youtubePosY: number;
  setYoutubePos: (X: number, Y: number) => void;
  setYoutubePosDefault: () => void;
}

export interface IFirstTimeUserState {
  isFirstTimeUser: boolean;
  toggleIsFirstTimeUser: () => void;
}

export interface IGrid {
  grid: number[];
  setGrid: (grid: number[]) => void;
  setGridDefault: () => void;
}

export interface ILockWidgets {
  areWidgetsLocked: boolean;
  setAreWidgetsLocked: (areWidgetsLocked: boolean) => void;
}

export interface ISideNavItem {
  id: string;
  content: JSX.Element;
  tooltipTitle: string;
  isToggled: boolean;
  setToggled: (val: boolean) => void;
  toggleString: string;
  toggleIcon: string;
  isShown: boolean;
}

export interface ISideNavItems {
  sideNavItemArray: ISideNavItem[];
  setSideNavItemArray: (sideNavItemArray: ISideNavItem[]) => void;
}

export interface ISideNavOrderStore {
  sideNavOrder: number[];
  setSideNavOrder: (sideNavOrder: number[]) => void;
}

export interface ISeoContent {
  isSeoVisible: boolean;
  setSeoVisibility: (isSeoVisible: boolean) => void;
}

export interface ISeoToggle {
  onButtonClick: () => void;
}

export interface ITimeSession {
  id: string;
  startTime: Date;
  endTime: Date | null;
  sessionType: "pomodoro" | "shortBreak" | "longBreak";
  plannedDuration: number;
  actualDuration: number | null;
  currentElapsed: number; // Current elapsed time in seconds (for active sessions)
  taskId: string | null;
  completed: boolean;
}

export interface ITimeMetrics {
  totalFocusTime: number;
  totalBreakTime: number;
  sessionsCompleted: number;
  avgSessionLength: number;
  productivity: number;
  dailyStats: { [date: string]: IDailyStats };
  weeklyTrends: IWeeklyTrend[];
}

export interface IDailyStats {
  date: string;
  focusTime: number;
  breakTime: number;
  sessionsCompleted: number;
  productivity: number;
}

export interface IWeeklyTrend {
  week: string;
  avgFocusTime: number;
  avgSessions: number;
  productivity: number;
}

export interface ITimeTrackingState {
  sessions: ITimeSession[];
  currentSession: ITimeSession | null;
  metrics: ITimeMetrics;
  startSession: (
    sessionType: "pomodoro" | "shortBreak" | "longBreak",
    plannedDuration: number,
    taskId?: string
  ) => void;
  endSession: (completed: boolean) => void;
  updateCurrentSession: () => void;
  pauseSession: () => void;
  resumeSession: () => void;
  getMetrics: () => ITimeMetrics;
  getDailyStats: (date: string) => IDailyStats;
  clearHistory: () => void;
}
