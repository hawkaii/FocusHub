import { useSetBackground } from "@Store";

export const CustomColor = () => {
  const { backgroundColor } = useSetBackground();
  return (
    <div className="h-screen" style={{ backgroundColor }}>
    </div>
  );
};