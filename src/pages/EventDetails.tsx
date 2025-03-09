
import { useState } from "react";
import { useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Calendar, Clock, MapPin, User, Users } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";

// Mock data for events (same as in Events.tsx)
const mockEvents = [
  {
    id: "1",
    title: "Web Development Workshop",
    description: "Learn the basics of web development with HTML, CSS, and JavaScript. This workshop is designed for beginners who want to start their journey in web development. We'll cover the fundamentals of HTML structure, CSS styling, and basic JavaScript interactivity. By the end of this workshop, you'll have built your first web page and understand the core concepts needed to continue learning.",
    date: "2023-06-15T10:00:00",
    endTime: "2023-06-15T16:00:00",
    location: "Online",
    image: "https://images.unsplash.com/photo-1517694712202-14dd9538aa97",
    organizer: "Tech Academy",
    organizerImage: "https://randomuser.me/api/portraits/women/44.jpg",
    attendees: 45,
    agenda: [
      { time: "10:00 AM", title: "Introduction to Web Development" },
      { time: "11:00 AM", title: "HTML Basics" },
      { time: "12:00 PM", title: "Lunch Break" },
      { time: "1:00 PM", title: "CSS Fundamentals" },
      { time: "3:00 PM", title: "JavaScript Introduction" },
      { time: "4:00 PM", title: "Building Your First Web Page" }
    ]
  },
  {
    id: "2",
    title: "Startup Networking Mixer",
    description: "Connect with fellow entrepreneurs and investors in a casual setting. This event provides a unique opportunity to expand your professional network, share ideas, and potentially find collaborators or investors for your startup. Light refreshments will be served, and there will be structured networking activities to ensure everyone gets a chance to connect with relevant contacts.",
    date: "2023-06-20T18:00:00",
    endTime: "2023-06-20T21:00:00",
    location: "Innovation Hub, San Francisco",
    image: "https://images.unsplash.com/photo-1515187029135-18ee286d815b",
    organizer: "Founder Network",
    organizerImage: "https://randomuser.me/api/portraits/men/32.jpg",
    attendees: 120,
    agenda: [
      { time: "6:00 PM", title: "Doors Open & Registration" },
      { time: "6:30 PM", title: "Welcome & Introduction" },
      { time: "7:00 PM", title: "Structured Networking Session" },
      { time: "8:00 PM", title: "Open Networking & Refreshments" },
      { time: "9:00 PM", title: "Event Concludes" }
    ]
  },
  {
    id: "3",
    title: "Design Thinking Workshop",
    description: "A hands-on workshop to learn design thinking principles and methodologies. Design thinking is a human-centered approach to innovation that draws from the designer's toolkit to integrate the needs of people, the possibilities of technology, and the requirements for business success. This workshop will guide you through the design thinking process with practical exercises and real-world applications.",
    date: "2023-06-25T09:00:00",
    endTime: "2023-06-25T17:00:00",
    location: "Design Studio, New York",
    image: "https://images.unsplash.com/photo-1553877522-43269d4ea984",
    organizer: "Creative Minds",
    organizerImage: "https://randomuser.me/api/portraits/women/68.jpg",
    attendees: 30,
    agenda: [
      { time: "9:00 AM", title: "Introduction to Design Thinking" },
      { time: "10:00 AM", title: "Empathize: Understanding User Needs" },
      { time: "11:30 AM", title: "Define: Problem Statement Creation" },
      { time: "12:30 PM", title: "Lunch Break" },
      { time: "1:30 PM", title: "Ideate: Brainstorming Solutions" },
      { time: "3:00 PM", title: "Prototype: Creating Simple Models" },
      { time: "4:30 PM", title: "Test & Feedback" }
    ]
  },
  {
    id: "4",
    title: "AI in Healthcare Conference",
    description: "Exploring the latest applications of artificial intelligence in healthcare. This conference brings together healthcare professionals, AI researchers, and industry leaders to discuss how artificial intelligence is transforming patient care, medical research, and healthcare operations. Sessions will cover case studies, emerging technologies, ethical considerations, and future trends.",
    date: "2023-07-05T09:00:00",
    endTime: "2023-07-05T18:00:00",
    location: "Medical Center, Boston",
    image: "https://images.unsplash.com/photo-1576091160550-2173dba999ef",
    organizer: "Health Tech Association",
    organizerImage: "https://randomuser.me/api/portraits/men/45.jpg",
    attendees: 200,
    agenda: [
      { time: "9:00 AM", title: "Opening Keynote: The Future of AI in Medicine" },
      { time: "10:30 AM", title: "Panel: AI Diagnostics & Imaging" },
      { time: "12:00 PM", title: "Networking Lunch" },
      { time: "1:30 PM", title: "Breakout Sessions" },
      { time: "3:30 PM", title: "Case Studies: AI Implementation Success Stories" },
      { time: "5:00 PM", title: "Closing Panel: Ethical Considerations & Next Steps" }
    ]
  },
  {
    id: "5",
    title: "Mobile App Development Bootcamp",
    description: "Intensive 2-day bootcamp on building mobile applications. This hands-on bootcamp will take you through the entire process of creating a mobile app from concept to deployment. You'll learn about UI/UX design principles, coding best practices, testing strategies, and app store submission processes. By the end of the bootcamp, you'll have developed your own functioning mobile application.",
    date: "2023-07-10T10:00:00",
    endTime: "2023-07-11T17:00:00",
    location: "Tech Campus, Austin",
    image: "https://images.unsplash.com/photo-1551650975-87deedd944c3",
    organizer: "App Developers Guild",
    organizerImage: "https://randomuser.me/api/portraits/women/22.jpg",
    attendees: 50,
    agenda: [
      { time: "Day 1, 10:00 AM", title: "App Concept & Planning" },
      { time: "Day 1, 1:00 PM", title: "UI/UX Design Fundamentals" },
      { time: "Day 1, 3:00 PM", title: "Setting Up Your Development Environment" },
      { time: "Day 2, 10:00 AM", title: "Core Functionality Implementation" },
      { time: "Day 2, 1:00 PM", title: "Testing & Debugging" },
      { time: "Day 2, 3:00 PM", title: "Deployment & App Store Submission" }
    ]
  },
  {
    id: "6",
    title: "Sustainable Business Summit",
    description: "Discussing strategies for building environmentally sustainable businesses. This summit brings together business leaders, sustainability experts, and policymakers to share insights on how companies can reduce their environmental impact while maintaining profitability. Topics include renewable energy adoption, waste reduction, sustainable supply chains, and green marketing strategies.",
    date: "2023-07-15T09:00:00",
    endTime: "2023-07-15T17:00:00",
    location: "Green Center, Portland",
    image: "https://images.unsplash.com/photo-1464692805480-a69dfaafdb0d",
    organizer: "Eco Business Alliance",
    organizerImage: "https://randomuser.me/api/portraits/men/67.jpg",
    attendees: 150,
    agenda: [
      { time: "9:00 AM", title: "Opening Remarks: The Business Case for Sustainability" },
      { time: "10:00 AM", title: "Panel: Renewable Energy Integration" },
      { time: "11:30 AM", title: "Workshop: Measuring Your Carbon Footprint" },
      { time: "12:30 PM", title: "Networking Lunch" },
      { time: "2:00 PM", title: "Case Studies: Sustainable Success Stories" },
      { time: "3:30 PM", title: "Panel: Policy & Regulation Landscape" },
      { time: "5:00 PM", title: "Closing Keynote & Networking Reception" }
    ]
  }
];

