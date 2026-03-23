import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useOfflineSync } from '../utils/OfflineSyncContext';
import api from '../utils/api';

const ASSIGNED_PROJECTS = [
  { id: 'proj-1', name: 'Seed Distribution - Dunda Zone A', type: 'seed_distribution', icon: '🌱' },
  { id: 'proj-2', name: 'Canal Insp - Bhatwari Sector 3', type: 'irrigation_work', icon: '💧' }
];

export default function SubmissionForm() {
  const { user } = useAuth();
  const { isOnline, addToQueue, syncData } = useOfflineSync();
  const navigate = useNavigate();
  
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  
  const [form, setForm] = useState({
    project_id: '',
    completion_percentage: 50,
    materials_used: '',
    work_description: '',
    gps_lat: null,
    gps_lng: null,
    photoBase64: null,
  });

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => setForm({ ...form, photoBase64: ev.target.result });
      reader.readAsDataURL(file);
    }
  };

  const getLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setForm(prev => ({ 
            ...prev, 
            gps_lat: position.coords.latitude, 
            gps_lng: position.coords.longitude 
          }));
        },
        (err) => {
          console.warn('Geolocation failed:', err.message);
          // Fallback to demo location if needed
          setForm(prev => ({ 
            ...prev, 
            gps_lat: 30.75 + (Math.random() * 0.05), 
            gps_lng: 78.45 + (Math.random() * 0.05)
          }));
        },
        { enableHighAccuracy: true, timeout: 5000 }
      );
    }
  };

  useEffect(() => {
    if (step === 3 && !form.gps_lat) {
      getLocation();
    }
  }, [step]);

  const handleSubmit = async () => {
    setLoading(true);
    setError('');

    const submissionData = {
      district_id: user.district_id || 'unknown',
      block_id: user.block_id || 'unknown',
      village: 'Field Location',
      activity_type: ASSIGNED_PROJECTS.find(p => p.id === form.project_id)?.type || 'general',
      completion_percentage: form.completion_percentage,
      materials_used: form.materials_used,
      work_description: form.work_description || 'None',
      project_gps_lat: form.gps_lat,
      project_gps_lng: form.gps_lng,
      photoBase64: form.photoBase64,
    };

    if (!isOnline) {
      const offlineItem = await addToQueue(submissionData);
      setResult({
        offline: true, 
        message: 'Saved on phone. Will send when internet is back!',
        hash: 'OFFLINE-' + offlineItem.id.slice(-6)
      });
      setStep(5);
      setLoading(false);
      return;
    }

    try {
      const formData = new FormData();
      Object.keys(submissionData).forEach(key => {
        if (key === 'photoBase64' && submissionData[key]) {
          const base64 = submissionData[key];
          const byteString = atob(base64.split(',')[1]);
          const mimeString = base64.split(',')[0].split(':')[1].split(';')[0];
          const ab = new ArrayBuffer(byteString.length);
          const ia = new Uint8Array(ab);
          for (let i = 0; i < byteString.length; i++) ia[i] = byteString.charCodeAt(i);
          const blob = new Blob([ab], {type: mimeString});
          formData.append('photo', blob, 'capture.jpg');
        } else if (key !== 'photoBase64' && submissionData[key] !== null) {
          formData.append(key, submissionData[key]);
        }
      });
      formData.append('beneficiary_count', 1);

      const res = await api.post('/submissions', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      
      setResult({
        offline: false,
        message: res.data.is_anomaly ? 'Sent! (Under Review)' : 'Sent successfully!',
        hash: res.data.submission_hash,
        is_anomaly: res.data.is_anomaly
      });
      setStep(5);
      syncData();
    } catch (err) {
      setError(err.response?.data?.detail || 'Sending failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getWhatsappLink = () => {
    const p = ASSIGNED_PROJECTS.find(x => x.id === form.project_id);
    const text = encodeURIComponent(`Namaskar! Work verification for: ${p?.name}\nProgress: ${form.completion_percentage}%\nReceipt ID: ${result?.hash || 'demo'}\nPlease check!`);
    return `https://wa.me/919876543210?text=${text}`;
  };

  return (
    <div className="min-h-screen pt-44 pb-20 px-4 bg-brand-creme">
      <div className="max-w-xl mx-auto">
        
        {/* Progress Tape */}
        <div className="flex gap-2 mb-12 h-1 px-2">
           {[1, 2, 3, 4].map(s => (
             <div 
               key={s} 
               className={`flex-1 transition-all duration-700 rounded-full ${s <= step ? 'bg-accent-cobalt shadow-[0_0_10px_rgba(45,92,247,0.5)]' : 'bg-brand-ink/10'}`}
             />
           ))}
        </div>

        {/* Content Section */}
        <div className="space-y-12">
          
          {/* Step 1: Destination Selection */}
          {step === 1 && (
            <div className="space-y-8 animate-in slide-in-from-right-12 duration-500">
               <div>
                 <h2 className="text-display text-4xl font-black uppercase leading-none mb-4 text-brand-ink">Choose<br/>Work</h2>
                 <p className="text-label text-brand-ink">Step 1 of 4</p>
               </div>

               <div className="space-y-4">
                 {ASSIGNED_PROJECTS.map(p => (
                   <button
                    key={p.id}
                    onClick={() => setForm({ ...form, project_id: p.id })}
                    className={`w-full p-6 text-left transition-all duration-300 border-2 ${
                      form.project_id === p.id
                        ? 'bg-accent-cobalt text-white border-brand-ink shadow-[6px_6px_0px_black] translate-x-[-2px] translate-y-[-2px]'
                        : 'bg-white border-brand-ink/10 text-brand-ink hover:border-brand-ink shadow-[4px_4px_0px_rgba(0,0,0,0.05)]'
                    }`}
                   >
                     <div className="flex items-center justify-between">
                       <span className="font-display font-bold text-lg">{p.name}</span>
                       <span className="text-xl">{p.icon}</span>
                     </div>
                   </button>
                 ))}
               </div>

               <div className="pt-8">
                 <button 
                  onClick={() => setStep(2)} 
                  disabled={!form.project_id}
                  className="btn-capsule w-full disabled:opacity-30 disabled:grayscale"
                 >
                   NEXT →
                 </button>
               </div>
            </div>
          )}

          {/* Step 2: Details */}
          {step === 2 && (
            <div className="space-y-10 animate-in slide-in-from-right-12 duration-500">
               <div>
                 <h2 className="text-display text-4xl font-black uppercase leading-none mb-4 text-brand-ink">Enter<br/>Details</h2>
                 <p className="text-label text-brand-ink">Step 2 of 4</p>
               </div>
               
               <div className="organic-panel p-8 rounded-[40px] space-y-8">
                  <div className="space-y-4">
                    <div className="flex justify-between items-end">
                      <label className="text-label text-brand-ink font-black">How much is done?</label>
                      <span className="font-display font-black text-4xl text-brand-ink">{form.completion_percentage}%</span>
                    </div>
                    <input
                      type="range"
                      min="0" max="100" step="10"
                      value={form.completion_percentage}
                      onChange={(e) => setForm({ ...form, completion_percentage: parseInt(e.target.value) })}
                      className="w-full h-1 bg-black/10 appearance-none cursor-pointer accent-accent-cobalt"
                    />
                  </div>

                  <div className="space-y-4">
                     <label className="block text-label text-brand-ink font-black">What was used?</label>
                     <input
                      type="text"
                      value={form.materials_used}
                      onChange={(e) => setForm({ ...form, materials_used: e.target.value })}
                      placeholder="e.g. 5 bags of seeds"
                      className="input-minimal"
                     />
                  </div>
               </div>

               <div className="flex gap-4">
                 <button onClick={() => setStep(1)} className="px-8 py-4 border-2 border-brand-ink font-mono font-bold uppercase transition hover:bg-brand-ink hover:text-white rounded-full">BACK</button>
                 <button 
                  onClick={() => setStep(3)} 
                  disabled={!form.materials_used}
                  className="btn-capsule flex-1 disabled:opacity-30"
                 >
                   NEXT →
                 </button>
               </div>
            </div>
          )}

          {/* Step 3: Photo */}
          {step === 3 && (
            <div className="space-y-10 animate-in slide-in-from-right-12 duration-500">
               <div>
                 <h2 className="text-display text-4xl font-black uppercase leading-none mb-4 text-brand-ink">Take<br/>Photo</h2>
                 <p className="text-label text-brand-ink">Step 3 of 4</p>
               </div>
               
               <label className="group block relative cursor-pointer">
                  <input
                    type="file"
                    accept="image/*"
                    capture="environment"
                    onChange={handlePhotoChange}
                    className="hidden"
                  />
                  <div className={`aspect-square w-full border-4 border-dashed transition-all duration-500 overflow-hidden flex flex-col items-center justify-center gap-6 rounded-[40px] ${
                    form.photoBase64 ? 'border-emerald-500' : 'border-brand-ink/10 bg-brand-clay hover:border-brand-ink'
                  }`}>
                    {form.photoBase64 ? (
                      <img src={form.photoBase64} alt="Captured" className="w-full h-full object-cover" />
                    ) : (
                      <>
                        <div className="w-20 h-20 rounded-full border-2 border-brand-ink flex items-center justify-center text-4xl group-hover:scale-125 transition-transform duration-700">📸</div>
                        <p className="text-label text-center px-8 text-brand-ink">CLICK TO TAKE PHOTO OF WORK</p>
                      </>
                    )}
                  </div>
               </label>

               <div className="bg-brand-ink text-white p-5 flex items-center justify-between rounded-2xl shadow-[8px_8px_0px_rgba(0,0,0,0.1)]">
                  <div className="flex items-center gap-4">
                    <span className={`w-3 h-3 rounded-full ${form.gps_lat ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500 animate-spin'}`}></span>
                    <span className="text-label text-white">Location: {form.gps_lat ? 'LOCKED' : 'FINDING...'}</span>
                  </div>
                  {form.gps_lat && <span className="text-label text-white/60">{form.gps_lat.toFixed(4)}, {form.gps_lng.toFixed(4)}</span>}
               </div>

               <div className="flex gap-4">
                 <button onClick={() => setStep(2)} className="px-8 py-4 border-2 border-brand-ink font-mono font-bold uppercase transition hover:bg-brand-ink hover:text-white rounded-full">BACK</button>
                 <button 
                  onClick={() => setStep(4)} 
                  disabled={!form.photoBase64 || !form.gps_lat}
                  className="btn-capsule flex-1 disabled:opacity-30"
                 >
                   NEXT →
                 </button>
               </div>
            </div>
          )}

          {/* Step 4: Final Sign-off */}
          {step === 4 && (
            <div className="space-y-10 animate-in slide-in-from-right-12 duration-500">
               <div>
                 <h2 className="text-display text-4xl font-black uppercase leading-none mb-4 text-brand-ink">Final<br/>Check</h2>
                 <p className="text-label text-brand-ink">Last Step</p>
               </div>

               <div className="bento-tile p-8 divide-y-4 divide-brand-ink/10">
                  <div className="py-6 flex justify-between items-center">
                     <span className="text-label text-brand-ink">Project</span>
                     <span className="font-display font-black text-lg tracking-tight text-brand-ink text-right max-w-[200px]">{ASSIGNED_PROJECTS.find(p => p.id === form.project_id)?.name}</span>
                  </div>
                  <div className="py-6 flex justify-between items-center">
                     <span className="text-label text-brand-ink">Progress</span>
                     <span className="font-display font-black text-3xl italic text-accent-cobalt">{form.completion_percentage}%</span>
                  </div>
                  <div className="py-6 space-y-4">
                     <span className="text-label text-brand-ink block mb-2">Used</span>
                     <p className="text-xl font-black bg-brand-clay p-6 rounded-2xl border-2 border-brand-ink text-brand-ink shadow-[4px_4px_0px_black]">
                       {form.materials_used}
                     </p>
                  </div>
               </div>

               {error && (
                 <p className="text-center text-rose-600 font-mono text-[10px] uppercase font-bold">{error}</p>
               )}

               <div className="flex gap-4">
                 <button onClick={() => setStep(3)} className="px-8 py-4 border-2 border-brand-ink font-mono font-bold uppercase transition hover:bg-brand-ink hover:text-white rounded-full" disabled={loading}>BACK</button>
                 <button 
                  onClick={handleSubmit} 
                  disabled={loading}
                  className="btn-capsule flex-1"
                 >
                   {loading ? 'SENDING...' : 'YES, SUBMIT'}
                 </button>
               </div>
            </div>
          )}

          {/* Step 5: Finished */}
          {step === 5 && result && (
            <div className="text-center space-y-8 animate-in zoom-in-95 duration-700">
               <div className="inline-block relative">
                  <div className="w-32 h-32 rounded-full border-8 border-brand-ink flex items-center justify-center text-4xl shadow-[8px_8px_0px_#2d5cf7] bg-white">
                    {result.offline ? '💾' : '🏁'}
                  </div>
               </div>
               
               <div className="space-y-4">
                 <h2 className="text-display text-4xl font-black uppercase tracking-tighter text-brand-ink">Done!</h2>
                 <p className="text-sm font-bold text-brand-ink px-8">{result.message}</p>
                 <div className="mt-8 p-4 bg-brand-ink text-white font-mono text-[10px] rounded-2xl break-all mx-4 select-all shadow-xl">
                    ID: {result.hash}
                 </div>
               </div>

               <div className="pt-12 space-y-4">
                   <a
                   href={getWhatsappLink()}
                   target="_blank"
                   rel="noopener noreferrer"
                   className="w-full py-5 bg-[#25D366] text-white font-display font-black uppercase text-sm rounded-full flex items-center justify-center gap-4 border-4 border-brand-ink shadow-[8px_8px_0px_black] hover:bg-white hover:text-[#25D366] transition-all active:translate-y-[4px] active:shadow-none"
                 >
                   📡 SEND TO FARMER
                 </a>

                 <button
                   onClick={() => navigate('/field')}
                   className="w-full py-4 font-mono font-bold text-[10px] uppercase underline tracking-widest text-brand-ink"
                 >
                   Go Back to Dashboard
                 </button>
               </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
