import { NextResponse } from 'next/server';
import { Twilio } from 'twilio';
import { getTwilioCredentials, validatePhoneNumber } from '@/lib/twilio';
import { supabase } from '@/lib/supabase';

export async function POST(request: Request) {
  try {
    // Get the current user's ID
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { phoneNumber, message, leadId } = await request.json();

    if (!phoneNumber || !message) {
      return NextResponse.json(
        { error: 'Phone number and message are required' },
        { status: 400 }
      );
    }

    if (!validatePhoneNumber(phoneNumber)) {
      return NextResponse.json(
        { error: 'Invalid phone number format' },
        { status: 400 }
      );
    }

    const credentials = await getTwilioCredentials(user.id);
    if (!credentials) {
      return NextResponse.json(
        { error: 'No Twilio account configured' },
        { status: 400 }
      );
    }

    const client = new Twilio(credentials.accountSid, credentials.authToken);
    const twilioMessage = await client.messages.create({
      body: message,
      to: phoneNumber,
      from: credentials.phoneNumber,
    });

    // Log the SMS in the database if leadId is provided
    if (leadId) {
      const { error: dbError } = await supabase
        .from('sms_logs')
        .insert({
          lead_id: leadId,
          phone_number: phoneNumber,
          message,
          message_id: twilioMessage.sid,
          status: twilioMessage.status,
        });

      if (dbError) {
        console.error('Error logging SMS:', dbError);
      }
    }

    return NextResponse.json({
      success: true,
      messageId: twilioMessage.sid,
      status: twilioMessage.status,
    });
  } catch (error) {
    console.error('Error in SMS route:', error);
    return NextResponse.json(
      { 
        success: false,
        error: error instanceof Error ? error.message : 'Failed to send SMS'
      },
      { status: 500 }
    );
  }
}
