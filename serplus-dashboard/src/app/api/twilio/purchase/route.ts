import { NextResponse } from 'next/server';
import { Twilio } from 'twilio';
import { getTwilioCredentials } from '@/lib/twilio';
import { supabase } from '@/lib/supabase';

export async function POST(request: Request) {
  try {
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { phoneNumber } = await request.json();
    if (!phoneNumber) {
      return NextResponse.json(
        { error: 'Phone number is required' },
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
    
    // Purchase the number through Twilio
    const purchasedNumber = await client.incomingPhoneNumbers
      .create({ phoneNumber });

    // Get the user's Twilio account ID
    const { data: accountData } = await supabase
      .from('twilio_accounts')
      .select('id')
      .eq('user_id', user.id)
      .single();

    if (!accountData) {
      throw new Error('Twilio account not found');
    }

    // Store the purchased number in our database
    const { error: insertError } = await supabase
      .from('twilio_phone_numbers')
      .insert({
        user_id: user.id,
        twilio_account_id: accountData.id,
        phone_number: purchasedNumber.phoneNumber,
        friendly_name: purchasedNumber.friendlyName,
        status: 'active',
        capabilities: {
          voice: purchasedNumber.capabilities.voice,
          sms: purchasedNumber.capabilities.sms,
          mms: purchasedNumber.capabilities.mms,
        },
      });

    if (insertError) {
      throw new Error('Failed to save phone number to database');
    }

    return NextResponse.json({
      success: true,
      phoneNumber: purchasedNumber.phoneNumber,
      friendlyName: purchasedNumber.friendlyName,
    });
  } catch (error) {
    console.error('Error purchasing phone number:', error);
    return NextResponse.json(
      { 
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      },
      { status: 500 }
    );
  }
}