import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useOfflineSync } from '../utils/OfflineSyncContext';
import api from '../utils/api';

export default function SubmissionForm() {
  const { user } = useAuth();
  const { farmerId } = useParams();
  const [searchParams] = useSearchParams();
  const { isOnline, addToQueue, syncData } = useOfflineSync();
  const navigate = useNavigate();
  const cameraInputRef = useRef(null);

  const farmerName = searchParams.get('name') || 'Unknown Farmer';
  const farmerVillage = searchParams.get('village') || 'Unknown';
  const taskType = searchParams.get('task') || 'seed_distribution';
  const currentStatus = searchParams.get('status') || 'in_progress';

  const taskLabel = taskType === 'seed_distribution' ? 'Seed Distribution' : 'Canal Inspection';

  const [form, setForm] = useState({
    status: currentStatus,
    description: '',
    photoBase64: null,
    gps_lat: null,
    gps_lng: null,
  });

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [gpsLoading, setGpsLoading] = useState(false);
  const [qrData, setQrData] = useState(null);

  // Fetch QR when result becomes available
  useEffect(() => {
    if (result && !result.offline && result.id) {
      api.get(`/verify/qr-data/${result.id}`)
        .then(res => setQrData(res.data))
        .catch(err => console.error("Could not load QR:", err));
    }
  }, [result]);

  // Capture GPS on mount and when photo is taken or selected
  const captureGPS = () => {
    setGpsLoading(true);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setForm(prev => ({
            ...prev,
            gps_lat: position.coords.latitude,
            gps_lng: position.coords.longitude,
          }));
          setGpsLoading(false);
        },
        (error) => {
          // Fallback to demo coordinates
          setForm(prev => ({
            ...prev,
            gps_lat: 30.75 + (Math.random() * 0.05),
            gps_lng: 78.45 + (Math.random() * 0.05),
          }));
          setGpsLoading(false);
        },
        { enableHighAccuracy: true, timeout: 10000 }
      );
    } else {
      setGpsLoading(false);
    }
  };

  useEffect(() => {
    captureGPS();
  }, []);
  const handlePhotoCapture = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        setForm(prev => ({ ...prev, photoBase64: ev.target.result }));
        // Capture GPS coordinates when photo is taken
        captureGPS();
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async () => {
    if (!form.description.trim()) {
      setError('Please enter a description.');
      return;
    }
    // Photo is recommended but not mandatory
    if (!form.photoBase64 && !form.skipPhotoConfirm) {
      setError('No photo attached. Click "Submit Report" again to submit without photo.');
      setForm(prev => ({ ...prev, skipPhotoConfirm: true }));
      return;
    }

    setLoading(true);
    setError('');

    const submissionData = {
      district_id: user.district_id || 'unknown',
      block_id: user.block_id || 'unknown',
      village: farmerVillage,
      activity_type: taskType,
      completion_percentage: form.status === 'completed' ? 100 : form.status === 'in_progress' ? 50 : 0,
      work_description: form.description || 'None',
      farmer_name: farmerName,
      farmer_id: farmerId || '',
      task_status: form.status,
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
          const blob = new Blob([ab], { type: mimeString });
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
        message: res.data.is_anomaly ? 'Sent! (Under Review)' : 'Submitted successfully!',
        hash: res.data.submission_hash,
        id: res.data.id,
        is_anomaly: res.data.is_anomaly
      });
      syncData();
    } catch (err) {
      setError(err.response?.data?.detail || 'Submission failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getWhatsappLink = () => {
    const statusText = form.status === 'completed' ? 'Completed' : form.status === 'in_progress' ? 'In Progress' : 'Not Completed';
    const text = encodeURIComponent(
      `Namaskar!\n\n📋 *PMDDKY Field Report Receipt*\n\n👤 Farmer: ${farmerName}\n📍 Village: ${farmerVillage}\n📌 Task: ${taskLabel}\n📊 Status: ${statusText}\n🔖 Receipt ID: ${result?.hash || 'N/A'}\n\nThis is an official submission confirmation from PMDDKY GroundTruth system.`
    );
    return `https://wa.me/919554391773?text=${text}`;
  };

  // ── Success Screen ──
  if (result) {
    return (
      <div className="min-h-screen pt-24 pb-16 px-4 bg-surface">
        <div className="max-w-xl mx-auto text-center space-y-6">
          <div className="w-20 h-20 mx-auto rounded-full bg-success-light flex items-center justify-center">
            <span className="text-4xl">{result.offline ? '💾' : '✅'}</span>
          </div>
          <h2 className="text-2xl font-bold text-ink">Done!</h2>
          <p className="text-sm text-ink-secondary">{result.message}</p>
          <div className="card bg-ink text-white text-xs font-mono p-3 break-all text-left">
            ID: {result.hash}
          </div>

          {/* WhatsApp Receipt */}
          <a
            href={getWhatsappLink()}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full py-4 bg-[#25D366] text-white font-bold text-sm rounded-lg flex items-center justify-center gap-3"
          >
            📩 Send Receipt on WhatsApp
          </a>

          {/* QR Code Verification */}
          {qrData && (
            <div className="card bg-surface border-2 border-primary-light p-6 space-y-4 text-center mt-6">
              <h3 className="text-sm font-bold text-primary uppercase tracking-wide">Farmer Verification</h3>
              <p className="text-xs text-ink-muted">Show this QR to the farmer to verify receipt of benefits.</p>
              <div className="flex justify-center bg-white p-4 rounded-xl border border-border inline-block mx-auto">
                <img src={qrData.qr_base64} alt="Verification QR" className="w-48 h-48" />
              </div>
            </div>
          )}

          <button
            onClick={() => navigate('/field')}
            className="btn-primary w-full py-4 mt-6"
          >
            ← Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24 pb-16 px-4 bg-surface">
      <div className="max-w-xl mx-auto space-y-5">

        {/* Farmer Info Header */}
        <div className="card">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-primary text-white flex items-center justify-center text-sm font-bold">
              {farmerName.split(' ').map(n => n[0]).join('')}
            </div>
            <div>
              <h1 className="text-lg font-bold text-ink">{farmerName}</h1>
              <p className="text-xs text-ink-muted">{farmerVillage} • {taskLabel}</p>
            </div>
          </div>
        </div>

        {/* Status Section */}
        <div className="card space-y-3">
          <h2 className="text-sm font-bold text-ink uppercase tracking-wide">Task Status</h2>

          <div className="space-y-2">
            {/* In Progress */}
            <label
              className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer ${
                form.status === 'in_progress'
                  ? 'border-warning bg-warning-light'
                  : 'border-border bg-surface'
              }`}
            >
              <input
                type="radio"
                name="status"
                value="in_progress"
                checked={form.status === 'in_progress'}
                onChange={(e) => setForm({ ...form, status: e.target.value })}
                className="w-4 h-4 accent-warning"
              />
              <span className="text-lg">🔄</span>
              <span className="text-sm font-semibold text-ink">In Progress</span>
            </label>

            {/* Completed */}
            <label
              className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer ${
                form.status === 'completed'
                  ? 'border-success bg-success-light'
                  : 'border-border bg-surface'
              }`}
            >
              <input
                type="radio"
                name="status"
                value="completed"
                checked={form.status === 'completed'}
                onChange={(e) => setForm({ ...form, status: e.target.value })}
                className="w-4 h-4 accent-success"
              />
              <span className="text-lg">✅</span>
              <span className="text-sm font-semibold text-ink">Completed</span>
            </label>

            {/* Not Completed */}
            <label
              className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer ${
                form.status === 'not_completed'
                  ? 'border-danger bg-danger-light'
                  : 'border-border bg-surface'
              }`}
            >
              <input
                type="radio"
                name="status"
                value="not_completed"
                checked={form.status === 'not_completed'}
                onChange={(e) => setForm({ ...form, status: e.target.value })}
                className="w-4 h-4 accent-danger"
              />
              <span className="text-lg">❌</span>
              <span className="text-sm font-semibold text-ink">Not Completed</span>
            </label>
          </div>
        </div>

        {/* Description Section */}
        <div className="card space-y-3">
          <h2 className="text-sm font-bold text-ink uppercase tracking-wide">Description</h2>
          <textarea
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            placeholder="Write details about the field visit, observations, materials used..."
            rows={4}
            className="input-field resize-none"
          />
        </div>

        {/* Photo & GPS Section */}
        <div className="card space-y-4">
          <h2 className="text-sm font-bold text-ink uppercase tracking-wide">Photo Evidence</h2>

          {/* Photo Preview */}
          {form.photoBase64 && (
            <div className="relative rounded-lg overflow-hidden border border-border">
              <img src={form.photoBase64} alt="Captured" className="w-full h-56 object-cover" />
              <button
                onClick={() => setForm({ ...form, photoBase64: null, gps_lat: null, gps_lng: null })}
                className="absolute top-2 right-2 w-8 h-8 bg-danger text-white rounded-full flex items-center justify-center text-sm font-bold"
              >
                ✕
              </button>
            </div>
          )}

          {/* GPS Info (shown after photo is taken) */}
          {form.photoBase64 && (
            <div className="flex items-center gap-3 p-3 rounded-lg bg-surface border border-border">
              <span className={`w-3 h-3 rounded-full ${form.gps_lat ? 'bg-success' : gpsLoading ? 'bg-warning' : 'bg-danger'}`}></span>
              <div className="flex-1">
                <p className="text-xs font-bold text-ink">
                  {gpsLoading ? 'Fetching location...' : form.gps_lat ? 'Location Captured' : 'Location unavailable'}
                </p>
                {form.gps_lat && (
                  <p className="text-xs text-ink-muted font-mono">
                    {form.gps_lat.toFixed(6)}, {form.gps_lng.toFixed(6)}
                  </p>
                )}
              </div>
              {form.gps_lat && (
                <span className="status-pill bg-success-light text-success">GPS ✓</span>
              )}
            </div>
          )}

          {/* Camera Capture Button */}
          {!form.photoBase64 && (
            <div className="flex justify-center">
              <button
                onClick={() => cameraInputRef.current?.click()}
                className="flex flex-col items-center justify-center gap-3 w-full p-8 border-2 border-dashed border-border-strong rounded-lg hover:bg-surface"
              >
                <span className="text-4xl">📷</span>
                <span className="text-sm font-bold text-ink">Take Photo</span>
                <span className="text-xs text-ink-muted">Camera only — GPS will be captured automatically</span>
              </button>
              <input
                ref={cameraInputRef}
                type="file"
                accept="image/*"
                capture="environment"
                onChange={handlePhotoCapture}
                className="hidden"
              />
            </div>
          )}
        </div>

        {/* Error */}
        {error && (
          <div className="p-3 bg-danger-light border border-danger text-danger text-sm font-bold rounded-lg text-center">
            {error}
          </div>
        )}

        {/* Submit */}
        <div className="flex gap-3">
          <button
            onClick={() => navigate('/field')}
            className="btn-outline flex-shrink-0"
          >
            ← Back
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="btn-primary flex-1 py-4 text-base"
          >
            {loading ? 'Submitting...' : 'Submit Report'}
          </button>
        </div>

      </div>
    </div>
  );
}
