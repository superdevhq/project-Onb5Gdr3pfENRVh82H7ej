
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Calendar, MapPin, Search, Users } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Tables } from "@/integrations/supabase/types";
import { useToast } from "@/hooks/use-toast";

type Event = Tables<"events"> & {
  profiles: Tables<"profiles"> | null;
  attendee_count: number;
};

const Events = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [events, setEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  
  useEffect(() => {
    fetchEvents();

    // Set up real-time subscription for registrations
    const registrationsSubscription = supabase
      .channel('public-registrations')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'registrations'
      }, () => {
        // Refresh events when registrations change
        fetchEvents();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(registrationsSubscription);
    };
  }, []);

  const fetchEvents = async () => {
    setIsLoading(true);
    try {
      // First, fetch all events with their basic details
      const { data: eventsData, error: eventsError } = await supabase
        .from("events")
        .select(`
          *,
          profiles(*)
        `)
        .order('date', { ascending: true });

      if (eventsError) {
        throw eventsError;
      }

      // Then, for each event, get the attendee count
      const eventsWithCounts = await Promise.all(
        eventsData.map(async (event) => {
          const { count, error } = await supabase
            .from("registrations")
            .select('*', { count: 'exact', head: true })
            .eq("event_id", event.id);

          if (error) {
            console.error("Error fetching attendee count:", error);
            return { ...event, attendee_count: 0 };
          }

          return { ...event, attendee_count: count || 0 };
        })
      );

      setEvents(eventsWithCounts);
    } catch (error) {
      console.error("Error fetching events:", error);
      toast({
        title: "Error",
        description: "Failed to load events. Please try again later.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  // Filter events based on search term
  const filteredEvents = events.filter(event => 
    event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (event.description?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
    event.location.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'long', 
      day: 'numeric', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-4">Discover Events</h1>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <Input
            type="text"
            placeholder="Search events by name, description, or location"
            className="pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      ) : filteredEvents.length === 0 ? (
        <div className="text-center py-12">
          <h2 className="text-2xl font-semibold mb-2">No events found</h2>
          <p className="text-gray-600 mb-6">Try adjusting your search or create your own event!</p>
          <Button asChild>
            <Link to="/create">Create Event</Link>
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredEvents.map((event) => (
            <Card key={event.id} className="overflow-hidden hover:shadow-md transition-shadow">
              <div className="h-48 overflow-hidden">
                <img 
                  src={event.image_url || "https://images.unsplash.com/photo-1517694712202-14dd9538aa97"} 
                  alt={event.title} 
                  className="w-full h-full object-cover"
                />
              </div>
              <CardContent className="p-4">
                <div className="flex items-center text-sm text-gray-500 mb-2">
                  <Calendar className="h-4 w-4 mr-1" />
                  <span>{formatDate(event.date)}</span>
                </div>
                <div className="flex items-center text-sm text-gray-500 mb-3">
                  <MapPin className="h-4 w-4 mr-1" />
                  <span>{event.location}</span>
                </div>
                <h3 className="text-xl font-semibold mb-2">{event.title}</h3>
                <p className="text-gray-600 text-sm mb-3 line-clamp-2">{event.description}</p>
                <div className="flex items-center text-sm text-gray-500">
                  <Users className="h-4 w-4 mr-1" />
                  <span>{event.attendee_count} attendees</span>
                </div>
              </CardContent>
              <CardFooter className="p-4 pt-0">
                <Button asChild className="w-full">
                  <Link to={`/events/${event.id}`}>View Details</Link>
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default Events;
