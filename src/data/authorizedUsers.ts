export interface AuthorizedUser {
  id: string;          // User Login ID (e.g. '1011', '1021')
  name: string;        // Full Name in Hindi
  nameEn: string;      // Full Name in English
  designation: string; // Designation
  pin: string;         // Password / PIN
  role: 'operator' | 'officer' | 'admin'; // 'operator' = Edit/Control, 'officer' = View Only
  phone?: string;
}

/**
 * 🔒 OFFICIAL WHITELISTED USERS LIST (सबस्टेशन अरनिया अधिकृत यूज़र्स)
 */
export const INITIAL_WHITELISTED_USERS: AuthorizedUser[] = [
  // ==================== OPERATORS (EDIT / CONTROL ACCESS) ====================
  {
    id: '1011',
    name: 'रवि बंसल (SSO)',
    nameEn: 'Ravi Bansal (SSO)',
    designation: 'सबस्टेशन ऑपरेटर (SSO)',
    pin: '1234',
    role: 'operator'
  },
  {
    id: '1012',
    name: 'अवधेश (SSO)',
    nameEn: 'Avdhesh (SSO)',
    designation: 'सबस्टेशन ऑपरेटर (SSO)',
    pin: '1234',
    role: 'operator'
  },
  {
    id: '1013',
    name: 'देवेन्द्र (SSO)',
    nameEn: 'Devendra (SSO)',
    designation: 'सबस्टेशन ऑपरेटर (SSO)',
    pin: '1234',
    role: 'operator'
  },
  {
    id: '1014',
    name: 'जितेन्द्र (SSO)',
    nameEn: 'Jitendra (SSO)',
    designation: 'सबस्टेशन ऑपरेटर (SSO)',
    pin: '1234',
    role: 'operator'
  },

  // ==================== VIEW ACCESS (OFFICERS / READ ONLY) ====================
  {
    id: '1021',
    name: 'SDO (संतोष त्रिपाठी)',
    nameEn: 'SDO (Santosh Tripathi)',
    designation: 'उपमंडल अधिकारी (Sub Divisional Officer)',
    pin: '5678',
    role: 'officer'
  },
  {
    id: '1022',
    name: 'JE (दिलेराम)',
    nameEn: 'JE (Dileram)',
    designation: 'कनिष्ठ अभियंता (Junior Engineer)',
    pin: '5678',
    role: 'officer'
  },

  // ==================== SYSTEM ADMIN (FULL SUPERUSER & LOG DELETION RIGHT) ====================
  {
    id: '9999',
    name: 'सबस्टेशन एडमिन (Admin)',
    nameEn: 'Substation Admin',
    designation: 'सिस्टम एडमिनिस्ट्रेटर (Log Clear Right)',
    pin: '9999',
    role: 'admin'
  }
];