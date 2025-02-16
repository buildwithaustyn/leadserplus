import Link from 'next/link';

const Sidebar = () => {
  return (
    <aside className="w-64 bg-gray-800 text-white p-6">
      <nav>
        <ul className="space-y-2">
          <li>
            <Link href="/" className="block py-2 hover:text-gray-300">
              Dashboard
            </Link>
          </li>
          <li>
            <Link href="/leads" className="block py-2 hover:text-gray-300">
              Leads
            </Link>
          </li>
          <li>
            <Link href="/lead-scraper" className="block py-2 hover:text-gray-300">
              Lead Scraper
            </Link>
          </li>
        </ul>
      </nav>
    </aside>
  );
};

export default Sidebar; 