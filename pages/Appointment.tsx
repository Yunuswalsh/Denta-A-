
import React, { useState, useEffect } from 'react';
import { db } from '../services/db';
import { Doctor, Appointment } from '../types';

const AppointmentPage: React.FC = () => {
  const [step, setStep] = useState(1);
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  
  // Data
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [existingAppointments, setExistingAppointments] = useState<Appointment[]>([]);
  
  // Updated Patient State
  const [patientInfo, setPatientInfo] = useState({ 
    name: '', 
    phone: '', 
    tc: '',
    age: '',
    medicalHistory: '',
    visitReason: 'Genel Muayene', // Default
    notes: '' 
  });
  
  const [success, setSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const load = async () => {
      const d = await db.getDoctors();
      const a = await db.getAppointments();
      setDoctors(d);
      setExistingAppointments(a);
    };
    load();
  }, []);

  const timeSlots = ['09:00', '10:00', '11:00', '13:00', '14:00', '15:00', '16:00', '17:00'];
  const visitReasons = [
    "Genel Muayene",
    "Diş Ağrısı / Sızı",
    "Diş Temizliği & Beyazlatma",
    "İmplant Danışma",
    "Ortodonti (Tel) Kontrolü",
    "Estetik Gülüş Tasarımı",
    "Kanal Tedavisi",
    "Diş Çekimi",
    "Diş Eti Problemleri",
    "Çocuk Diş Muayenesi"
  ];

  const getAvailableSlots = () => {
    if (!selectedDoctor || !selectedDate) return [];
    
    // Basit filtreleme için local state kullanıyoruz
    const taken = existingAppointments
      .filter(a => a.doctorId === selectedDoctor.id && a.date === selectedDate && a.status !== 'cancelled')
      .map(a => a.time);

    return timeSlots.filter(t => !taken.includes(t));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDoctor) return;
    setErrorMsg('');
    setLoading(true);

    try {
      const newApt: Appointment = {
        id: '', // Firestore will assign
        doctorId: selectedDoctor.id,
        patientName: patientInfo.name,
        patientPhone: patientInfo.phone,
        patientTC: patientInfo.tc,
        patientAge: parseInt(patientInfo.age),
        medicalHistory: patientInfo.medicalHistory,
        visitReason: patientInfo.visitReason,
        date: selectedDate,
        time: selectedTime,
        notes: patientInfo.notes,
        status: 'pending',
        createdAt: Date.now()
      };

      await db.addAppointment(newApt);
      setSuccess(true);
    } catch (err: any) {
      setErrorMsg(err.message || 'Randevu oluşturulurken bir hata oluştu.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="max-w-md mx-auto mt-20 p-8 bg-white rounded-2xl shadow-xl text-center animate-fade-in">
        <div className="w-20 h-20 bg-green-100 text-green-500 rounded-full flex items-center justify-center mx-auto mb-6 text-4xl shadow-sm">✓</div>
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Randevu Onaylandı!</h2>
        <p className="text-gray-600 mb-6">
          Sayın {patientInfo.name}, randevunuz başarıyla sisteme işlendi. Onaylandığında SMS ile bilgilendirme yapılacaktır.
        </p>
        <button onClick={() => window.location.reload()} className="bg-primary-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-primary-700 transition">Yeni Randevu</button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900">Randevu Oluştur</h1>
        <div className="flex mt-4 space-x-2">
           <div className={`h-2 flex-1 rounded-full transition-all duration-500 ${step >= 1 ? 'bg-primary-500' : 'bg-gray-200'}`}></div>
           <div className={`h-2 flex-1 rounded-full transition-all duration-500 ${step >= 2 ? 'bg-primary-500' : 'bg-gray-200'}`}></div>
           <div className={`h-2 flex-1 rounded-full transition-all duration-500 ${step >= 3 ? 'bg-primary-500' : 'bg-gray-200'}`}></div>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-lg p-6 md:p-10 border border-gray-100">
        
        {/* Step 1: Select Doctor */}
        {step === 1 && (
          <div className="animate-fade-in">
            <h2 className="text-xl font-bold mb-6 flex items-center gap-2"><span className="text-primary-500">1.</span> Doktor Seçimi</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {doctors.length === 0 ? <p className="col-span-3 text-center text-gray-400 py-10">Doktorlar yükleniyor...</p> : doctors.map(doc => (
                <div 
                  key={doc.id}
                  onClick={() => setSelectedDoctor(doc)}
                  className={`cursor-pointer border-2 rounded-xl p-4 flex flex-col items-center transition duration-200 hover:scale-105 ${selectedDoctor?.id === doc.id ? 'border-primary-500 bg-primary-50 shadow-md' : 'border-gray-100 hover:border-primary-200'}`}
                >
                  <img src={doc.image} alt={doc.name} className="w-24 h-24 rounded-full object-cover mb-3 shadow-sm" />
                  <h3 className="font-bold text-center text-slate-900">{doc.name}</h3>
                  <p className="text-sm text-primary-600 font-medium">{doc.specialty}</p>
                </div>
              ))}
            </div>
            <div className="mt-8 text-right">
              <button 
                disabled={!selectedDoctor}
                onClick={() => setStep(2)}
                className="bg-primary-600 disabled:bg-gray-300 text-white px-8 py-3 rounded-xl font-bold transition shadow-lg shadow-primary-500/30"
              >
                İlerle &rarr;
              </button>
            </div>
          </div>
        )}

        {/* Step 2: Date & Time */}
        {step === 2 && (
          <div className="animate-fade-in">
            <div className="flex items-center mb-6">
               <button onClick={() => setStep(1)} className="text-gray-400 hover:text-gray-600 mr-4 transition">← Geri</button>
               <h2 className="text-xl font-bold"><span className="text-primary-500">2.</span> Tarih ve Saat</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Tarih Seçin</label>
                <input 
                  type="date" 
                  className="w-full border-gray-300 rounded-lg shadow-sm focus:ring-primary-500 focus:border-primary-500 p-3 border"
                  min={new Date().toISOString().split('T')[0]}
                  onChange={(e) => { setSelectedDate(e.target.value); setSelectedTime(''); }}
                  value={selectedDate}
                />
              </div>

              <div>
                 <label className="block text-sm font-medium text-gray-700 mb-2">Saat Seçin</label>
                 {selectedDate ? (
                   <div className="grid grid-cols-3 gap-3">
                     {getAvailableSlots().map(slot => (
                       <button
                         key={slot}
                         onClick={() => setSelectedTime(slot)}
                         className={`py-2 px-3 rounded-lg text-sm font-medium transition ${selectedTime === slot ? 'bg-primary-600 text-white shadow-md' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                       >
                         {slot}
                       </button>
                     ))}
                     {getAvailableSlots().length === 0 && <p className="text-red-500 text-sm col-span-3">Bu tarihte boş yer kalmadı.</p>}
                   </div>
                 ) : (
                   <div className="bg-gray-50 rounded-lg p-4 text-center text-gray-400 text-sm italic border border-dashed border-gray-200">
                     Lütfen soldan tarih seçiniz.
                   </div>
                 )}
              </div>
            </div>

            <div className="mt-8 text-right">
              <button 
                disabled={!selectedDate || !selectedTime}
                onClick={() => setStep(3)}
                className="bg-primary-600 disabled:bg-gray-300 text-white px-8 py-3 rounded-xl font-bold transition shadow-lg shadow-primary-500/30"
              >
                İlerle &rarr;
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Patient Info */}
        {step === 3 && (
          <form onSubmit={handleSubmit} className="animate-fade-in">
            <div className="flex items-center mb-6">
               <button type="button" onClick={() => setStep(2)} className="text-gray-400 hover:text-gray-600 mr-4 transition">← Geri</button>
               <h2 className="text-xl font-bold"><span className="text-primary-500">3.</span> Kişisel Bilgiler</h2>
            </div>

            {errorMsg && (
              <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg mb-6 flex items-center">
                <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" /></svg>
                {errorMsg}
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              
              <div className="md:col-span-2">
                 <label className="block text-sm font-bold text-gray-700 mb-1">Randevu Alma Nedeni</label>
                 <select 
                    className="w-full border border-slate-600 rounded-lg p-3 focus:ring-primary-500 focus:border-primary-500 bg-slate-800 text-white"
                    value={patientInfo.visitReason}
                    onChange={(e) => setPatientInfo({...patientInfo, visitReason: e.target.value})}
                 >
                   {visitReasons.map(r => <option key={r} value={r} className="text-white">{r}</option>)}
                 </select>
              </div>

              <div className="md:col-span-1">
                <label className="block text-sm font-medium text-gray-700">TC Kimlik No</label>
                <input 
                  required
                  type="text" 
                  maxLength={11}
                  placeholder="11 haneli TC No"
                  className="mt-1 w-full border border-slate-600 rounded-lg p-3 focus:ring-primary-500 focus:border-primary-500 bg-slate-800 text-white placeholder-gray-400"
                  value={patientInfo.tc}
                  onChange={e => setPatientInfo({...patientInfo, tc: e.target.value.replace(/\D/g, '')})}
                />
              </div>

              <div className="md:col-span-1">
                <label className="block text-sm font-medium text-gray-700">Ad Soyad</label>
                <input 
                  required
                  type="text" 
                  className="mt-1 w-full border border-slate-600 rounded-lg p-3 focus:ring-primary-500 focus:border-primary-500 bg-slate-800 text-white placeholder-gray-400"
                  value={patientInfo.name}
                  onChange={e => setPatientInfo({...patientInfo, name: e.target.value})}
                />
              </div>

              <div className="md:col-span-1">
                <label className="block text-sm font-medium text-gray-700">Telefon</label>
                <input 
                  required
                  type="tel" 
                  placeholder="05XX XXX XX XX"
                  className="mt-1 w-full border border-slate-600 rounded-lg p-3 focus:ring-primary-500 focus:border-primary-500 bg-slate-800 text-white placeholder-gray-400"
                  value={patientInfo.phone}
                  onChange={e => setPatientInfo({...patientInfo, phone: e.target.value})}
                />
              </div>

              <div className="md:col-span-1">
                <label className="block text-sm font-medium text-gray-700">Yaş</label>
                <input 
                  required
                  type="number" 
                  min={1}
                  max={120}
                  className="mt-1 w-full border border-slate-600 rounded-lg p-3 focus:ring-primary-500 focus:border-primary-500 bg-slate-800 text-white placeholder-gray-400"
                  value={patientInfo.age}
                  onChange={e => setPatientInfo({...patientInfo, age: e.target.value})}
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700">Sağlık Geçmişi / Kronik Hastalıklar</label>
                <textarea 
                  required
                  placeholder="Örn: Diyabet, Kalp Rahatsızlığı, Kanser geçmişi, İlaç alerjisi vb."
                  className="mt-1 w-full border border-slate-600 rounded-lg p-3 focus:ring-primary-500 focus:border-primary-500 h-20 bg-slate-800 text-white placeholder-gray-400"
                  value={patientInfo.medicalHistory}
                  onChange={e => setPatientInfo({...patientInfo, medicalHistory: e.target.value})}
                ></textarea>
                <p className="text-xs text-gray-500 mt-1">*Bu bilgiler doktorunuzun tedavisini planlaması için kritiktir.</p>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700">Randevu Notları (Opsiyonel)</label>
                <textarea 
                  placeholder="Eklemek istediğiniz özel durumlar..."
                  className="mt-1 w-full border border-slate-600 rounded-lg p-3 focus:ring-primary-500 focus:border-primary-500 bg-slate-800 text-white placeholder-gray-400"
                  value={patientInfo.notes}
                  onChange={e => setPatientInfo({...patientInfo, notes: e.target.value})}
                ></textarea>
              </div>
            </div>

            <div className="mt-6 bg-blue-50 p-4 rounded-xl border border-blue-100 flex items-start gap-3">
               <div className="text-2xl">🗓️</div>
               <div>
                  <h4 className="font-bold text-blue-900 text-sm">Randevu Özeti</h4>
                  <p className="text-blue-800 text-sm mt-1">
                    Dr. {selectedDoctor?.name} - <span className="font-bold">{selectedDate} | {selectedTime}</span>
                  </p>
                  <p className="text-blue-700 text-xs mt-1">Nedeni: {patientInfo.visitReason}</p>
               </div>
            </div>

            <div className="mt-8 text-right">
              <button 
                type="submit"
                disabled={loading}
                className="bg-primary-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-primary-700 transition shadow-lg shadow-primary-500/30 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'İşleniyor...' : 'Randevuyu Onayla'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default AppointmentPage;