const EventDetails = () => {
  const { id } = useParams<{ id: string }>();
  const [isRegisterDialogOpen, setIsRegisterDialogOpen] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");

  // Find the event with the matching ID
  const event = mockEvents.find(event => event.id === id);

  if (!event) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h1 className="text-3xl font-bold mb-4">Event Not Found</h1>
        <p className="text-gray-600 mb-8">The event you're looking for doesn't exist or has been removed.</p>
        <Button asChild>
          <a href="/events">Browse Events</a>
        </Button>
      </div>
    );
  }

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
  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleRegister = () => {
    if (!name || !email) {
      toast({
        title: "Error",
        description: "Please fill in all fields",
        variant: "destructive"
      });
      return;
    }

    // In a real app, this would send data to a server
    toast({
      title: "Registration Successful!",
      description: `You're registered for ${event.title}. Check your email for details.`
    });
    
    setIsRegisterDialogOpen(false);
    setName("");
    setEmail("");
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Event Header */}
      <div className="relative h-64 md:h-96 rounded-lg overflow-hidden mb-8">
        <img 
          src={event.image} 
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

          <div className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">Agenda</h2>
            <div className="space-y-4">
              {event.agenda.map((item, index) => (
                <div key={index} className="flex">
                  <div className="w-24 flex-shrink-0 text-gray-600">{item.time}</div>
                  <div className="flex-grow">{item.title}</div>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h2 className="text-2xl font-semibold mb-4">Organizer</h2>
            <div className="flex items-center">
              <img 
                src={event.organizerImage} 
                alt={event.organizer} 
                className="w-12 h-12 rounded-full mr-4"
              />
              <div>
                <h3 className="font-medium">{event.organizer}</h3>
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
                    <p className="text-gray-600">{formatTime(event.date)} - {formatTime(event.endTime)}</p>
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
                    <p className="text-gray-600">{event.attendees} people attending</p>
                  </div>
                </div>
              </div>
              
              <Button 
                className="w-full" 
                size="lg"
                onClick={() => setIsRegisterDialogOpen(true)}
              >
                Register for Event
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Registration Dialog */}
      <Dialog open={isRegisterDialogOpen} onOpenChange={setIsRegisterDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Register for {event.title}</DialogTitle>
            <DialogDescription>
              Fill in your details to secure your spot at this event.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input 
                id="name" 
                placeholder="Enter your full name" 
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input 
                id="email" 
                type="email" 
                placeholder="Enter your email address" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsRegisterDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleRegister}>
              Complete Registration
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default EventDetails;
