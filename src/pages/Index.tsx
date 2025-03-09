
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Tables } from "@/integrations/supabase/types";
import { Calendar, MapPin, Users } from "lucide-react";
import { Card, CardContent, CardFooter } from "@/components/ui/card";

type EventWithDetails = Tables<"events"> & {
  profiles: Tables<"profiles">;
  attendee_count: number;
};

const Index = () => {
  const [featuredEvents, setFeaturedEvents] = useState<EventWithDetails[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchFeaturedEvents();

    // Set up real-time subscription for registrations
    const registrationsSubscription = supabase
      .channel('home-registrations')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'registrations'
      }, () => {
        // Refresh events when registrations change
        fetchFeaturedEvents();
      })
      .subscribe();

    // Set up real-time subscription for new events
    const eventsSubscription = supabase
      .channel('home-events')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'events'
      }, () => {
        // Refresh events when new events are created
        fetchFeaturedEvents();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(registrationsSubscription);
      supabase.removeChannel(eventsSubscription);
    };
  }, []);

  const fetchFeaturedEvents = async () => {
    try {
      // First, fetch upcoming events
      const { data: eventsData, error: eventsError } = await supabase
        .from("events")
        .select(`
          *,
          profiles(*)
        `)
        .gte('date', new Date().toISOString()) // Only future events
        .order('date', { ascending: true })
        .limit(3);

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

      setFeaturedEvents(eventsWithCounts);
    } catch (error) {
      console.error("Error fetching featured events:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'long', 
      day: 'numeric', 
      year: 'numeric'
    });
  };

  return (
    <div className="min-h-screen bg-[#0F0F13] text-white overflow-hidden">
      {/* Hero Section */}
      <div className="relative">
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-b from-purple-900/20 via-transparent to-[#0F0F13] z-10"></div>
        
        {/* Content */}
        <div className="container mx-auto px-4 pt-20 pb-32 md:pt-32 md:pb-48 relative z-20">
          <div className="flex flex-col lg:flex-row items-center">
            {/* Left side content */}
            <div className="w-full lg:w-1/2 mb-12 lg:mb-0">
              <div className="text-2xl font-semibold mb-4 flex items-center">
                <span className="text-white/80">luma</span>
                <span className="text-white ml-1">+</span>
              </div>
              
              <h1 className="text-5xl md:text-6xl font-bold tracking-tight mb-6">
                Delightful
                <br />
                events
                <br />
                <span className="bg-gradient-to-r from-blue-500 to-purple-500 text-transparent bg-clip-text">start</span> <span className="bg-gradient-to-r from-pink-500 to-red-500 text-transparent bg-clip-text">here.</span>
              </h1>
              
              <p className="text-xl text-white/80 mb-8 max-w-lg">
                Set up an event page, invite friends and sell tickets. Host a memorable event today.
              </p>
              
              <Button asChild size="lg" className="bg-white text-black hover:bg-white/90 px-8 py-6 text-lg rounded-md">
                <Link to="/create">Create Your First Event</Link>
              </Button>
            </div>
            
            {/* Right side - Phone mockup */}
            <div className="w-full lg:w-1/2 relative">
              <div className="relative w-full max-w-md mx-auto">
                {/* Phone frame with video */}
                <div className="relative rounded-[40px] overflow-hidden border-8 border-gray-800 shadow-2xl aspect-[9/19] bg-black">
                  <video 
                    className="w-full h-full object-cover"
                    autoPlay 
                    loop 
                    muted 
                    playsInline
                  >
                    <source src="https://cdn.lu.ma/landing/phone-dark.mp4" type="video/mp4" />
                    Your browser does not support the video tag.
                  </video>
                </div>
                
                {/* Decorative elements */}
                <div className="absolute -top-10 -right-10 w-20 h-20 text-pink-500 animate-pulse">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
                  </svg>
                </div>
                <div className="absolute -bottom-5 -left-5 w-16 h-16 text-blue-500 animate-bounce">
                  <svg viewBox="0 0 24 24" fill="currentColor">
                    <circle cx="12" cy="12" r="10" />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Featured Events Section */}
      <div className="bg-[#13131A] py-20">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-4">Upcoming Events</h2>
          <p className="text-white/70 text-center mb-12 max-w-2xl mx-auto">
            Discover exciting events happening soon. Join the community and expand your network.
          </p>
          
          {isLoading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
            </div>
          ) : featuredEvents.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-white/70 mb-6">No upcoming events at the moment.</p>
              <Button asChild className="bg-purple-600 hover:bg-purple-700">
                <Link to="/create">Create the first event</Link>
              </Button>
            </div>
          ) : (
            <div className="grid md:grid-cols-3 gap-8">
              {featuredEvents.map(event => (
                <Card key={event.id} className="bg-[#1C1C24] border-0 overflow-hidden hover:shadow-lg hover:shadow-purple-900/20 transition-all">
                  <div className="h-48 overflow-hidden">
                    <img 
                      src={event.image_url || "https://images.unsplash.com/photo-1517694712202-14dd9538aa97"} 
                      alt={event.title} 
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <CardContent className="p-5">
                    <div className="flex items-center text-sm text-white/60 mb-2">
                      <Calendar className="h-4 w-4 mr-1" />
                      <span>{formatDate(event.date)}</span>
                    </div>
                    <div className="flex items-center text-sm text-white/60 mb-3">
                      <MapPin className="h-4 w-4 mr-1" />
                      <span>{event.location}</span>
                    </div>
                    <h3 className="text-xl font-semibold mb-2">{event.title}</h3>
                    <p className="text-white/70 text-sm mb-3 line-clamp-2">{event.description}</p>
                    <div className="flex items-center text-sm text-white/60">
                      <Users className="h-4 w-4 mr-1" />
                      <span>{event.attendee_count} attendees</span>
                    </div>
                  </CardContent>
                  <CardFooter className="p-5 pt-0">
                    <Button asChild className="w-full bg-purple-600 hover:bg-purple-700">
                      <Link to={`/events/${event.id}`}>View Details</Link>
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
          
          <div className="text-center mt-12">
            <Button asChild variant="outline" className="border-white/20 text-white hover:bg-white/10">
              <Link to="/events">View All Events</Link>
            </Button>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="container mx-auto px-4 py-20">
        <h2 className="text-3xl font-bold text-center mb-12">Why choose our platform?</h2>
        <div className="grid md:grid-cols-3 gap-8">
          <div className="bg-[#1C1C24] p-8 rounded-xl">
            <div className="w-14 h-14 bg-purple-900/50 rounded-full flex items-center justify-center mb-6">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold mb-3">Easy to Create</h3>
            <p className="text-white/70">Create beautiful event pages in minutes with our intuitive editor.</p>
          </div>
          <div className="bg-[#1C1C24] p-8 rounded-xl">
            <div className="w-14 h-14 bg-blue-900/50 rounded-full flex items-center justify-center mb-6">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold mb-3">Attendee Management</h3>
            <p className="text-white/70">Manage registrations, send updates, and communicate with your attendees.</p>
          </div>
          <div className="bg-[#1C1C24] p-8 rounded-xl">
            <div className="w-14 h-14 bg-pink-900/50 rounded-full flex items-center justify-center mb-6">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 text-pink-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold mb-3">Insightful Analytics</h3>
            <p className="text-white/70">Get valuable insights about your events and attendees to improve future events.</p>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="container mx-auto px-4 py-16 md:py-24">
        <div className="bg-gradient-to-r from-purple-800 to-pink-700 rounded-2xl p-10 md:p-16 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">Ready to host your next event?</h2>
          <p className="text-white/80 mb-8 max-w-2xl mx-auto">
            Join thousands of event creators who trust our platform for their events.
          </p>
          <Button asChild size="lg" className="bg-white text-black hover:bg-white/90 px-8 py-6 text-lg rounded-md">
            <Link to="/signup">Get Started for Free</Link>
          </Button>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-[#13131A] py-16">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-6 md:mb-0">
              <h3 className="text-2xl font-bold text-white">luma<span className="text-purple-500">+</span></h3>
              <p className="text-white/70">Host memorable events, effortlessly</p>
            </div>
            <div className="flex gap-8">
              <Link to="/events" className="text-white/70 hover:text-white">Events</Link>
              <Link to="/login" className="text-white/70 hover:text-white">Login</Link>
              <Link to="/signup" className="text-white/70 hover:text-white">Sign Up</Link>
            </div>
          </div>
          <div className="mt-12 pt-8 border-t border-white/10 text-center text-white/50">
            <p>&copy; {new Date().getFullYear()} Luma Events. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
