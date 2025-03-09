
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/hooks/use-toast";
import { Calendar, Clock, MapPin, Upload } from "lucide-react";

const CreateEvent = () => {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    date: "",
    startTime: "",
    endTime: "",
    location: "",
    image: null as File | null,
    imagePreview: ""
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setFormData(prev => ({
        ...prev,
        image: file,
        imagePreview: URL.createObjectURL(file)
      }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form
    if (!formData.title || !formData.description || !formData.date || 
        !formData.startTime || !formData.endTime || !formData.location) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);

    // In a real app, this would send data to a server
    setTimeout(() => {
      toast({
        title: "Event Created!",
        description: "Your event has been created successfully."
      });
      setIsSubmitting(false);
      navigate("/dashboard");
    }, 1500);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Create New Event</h1>
        
        <form onSubmit={handleSubmit}>
          <Card className="mb-8">
            <CardContent className="p-6">
              <div className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="title">Event Title*</Label>
                  <Input
                    id="title"
                    name="title"
                    placeholder="Give your event a clear, descriptive title"
                    value={formData.title}
                    onChange={handleChange}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="description">Event Description*</Label>
                  <Textarea
                    id="description"
                    name="description"
                    placeholder="Describe your event, what attendees can expect, and any other relevant details"
                    rows={6}
                    value={formData.description}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="mb-8">
            <CardContent className="p-6">
              <h2 className="text-xl font-semibold mb-4">Date & Time</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="date">Event Date*</Label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                    <Input
                      id="date"
                      name="date"
                      type="date"
                      className="pl-10"
                      value={formData.date}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="startTime">Start Time*</Label>
                    <div className="relative">
                      <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                      <Input
                        id="startTime"
                        name="startTime"
                        type="time"
                        className="pl-10"
                        value={formData.startTime}
                        onChange={handleChange}
                        required
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="endTime">End Time*</Label>
                    <div className="relative">
                      <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                      <Input
                        id="endTime"
                        name="endTime"
                        type="time"
                        className="pl-10"
                        value={formData.endTime}
                        onChange={handleChange}
                        required
                      />
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="mb-8">
            <CardContent className="p-6">
              <h2 className="text-xl font-semibold mb-4">Location</h2>
              
              <div className="space-y-2">
                <Label htmlFor="location">Event Location*</Label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                  <Input
                    id="location"
                    name="location"
                    placeholder="Enter the event location or 'Online' for virtual events"
                    className="pl-10"
                    value={formData.location}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="mb-8">
            <CardContent className="p-6">
              <h2 className="text-xl font-semibold mb-4">Event Image</h2>
              
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="image">Upload Event Image</Label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                    {formData.imagePreview ? (
                      <div className="relative">
                        <img 
                          src={formData.imagePreview} 
                          alt="Event preview" 
                          className="mx-auto max-h-64 rounded-lg"
                        />
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          className="absolute top-2 right-2"
                          onClick={() => setFormData(prev => ({ ...prev, image: null, imagePreview: "" }))}
                        >
                          Change
                        </Button>
                      </div>
                    ) : (
                      <div>
                        <Upload className="mx-auto h-12 w-12 text-gray-400 mb-2" />
                        <p className="text-sm text-gray-600 mb-2">
                          Drag and drop an image, or click to browse
                        </p>
                        <p className="text-xs text-gray-500">
                          Recommended size: 1200 x 600 pixels (16:9 ratio)
                        </p>
                        <Input
                          id="image"
                          name="image"
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={handleImageChange}
                        />
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => document.getElementById("image")?.click()}
                          className="mt-4"
                        >
                          Select Image
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <div className="flex justify-end space-x-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate("/dashboard")}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Creating Event..." : "Create Event"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateEvent;
