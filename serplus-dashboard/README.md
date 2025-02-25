# SERPLUS Dashboard

Enterprise-grade dashboard for lead management and AI insights.

## Features

- **Lead Scraper**: Integrated with SerpAPI for powerful lead generation
  - Search and extract leads from Google search results
  - Automatic email and phone number extraction
  - Save leads with one click
  
- **Lead Management**: Comprehensive lead tracking system
  - View all saved leads in one place
  - Contact information with clickable email and phone links
  - Easy deletion of unwanted leads
  - Timestamp tracking for lead acquisition

## Setup

1. Clone the repository:
```bash
git clone https://github.com/OfficialPr0x/serplus-dashboard.git
cd serplus-dashboard
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env.local` file in the root directory and add your SerpAPI key:
```
SERPAPI_KEY=your_serpapi_key_here
```

4. Run the development server:
```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Environment Variables

- `SERPAPI_KEY`: Your SerpAPI API key (Get one at [https://serpapi.com](https://serpapi.com))

## Tech Stack

- Next.js 13+ with App Router
- TypeScript
- Tailwind CSS
- FontAwesome Icons
- SerpAPI Integration
#   l e a d s e r p l u s  
 