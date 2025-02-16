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

    const { areaCode } = await request.json();
    if (!areaCode) {
      return NextResponse.json(
        { error: 'Area code is required' },
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
    const numbers = await client.availablePhoneNumbers('US')
      .local
      .list({ areaCode: parseInt(areaCode), limit: 20 });

    return NextResponse.json({
      success: true,
      numbers: numbers.map(num => ({
        phoneNumber: num.phoneNumber,
        friendlyName: num.friendlyName,
        locality: num.locality,
        region: num.region,
      }))
    });
  } catch (error) {
    console.error('Error searching phone numbers:', error);
    return NextResponse.json(
      { 
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      },
      { status: 500 }
    );
  }
}