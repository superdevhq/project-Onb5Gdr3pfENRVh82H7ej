
import { useState } from "react";
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
import { toast } from "@/hooks/use-toast";

// Mock data for user's events
const mockUserEvents = [
  {
    id: "101",
    title: "Product Design Workshop",
    description: "Learn the fundamentals of product design in this interactive workshop.",
    date: "2023-08-15T10:00:00",
    location: "Design Studio, Seattle",
    image: "https://images.unsplash.com/photo-1587440871875-191322ee64b0",
    attendees: 18,
    status: "upcoming"
  },
  {
    id: "102",
    title: "JavaScript Fundamentals",
    description: "A beginner-friendly introduction to JavaScript programming.",
    date: "2023-08-20T14:00:00",
    location: "Online",
    image: "https://images.unsplash.com/photo-1579468118864-1b9ea3c0db4a",
    attendees: 32,
    status: "upcoming"
  },
  {
    id: "103",
    title: "Networking for Startups",
    description: "Connect with other startup founders and potential investors.",
    date: "2023-07-10T18:00:00",
    location: "Innovation Hub, Chicago",
    image: "https://images.unsplash.com/photo-1540317580384-e5d43867caa6",
    attendees: 65,
    status: "past"
  },
  {
    id: "104",
    title: "Introduction to Machine Learning",
    description: "Learn the basics of machine learning and AI applications.",
    date: "2023-06-25T09:00:00",
    location: "Tech Campus, Boston",
    image: "https://images.unsplash.com/photo-1485827404703-89b55fcc595e",
    attendees: 47,
    status: "past"
  }
];

// Mock data for registered events
const mockRegisteredEvents = [
  {
    id: "201",
    title: "UX Research Methods",
    description: "Explore different UX research methodologies and when to use them.",
    date: "2023-08-18T13:00:00",
    location: "Design Center, Portland",
    image: "https://images.unsplash.com/photo-1553877522-43269d4ea984",
    organizer: "Design Thinking Association",
    status: "upcoming"
  },
  {
    id: "202",
    title: "Blockchain Technology Summit",
    description: "Discover the latest trends and applications in blockchain technology.",
    date: "2023-09-05T09:00:00",
    location: "Tech Convention Center, San Francisco",
    image: "https://images.unsplash.com/photo-1639762681057-408e52192e55",
    organizer: "Blockchain Innovators",
    status: "upcoming"
  },
  {
    id: "203",
    title: "Digital Marketing Masterclass",
    description: "Advanced strategies for digital marketing and social media.",
    date: "2023-07-12T10:00:00",
    location: "Online",
    image: "https://images.unsplash.com/photo-1533750349088-cd871a92f312",
    organizer: "Marketing Pros",
    status: "past"
  }
];

const Dashboard = () => {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [eventToDelete, setEventToDelete] = useState<string | null>(null);

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

  const handleDeleteClick = (eventId: string) => {
    setEventToDelete(eventId);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    // In a real app, this would send a delete request to the server
    toast({
      title: "Event Deleted",
      description: "The event has been successfully deleted."
    });
    setDeleteDialogOpen(false);
    setEventToDelete(null);
  };

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
            {mockUserEvents.filter(event => event.status === "upcoming").length === 0 ? (
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
                {mockUserEvents
                  .filter(event => event.status === "upcoming")
                  .map(event => (
                    <Card key={event.id} className="overflow-hidden hover:shadow-md transition-shadow">
                      <div className="h-40 overflow-hidden relative">
                        <img 
                          src={event.image} 
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
                            <DropdownMenuItem asChild>
                              <Link to={`/edit/${event.id}`}>
                                <Edit className="mr-2 h-4 w-4" /> Edit Event
                              </Link>
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
                          <span>{event.attendees} attendees</span>
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

            {mockUserEvents.filter(event => event.status === "past").length > 0 && (
              <>
                <h2 className="text-xl font-semibold col-span-full mt-8 mb-2">Past Events</h2>
                {mockUserEvents
                  .filter(event => event.status === "past")
                  .map(event => (
                    <Card key={event.id} className="overflow-hidden hover:shadow-md transition-shadow opacity-75">
                      <div className="h-40 overflow-hidden relative">
                        <img 
                          src={event.image} 
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
                          <span>{event.attendees} attendees</span>
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
            {mockRegisteredEvents.filter(event => event.status === "upcoming").length === 0 ? (
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
                {mockRegisteredEvents
                  .filter(event => event.status === "upcoming")
                  .map(event => (
                    <Card key={event.id} className="overflow-hidden hover:shadow-md transition-shadow">
                      <div className="h-40 overflow-hidden">
                        <img 
                          src={event.image} 
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
                        <p className="text-sm text-gray-600 mb-2">Organized by: {event.organizer}</p>
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

            {mockRegisteredEvents.filter(event => event.status === "past").length > 0 && (
              <>
                <h2 className="text-xl font-semibold col-span-full mt-8 mb-2">Past Registrations</h2>
                {mockRegisteredEvents
                  .filter(event => event.status === "past")
                  .map(event => (
                    <Card key={event.id} className="overflow-hidden hover:shadow-md transition-shadow opacity-75">
                      <div className="h-40 overflow-hidden">
                        <img 
                          src={event.image} 
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
                        <p className="text-sm text-gray-600 mb-2">Organized by: {event.organizer}</p>
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
