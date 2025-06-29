import { FC } from "react";
import clsx from "clsx";

export const NavItem: FC<{
  onClick?: () => void;
  toggled?: boolean;
  shown?: boolean;
}> = ({ children, onClick, toggled, shown }) => {
  if (shown) {
    return (
      <li>
        <button
          className={clsx(
            "relative flex h-14 items-center bg-background-primary px-4 text-text-primary transition-all duration-200 ease-in-out sm:h-16 sm:px-6",
            "hover:bg-background-secondary hover:text-supporting-blue focus:outline-none focus:ring-2 focus:ring-accent-orange focus:ring-inset",
            toggled &&
              "bg-accent-orange text-white border-l-4 border-hover-accent shadow-md hover:bg-hover-accent"
          )}
          onClick={onClick}
        >
          {children}
        </button>
      </li>
    );
  } else {
    return <></>;
  }
};