import Slider from "rc-slider";
import "rc-slider/assets/index.css";
import { useEffect, useState } from "react";
import { IconContext } from "react-icons";
import { FaPauseCircle, FaPlayCircle, FaYoutube } from "react-icons/fa";
import { IoCloseSharp } from "react-icons/io5";
import YouTube from "react-youtube";
import { useSong, useToggleMusic, usePlayerAudioVolume } from "@Store";
import "./Player.scss";
import { StationSelector } from "./StationSelector";
import { IPlayer, IOptionType } from "./interfaces";

export const Player = () => {
  const { song, toggledSong } = useSong();
  const { isMusicToggled, setIsMusicToggled } = useToggleMusic();
  const { audioVolume, setAudioVolume } = usePlayerAudioVolume();
  const [player, setPlayer] = useState<IPlayer>();
  const [playAudio, setPlayAudio] = useState(true);
  const [autoplay, setAutoPlay] = useState(0);

  useEffect(() => {
    if (toggledSong) {
      if (playAudio) {
        setPlayAudio(false);
      }
      setAutoPlay(1);
    }
  }, [toggledSong]);

  useEffect(() => {
    if (!isMusicToggled) {
      onPauseVideo();
    }
  }, [isMusicToggled]);

  const onReady = (e: any) => {
    e.target.setVolume(audioVolume);
    setPlayer(e.target);
  };

  const onPlayVideo = () => {
    player?.playVideo();
  };

  const onPauseVideo = () => {
    player?.pauseVideo();
  };

  const onVolumeChange = (value: number | number[]) => {
    setAudioVolume(value as number);
    player?.setVolume(value);
  };

  const triggerAudio = () => {
    if (playAudio) {
      onPlayVideo();
    } else {
      onPauseVideo();
    }
    setPlayAudio(!playAudio);
  };

  let opts: IOptionType = {
    playerVars: {
      autoplay: autoplay as number,
    },
  };

  return (
    <>
      <div className="mb-2 w-72 rounded-lg border border-border-light bg-background-primary px-3 py-4 text-text-primary shadow-card backdrop-blur-sm sm:w-96">
        <div className="mb-4 flex items-center justify-between space-x-6 border-b border-border-light pb-3">
          <div className="font-medium text-text-primary">{song?.artist}</div>
          <div className="flex items-center space-x-2">
            <IconContext.Provider value={{ size: "1.1rem" }}>
              <FaYoutube className="text-error" />
            </IconContext.Provider>
            <IconContext.Provider value={{ size: "1.1rem" }}>
              <IoCloseSharp
                className="cursor-pointer text-error transition-colors duration-200 hover:text-red-600"
                onClick={() => setIsMusicToggled(false)}
              />
            </IconContext.Provider>
          </div>
        </div>
        <YouTube
          className="hidden"
          videoId={song.id}
          onReady={onReady}
          // @ts-ignore
          opts={opts}
        />
        <div className="space-y-4">
          <div className="flex items-center space-x-3">
            <IconContext.Provider value={{ size: "1.5rem" }}>
              {playAudio ? (
                <FaPlayCircle
                  onClick={triggerAudio}
                  className="cursor-pointer text-accent-orange transition-colors duration-200 hover:text-hover-accent"
                />
              ) : (
                <FaPauseCircle
                  onClick={triggerAudio}
                  className="cursor-pointer text-accent-orange transition-colors duration-200 hover:text-hover-accent"
                />
              )}
            </IconContext.Provider>
            <div className="flex-1">
              <Slider
                defaultValue={audioVolume}
                onChange={value => {
                  onVolumeChange(value as number);
                }}
                railStyle={{
                  backgroundColor: "#BFC0C0",
                  height: 6,
                }}
                handleStyle={{
                  backgroundColor: "#EF8354",
                  borderColor: "#EF8354",
                  opacity: 1,
                  height: 18,
                  width: 18,
                }}
                trackStyle={{
                  backgroundColor: "#EF8354",
                  height: 6,
                }}
              />
            </div>
          </div>
          <StationSelector />
        </div>
      </div>
    </>
  );
};
