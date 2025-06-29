import { Background } from "@Root/src/App";
import { useSetBackground } from "@Root/src/store";
import clsx from "clsx";
import { useCallback } from "react";

export const BackgroundDropdownItem = ({
  isPicked,
  setBackgroundId,
  background,
  title,
  className,
}: {
  isPicked: boolean;
  setBackgroundId: any;
  background: Background;
  title: string;
  className?: string;
}) => {
  return (
    <div
      className={clsx(
        "cursor-pointer bg-background-primary py-2 hover:bg-background-secondary transition-colors duration-200",
        isPicked && "bg-background-secondary border-l-4 border-accent-orange"
      )}
      onClick={() => setBackgroundId(background)}
    >
      {title === "Custom Color" ? (
        <CustomColorPicker />
      ) : (
        <div className="block px-4 py-2 text-sm text-text-primary">{title}</div>
      )}
    </div>
  );
};

const colors = ["#000000", "#383838", "#654724", "#312465", "#1F6353", "#652424"];
const CustomColorPicker = () => {
  const { backgroundId, backgroundColor, setBackgroundColor } = useSetBackground();
  const isUsingCustomBackground = backgroundId === Background.CUSTOM_COLOR;

  return (
    <div>
      <div className="block py-2 pl-4 text-sm text-text-primary">Color</div>
      <div className="ml-4 flex pb-2">
        {colors.map(col => (
          <div
            key={col}
            className="mr-2 pl-4 cursor-pointer hover:scale-110 transition-transform duration-200"
            onClick={() => setBackgroundColor(col)}
            style={{
              background: col,
              width: 16,
              height: 16,
              border: isUsingCustomBackground && backgroundColor === col ? "2px solid var(--color-accent-orange)" : "1px solid var(--color-border-medium)",
              borderRadius: "4px",
            }}
          />
        ))}
      </div>
    </div>
  );
};