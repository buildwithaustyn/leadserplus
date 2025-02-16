import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

const LEADS_FILE = path.join(process.cwd(), 'data', 'leads.json');

// Ensure data directory exists
async function ensureDataDir() {
  const dataDir = path.join(process.cwd(), 'data');
  try {
    await fs.access(dataDir);
  } catch {
    await fs.mkdir(dataDir, { recursive: true });
  }
}

// Initialize leads file if it doesn't exist
async function initLeadsFile() {
  try {
    await fs.access(LEADS_FILE);
  } catch {
    await fs.writeFile(LEADS_FILE, JSON.stringify([]));
  }
}

// Get all leads
export async function GET() {
  try {
    await ensureDataDir();
    await initLeadsFile();
    const data = await fs.readFile(LEADS_FILE, 'utf-8');
    return NextResponse.json(JSON.parse(data));
  } catch (error) {
    console.error('Error reading leads:', error);
    return NextResponse.json({ error: 'Failed to fetch leads' }, { status: 500 });
  }
}

// Save a new lead
export async function POST(request: Request) {
  try {
    await ensureDataDir();
    await initLeadsFile();
    
    const newLead = await request.json();
    const data = await fs.readFile(LEADS_FILE, 'utf-8');
    const leads = JSON.parse(data);
    
    // Add timestamp and unique ID
    const leadWithMeta = {
      ...newLead,
      id: `lead_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      savedAt: new Date().toISOString()
    };
    
    leads.push(leadWithMeta);
    await fs.writeFile(LEADS_FILE, JSON.stringify(leads, null, 2));
    
    return NextResponse.json(leadWithMeta);
  } catch (error) {
    console.error('Error saving lead:', error);
    return NextResponse.json({ error: 'Failed to save lead' }, { status: 500 });
  }
}

// Delete a lead
export async function DELETE(request: Request) {
  try {
    const { id } = await request.json();
    const data = await fs.readFile(LEADS_FILE, 'utf-8');
    const leads = JSON.parse(data);
    
    const filteredLeads = leads.filter((lead: any) => lead.id !== id);
    await fs.writeFile(LEADS_FILE, JSON.stringify(filteredLeads, null, 2));
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting lead:', error);
    return NextResponse.json({ error: 'Failed to delete lead' }, { status: 500 });
  }
}
