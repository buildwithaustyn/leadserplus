import { NextResponse } from 'next/server';
import { streamSearchResults } from '../../../utils/serpApi';
import { extractContactInfo, validateContactInfo } from '../../../utils/contactExtractor';

export const runtime = 'nodejs';

export async function POST(request: Request) {
  try {
    const { searchQuery, location, engines = ['google'] } = await request.json();

    // Create a TransformStream for streaming results
    const stream = new TransformStream();
    const writer = stream.writable.getWriter();
    const encoder = new TextEncoder();

    // Start processing in the background
    (async () => {
      let resultCount = 0;
      try {
        // Send initial status
        await writer.write(
          encoder.encode(`data: ${JSON.stringify({ type: 'status', message: 'Starting search...' })}\n\n`)
        );

        for await (const result of streamSearchResults({ 
          searchQuery, 
          location, 
          engine: engines.length > 1 ? 'all' : engines[0]
        })) {
          // Extract and validate contact information
          const contactInfo = await validateContactInfo(
            extractContactInfo(result.snippet)
          );

          // Only send results that have contact information
          if (contactInfo.emails.length > 0 || contactInfo.phones.length > 0) {
            resultCount++;
            const enhancedResult = {
              type: 'result',
              data: {
                ...result,
                contactInfo,
                timestamp: new Date().toISOString()
              }
            };

            // Write the result to the stream
            await writer.write(
              encoder.encode(`data: ${JSON.stringify(enhancedResult)}\n\n`)
            );

            // Send progress updates every 5 results
            if (resultCount % 5 === 0) {
              await writer.write(
                encoder.encode(`data: ${JSON.stringify({ 
                  type: 'progress', 
                  count: resultCount,
                  message: `Found ${resultCount} leads...`
                })}\n\n`)
              );
            }
          }
        }

        // Send completion status
        await writer.write(
          encoder.encode(`data: ${JSON.stringify({ 
            type: 'complete', 
            count: resultCount,
            message: `Search complete. Found ${resultCount} leads.`
          })}\n\n`)
        );
      } catch (error) {
        console.error('Streaming error:', error);
        // Send error event
        await writer.write(
          encoder.encode(`data: ${JSON.stringify({ 
            type: 'error',
            message: 'Search failed',
            error: error instanceof Error ? error.message : 'Unknown error'
          })}\n\n`)
        );
      } finally {
        await writer.close();
      }
    })();

    return new NextResponse(stream.readable, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache, no-transform',
        'Connection': 'keep-alive'
      }
    });
  } catch (error) {
    console.error('Search API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch search results' },
      { status: 500 }
    );
  }
}
