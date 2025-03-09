
import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Calendar, Clock, MapPin, User, Users } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Tables } from "@/integrations/supabase/types";
import { useAuth } from "@/contexts/AuthContext";

type EventWithDetails = Tables<"events"> & {
  profiles: Tables<"profiles"> | null;
  agenda_items: {
    id: string;
    title: string;
    time: string;
    display_order: number;
  }[];
  attendee_count: number;
};

const EventDetails = () => {
  const { id } = useParams<{ id: string }>();
  const [isRegisterDialogOpen, setIsRegisterDialogOpen] = useState(false);
  const [event, setEvent] = useState<EventWithDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRegistering, setIsRegistering] = useState(false);
  const [isUserRegistered, setIsUserRegistered] = useState(false);
  const [attendeeCount, setAttendeeCount] = useState(0);
  const { toast } = useToast();
  const { user } = useAuth();

  useEffect(() => {
    if (id) {
      fetchEventDetails();
      fetchAttendeeCount();
    }

    // Set up real-time subscription for registrations
    if (id) {
      const registrationsSubscription = supabase
        .channel('event-registrations')
        .on('postgres_changes', {
          event: '*',
          schema: 'public',
          table: 'registrations',
          filter: `event_id=eq.${id}`
        }, () => {
          // Refresh attendee count when registrations change
          fetchAttendeeCount();
        })
        .subscribe();

      return () => {
        supabase.removeChannel(registrationsSubscription);
      };
    }
  }, [id]);

  useEffect(() => {
    if (user && event) {
      checkUserRegistration();
    }
  }, [user, event]);

  const fetchEventDetails = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("events")
        .select(`
          *,
          profiles(*),
          agenda_items(id, title, time, display_order)
        `)
        .eq("id", id)
        .single();

      if (error) {
        throw error;
      }

      // Sort agenda items by display_order
      const sortedAgendaItems = data.agenda_items.sort(
        (a, b) => a.display_order - b.display_order
      );

      setEvent({
        ...data,
        agenda_items: sortedAgendaItems,
        attendee_count: 0 // Will be updated by fetchAttendeeCount
      });
    } catch (error) {
      console.error("Error fetching event details:", error);
      toast({
        title: "Error",
        description: "Failed to load event details. Please try again later.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchAttendeeCount = async () => {
    if (!id) return;
    
    try {
      const { count, error } = await supabase
        .from("registrations")
        .select('*', { count: 'exact', head: true })
        .eq("event_id", id);

      if (error) {
        throw error;
      }

      setAttendeeCount(count || 0);
      
      // Update event object if it exists
      if (event) {
        setEvent(prev => prev ? { ...prev, attendee_count: count || 0 } : null);
      }
    } catch (error) {
      console.error("Error fetching attendee count:", error);
    }
  };

  const checkUserRegistration = async () => {
    if (!user || !event) return;

    try {
      const { data, error } = await supabase
        .from("registrations")
        .select("id")
        .eq("event_id", id)
        .eq("user_id", user.id)
        .maybeSingle();

      if (error) {
        throw error;
      }

      setIsUserRegistered(!!data);
    } catch (error) {
      console.error("Error checking registration:", error);
    }
  };

  const handleRegister = async () => {
    if (!user) {
      toast({
        title: "Login Required",
        description: "Please log in to register for this event",
        variant: "destructive"
      });
      return;
    }

    if (!event) return;

    setIsRegistering(true);
    try {
      const { error } = await supabase
        .from("registrations")
        .insert({
          event_id: event.id,
          user_id: user.id
        });

      if (error) {
        throw error;
      }

      toast({
        title: "Registration Successful!",
        description: `You're registered for ${event.title}.`
      });
      
      setIsUserRegistered(true);
      setIsRegisterDialogOpen(false);
      // Attendee count will be updated by the subscription
    } catch (error) {
      console.error("Error registering for event:", error);
      toast({
        title: "Registration Failed",
        description: "There was an error registering for this event. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsRegistering(false);
    }
  };

  const handleCancelRegistration = async () => {
    if (!user || !event) return;

    setIsRegistering(true);
    try {
      const { error } = await supabase
        .from("registrations")
        .delete()
        .eq("event_id", event.id)
        .eq("user_id", user.id);

      if (error) {
        throw error;
      }

      toast({
        title: "Registration Cancelled",
        description: `You've cancelled your registration for ${event.title}.`
      });
      
      setIsUserRegistered(false);
      // Attendee count will be updated by the subscription
    } catch (error) {
      console.error("Error cancelling registration:", error);
      toast({
        title: "Cancellation Failed",
        description: "There was an error cancelling your registration. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsRegistering(false);
    }
  };

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      weekday: 'long',
      month: 'long', 
      day: 'numeric', 
      year: 'numeric'
    });
  };

  // Format time
  const formatTime = (timeString: string) => {
    // If the time is in HH:MM format, convert it to a date object
    if (timeString.includes(':')) {
      const [hours, minutes] = timeString.split(':').map(Number);
      const date = new Date();
      date.setHours(hours, minutes);
      return date.toLocaleTimeString('en-US', { 
        hour: '2-digit',
        minute: '2-digit'
      });
    }
    
    // If it's already a date string
    const date = new Date(timeString);
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-16 flex justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h1 className="text-3xl font-bold mb-4">Event Not Found</h1>
        <p className="text-gray-600 mb-8">The event you're looking for doesn't exist or has been removed.</p>
        <Button asChild>
          <Link to="/events">Browse Events</Link>
        </Button>
      </div>
    );
  }

  // Get organizer name and avatar with fallbacks
  const organizerName = event.profiles?.full_name || "Event Organizer";
  const organizerAvatar = event.profiles?.avatar_url || "https://randomuser.me/api/portraits/lego/1.jpg";

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Event Header */}
      <div className="relative h-64 md:h-96 rounded-lg overflow-hidden mb-8">
        <img 
          src={event.image_url || "https://images.unsplash.com/photo-1517694712202-14dd9538aa97"} 
          alt={event.title} 
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black bg-opacity-40 flex items-end">
          <div className="p-6 text-white">
            <h1 className="text-3xl md:text-4xl font-bold mb-2">{event.title}</h1>
            <div className="flex items-center">
              <Calendar className="h-5 w-5 mr-2" />
              <span className="mr-4">{formatDate(event.date)}</span>
              <MapPin className="h-5 w-5 mr-2" />
              <span>{event.location}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Event Details */}
        <div className="lg:col-span-2">
          <div className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">About this event</h2>
            <p className="text-gray-700 whitespace-pre-line">{event.description}</p>
          </div>

          {event.agenda_items && event.agenda_items.length > 0 && (
            <div className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">Agenda</h2>
              <div className="space-y-4">
                {event.agenda_items.map((item) => (
                  <div key={item.id} className="flex">
                    <div className="w-24 flex-shrink-0 text-gray-600">{item.time}</div>
                    <div className="flex-grow">{item.title}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div>
            <h2 className="text-2xl font-semibold mb-4">Organizer</h2>
            <div className="flex items-center">
              <img 
                src={organizerAvatar} 
                alt={organizerName} 
                className="w-12 h-12 rounded-full mr-4"
              />
              <div>
                <h3 className="font-medium">{organizerName}</h3>
                <p className="text-gray-600 text-sm">Event Organizer</p>
              </div>
            </div>
          </div>
        </div>

        {/* Registration Card */}
        <div>
          <Card className="sticky top-8">
            <CardContent className="p-6">
              <h3 className="text-xl font-semibold mb-4">Event Details</h3>
              
              <div className="space-y-4 mb-6">
                <div className="flex items-start">
                  <Calendar className="h-5 w-5 mr-3 mt-0.5 text-gray-500" />
                  <div>
                    <p className="font-medium">Date and Time</p>
                    <p className="text-gray-600">{formatDate(event.date)}</p>
                    <p className="text-gray-600">{formatTime(event.date)} - {formatTime(event.end_time)}</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <MapPin className="h-5 w-5 mr-3 mt-0.5 text-gray-500" />
                  <div>
                    <p className="font-medium">Location</p>
                    <p className="text-gray-600">{event.location}</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <Users className="h-5 w-5 mr-3 mt-0.5 text-gray-500" />
                  <div>
                    <p className="font-medium">Attendees</p>
                    <p className="text-gray-600">{attendeeCount} people attending</p>
                  </div>
                </div>
              </div>
              
              {!user ? (
                <Button 
                  className="w-full" 
                  size="lg"
                  asChild
                >
                  <Link to="/login">Login to Register</Link>
                </Button>
              ) : isUserRegistered ? (
                <Button 
                  className="w-full" 
                  size="lg"
                  variant="outline"
                  onClick={handleCancelRegistration}
                  disabled={isRegistering}
                >
                  {isRegistering ? "Processing..." : "Cancel Registration"}
                </Button>
              ) : (
                <Button 
                  className="w-full" 
                  size="lg"
                  onClick={handleRegister}
                  disabled={isRegistering}
                >
                  {isRegistering ? "Processing..." : "Register for Event"}
                </Button>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default EventDetails;
