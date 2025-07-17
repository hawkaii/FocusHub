import clsx from "clsx";

const classes: { [key: string]: any } = {
  base: "focus:outline-none transition-all duration-200 ease-in-out font-medium rounded-lg inline-flex items-center justify-center",
  disabled: "opacity-50 cursor-not-allowed",
  pill: "rounded-full",
  size: {
    small: "px-3 py-1.5 text-sm",
    normal: "px-4 py-2 text-base",
    large: "px-6 py-3 text-lg",
  },
  variant: {
    primary:
      "bg-accent-orange text-white border-2 border-accent-orange hover:bg-hover-accent hover:border-hover-accent hover:-translate-y-0.5 focus:ring-4 focus:ring-accent-orange/20",
    secondary:
      "bg-transparent text-text-primary border-2 border-border-medium hover:bg-background-secondary hover:border-supporting-blue hover:text-supporting-blue focus:ring-4 focus:ring-supporting-blue/20",
    tertiary:
      "bg-background-secondary text-text-primary border border-border-light hover:bg-border-light hover:border-border-medium focus:ring-4 focus:ring-border-medium/20",
    danger:
      "bg-error text-white border-2 border-error hover:bg-red-600 hover:border-red-600 hover:-translate-y-0.5 focus:ring-4 focus:ring-error/20",
    success:
      "bg-success text-white border-2 border-success hover:bg-green-600 hover:border-green-600 hover:-translate-y-0.5 focus:ring-4 focus:ring-success/20",
    ghost:
      "bg-transparent text-text-secondary hover:bg-background-secondary hover:text-text-primary focus:ring-4 focus:ring-border-medium/20",
    // Legacy variants for backward compatibility
    cold: "bg-supporting-blue text-white border-2 border-supporting-blue hover:bg-hover-primary hover:border-hover-primary focus:ring-4 focus:ring-supporting-blue/20",
    bottomButton:
      "bg-accent-orange text-white border-2 border-accent-orange hover:bg-hover-accent hover:border-hover-accent shadow-lg focus:ring-4 focus:ring-accent-orange/20",
    coldPrimary:
      "bg-primary-dark text-white border-2 border-primary-dark hover:bg-supporting-blue hover:border-supporting-blue focus:ring-4 focus:ring-primary-dark/20",
  },
};

export const Button = ({
  children,
  className,
  type = "button",
  variant = "primary",
  size = "normal",
  disabled = false,
  onClick,
}: {
  children: any;
  className?: string;
  type?: any;
  variant?: string;
  size?: string;
  onClick?: React.MouseEventHandler;
  disabled?: boolean;
}) => {
  return (
    <button
      disabled={disabled}
      className={clsx(
        classes.base,
        classes.size[size],
        classes.variant[variant],
        disabled && classes.disabled,
        className
      )}
      onClick={onClick}
      type={type}
    >
      {children}
    </button>
  );
};
