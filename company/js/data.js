// Neev Employer Portal — mock data: companies, employees, pending queues.
const COMPANIES = {
  buildright: { name:'BuildRight Constructions', sector:'Construction', employees:120, onNeev:24, cin:'U45201DL2015PTC280001', gst:'07AABCB1234C1Z5', pan:'AABCB1234C', tan:'DELB12345C', password:'demo123',
    hrms:'API — Keka', ip:'103.21.58.140', companyAddr:'Plot 14, Sector 8, Dwarka, New Delhi, 110077', hoAddr:'Plot 14, Sector 8, Dwarka, New Delhi, 110077', contact:'Priya Sharma (HR Manager)', email:'priya.hr@buildright.in' },
  quickserve: { name:'QuickServe Logistics', sector:'Logistics', employees:340, onNeev:67, cin:'U63090MH2017PTC300002', gst:'27AABCQ5678D1Z2', pan:'AABCQ5678D', tan:'MUMQ54321C', password:'demo123',
    hrms:'API — greytHR', ip:'182.74.10.203', companyAddr:'4th Floor, Andheri East, Mumbai, Maharashtra, 400069', hoAddr:'Tower B, BKC, Mumbai, Maharashtra, 400051', contact:'Rakesh Menon (HR Head)', email:'rakesh.menon@quickserve.in' },
  secureguard: { name:'SecureGuard Facilities', sector:'Security & FM', employees:210, onNeev:38, cin:'U74999KA2016PTC310003', gst:'29AABCS9012E1Z8', pan:'AABCS9012E', tan:'BLRS98765C', password:'demo123',
    hrms:'Manual Excel upload', ip:'157.32.88.19', companyAddr:'2nd Cross, Koramangala, Bengaluru, Karnataka, 560034', hoAddr:'2nd Cross, Koramangala, Bengaluru, Karnataka, 560034', contact:'Anita Rao (HR Manager)', email:'anita.rao@secureguard.in' }
};

// Companies that self-registered this session via the sign-up flow (not pre-seeded demo companies).
let REGISTERED_COMPANIES = [];

// Who's logged in right now: a Company Admin sees every branch; an Area Manager is scoped to one.
let currentScope = { role:'company', branch:null };

const BRANCHES = ['Delhi Hub','Mumbai Hub','Bangalore Hub'];

