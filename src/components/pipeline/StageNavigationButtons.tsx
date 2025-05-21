
import React from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight, Loader2 } from "lucide-react";
import { useMediaQuery } from "@/hooks/use-mobile";

interface StageNavigationButtonsProps {
  onPrevious: () => void;
  onNext: () => void;
  isNextDisabled: boolean;
  isLoading: boolean;
  loadingMessage?: string;
}

const StageNavigationButtons: React.FC<StageNavigationButtonsProps> = ({
  onPrevious,
  onNext,
  isNextDisabled,
  isLoading,
  loadingMessage = "Processing...",
}) => {
  const isMobile = useMediaQuery("md");

  return (
    <div className={`flex ${isMobile ? 'flex-col space-y-2' : 'justify-between'}`}>
      <Button 
        variant="outline" 
        onClick={onPrevious}
        className={isMobile ? "w-full" : ""}
        size={isMobile ? "sm" : "default"}
      >
        <ArrowLeft className={`mr-2 h-${isMobile ? 3 : 4} w-${isMobile ? 3 : 4}`} />
        Previous
      </Button>
      <Button 
        onClick={onNext} 
        disabled={isNextDisabled || isLoading}
        className={isMobile ? "w-full" : ""}
        size={isMobile ? "sm" : "default"}
      >
        {isLoading ? (
          <>
            <Loader2 className={`mr-2 h-${isMobile ? 3 : 4} w-${isMobile ? 3 : 4} animate-spin`} />
            {loadingMessage || "Processing..."}
          </>
        ) : (
          <>
            Next
            <ArrowRight className={`ml-2 h-${isMobile ? 3 : 4} w-${isMobile ? 3 : 4}`} />
          </>
        )}
      </Button>
    </div>
  );
};

export default StageNavigationButtons;
