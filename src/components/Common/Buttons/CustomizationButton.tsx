/* Component for customization buttons in top right of the screen */
export const CustomizationButton = props => {
  return (
    <div>
      <button
        type="button"
        className="flex items-center rounded-lg bg-background-primary px-4 py-2 text-sm font-medium text-text-primary shadow-card border border-border-light transition-all duration-200 hover:shadow-card-hover hover:bg-background-secondary hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-accent-orange focus:ring-offset-2"
        onClick={() => props.changeModal(true)}
      >
        {props.title}
        {props.icon}
      </button>
      <div className="flex justify-end space-x-6">{props.modal}</div>
    </div>
  );
};