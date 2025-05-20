
import React, { useState, useEffect, useMemo } from 'react';
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
import { ArrowRight, ArrowLeft, X, Info, Play, Sparkles } from 'lucide-react';
import { useMediaQuery } from '@/hooks/use-mobile';

interface TourStep {
  title: string;
  description: string;
  image?: string;
  element?: string; // CSS selector for an element to highlight
  placement?: 'top' | 'right' | 'bottom' | 'left'; // Where to place tooltip relative to element
  spotlightClicks?: boolean; // Whether to allow clicks inside the spotlight
}

interface GuidedTourProps {
  tourId: string;  // Unique identifier for this tour
  steps: TourStep[];
  onComplete?: () => void;
  onSkip?: () => void;
  autoStart?: boolean; // Whether to start automatically
  showAgainAfterDays?: number; // If provided, will show again after X days even if completed
  aiContext?: boolean; // Whether this tour provides AI context specifically
}

const LOCAL_STORAGE_PREFIX = 'eduforge_tour_';

const GuidedTour: React.FC<GuidedTourProps> = ({ 
  tourId, 
  steps, 
  onComplete, 
  onSkip,
  autoStart = true,
  showAgainAfterDays,
  aiContext = false
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const { toast } = useToast();
  const isMobile = useMediaQuery('(max-width: 768px)');
  
  // Store tour state in local storage
  const storageKey = `${LOCAL_STORAGE_PREFIX}${tourId}`;

  useEffect(() => {
    if (!autoStart) return;
    
    // Check if tour has been completed
    const tourData = localStorage.getItem(storageKey);
    
    if (!tourData) {
      // Tour has never been shown
      setIsOpen(true);
      return;
    }
    
    try {
      const parsedData = JSON.parse(tourData);
      
      // If showAgainAfterDays is set, check if enough time has passed
      if (showAgainAfterDays && parsedData.completedAt) {
        const completedDate = new Date(parsedData.completedAt);
        const daysSinceCompleted = (Date.now() - completedDate.getTime()) / (1000 * 60 * 60 * 24);
        
        if (daysSinceCompleted >= showAgainAfterDays) {
          setIsOpen(true);
          return;
        }
      }
      
      // Don't show if completed and not enough time has passed
      if (parsedData.status === 'completed') {
        setIsOpen(false);
      } else {
        setIsOpen(true);
        
        // Resume from last step if available
        if (parsedData.lastStep) {
          setCurrentStep(parsedData.lastStep);
        }
      }
    } catch (e) {
      // If there's an error parsing, show the tour
      setIsOpen(true);
    }
  }, [tourId, autoStart, showAgainAfterDays, storageKey]);
  
  const saveProgress = (status: 'completed' | 'skipped', step?: number) => {
    const data = {
      status,
      completedAt: new Date().toISOString(),
      lastStep: step
    };
    
    localStorage.setItem(storageKey, JSON.stringify(data));
  };

  const handleComplete = () => {
    // Mark tour as completed
    saveProgress('completed');
    setIsOpen(false);
    
    if (onComplete) {
      onComplete();
    }
    
    toast({
      title: "Tour completed",
      description: aiContext 
        ? "You now understand how AI content generation works in EduForge." 
        : "You can always access help from the support menu.",
    });
  };

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      const nextStep = currentStep + 1;
      setCurrentStep(nextStep);
      saveProgress('skipped', nextStep);
    } else {
      handleComplete();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      const prevStep = currentStep - 1;
      setCurrentStep(prevStep);
      saveProgress('skipped', prevStep);
    }
  };

  const handleDismiss = () => {
    setIsOpen(false);
    
    // Mark tour as skipped
    saveProgress('skipped', currentStep);
    
    if (onSkip) {
      onSkip();
    }
    
    toast({
      title: "Tour skipped",
      description: "You can restart the tour from the help menu.",
    });
  };

  // Progress calculation
  const progress = useMemo(() => {
    return ((currentStep + 1) / steps.length) * 100;
  }, [currentStep, steps.length]);
  
  // Responsive title based on screen size
  const responsiveTitle = useMemo(() => {
    if (!steps[currentStep]) return '';
    
    return isMobile && steps[currentStep].title.length > 30 
      ? steps[currentStep].title.substring(0, 30) + '...' 
      : steps[currentStep].title;
  }, [steps, currentStep, isMobile]);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="pr-10 flex items-center">
            {aiContext && <Sparkles className="h-5 w-5 mr-2 text-blue-500" />}
            {responsiveTitle}
          </DialogTitle>
          <Button 
            variant="ghost" 
            size="icon" 
            className="absolute right-4 top-4" 
            onClick={handleDismiss}
          >
            <X className="h-4 w-4" />
          </Button>
          <DialogDescription className="flex items-center justify-between">
            <span>Step {currentStep + 1} of {steps.length}</span>
            <span className="text-xs text-muted-foreground">
              {Math.round(progress)}% complete
            </span>
          </DialogDescription>
        </DialogHeader>
        
        {/* Progress bar */}
        <div className="h-1 w-full bg-gray-200 rounded-full overflow-hidden">
          <div 
            className="h-full bg-primary transition-all duration-300 ease-in-out"
            style={{ width: `${progress}%` }}
          />
        </div>
        
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
            <Button onClick={handleNext} className="bg-primary text-primary-foreground">
              {currentStep < steps.length - 1 ? (
                <>
                  Next <ArrowRight className="ml-2 h-4 w-4" />
                </>
              ) : (
                <>
                  {aiContext ? (
                    <>
                      <Play className="mr-2 h-4 w-4" />
                      Start Using AI
                    </>
                  ) : (
                    'Finish'
                  )}
                </>
              )}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default GuidedTour;
