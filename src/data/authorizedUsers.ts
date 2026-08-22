export interface AuthorizedUser {
  id: string;          // User Login ID (e.g. 'sso1', 'xen', 'aen', 'operator1')
  name: string;        // Full Name in Hindi
  nameEn: string;      // Full Name in English
  designation: string; // Designation
  pin: string;         // Password / PIN
  role: 'operator' | 'officer' | 'admin'; // 'operator' = Edit/Control, 'officer' = View Only
  phone?: string;
}

/**
 * 🔒 WHITELISTED USERS LIST (अधिकृत उपयोगकर्ताओं की सूची)
 * नई आईडी जोड़ने या पासवर्ड बदलने के लिए इस लिस्ट में नया रिकॉर्ड जोड़ें या एडिट करें।
 */
export const INITIAL_WHITELISTED_USERS: AuthorizedUser[] = [
  {
    id: 'sso1',
    name: 'रमेश कुमार (SSO)',
    nameEn: 'Ramesh Kumar (SSO)',
    designation: 'सबस्टेशन ऑपरेटर (SSO - Shift A)',
    pin: '1234',
    role: 'operator'
  },
  {
    id: 'sso2',
    name: 'दिनेश शर्मा (SSO)',
    nameEn: 'Dinesh Sharma (SSO)',
    designation: 'सबस्टेशन ऑपरेटर (SSO - Shift B)',
    pin: '1234',
    role: 'operator'
  },
  {
    id: 'sso3',
    name: 'सुरेश वर्मा (SSO)',
    nameEn: 'Suresh Verma (SSO)',
    designation: 'सबस्टेशन ऑपरेटर (SSO - Shift C)',
    pin: '1234',
    role: 'operator'
  },
  {
    id: 'xen',
    name: 'इरफान खान (XEN)',
    nameEn: 'Irfan Khan (XEN)',
    designation: 'अधिशासी अभियंता (Executive Engineer)',
    pin: '5678',
    role: 'officer'
  },
  {
    id: 'aen',
    name: 'सुनील शर्मा (AEN)',
    nameEn: 'Sunil Sharma (AEN)',
    designation: 'सहायक अभियंता (Assistant Engineer)',
    pin: '5678',
    role: 'officer'
  },
  {
    id: 'jen',
    name: 'विकास गुप्ता (JEN)',
    nameEn: 'Vikas Gupta (JEN)',
    designation: 'कनिष्ठ अभियंता (Junior Engineer)',
    pin: '5678',
    role: 'officer'
  },
  {
    id: 'admin',
    name: 'सबस्टेशन इंचार्ज (Admin)',
    nameEn: 'Substation In-Charge (Admin)',
    designation: 'सिस्टम एडमिनिस्ट्रेटर',
    pin: '9999',
    role: 'admin'
  }
];