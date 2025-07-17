import { FaChartBar } from "react-icons/fa";
import { useState } from "react";
import { AnalyticsModal } from "./AnalyticsModal";
import { Button } from "@Components/Common/Button";

export const AnalyticsButton = () => {
  const [isAnalyticsOpen, setIsAnalyticsOpen] = useState(false);

  return (
    <>
      <Button
        onClick={() => setIsAnalyticsOpen(true)}
        variant="primary"
        className="flex items-center space-x-2 bg-gradient-to-r from-accent-orange to-hover-accent shadow-lg hover:from-hover-accent hover:to-accent-orange"
      >
        <FaChartBar className="h-5 w-5" />
        <span className="font-semibold">Analytics Dashboard</span>
      </Button>

      <AnalyticsModal isVisible={isAnalyticsOpen} onClose={() => setIsAnalyticsOpen(false)} />
    </>
  );
};
