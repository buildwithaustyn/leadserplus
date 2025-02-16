import { supabase } from './supabase';

interface TwilioCredentials {
  accountSid: string;
  authToken: string;
  phoneNumber: string;
}

export async function getTwilioCredentials(userId: string): Promise<TwilioCredentials | null> {
  // Get the user's Twilio account
  const { data: accountData, error: accountError } = await supabase
    .from('twilio_accounts')
    .select('id, account_sid, auth_token')
    .eq('user_id', userId)
    .single();

  if (accountError || !accountData) {
    console.error('Error fetching Twilio account:', accountError);
    return null;
  }

  // Get the user's active phone number
  const { data: phoneData, error: phoneError } = await supabase
    .from('twilio_phone_numbers')
    .select('phone_number')
    .eq('twilio_account_id', accountData.id)
    .eq('status', 'active')
    .single();

  if (phoneError || !phoneData) {
    console.error('Error fetching phone number:', phoneError);
    return null;
  }

  return {
    accountSid: accountData.account_sid,
    authToken: accountData.auth_token,
    phoneNumber: phoneData.phone_number
  };
}

export const validatePhoneNumber = (phoneNumber: string): boolean => {
  // Basic phone number validation - can be enhanced based on requirements
  const phoneRegex = /^\+?[1-9]\d{1,14}$/;
  return phoneRegex.test(phoneNumber);
};