// Employee "score" inputs: experience is derived from `joined`, feedback comes from `rating` (out of 5 stars).
const EMPS = [
  { ecn:'ECN-48213', name:'Ramesh Kumar', branch:'Delhi Hub', dept:'Site Labour', desig:'Mason', joined:'12 Mar 2024', type:'Full-time', salary:20000, rating:4.5, loan:{lan:'5832012026',amount:5000,charge:150,gst:27,net:4823,tenure:'2 wks',due:'30th Aug',van:'NEEV00583201',status:'Active'} },
  { ecn:'ECN-48301', name:'Suresh Yadav', branch:'Delhi Hub', dept:'Site Labour', desig:'Helper', joined:'04 Jun 2024', type:'Full-time', salary:15000, rating:4, loan:{lan:'5833012026',amount:3000,charge:90,gst:16,net:2894,tenure:'2 wks',due:'30th Aug',van:'NEEV00583301',status:'Active'} },
  { ecn:'ECN-48422', name:'Meena Devi', branch:'Mumbai Hub', dept:'Housekeeping', desig:'Cleaner', joined:'18 Jan 2025', type:'Full-time', salary:12000, rating:4.5, loan:null },
  { ecn:'ECN-48510', name:'Anil Singh', branch:'Delhi Hub', dept:'Security', desig:'Guard', joined:'02 Aug 2023', type:'Full-time', salary:18000, rating:5, loan:{lan:'5835012026',amount:4000,charge:120,gst:22,net:3858,tenure:'2 wks',due:'30th Aug',van:'NEEV00583501',status:'Active'} },
  { ecn:'ECN-48601', name:'Pooja Kumari', branch:'Bangalore Hub', dept:'Site Labour', desig:'Painter', joined:'20 Nov 2024', type:'Contract', salary:16000, rating:3.5, loan:null },
  { ecn:'ECN-48712', name:'Ravi Prasad', branch:'Mumbai Hub', dept:'Delivery', desig:'Rider', joined:'05 Mar 2025', type:'Full-time', salary:14000, rating:3, loan:{lan:'5837012026',amount:2000,charge:30,gst:5,net:1965,tenure:'1 wk',due:'30th Aug',van:'NEEV00583701',status:'Active'} },
  { ecn:'ECN-48803', name:'Dinesh Mandal', branch:'Delhi Hub', dept:'Site Labour', desig:'Foreman', joined:'10 Sep 2023', type:'Full-time', salary:25000, rating:4.5, loan:{lan:'5838012026',amount:7000,charge:210,gst:38,net:6752,tenure:'2 wks',due:'30th Aug',van:'NEEV00583801',status:'Active'} },
  { ecn:'ECN-48915', name:'Lakshmi Nair', branch:'Bangalore Hub', dept:'Housekeeping', desig:'Supervisor', joined:'22 Apr 2024', type:'Full-time', salary:22000, rating:5, loan:null },
  { ecn:'ECN-49001', name:'Bikash Das', branch:'Mumbai Hub', dept:'Security', desig:'Guard', joined:'14 Jul 2024', type:'Full-time', salary:18000, rating:3.5, loan:{lan:'5840012026',amount:3000,charge:45,gst:8,net:2947,tenure:'1 wk',due:'30th Aug',van:'NEEV00584001',status:'Active'} },
  { ecn:'ECN-49102', name:'Santosh Mahto', branch:'Bangalore Hub', dept:'Delivery', desig:'Loader', joined:'01 Feb 2025', type:'Contract', salary:13000, rating:2.5, loan:{lan:'5841012026',amount:4000,charge:120,gst:22,net:3858,tenure:'2 wks',due:'30th Aug',van:'NEEV00584101',status:'Active'} },
  { ecn:'ECN-49203', name:'Geeta Sharma', branch:'Delhi Hub', dept:'Site Labour', desig:'Helper', joined:'30 May 2024', type:'Full-time', salary:14000, rating:4, loan:{lan:'5842012026',amount:2000,charge:30,gst:5,net:1965,tenure:'1 wk',due:'30th Aug',van:'NEEV00584201',status:'Active'} }
];

const PENDING_VERIFY = [
  { name:'Mohan Patel', ecn:'ECN-49305', branch:'Delhi Hub', mobile:'98765XXXXX', date:'29 Aug 2026' },
  { name:'Sunita Devi', ecn:'ECN-49412', branch:'Mumbai Hub', mobile:'91234XXXXX', date:'30 Aug 2026' }
];

// Every loan request now lands here for HR approval — small or large, not just above-threshold ones.
// Requests over TWO_STAGE_THRESHOLD need Area Manager approval first, then a Company Admin final sign-off (stage:'escalated').
const TWO_STAGE_THRESHOLD = 5000;
const PENDING_APPROVALS = [
  { name:'Dinesh Mandal', ecn:'ECN-48803', amount:7000, accrued:12500, salary:25000, deductionLoad:'28%', stage:'pending' },
  { name:'Meena Devi', ecn:'ECN-48422', amount:2000, accrued:6800, salary:12000, deductionLoad:'17%', stage:'pending' },
  { name:'Pooja Kumari', ecn:'ECN-48601', amount:1500, accrued:8200, salary:16000, deductionLoad:'9%', stage:'pending' }
];

// Every HR action taken this session — approvals, employee additions, policy changes, etc.
let AUDIT_LOG = [];

// Bulk CSV import: rows parsed from the last uploaded file, pending confirmation.
let BULK_ROWS = [];

// Scheduled report delivery (Settings screen), null until an admin sets one up.
let REPORT_SCHEDULE = null;

let currentCompany = null;
