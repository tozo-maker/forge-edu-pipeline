
import React, { useState, useEffect } from 'react';
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { ArrowRight, ArrowLeft, X } from 'lucide-react';

interface TourStep {
  title: string;
  description: string;
  image?: string;
}

interface GuidedTourProps {
  tourId: string;
  steps: TourStep[];
  onComplete?: () => void;
}

const LOCAL_STORAGE_PREFIX = 'eduforge_tour_';

const GuidedTour: React.FC<GuidedTourProps> = ({ tourId, steps, onComplete }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const { toast } = useToast();

  useEffect(() => {
    // Check if tour has been completed
    const tourCompleted = localStorage.getItem(`${LOCAL_STORAGE_PREFIX}${tourId}`);
    
    if (!tourCompleted) {
      setIsOpen(true);
    }
  }, [tourId]);

  const handleComplete = () => {
    // Mark tour as completed
    localStorage.setItem(`${LOCAL_STORAGE_PREFIX}${tourId}`, 'completed');
    setIsOpen(false);
    
    if (onComplete) {
      onComplete();
    }
    
    toast({
      title: "Tour completed",
      description: "You can always access help from the support menu.",
    });
  };

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleComplete();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleDismiss = () => {
    setIsOpen(false);
    
    // Mark tour as completed but also indicate it was skipped
    localStorage.setItem(`${LOCAL_STORAGE_PREFIX}${tourId}`, 'skipped');
    
    toast({
      title: "Tour skipped",
      description: "You can restart the tour from the help menu.",
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="pr-10">{steps[currentStep]?.title}</DialogTitle>
          <Button 
            variant="ghost" 
            size="icon" 
            className="absolute right-4 top-4" 
            onClick={handleDismiss}
          >
            <X className="h-4 w-4" />
          </Button>
          <DialogDescription>
            Step {currentStep + 1} of {steps.length}
          </DialogDescription>
        </DialogHeader>
        
        {steps[currentStep]?.image && (
          <div className="my-4">
            <img 
              src={steps[currentStep].image} 
              alt={`Tour step ${currentStep + 1}`}
              className="w-full rounded-md border"
            />
          </div>
        )}
        
        <div className="my-4">
          {steps[currentStep]?.description}
        </div>
        
        <DialogFooter className="flex justify-between sm:justify-between">
          <div>
            {currentStep > 0 && (
              <Button variant="outline" onClick={handlePrevious}>
                <ArrowLeft className="mr-2 h-4 w-4" /> Previous
              </Button>
            )}
          </div>
          <div className="flex gap-2">
            <Button variant="ghost" onClick={handleDismiss}>
              Skip tour
            </Button>
            <Button onClick={handleNext}>
              {currentStep < steps.length - 1 ? (
                <>
                  Next <ArrowRight className="ml-2 h-4 w-4" />
                </>
              ) : (
                'Finish'
              )}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default GuidedTour;
