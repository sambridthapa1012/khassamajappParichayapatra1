import  { useState, useEffect } from 'react';
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, query, where, getDocs } from 'firebase/firestore';

// =========================================================================
// ⚠️ फायरबेस सेटिङ: यहाँ आफ्नो वास्तविक Firebase Project Configuration विवरणहरू राख्नुहोस्:
// =========================================================================
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT_ID.appspot.com",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID"
};

// Initialize Firebase & Firestore
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export default function ParichayaPatra() {
  const [searchId, setSearchInput] = useState('');
  const [member, setMember] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');

  // URL Query parameter 'id' बाट सदस्यता नम्बर लिने फङ्सन (उदा: ?id=KS-00001)
  const getQueryParamId = () => {
    const params = new URLSearchParams(window.location.search);
    return params.get('id');
  };

  const fetchMemberDetails = async (idToSearch) => {
    if (!idToSearch) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setErrorMsg('');
    setMember(null);

    // 'KS-00005' लाई नम्बर '5' मा बदल्ने
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

        // सुरक्षा नियम: केवल एप्रुभ्ड सदस्यहरू मात्र प्रमाणीकरण पोर्टलमा देखाइनेछ
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

  // विन्डो लोड हुँदा URL प्यारामिटर जाँच गर्ने र विवरण तान्ने
  useEffect(() => {
    const urlId = getQueryParamId();
    if (urlId) {
      fetchMemberDetails(urlId);
    } else {
      setLoading(false);
    }
  }, []);

  // म्यानुअल तरिकाले आईडी खोज्दा
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchId.trim()) {
      const formattedInput = searchId.toUpperCase().trim();
      // Address Bar को URL लाई पनि 'id' सँग अपडेट गर्ने (Reload नगरीकन)
      const newUrl = `${window.location.protocol}//${window.location.host}${window.location.pathname}?id=${formattedInput}`;
      window.history.pushState({ path: newUrl }, '', newUrl);
      fetchMemberDetails(formattedInput);
    }
  };

  // पुनः अर्को आईडी खोज्नका लागि स्क्रिन रिसेट गर्ने
  const resetPortal = () => {
    const cleanUrl = `${window.location.protocol}//${window.location.host}${window.location.pathname}`;
    window.history.pushState({ path: cleanUrl }, '', cleanUrl);
    setSearchInput('');
    setMember(null);
    setErrorMsg('');
    setLoading(false);
  };

  // सदस्यता मिति देखाउनका लागि सहयोगी ढाँचा फङ्सन
  const getFormattedDate = (timestamp) => {
    if (!timestamp) return "२०८२-१२-२२";
    const dateObj = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    const y = dateObj.getFullYear();
    const m = (dateObj.getMonth() + 1).toString().padStart(2, '0');
    const d = dateObj.getDate().toString().padStart(2, '0');
    return `${y}-${m}-${d}`;
  };

  return (
    <div className="min-h-screen flex flex-col justify-between bg-slate-100 font-['Mukta']">
      
      {/* 💳 Verification Card Holder */}
      <main className="flex-grow flex items-center justify-center p-4 md:p-6">
        <div className="w-full max-w-[400px] bg-white rounded-[30px] shadow-2xl overflow-hidden border border-slate-100 transition-all duration-300">
          
          {/* Top Curves Header (Maroon and Gold Wave) */}
          <div 
            className="text-white pt-8 px-4 text-center relative"
            style={{
              background: 'linear-gradient(180deg, #951B1B 0%, #7A1212 100%)',
              clipPath: 'ellipse(85% 100% at 50% 0%)',
              paddingBottom: '95px'
            }}
          >
            {/* Dedicated premium golden border container for logo.png */}
            <div className="relative z-10 flex justify-center mb-3">
              <div className="w-[60px] h-[60px] bg-white rounded-full border-2 border-[#D4AF37] flex items-center justify-center overflow-hidden shadow-md">
                <img 
                  src="/assets/images/logo.png" 
                  className="w-full h-full object-cover" 
                  alt="Logo"
                  onError={(e) => {
                    e.target.style.display = 'none';
                    document.getElementById('logo-fallback').style.display = 'flex';
                  }}
                />
                <div id="logo-fallback" className="hidden w-full h-full items-center justify-center bg-white">
                  <span className="text-xl font-bold text-[#951B1B]">खस</span>
                </div>
              </div>
            </div>
            
            <h1 className="text-2xl font-black tracking-wide leading-tight">खस समाज नेपाल</h1>
            <p class="text-[10px] text-white/70 font-semibold uppercase tracking-widest mt-0.5">केन्द्रीय कार्यालय, अनामनगर, काठमाडौं</p>
            
            {/* White badge "परिचय पत्र" */}
            <div className="mt-4 inline-block px-6 py-1.5 bg-white text-[#951B1B] rounded-full text-xs font-black shadow-sm tracking-wide">
              परिचय पत्र
            </div>
          </div>

          {/* Dynamic Content Area */}
          <div className="relative px-5 pb-6">
            
            {/* Profile Avatar overlapping curve precisely */}
            <div className="flex justify-center -mt-[65px] mb-4 relative z-20">
              <div className="w-[130px] h-[130px] rounded-full bg-white border-[3.5px] border-[#D4AF37] shadow-lg overflow-hidden flex items-center justify-center">
                {member?.profileBase64 ? (
                  <img 
                    src={`data:image/png;base64,${member.profileBase64}`} 
                    className="w-full h-full object-cover" 
                    alt="Profile Picture" 
                  />
                ) : (
                  <svg className="w-16 h-16 text-slate-300" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M24 20.993V24H0v-2.996A14.977 14.977 0 0112.004 15c4.904 0 9.26 2.354 11.996 5.993zM16.002 8.999a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                )}
              </div>
            </div>

            {/* 🔍 Search Input Widget - Shown when no member data is active */}
            {!member && !loading && !errorMsg && (
              <form onSubmit={handleSearchSubmit} className="py-6 text-center">
                <h2 class="text-lg font-bold text-gray-800 mb-2">सदस्यता प्रमाणिकरण पोर्टल</h2>
                <p class="text-xs text-gray-500 mb-4 leading-relaxed">आफ्नो डिजिटल सदस्यता परिचय पत्र प्रमाणीकरण गर्न कृपया तल आफ्नो सदस्यता नम्बर (उदा: KS-00001) राख्नुहोस्।</p>
                <div className="flex gap-2 bg-slate-50 p-1.5 rounded-2xl border border-slate-200">
                  <input 
                    type="text" 
                    placeholder="KS-00000" 
                    value={searchId}
                    onChange={(e) => setSearchInput(e.target.value)}
                    className="flex-grow bg-transparent px-3 py-2 text-sm font-bold text-gray-700 placeholder-gray-400 focus:outline-none uppercase"
                  />
                  <button 
                    type="submit" 
                    className="px-5 py-2.5 bg-[#951B1B] text-white font-bold text-xs rounded-xl shadow-md tracking-wider uppercase hover:opacity-90 active:scale-95 transition-all"
                  >
                    खोज्नुहोस्
                  </button>
                </div>
              </form>
            )}

            {/* 🌀 Dynamic Loader Spinner */}
            {loading && (
              <div className="py-12 flex flex-col items-center justify-center gap-3">
                <div className="w-10 h-10 border-4 border-t-[#951B1B] border-slate-200 rounded-full animate-spin"></div>
                <p className="text-xs text-slate-500 font-semibold tracking-wide">विवरण सुरक्षित सर्भरबाट खोजिँदैछ...</p>
              </div>
            )}

            {/* 🔴 Error State Container */}
            {errorMsg && !loading && (
              <div className="text-center py-6 px-4">
                <div className="w-14 h-14 bg-red-50 rounded-full inline-flex items-center justify-center text-red-500 text-3xl mb-4 border border-red-100">
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
                <h3 className="text-md font-bold text-slate-800">विवरण फेला परेन!</h3>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">{errorMsg}</p>
                <button 
                  onClick={resetPortal} 
                  className="mt-5 px-6 py-2.5 bg-[#951B1B] text-white text-xs font-bold rounded-xl shadow hover:opacity-90 transition-all"
                >
                  पुनः प्रयास गर्नुहोस्
                </button>
              </div>
            )}

            {/* ✅ SUCCESS: Profile Details Rendering */}
            {member && !loading && (
              <div className="animate-fade-in">
                
                {/* Meta block split */}
                <div className="flex justify-between px-3 mb-4">
                  <div className="text-left">
                    <span className="text-[10px] text-slate-400 font-extrabold uppercase">सदस्यता नम्बर</span>
                    <p className="text-xs font-black text-[#951B1B] mt-0.5">{member.formattedId}</p>
                  </div>
                  <div className="text-right">
                    <span class="text-[10px] text-slate-400 font-extrabold uppercase">सदस्यता मिति</span>
                    <p className="text-xs font-black text-slate-800 mt-0.5">{getFormattedDate(member.createdAt)}</p>
                  </div>
                </div>
                
                <div className="h-[1px] bg-slate-100 w-full mb-4"></div>

                {/* Details Table in RSP style */}
                <div className="space-y-4 px-2">
                  <div className="flex items-center">
                    <span className="w-[100px] text-right text-xs font-bold text-slate-400">नाम:</span>
                    <span className="pl-5 text-sm font-extrabold text-slate-800">{member.name || "-- --"}</span>
                  </div>
                  <div className="flex items-center">
                    <span className="w-[100px] text-right text-xs font-bold text-slate-400">प्रदेश:</span>
                    <span className="pl-5 text-sm font-extrabold text-slate-800">{member.pradesh || "-- --"}</span>
                  </div>
                  <div className="flex items-center">
                    <span className="w-[100px] text-right text-xs font-bold text-slate-400">जिल्ला:</span>
                    <span className="pl-5 text-sm font-extrabold text-slate-800">{member.district || "-- --"}</span>
                  </div>
                  <div className="flex items-center">
                    <span className="w-[100px] text-right text-xs font-bold text-slate-400">नगरपालिका:</span>
                    <span className="pl-5 text-sm font-extrabold text-slate-800">{member.palika || "-- --"}</span>
                  </div>
                  <div className="flex items-center">
                    <span className="w-[100px] text-right text-xs font-bold text-slate-400">वडा नं.:</span>
                    <span className="pl-5 text-sm font-extrabold text-slate-800">{member.wardaNo || "--"}</span>
                  </div>
                </div>

                <div className="h-[1px] bg-slate-100 w-full my-5"></div>

                {/* Bottom Split Block: Left Signature | Right Verified Seal */}
                <div className="flex items-center justify-between px-2 gap-4">
                  
                  {/* Left: Accurate Digital Vector Signature of President "Biresh Thapa" */}
                  <div className="flex-1 text-center flex flex-col items-center justify-center border-r border-slate-100 pr-2">
                    <div className="w-[110px] h-[55px] flex items-center justify-center">
                      <svg viewBox="0 0 130 45" className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
                        <path d="M 28.6 18 Q 23.4 9.9, 33.8 8.1 Q 45.5 6.75, 41.6 18.9" fill="none" stroke="#0F2D59" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M 41.6 13.5 C 52 5.4, 62.4 9.9, 57.2 18.9 Q 52 21.6, 65 20.25" fill="none" stroke="#0F2D59" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M 65 14.4 Q 70.2 7.2, 80.6 8.1 Q 88.4 9, 83.2 20.25" fill="none" stroke="#0F2D59" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M 83.2 12.6 Q 91 9, 98.8 9.9 L 96.2 20.25" fill="none" stroke="#0F2D59" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/>
                        <path d="M 23.4 11.25 Q 62.4 10.35, 101.4 9.45" fill="none" stroke="#0F2D59" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/>
                        <path d="M 15.6 24.75 Q 62.4 23.4, 114.4 18.9" fill="none" stroke="#0F2D59" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/>
                      </svg>
                    </div>
                    <div className="w-[80px] h-[1px] bg-slate-300 my-1"></div>
                    <p className="text-[10px] font-bold text-[#951B1B]">अध्यक्ष</p>
                    <p className="text-[8px] font-semibold text-slate-400">बिरेश थापा</p>
                  </div>

                  {/* Right: Beautiful Verified Badge/Stamp matching RSP style */}
                  <div className="flex-1 flex flex-col items-center justify-center">
                    <div className="w-[58px] h-[55px] bg-emerald-50 rounded-full border border-emerald-100 flex items-center justify-center text-emerald-500 shadow-sm relative">
                      <div className="absolute -top-1 -right-1 bg-amber-400 text-white rounded-full p-0.5 border border-white text-[8px] flex items-center justify-center w-4 h-4">
                        <svg className="w-2.5 h-2.5" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                      </div>
                      <svg className="w-8 h-8 text-emerald-500 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <span className="text-[10px] font-extrabold text-emerald-600 mt-1 tracking-wide uppercase flex items-center gap-1">
                      सक्रिय (Verified)
                    </span>
                    <p className="text-[8px] font-bold text-slate-300">आधिकारिक सदस्य</p>
                  </div>

                </div>

                {/* Back to search action */}
                <div className="mt-6 flex justify-center">
                  <button 
                    onClick={resetPortal} 
                    className="px-5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-500 text-xs font-bold rounded-xl transition-all"
                  >
                    ← अर्को कार्ड खोज्नुहोस्
                  </button>
                </div>

              </div>
            )}

          </div>

          {/* Curved Footer matching RSP Style */}
          <div 
            className="text-white text-center pb-5 pt-10 px-4 relative"
            style={{
              background: 'linear-gradient(180deg, #951B1B 0%, #7A1212 100%)',
              clipPath: 'ellipse(85% 100% at 50% 100%)',
              paddingTop: '55px'
            }}
          >
            <div className="flex justify-around items-center">
              <div className="flex items-center gap-1.5 text-[9px] font-bold">
                <svg className="w-3.5 h-3.5 text-amber-300" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                </svg>
                <span>9852049420</span>
              </div>
              <div className="flex items-center gap-1.5 text-[9px] font-bold">
                <svg className="w-3.5 h-3.5 text-amber-300" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                  <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                </svg>
                <span>khassamaj77@gmail.com</span>
              </div>
            </div>
          </div>

        </div>
      </main>

      {/* Clean Minimal Footer */}
      <footer className="text-center py-4 border-t border-slate-200 bg-white">
        <p className="text-[10px] text-slate-400 font-semibold">© 2026 खस समाज नेपाल। सर्वाधिकार सुरक्षित।</p>
        <p className="text-[8px] text-slate-300 mt-0.5">Powered by Khas Samaj Digital Network Division</p>
      </footer>

    </div>
  );
}