
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Calendar, Clock, MapPin, Upload, Plus, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { v4 as uuidv4 } from "uuid";

interface AgendaItem {
  id: string;
  time: string;
  title: string;
  display_order: number;
}

const CreateEvent = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [agendaItems, setAgendaItems] = useState<AgendaItem[]>([
    { id: uuidv4(), time: "", title: "", display_order: 0 }
  ]);
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

  const handleAgendaChange = (id: string, field: 'time' | 'title', value: string) => {
    setAgendaItems(prev => 
      prev.map(item => 
        item.id === id ? { ...item, [field]: value } : item
      )
    );
  };

  const addAgendaItem = () => {
    setAgendaItems(prev => [
      ...prev, 
      { 
        id: uuidv4(), 
        time: "", 
        title: "", 
        display_order: prev.length 
      }
    ]);
  };

  const removeAgendaItem = (id: string) => {
    if (agendaItems.length > 1) {
      setAgendaItems(prev => {
        const filtered = prev.filter(item => item.id !== id);
        // Update display_order for remaining items
        return filtered.map((item, index) => ({
          ...item,
          display_order: index
        }));
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast({
        title: "Authentication Error",
        description: "You must be logged in to create an event",
        variant: "destructive"
      });
      return;
    }
    
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

    // Validate agenda items
    const validAgendaItems = agendaItems.filter(item => item.time && item.title);
    if (validAgendaItems.length === 0) {
      toast({
        title: "Error",
        description: "Please add at least one agenda item with both time and title",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Combine date and time
      const eventDate = new Date(`${formData.date}T${formData.startTime}`);
      const eventEndTime = new Date(`${formData.date}T${formData.endTime}`);
      
      let imageUrl = null;
      
      // Upload image if provided
      if (formData.image) {
        const fileExt = formData.image.name.split('.').pop();
        const fileName = `${uuidv4()}.${fileExt}`;
        const filePath = `event-images/${fileName}`;
        
        const { error: uploadError, data } = await supabase.storage
          .from('events')
          .upload(filePath, formData.image);
          
        if (uploadError) {
          throw uploadError;
        }
        
        // Get public URL
        const { data: { publicUrl } } = supabase.storage
          .from('events')
          .getPublicUrl(filePath);
          
        imageUrl = publicUrl;
      }
      
      // Create event
      const { data: eventData, error: eventError } = await supabase
        .from('events')
        .insert({
          title: formData.title,
          description: formData.description,
          date: eventDate.toISOString(),
          end_time: eventEndTime.toISOString(),
          location: formData.location,
          image_url: imageUrl,
          organizer_id: user.id
        })
        .select()
        .single();
        
      if (eventError) {
        throw eventError;
      }
      
      // Add agenda items
      if (validAgendaItems.length > 0) {
        const agendaItemsToInsert = validAgendaItems.map((item, index) => ({
          event_id: eventData.id,
          time: item.time,
          title: item.title,
          display_order: index
        }));
        
        const { error: agendaError } = await supabase
          .from('agenda_items')
          .insert(agendaItemsToInsert);
          
        if (agendaError) {
          throw agendaError;
        }
      }
      
      toast({
        title: "Event Created!",
        description: "Your event has been created successfully."
      });
      
      navigate(`/events/${eventData.id}`);
    } catch (error) {
      console.error("Error creating event:", error);
      toast({
        title: "Error",
        description: "There was an error creating your event. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
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
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">Agenda</h2>
                <Button 
                  type="button" 
                  variant="outline" 
                  size="sm"
                  onClick={addAgendaItem}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Item
                </Button>
              </div>
              
              <div className="space-y-4">
                {agendaItems.map((item, index) => (
                  <div key={item.id} className="flex items-start gap-4">
                    <div className="w-1/3">
                      <Label htmlFor={`agenda-time-${item.id}`}>Time</Label>
                      <Input
                        id={`agenda-time-${item.id}`}
                        placeholder="e.g. 10:00 AM"
                        value={item.time}
                        onChange={(e) => handleAgendaChange(item.id, 'time', e.target.value)}
                      />
                    </div>
                    <div className="flex-1">
                      <Label htmlFor={`agenda-title-${item.id}`}>Description</Label>
                      <Input
                        id={`agenda-title-${item.id}`}
                        placeholder="e.g. Welcome & Introduction"
                        value={item.title}
                        onChange={(e) => handleAgendaChange(item.id, 'title', e.target.value)}
                      />
                    </div>
                    {agendaItems.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="mt-6"
                        onClick={() => removeAgendaItem(item.id)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                ))}
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
              onClick={() => navigate("/events")}
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
