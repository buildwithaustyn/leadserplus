export interface ContactInfo {
  emails: string[];
  phones: string[];
  websites: string[];
  name?: string;
  address?: string;
}

export function extractContactInfo(text: string): ContactInfo {
  const contact: ContactInfo = {
    emails: [],
    phones: [],
    websites: []
  };

  // Extract email addresses
  const emailRegex = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g;
  const emails = text.match(emailRegex);
  if (emails?.length) {
    contact.emails = [...new Set(emails)]; // Remove duplicates
  }

  // Extract phone numbers (various formats)
  const phoneRegex = /(?:\+?1[-.]?)?\(?([0-9]{3})\)?[-.]?([0-9]{3})[-.]?([0-9]{4})/g;
  const phones = text.match(phoneRegex);
  if (phones?.length) {
    contact.phones = [...new Set(phones.map(phone => 
      phone.replace(/[-.()]/g, '') // Clean up the format
    ))];
  }

  // Extract websites
  const websiteRegex = /https?:\/\/(?:www\.)?([a-zA-Z0-9-]+(?:\.[a-zA-Z]{2,})+)(?:\/[^\s]*)?/g;
  const websites = text.match(websiteRegex);
  if (websites?.length) {
    contact.websites = [...new Set(websites)];
  }

  // Extract potential business names (simplified approach)
  const lines = text.split('\n');
  for (const line of lines) {
    if (line.length > 0 && line.length < 100 && !line.includes('@') && !line.includes('http')) {
      contact.name = line.trim();
      break;
    }
  }

  return contact;
}

export async function validateContactInfo(contact: ContactInfo): Promise<ContactInfo> {
  // Validate email format
  contact.emails = contact.emails.filter(email => 
    /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}$/i.test(email)
  );

  // Validate phone numbers (must be 10 digits after cleaning)
  contact.phones = contact.phones.filter(phone => 
    phone.replace(/\D/g, '').length === 10
  );

  // Validate websites (must be valid URLs)
  contact.websites = contact.websites.filter(website => {
    try {
      new URL(website);
      return true;
    } catch {
      return false;
    }
  });

  return contact;
}