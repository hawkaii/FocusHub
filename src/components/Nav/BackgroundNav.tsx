import { useRef, useEffect } from "react";
import { useSetBackground } from "@Store";
import { BackgroundDropdownItem } from "./BackgroundDropdownItem";
import { Background } from "@Root/src/App";

export const BackgroundNav = ({
  isVisible = false,
  onClose,
}: {
  isVisible: boolean;
  onClose: any;
}) => {
  const { backgroundId, setBackgroundId } = useSetBackground();
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    //https://stackoverflow.com/questions/32553158/detect-click-outside-react-component
    function handleClickOutside(event: any) {
      if (!menuRef.current?.contains(event.target)) {
        onClose();
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      // Unbind the event listener on clean up
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [menuRef]);

  return !isVisible ? null : (
    <div className="flex justify-end" ref={menuRef}>
      <div className="w-70 text-left">
        <div
          className=" absolute right-2 z-[9999] mt-2 ml-2 w-56 origin-top-right divide-y divide-gray-100 rounded-md bg-gray-700 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none dark:divide-gray-900"
          role="menu"
          ref={menuRef}
        >
          <BackgroundDropdownItem
            isPicked={backgroundId == Background.CITY}
            setBackgroundId={setBackgroundId}
            background={Background.CITY}
            title="City"
            className="rounded-t-md"
          />
          <BackgroundDropdownItem
            isPicked={backgroundId == Background.LOFIGIRL}
            setBackgroundId={setBackgroundId}
            background={Background.LOFIGIRL}
            title="Lofi Girl"
          />
        </div>
      </div>
    </div>
  );
};
