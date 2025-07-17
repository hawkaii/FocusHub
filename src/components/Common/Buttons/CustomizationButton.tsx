/* Component for customization buttons in top right of the screen */
export const CustomizationButton = props => {
  return (
    <div>
      <button
        type="button"
        className="flex items-center rounded-lg border border-border-light bg-background-primary px-4 py-2 text-sm font-medium text-text-primary shadow-card transition-all duration-200 hover:-translate-y-0.5 hover:bg-background-secondary hover:shadow-card-hover focus:outline-none focus:ring-2 focus:ring-accent-orange focus:ring-offset-2"
        onClick={() => props.changeModal(true)}
      >
        {props.title}
        {props.icon}
      </button>
      <div className="flex justify-end space-x-6">{props.modal}</div>
    </div>
  );
};
