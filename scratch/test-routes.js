const routes = [
  { path: '/', expected: 'CampusOne' },
  { path: '/events', expected: 'Campus Events' },
  { path: '/dashboard', expected: 'Dashboard' },
  { path: '/events/create', expected: 'Create New Event' },
  { path: '/clubs', expected: 'Campus Clubs' },
  { path: '/campus-services/internships', expected: 'Internship' },
  { path: '/campus-services/placements', expected: 'Placement' },
  { path: '/campus-services/notices', expected: 'College Notices' },
  { path: '/campus-services/announcements', expected: 'Announcements' },
  { path: '/institute-services/lost-and-found', expected: 'Lost & Found' },
  { path: '/institute-services/marketplace', expected: 'Marketplace' },
  { path: '/institute-services/gallery', expected: 'Campus Gallery' },
  { path: '/institute-services/hostel-notices', expected: 'Hostel Notices' },
  { path: '/auth/login', expected: 'Sign In' },
  { path: '/auth/register', expected: 'Create Account' },
  { path: '/profile', expected: 'Profile' },
];

async function verifyAll() {
  console.log('Testing CampusOne routes against http://localhost:3000 ...\n');
  let allPass = true;

  for (const r of routes) {
    try {
      const res = await fetch('http://localhost:3000' + r.path);
      const text = await res.text();
      const hasContent = text.includes(r.expected);
      const statusOk = res.status === 200;
      if (statusOk && hasContent) {
        console.log(`[PASS] ${r.path.padEnd(36)} -> HTTP 200 (Verified text: "${r.expected}")`);
      } else {
        console.log(`[FAIL] ${r.path.padEnd(36)} -> HTTP ${res.status} (Verified text: ${hasContent})`);
        allPass = false;
      }
    } catch (err) {
      console.error(`[ERROR] ${r.path.padEnd(36)} -> ${err.message}`);
      allPass = false;
    }
  }

  console.log(`\nOverall Result: ${allPass ? 'ALL TESTS PASSED SUCCESSFULLY' : 'SOME TESTS FAILED'}`);
}

verifyAll();
