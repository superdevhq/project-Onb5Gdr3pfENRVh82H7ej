
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar, Edit, MapPin, MoreHorizontal, Plus, Trash2, Users } from "lucide-react";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Tables } from "@/integrations/supabase/types";

type EventWithDetails = Tables<"events"> & {
  profiles: Tables<"profiles">;
  attendee_count: number;
};

const Dashboard = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [eventToDelete, setEventToDelete] = useState<string | null>(null);
  const [myEvents, setMyEvents] = useState<EventWithDetails[]>([]);
  const [registeredEvents, setRegisteredEvents] = useState<EventWithDetails[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchMyEvents();
      fetchRegisteredEvents();

      // Set up real-time subscription for events and registrations
      const eventsSubscription = supabase
        .channel('dashboard-events')
        .on('postgres_changes', {
          event: '*',
          schema: 'public',
          table: 'events',
          filter: `organizer_id=eq.${user.id}`
        }, () => {
          fetchMyEvents();
        })
        .subscribe();

      const registrationsSubscription = supabase
        .channel('dashboard-registrations')
        .on('postgres_changes', {
          event: '*',
          schema: 'public',
          table: 'registrations'
        }, () => {
          fetchMyEvents();
          fetchRegisteredEvents();
        })
        .subscribe();

      return () => {
        supabase.removeChannel(eventsSubscription);
        supabase.removeChannel(registrationsSubscription);
      };
    }
  }, [user]);

  const fetchMyEvents = async () => {
    if (!user) return;
    
    try {
      // First, fetch all events organized by the user
      const { data: eventsData, error: eventsError } = await supabase
        .from("events")
        .select(`
          *,
          profiles(*)
        `)
        .eq("organizer_id", user.id)
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

      setMyEvents(eventsWithCounts);
    } catch (error) {
      console.error("Error fetching my events:", error);
      toast({
        title: "Error",
        description: "Failed to load your events. Please try again later.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchRegisteredEvents = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from("registrations")
        .select(`
          event_id
        `)
        .eq("user_id", user.id);

      if (error) {
        throw error;
      }

      if (data.length === 0) {
        setRegisteredEvents([]);
        return;
      }

      // Get the event IDs the user has registered for
      const eventIds = data.map(registration => registration.event_id);

      // Fetch the details of those events
      const { data: eventsData, error: eventsError } = await supabase
        .from("events")
        .select(`
          *,
          profiles(*)
        `)
        .in("id", eventIds)
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

      setRegisteredEvents(eventsWithCounts);
    } catch (error) {
      console.error("Error fetching registered events:", error);
      toast({
        title: "Error",
        description: "Failed to load your registered events. Please try again later.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteClick = (eventId: string) => {
    setEventToDelete(eventId);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!eventToDelete) return;

    try {
      // First delete all agenda items for this event
      const { error: agendaError } = await supabase
        .from("agenda_items")
        .delete()
        .eq("event_id", eventToDelete);

      if (agendaError) {
        throw agendaError;
      }

      // Then delete all registrations for this event
      const { error: registrationsError } = await supabase
        .from("registrations")
        .delete()
        .eq("event_id", eventToDelete);

      if (registrationsError) {
        throw registrationsError;
      }

      // Finally delete the event itself
      const { error: eventError } = await supabase
        .from("events")
        .delete()
        .eq("id", eventToDelete);

      if (eventError) {
        throw eventError;
      }

      toast({
        title: "Event Deleted",
        description: "The event has been successfully deleted."
      });
      
      // Events will be refreshed by the subscription
    } catch (error) {
      console.error("Error deleting event:", error);
      toast({
        title: "Error",
        description: "Failed to delete the event. Please try again later.",
        variant: "destructive",
      });
    } finally {
      setDeleteDialogOpen(false);
      setEventToDelete(null);
    }
  };

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

  // Check if an event is in the past
  const isEventPast = (dateString: string) => {
    const eventDate = new Date(dateString);
    const now = new Date();
    return eventDate < now;
  };

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h1 className="text-3xl font-bold mb-4">Authentication Required</h1>
        <p className="text-gray-600 mb-8">Please log in to view your dashboard.</p>
        <Button asChild>
          <Link to="/login">Log In</Link>
        </Button>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-16 flex justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Filter events into upcoming and past
  const upcomingMyEvents = myEvents.filter(event => !isEventPast(event.date));
  const pastMyEvents = myEvents.filter(event => isEventPast(event.date));
  const upcomingRegisteredEvents = registeredEvents.filter(event => !isEventPast(event.date));
  const pastRegisteredEvents = registeredEvents.filter(event => isEventPast(event.date));

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-gray-600">Manage your events and registrations</p>
        </div>
        <Button asChild className="mt-4 md:mt-0">
          <Link to="/create">
            <Plus className="mr-2 h-4 w-4" /> Create New Event
          </Link>
        </Button>
      </div>

      <Tabs defaultValue="my-events">
        <TabsList className="mb-8">
          <TabsTrigger value="my-events">My Events</TabsTrigger>
          <TabsTrigger value="registered">Registered Events</TabsTrigger>
        </TabsList>

        {/* My Events Tab */}
        <TabsContent value="my-events">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {upcomingMyEvents.length === 0 ? (
              <div className="col-span-full text-center py-12">
                <h2 className="text-2xl font-semibold mb-2">No upcoming events</h2>
                <p className="text-gray-600 mb-6">You haven't created any upcoming events yet.</p>
                <Button asChild>
                  <Link to="/create">Create Your First Event</Link>
                </Button>
              </div>
            ) : (
              <>
                <h2 className="text-xl font-semibold col-span-full mb-2">Upcoming Events</h2>
                {upcomingMyEvents.map(event => (
                  <Card key={event.id} className="overflow-hidden hover:shadow-md transition-shadow">
                    <div className="h-40 overflow-hidden relative">
                      <img 
                        src={event.image_url || "https://images.unsplash.com/photo-1517694712202-14dd9538aa97"} 
                        alt={event.title} 
                        className="w-full h-full object-cover"
                      />
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button 
                            variant="ghost" 
                            size="icon"
                            className="absolute top-2 right-2 bg-white/80 hover:bg-white"
                          >
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem asChild>
                            <Link to={`/events/${event.id}`}>View Event</Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            className="text-red-600 focus:text-red-600"
                            onClick={() => handleDeleteClick(event.id)}
                          >
                            <Trash2 className="mr-2 h-4 w-4" /> Delete Event
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
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
                      <div className="flex items-center text-sm text-gray-500">
                        <Users className="h-4 w-4 mr-1" />
                        <span>{event.attendee_count} attendees</span>
                      </div>
                    </CardContent>
                    <CardFooter className="p-4 pt-0">
                      <Button asChild variant="outline" className="w-full">
                        <Link to={`/events/${event.id}`}>Manage Event</Link>
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
              </>
            )}

            {pastMyEvents.length > 0 && (
              <>
                <h2 className="text-xl font-semibold col-span-full mt-8 mb-2">Past Events</h2>
                {pastMyEvents.map(event => (
                  <Card key={event.id} className="overflow-hidden hover:shadow-md transition-shadow opacity-75">
                    <div className="h-40 overflow-hidden relative">
                      <img 
                        src={event.image_url || "https://images.unsplash.com/photo-1517694712202-14dd9538aa97"} 
                        alt={event.title} 
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute top-2 right-2">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button 
                              variant="ghost" 
                              size="icon"
                              className="bg-white/80 hover:bg-white"
                            >
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem asChild>
                              <Link to={`/events/${event.id}`}>View Event</Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              className="text-red-600 focus:text-red-600"
                              onClick={() => handleDeleteClick(event.id)}
                            >
                              <Trash2 className="mr-2 h-4 w-4" /> Delete Event
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
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
                      <div className="flex items-center text-sm text-gray-500">
                        <Users className="h-4 w-4 mr-1" />
                        <span>{event.attendee_count} attendees</span>
                      </div>
                    </CardContent>
                    <CardFooter className="p-4 pt-0">
                      <Button asChild variant="outline" className="w-full">
                        <Link to={`/events/${event.id}`}>View Details</Link>
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
              </>
            )}
          </div>
        </TabsContent>

        {/* Registered Events Tab */}
        <TabsContent value="registered">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {upcomingRegisteredEvents.length === 0 ? (
              <div className="col-span-full text-center py-12">
                <h2 className="text-2xl font-semibold mb-2">No upcoming registrations</h2>
                <p className="text-gray-600 mb-6">You haven't registered for any upcoming events.</p>
                <Button asChild>
                  <Link to="/events">Browse Events</Link>
                </Button>
              </div>
            ) : (
              <>
                <h2 className="text-xl font-semibold col-span-full mb-2">Upcoming Registrations</h2>
                {upcomingRegisteredEvents.map(event => (
                  <Card key={event.id} className="overflow-hidden hover:shadow-md transition-shadow">
                    <div className="h-40 overflow-hidden">
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
                      <p className="text-sm text-gray-600 mb-2">
                        Organized by: {event.profiles.full_name || "Event Organizer"}
                      </p>
                    </CardContent>
                    <CardFooter className="p-4 pt-0">
                      <Button asChild className="w-full">
                        <Link to={`/events/${event.id}`}>View Event</Link>
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
              </>
            )}

            {pastRegisteredEvents.length > 0 && (
              <>
                <h2 className="text-xl font-semibold col-span-full mt-8 mb-2">Past Registrations</h2>
                {pastRegisteredEvents.map(event => (
                  <Card key={event.id} className="overflow-hidden hover:shadow-md transition-shadow opacity-75">
                    <div className="h-40 overflow-hidden">
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
                      <p className="text-sm text-gray-600 mb-2">
                        Organized by: {event.profiles.full_name || "Event Organizer"}
                      </p>
                    </CardContent>
                    <CardFooter className="p-4 pt-0">
                      <Button asChild variant="outline" className="w-full">
                        <Link to={`/events/${event.id}`}>View Details</Link>
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
              </>
            )}
          </div>
        </TabsContent>
      </Tabs>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Event</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this event? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={confirmDelete}>
              Delete Event
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Dashboard;
