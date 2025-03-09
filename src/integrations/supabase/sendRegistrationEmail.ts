
import { supabase } from "./client";

/**
 * Sends a registration confirmation email by calling the send-registration-email edge function
 * @param registrationId The ID of the registration to send an email for
 * @returns A promise that resolves when the email is sent
 */
export const sendRegistrationEmail = async (registrationId: string): Promise<void> => {
  try {
    const { data, error } = await supabase.functions.invoke('send-registration-email', {
      body: { registration_id: registrationId }
    });

    if (error) {
      console.error('Error sending registration email:', error);
      throw error;
    }

    console.log('Registration email sent successfully:', data);
  } catch (error) {
    console.error('Failed to send registration email:', error);
    throw error;
  }
};
