
// Follow this setup guide to integrate the Deno runtime and Supabase Functions in your project:
// https://supabase.com/docs/guides/functions/connect-to-supabase

import { createClient } from 'npm:@supabase/supabase-js@2.38.4'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  // Handle CORS preflight request
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    // Get the request body
    const { registration_id } = await req.json()
    
    if (!registration_id) {
      return new Response(
        JSON.stringify({ error: 'Registration ID is required' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      )
    }

    // Create Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || ''
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || ''
    const supabase = createClient(supabaseUrl, supabaseKey)

    // Get registration details
    const { data: registration, error: registrationError } = await supabase
      .from('registrations')
      .select('*, events(*), profiles:user_id(*)')
      .eq('id', registration_id)
      .single()

    if (registrationError || !registration) {
      return new Response(
        JSON.stringify({ error: 'Registration not found', details: registrationError }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 404 }
      )
    }

    // Get user email from auth.users
    let userData;
    const { data: userProfileData, error: userError } = await supabase
      .from('profiles')
      .select('email')
      .eq('id', registration.user_id)
      .single()

    if (userError || !userProfileData?.email) {
      // Try to get email from auth.users directly
      const { data: authUser, error: authUserError } = await supabase.auth.admin
        .getUserById(registration.user_id)

      if (authUserError || !authUser.user) {
        return new Response(
          JSON.stringify({ error: 'User not found', details: authUserError || userError }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 404 }
        )
      }

      userData = { email: authUser.user.email }
    } else {
      userData = userProfileData
    }

    // Send email using Resend
    const resendApiKey = Deno.env.get('RESEND_API_KEY')
    if (!resendApiKey) {
      return new Response(
        JSON.stringify({ error: 'Resend API key not configured' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      )
    }

    const eventName = registration.events?.name || 'the event'
    const eventDate = registration.events?.date 
      ? new Date(registration.events.date).toLocaleDateString('en-US', { 
          weekday: 'long', 
          year: 'numeric', 
          month: 'long', 
          day: 'numeric' 
        })
      : 'the scheduled date'

    const emailResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${resendApiKey}`
      },
      body: JSON.stringify({
        from: 'Luma Events <events@luma-clone.com>',
        to: userData.email,
        subject: `Registration Confirmed: ${eventName}`,
        html: `
          <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
            <h1 style="color: #6366F1;">Registration Confirmed!</h1>
            <p>Hello${registration.profiles?.full_name ? ' ' + registration.profiles.full_name : ''},</p>
            <p>Your registration for <strong>${eventName}</strong> has been confirmed.</p>
            <p><strong>Event Details:</strong></p>
            <ul>
              <li><strong>Date:</strong> ${eventDate}</li>
              ${registration.events?.location ? `<li><strong>Location:</strong> ${registration.events.location}</li>` : ''}
            </ul>
            <p>We look forward to seeing you there!</p>
            <p>Best regards,<br>The Luma Events Team</p>
          </div>
        `
      })
    })

    const emailResult = await emailResponse.json()

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Registration email sent successfully',
        email: emailResult
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    )
  }
})
