import create from "zustand";
import { persist } from "zustand/middleware";
import {
  IAudioVolume,
  IAlarmOption,
  ITimer,
  IPosTimerSettings,
  IHasStarted,
  IBreakStarted,
  IShortBreakTime,

} from "./interfaces";

import { InfoSection } from "./pages/InfoSection";
import { uuid } from "uuidv4";
import { v4 } from "uuid";

export const useGrid = create<IGrid>(
  persist(
    (set, _) => ({
      grid: null,
      setGrid: gridVal => set({ grid: gridVal }),
      setGridDefault: () => set(() => ({ grid: null })),
    }),
    { name: "set_grid" }
  )
);

/**
 * Audio Volume Store
 * ---
 * Handler for Audio Volume
 */

export const useAudioVolume = create<IAudioVolume>(
  persist(
    (set, _) => ({
      audioVolume: 0.7,
      setAudioVolume: volume => set({ audioVolume: volume }),
    }),
    { name: "set_audio_volume" }
  )
);

export const usePlayerAudioVolume = create<IAudioVolume>(
  persist(
    (set, _) => ({
      audioVolume: 75,
      setAudioVolume: volume => set({ audioVolume: volume }),
    }),
    { name: "set_player_audio_volume" }
  )
);

export const useAlarmOption = create<IAlarmOption>(
  persist(
    (set, _) => ({
      alarm:
        "https://raw.githubusercontent.com/freeCodeCamp/cdn/master/build/testable-projects-fcc/audio/BeepSound.wav",
      setAlarm: alarmPath => set({ alarm: alarmPath }),
    }),
    { name: "set_alarm" }
  )
);

const songs = [
  {
    id: "e3L1PIY1pN8",
    artist: "The Coffee Shop Radio",
    link: "https://www.youtube.com/watch?v=e3L1PIY1pN8",
  },
  {
    id: "jfKfPfyJRdk",
    artist: "Lofi Girl",
    link: "https://www.youtube.com/watch?v=jfKfPfyJRdk",
  },
  {
    id: "hi1cYzaLEig",
    artist: "Hip Hop Station",
    link: "https://www.youtube.com/watch?v=hi1cYzaLEig",
  },
  {
    id: "6uddGul0oAc",
    artist: "Tokyo Station",
    link: "https://www.youtube.com/watch?v=6uddGul0oAc",
  },
];
export const useSong = create<ISongState>(set => ({
  song: songs[0],
  setSong: songId => set({ song: songs.find(s => s.id === songId) as ISongTask }),
  toggledSong: "",
  setToggledSong: toggledSong => set({ toggledSong }),
}));

