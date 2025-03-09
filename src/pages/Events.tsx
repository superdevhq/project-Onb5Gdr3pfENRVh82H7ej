
import { useState } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Calendar, MapPin, Search, Users } from "lucide-react";

// Mock data for events
const mockEvents = [
  {
    id: "1",
    title: "Web Development Workshop",
    description: "Learn the basics of web development with HTML, CSS, and JavaScript.",
    date: "2023-06-15T10:00:00",
    location: "Online",
    image: "https://images.unsplash.com/photo-1517694712202-14dd9538aa97",
    organizer: "Tech Academy",
    attendees: 45
  },
  {
    id: "2",
    title: "Startup Networking Mixer",
    description: "Connect with fellow entrepreneurs and investors in a casual setting.",
    date: "2023-06-20T18:00:00",
    location: "Innovation Hub, San Francisco",
    image: "https://images.unsplash.com/photo-1515187029135-18ee286d815b",
    organizer: "Founder Network",
    attendees: 120
  },
  {
    id: "3",
    title: "Design Thinking Workshop",
    description: "A hands-on workshop to learn design thinking principles and methodologies.",
    date: "2023-06-25T09:00:00",
    location: "Design Studio, New York",
    image: "https://images.unsplash.com/photo-1553877522-43269d4ea984",
    organizer: "Creative Minds",
    attendees: 30
  },
  {
    id: "4",
    title: "AI in Healthcare Conference",
    description: "Exploring the latest applications of artificial intelligence in healthcare.",
    date: "2023-07-05T09:00:00",
    location: "Medical Center, Boston",
    image: "https://images.unsplash.com/photo-1576091160550-2173dba999ef",
    organizer: "Health Tech Association",
    attendees: 200
  },
  {
    id: "5",
    title: "Mobile App Development Bootcamp",
    description: "Intensive 2-day bootcamp on building mobile applications.",
    date: "2023-07-10T10:00:00",
    location: "Tech Campus, Austin",
    image: "https://images.unsplash.com/photo-1551650975-87deedd944c3",
    organizer: "App Developers Guild",
    attendees: 50
  },
  {
    id: "6",
    title: "Sustainable Business Summit",
    description: "Discussing strategies for building environmentally sustainable businesses.",
    date: "2023-07-15T09:00:00",
    location: "Green Center, Portland",
    image: "https://images.unsplash.com/photo-1464692805480-a69dfaafdb0d",
    organizer: "Eco Business Alliance",
    attendees: 150
  }
];

const Events = () => {
  const [searchTerm, setSearchTerm] = useState("");
  
  // Filter events based on search term
  const filteredEvents = mockEvents.filter(event => 
    event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    event.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
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

      {filteredEvents.length === 0 ? (
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
                <p className="text-gray-600 text-sm mb-3 line-clamp-2">{event.description}</p>
                <div className="flex items-center text-sm text-gray-500">
                  <Users className="h-4 w-4 mr-1" />
                  <span>{event.attendees} attendees</span>
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
