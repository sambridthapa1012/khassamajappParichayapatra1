import { useState, useEffect } from 'react';
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, query, where, getDocs } from 'firebase/firestore';

// =========================================================================
// ✅ Firebase Configuration
// Ensure your .env file is in the root directory and contains these exact keys.
// =========================================================================
const firebaseConfig = {
apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export default function ParichayaPatra() {
  const [searchId, setSearchInput] = useState('');
  const [member, setMember] = useState(null);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Helper to extract ID from URL
  const getQueryParamId = () => new URLSearchParams(window.location.search).get('id');

  const fetchMemberDetails = async (idToSearch) => {
    if (!idToSearch) return;

    setLoading(true);
    setErrorMsg('');
    setMember(null);

    // Clean ID: removing 'KS-' prefix and parsing as integer
    const cleanId = idToSearch.replace(/KS-/gi, "").trim();
    const searchNo = parseInt(cleanId, 10);

    if (isNaN(searchNo)) {
      setErrorMsg("सदस्यता नम्बरको ढाँचा मिलेन। कृपया सही ID प्रविष्ट गर्नुहोस्।");
      setLoading(false);
      return;
    }

    try {
      const q = query(collection(db, "users"), where("sadasyataNo", "==", searchNo));
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        const docData = querySnapshot.docs[0].data();

        // Check for approved status
        if (docData.paymentStatus !== "Approved" && docData.paymentStatus !== "Verified") {
          setErrorMsg("यो खाता स्वीकृत (Approved) भइसकेको छैन।");
        } else {
          setMember({ ...docData, formattedId: idToSearch.toUpperCase() });
        }
      } else {
        setErrorMsg("प्रणालीमा यो सदस्यता नम्बर फेला परेन।");
      }
    } catch (error) {
      console.error("Firebase Error: ", error);
      setErrorMsg("डाटाबेस सर्भरसँग सम्पर्क हुन सकेन। पछि प्रयास गर्नुहोस्।");
    } finally {
      setLoading(false);
    }
  };

  // Initial load check for URL parameters
  useEffect(() => {
    const urlId = getQueryParamId();
    if (urlId) {
      setSearchInput(urlId);
      fetchMemberDetails(urlId);
    }
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchId.trim()) {
      const formattedInput = searchId.toUpperCase().trim();
      // Update URL without full page reload
      const newUrl = `${window.location.pathname}?id=${formattedInput}`;
      window.history.pushState({ path: newUrl }, '', newUrl);
      fetchMemberDetails(formattedInput);
    }
  };

  const resetPortal = () => {
    window.history.pushState({}, '', window.location.pathname);
    setSearchInput('');
    setMember(null);
    setErrorMsg('');
  };

  return (
    <div className="min-h-screen flex flex-col justify-between bg-slate-100 font-['Mukta']">
      <main className="flex-grow flex items-center justify-center p-4">
        <div className="w-full max-w-[400px] bg-white rounded-[30px] shadow-2xl overflow-hidden border border-slate-100">
          {/* Header Section */}
          <div className="text-white pt-8 px-4 text-center relative" style={{ background: 'linear-gradient(180deg, #951B1B 0%, #7A1212 100%)', clipPath: 'ellipse(85% 100% at 50% 0%)', paddingBottom: '95px' }}>
            <h1 className="text-2xl font-black tracking-wide">खस समाज नेपाल</h1>
            <p className="text-[10px] text-white/70 font-semibold uppercase tracking-widest mt-0.5">केन्द्रीय कार्यालय, अनामनगर, काठमाडौं</p>
            <div className="mt-4 inline-block px-6 py-1.5 bg-white text-[#951B1B] rounded-full text-xs font-black shadow-sm">परिचय पत्र</div>
          </div>

          <div className="relative px-5 pb-6">
            {!member && !loading && !errorMsg && (
              <form onSubmit={handleSearchSubmit} className="py-6 text-center">
                <h2 className="text-lg font-bold text-gray-800 mb-2">सदस्यता प्रमाणिकरण पोर्टल</h2>
                <div className="flex gap-2 bg-slate-50 p-1.5 rounded-2xl border border-slate-200">
                  <input type="text" placeholder="KS-00000" value={searchId} onChange={(e) => setSearchInput(e.target.value)} className="flex-grow bg-transparent px-3 py-2 text-sm font-bold text-gray-700 uppercase focus:outline-none" />
                  <button type="submit" className="px-5 py-2.5 bg-[#951B1B] text-white font-bold text-xs rounded-xl shadow-md uppercase">खोज्नुहोस्</button>
                </div>
              </form>
            )}

            {loading && <div className="py-12 text-center text-slate-500 font-bold">विवरण लोड हुँदैछ...</div>}
            
            {errorMsg && !loading && (
              <div className="text-center py-6">
                <p className="text-sm text-red-500 font-bold mb-4">{errorMsg}</p>
                <button onClick={resetPortal} className="px-6 py-2 bg-[#951B1B] text-white text-xs rounded-xl font-bold">पुनः प्रयास गर्नुहोस्</button>
              </div>
            )}

            {member && !loading && (
              <div className="text-center py-6 animate-pulse">
                <p className="text-xl font-black text-green-700">सफलतापूर्वक फेला पर्यो!</p>
                <p className="text-md font-bold text-gray-800 mt-2">{member.name}</p>
                <button onClick={resetPortal} className="mt-6 text-slate-500 text-xs font-bold underline">अर्को कार्ड खोज्नुहोस्</button>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}