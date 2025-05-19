
import React from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

const subjects = [
  "Mathematics",
  "Science",
  "English/Language Arts",
  "Social Studies",
  "Foreign Languages",
  "Arts",
  "Physical Education",
  "Computer Science",
] as const;

const gradeLevels = [
  "K-2",
  "3-5",
  "6-8",
  "9-12",
  "Higher Education",
] as const;

const teachingStyles = [
  "traditional",
  "project_based",
  "inquiry_based",
  "flipped_classroom",
  "differentiated",
] as const;

const formSchema = z.object({
  subjects: z.array(z.string()).min(1, { message: "Select at least one subject area" }),
  gradeLevel: z.string({ required_error: "Please select a grade level" }),
  teachingStyle: z.string({ required_error: "Please select a teaching style" }),
  additionalInfo: z.string().optional(),
  pipelineExplanation: z.boolean().default(true),
});

type FormValues = z.infer<typeof formSchema>;

const OnboardingForm: React.FC = () => {
  const navigate = useNavigate();
  
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      subjects: [],
      gradeLevel: "",
      teachingStyle: "",
      additionalInfo: "",
      pipelineExplanation: true,
    },
  });

  const onSubmit = (values: FormValues) => {
    console.log("Onboarding submitted:", values);
    toast.success("Onboarding complete!");
    navigate("/pipeline-intro");
  };

  return (
    <div className="max-w-3xl mx-auto py-10 px-4">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-primary-500 mb-2">Welcome to EduForge AI</h1>
        <p className="text-gray-600">
          Let's get to know you better so we can personalize your experience
        </p>
      </div>
      
      <div className="bg-white rounded-xl shadow-md p-6 md:p-8">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="subjects"
              render={() => (
                <FormItem>
                  <div className="mb-4">
                    <FormLabel className="text-base">Subject Areas</FormLabel>
                    <FormDescription>
                      Select the subject areas you typically teach or develop content for
                    </FormDescription>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {subjects.map((subject) => (
                      <FormField
                        key={subject}
                        control={form.control}
                        name="subjects"
                        render={({ field }) => {
                          return (
                            <FormItem
                              key={subject}
                              className="flex flex-row items-start space-x-3 space-y-0"
                            >
                              <FormControl>
                                <Checkbox
                                  checked={field.value?.includes(subject)}
                                  onCheckedChange={(checked) => {
                                    return checked
                                      ? field.onChange([...field.value, subject])
                                      : field.onChange(
                                          field.value?.filter(
                                            (value) => value !== subject
                                          )
                                        )
                                  }}
                                />
                              </FormControl>
                              <FormLabel className="font-normal">
                                {subject}
                              </FormLabel>
                            </FormItem>
                          )
                        }}
                      />
                    ))}
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="gradeLevel"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Grade Level</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select grade level" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {gradeLevels.map((level) => (
                          <SelectItem key={level} value={level}>
                            {level}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="teachingStyle"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Preferred Teaching Style</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select teaching style" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="traditional">Traditional</SelectItem>
                        <SelectItem value="project_based">Project-Based Learning</SelectItem>
                        <SelectItem value="inquiry_based">Inquiry-Based</SelectItem>
                        <SelectItem value="flipped_classroom">Flipped Classroom</SelectItem>
                        <SelectItem value="differentiated">Differentiated Instruction</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <FormField
              control={form.control}
              name="additionalInfo"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Additional Information</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Tell us about your specific content needs or challenges..."
                      className="resize-none h-24"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="pipelineExplanation"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>
                      Show me an overview of the six-stage content creation pipeline
                    </FormLabel>
                    <FormDescription>
                      We'll guide you through our process before you start creating content
                    </FormDescription>
                  </div>
                </FormItem>
              )}
            />
            
            <Button type="submit" className="w-full">
              Complete Setup
            </Button>
          </form>
        </Form>
      </div>
    </div>
  );
};

export default OnboardingForm;
