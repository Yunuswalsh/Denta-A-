
import React, { useState, useEffect } from 'react';
import { db } from '../services/db';
import { Appointment, AIAnalysisLog, Doctor, Service } from '../types';
import { useNavigate } from 'react-router-dom';

type Tab = 'dashboard' | 'appointments' | 'patients' | 'ai' | 'doctors' | 'services';

const AdminPage: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<Tab>('dashboard');
  const [loading, setLoading] = useState(true);
  
  // Data State
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [aiLogs, setAiLogs] = useState<AIAnalysisLog[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [patients, setPatients] = useState<any[]>([]);

  // Modals State
  const [isDocModalOpen, setIsDocModalOpen] = useState(false);
  const [isSvcModalOpen, setIsSvcModalOpen] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState<any | null>(null);
  const [smsMessage, setSmsMessage] = useState('');

  // Form State
  const [newDoc, setNewDoc] = useState<Partial<Doctor>>({ name: '', specialty: '', image: '', availableDays: [1,2,3,4,5] });
  const [newSvc, setNewSvc] = useState<Partial<Service>>({ name: '', priceRange: '', duration: '', description: '' });

  useEffect(() => {
    const isAuth = localStorage.getItem('dentaai_admin') === 'true';
    if (!isAuth) {
      navigate('/login');
      return;
    }
    refreshData();
  }, [navigate]);

  const refreshData = async () => {
    setLoading(true);
    try {
      const [a, ai, d, s, p] = await Promise.all([
        db.getAppointments(),
        db.getAILogs(),
        db.getDoctors(),
        db.getServices(),
        db.getPatients()
      ]);
      setAppointments(a);
      setAiLogs(ai);
      setDoctors(d);
      setServices(s);
      setPatients(p);
    } catch (e) {
      console.error(e);
      alert('Veri yüklenirken hata oluştu.');
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (appointment: Appointment, status: Appointment['status']) => {
    await db.updateAppointmentStatus(appointment.id, status);
    
    // SMS Simulation Logic
    if (status === 'confirmed') {
       alert(
         `📨 SMS GÖNDERİLDİ!\n\n` +
         `Kime: ${appointment.patientPhone}\n` +
         `Mesaj: Sayın ${appointment.patientName}, ${appointment.date} saat ${appointment.time} randevunuz onaylanmıştır. Sağlıklı günler dileriz. -DentaAI`
       );
    }
    
    refreshData();
  };

  const handleSendSMS = () => {
    if(!smsMessage) return;
    alert(`SMS Gönderildi (${selectedPatient.phone}):\n${smsMessage}`);
    setSmsMessage('');
  };

  const handleDeleteDoctor = async (id: string) => {
    if(window.confirm('Bu doktoru silmek istediğinize emin misiniz?')) {
      await db.deleteDoctor(id);
      refreshData();
    }
  };

  const handleAddDoctor = async (e: React.FormEvent) => {
    e.preventDefault();
    if(newDoc.name) {
      await db.addDoctor({
        id: '', // Firestore auto-id
        name: newDoc.name!,
        specialty: newDoc.specialty!,
        image: newDoc.image || 'https://via.placeholder.com/300',
        availableDays: newDoc.availableDays || [1,2,3,4,5],
        averageRating: 0
      });
      setIsDocModalOpen(false);
      setNewDoc({name: '', specialty: ''});
      refreshData();
    }
  };

  const handleAddService = async (e: React.FormEvent) => {
    e.preventDefault();
    if(newSvc.name) {
      await db.addService({
        id: '',
        name: newSvc.name!,
        priceRange: newSvc.priceRange!,
        duration: newSvc.duration || '30 dk',
        description: newSvc.description || ''
      });
      setIsSvcModalOpen(false);
      setNewSvc({});
      refreshData();
    }
  };

  const handleDeleteService = async (id: string) => {
    if(window.confirm('Silmek istediğinize emin misiniz?')) {
      await db.deleteService(id);
      refreshData();
    }
  };

  const SidebarItem = ({ id, icon, label }: { id: Tab, icon: string, label: string }) => (
    <button 
      onClick={() => setActiveTab(id)} 
      className={`w-full text-left px-4 py-3 rounded-lg transition flex items-center gap-3 ${activeTab === id ? 'bg-primary-600 text-white shadow-lg shadow-primary-500/30' : 'hover:bg-slate-800 text-slate-300'}`}
    >
      <span>{icon}</span>
      <span className="font-medium">{label}</span>
    </button>
  );

  const StatCard = ({ title, value, color }: { title: string, value: string | number, color: string }) => (
    <div className={`bg-white p-6 rounded-xl shadow-sm border-l-4 ${color}`}>
       <p className="text-gray-500 text-sm font-medium">{title}</p>
       <p className="text-3xl font-bold text-slate-800 mt-2">{value}</p>
    </div>
  );

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-gray-50">
      {/* Sidebar */}
      <div className="w-full md:w-64 bg-slate-900 text-white flex flex-col shadow-2xl z-10">
        <div className="p-6 text-2xl font-bold border-b border-slate-800 flex items-center gap-2">
          <span>🛡️</span> Admin
        </div>
        <nav className="flex-1 p-4 space-y-2">
          <SidebarItem id="dashboard" icon="📊" label="Genel Bakış" />
          <SidebarItem id="appointments" icon="📅" label="Randevular" />
          <SidebarItem id="patients" icon="👥" label="Hasta Dosyaları" />
          <SidebarItem id="ai" icon="🤖" label="AI Logları" />
          <SidebarItem id="doctors" icon="👨‍⚕️" label="Doktorlar" />
          <SidebarItem id="services" icon="🦷" label="Hizmetler" />
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-8 overflow-y-auto h-screen">
        <div className="flex justify-between items-center mb-8">
           <h2 className="text-2xl font-bold text-slate-800 capitalize">
             {activeTab === 'ai' ? 'AI Analizleri' : activeTab === 'patients' ? 'Hasta Yönetimi' : activeTab === 'appointments' ? 'Randevu Takvimi' : activeTab}
           </h2>
           <div className="flex items-center gap-4">
              {loading && <span className="text-primary-600 font-bold animate-pulse">Veriler Güncelleniyor...</span>}
              <div className="text-sm text-gray-500">
                Son Güncelleme: {new Date().toLocaleTimeString()}
              </div>
           </div>
        </div>

        {activeTab === 'dashboard' && (
           <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <StatCard title="Toplam Randevu" value={appointments.length} color="border-blue-500" />
              <StatCard title="Bekleyen Onay" value={appointments.filter(a => a.status === 'pending').length} color="border-yellow-500" />
              <StatCard title="Kayıtlı Hasta" value={patients.length} color="border-green-500" />
              <StatCard title="Aylık Ciro (Tahmini)" value={`${(appointments.filter(a => a.status === 'completed').length * 1500).toLocaleString()} TL`} color="border-purple-500" />
              
              <div className="col-span-1 md:col-span-2 bg-white p-6 rounded-xl shadow-sm mt-4">
                 <h3 className="font-bold mb-4">Son Randevular</h3>
                 <div className="space-y-3">
                   {appointments.length === 0 ? <p className="text-gray-400">Kayıt yok.</p> : appointments.slice(-5).reverse().map(a => (
                     <div key={a.id} className="flex justify-between items-center text-sm border-b pb-2">
                       <div>
                         <span className="font-bold">{a.patientName}</span>
                         <span className="text-gray-500 mx-2">|</span>
                         <span className="text-gray-500">{a.date} {a.time}</span>
                       </div>
                       <span className={`px-2 py-0.5 rounded text-xs ${a.status === 'confirmed' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>{a.status}</span>
                     </div>
                   ))}
                 </div>
              </div>
           </div>
        )}

        {activeTab === 'appointments' && (
           <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100">
             <table className="min-w-full divide-y divide-gray-200">
               <thead className="bg-gray-50">
                 <tr>
                   <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Hasta Bilgisi</th>
                   <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Randevu Nedeni</th>
                   <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Doktor & Tarih</th>
                   <th className="px-6 py-4 text-center text-xs font-bold text-gray-500 uppercase tracking-wider">Durum</th>
                   <th className="px-6 py-4 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">İşlemler</th>
                 </tr>
               </thead>
               <tbody className="bg-white divide-y divide-gray-200">
                 {appointments.slice().reverse().map(apt => {
                   const doc = doctors.find(d => d.id === apt.doctorId);
                   return (
                   <tr key={apt.id} className="hover:bg-gray-50 transition">
                     <td className="px-6 py-4">
                       <div className="font-bold text-slate-900">{apt.patientName}</div>
                       <div className="text-sm text-gray-500">{apt.patientTC}</div>
                       <div className="text-xs text-gray-400">{apt.patientAge} Yaş</div>
                     </td>
                     <td className="px-6 py-4">
                        <span className="bg-blue-50 text-blue-700 px-2 py-1 rounded text-xs font-bold border border-blue-100">
                          {apt.visitReason || 'Genel Muayene'}
                        </span>
                        {apt.medicalHistory && (
                           <div className="text-xs text-gray-500 mt-1 truncate max-w-xs" title={apt.medicalHistory}>
                              <span className="font-semibold">Geçmiş:</span> {apt.medicalHistory}
                           </div>
                        )}
                     </td>
                     <td className="px-6 py-4">
                       <div className="text-sm font-medium text-slate-900">{doc?.name}</div>
                       <div className="text-sm text-primary-600">{apt.date} • {apt.time}</div>
                     </td>
                     <td className="px-6 py-4 text-center">
                        <span className={`px-3 py-1 inline-flex text-xs leading-5 font-bold rounded-full capitalize
                        ${apt.status === 'confirmed' ? 'bg-green-100 text-green-800' : 
                          apt.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 
                          apt.status === 'completed' ? 'bg-blue-100 text-blue-800' :
                          'bg-red-100 text-red-800'}`}>
                        {apt.status === 'pending' ? 'Onay Bekliyor' : apt.status}
                      </span>
                     </td>
                     <td className="px-6 py-4 text-right space-x-2">
                        {apt.status === 'pending' && <button onClick={() => updateStatus(apt, 'confirmed')} className="bg-green-100 text-green-700 hover:bg-green-200 px-3 py-1 rounded text-sm font-bold transition">✓ Onayla & SMS</button>}
                        {apt.status === 'confirmed' && <button onClick={() => updateStatus(apt, 'completed')} className="bg-blue-100 text-blue-700 hover:bg-blue-200 px-3 py-1 rounded text-sm font-bold transition">Tamamla</button>}
                        {apt.status !== 'cancelled' && <button onClick={() => updateStatus(apt, 'cancelled')} className="text-red-500 hover:bg-red-50 px-3 py-1 rounded text-sm font-bold transition">İptal</button>}
                     </td>
                   </tr>
                 )})}
               </tbody>
             </table>
           </div>
        )}

        {/* ... (Other tabs: patients, doctors, ai, services remain similar but I'll ensure full context is preserved if needed, though for this XML I only updated the Appointments table and logic) ... */}
        
        {activeTab === 'patients' && (
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
             {patients.map((p, idx) => (
               <div key={idx} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition">
                 <div className="flex justify-between items-start mb-4">
                    <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center text-xl">👤</div>
                    <span className="bg-primary-50 text-primary-700 text-xs px-2 py-1 rounded font-bold">{p.age} Yaş</span>
                 </div>
                 <h3 className="font-bold text-lg text-slate-900">{p.name}</h3>
                 <p className="text-gray-500 text-sm mb-4">TC: {p.tc}</p>
                 <div className="border-t pt-4">
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-gray-500">Toplam Randevu:</span>
                      <span className="font-bold">{p.appointments.length}</span>
                    </div>
                    <button 
                      onClick={() => setSelectedPatient(p)}
                      className="w-full bg-slate-900 text-white py-2 rounded-lg text-sm font-bold mt-2 hover:bg-slate-800"
                    >
                      Dosyayı Görüntüle / SMS
                    </button>
                 </div>
               </div>
             ))}
           </div>
        )}

        {activeTab === 'doctors' && (
           <div>
             <div className="flex justify-end mb-6">
               <button onClick={() => setIsDocModalOpen(true)} className="bg-primary-600 text-white px-6 py-2 rounded-lg font-bold hover:bg-primary-700 shadow-lg shadow-primary-500/30">
                 + Yeni Doktor Ekle
               </button>
             </div>
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {doctors.map(doc => (
                  <div key={doc.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden flex flex-col">
                     <div className="h-48 bg-gray-200">
                        <img src={doc.image} alt={doc.name} className="w-full h-full object-cover" />
                     </div>
                     <div className="p-4 flex-1">
                       <h3 className="font-bold text-lg text-slate-800">{doc.name}</h3>
                       <p className="text-sm text-primary-600 font-medium mb-2">{doc.specialty}</p>
                       <div className="flex justify-between items-center text-sm text-gray-500">
                          <span>⭐ {doc.averageRating}</span>
                          <button onClick={() => handleDeleteDoctor(doc.id)} className="text-red-500 font-bold hover:underline">Sil</button>
                       </div>
                     </div>
                  </div>
                ))}
             </div>
           </div>
        )}

        {activeTab === 'ai' && (
           <div className="space-y-4">
             {aiLogs.map(log => {
               const res = JSON.parse(log.aiResponse);
               return (
                 <div key={log.id} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex gap-4">
                    {log.imageBase64 && <img src={log.imageBase64} className="w-24 h-24 object-cover rounded-lg bg-gray-100" />}
                    <div>
                      <div className="flex gap-2 mb-1">
                         <span className={`text-xs font-bold px-2 py-0.5 rounded ${res.urgency === 'Acil' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>{res.urgency}</span>
                         <span className="text-xs text-gray-400">{new Date(log.timestamp).toLocaleString()}</span>
                      </div>
                      <p className="font-bold text-slate-800">"{log.userComplaint}"</p>
                      <p className="text-sm text-gray-600 mt-1"><span className="font-bold">AI:</span> {res.diagnosis}</p>
                    </div>
                 </div>
               )
             })}
           </div>
        )}

        {activeTab === 'services' && (
          <div>
            <div className="flex justify-end mb-4">
               <button onClick={() => setIsSvcModalOpen(true)} className="bg-primary-600 text-white px-4 py-2 rounded-lg font-bold hover:bg-primary-700">
                 + Hizmet Ekle
               </button>
            </div>
            <div className="bg-white rounded-xl shadow border border-gray-100 overflow-hidden">
               {services.map(s => (
                 <div key={s.id} className="p-4 border-b last:border-0 flex justify-between items-center hover:bg-gray-50">
                    <div>
                      <h4 className="font-bold">{s.name}</h4>
                      <p className="text-sm text-gray-500">{s.priceRange} • {s.duration}</p>
                    </div>
                    <button onClick={() => handleDeleteService(s.id)} className="text-red-500 hover:bg-red-50 p-2 rounded">🗑️</button>
                 </div>
               ))}
            </div>
          </div>
        )}
      </div>

      {/* Patient File Modal */}
      {selectedPatient && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
           <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto flex flex-col md:flex-row">
              {/* Left: Patient Info */}
              <div className="md:w-1/3 bg-slate-50 p-8 border-r border-gray-200">
                 <div className="text-center mb-6">
                    <div className="w-24 h-24 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center text-4xl mx-auto mb-4">
                      {selectedPatient.name.charAt(0)}
                    </div>
                    <h2 className="text-2xl font-bold text-slate-900">{selectedPatient.name}</h2>
                    <p className="text-gray-500">{selectedPatient.age} Yaşında</p>
                 </div>
                 
                 <div className="space-y-4 text-sm">
                    <div>
                      <label className="block text-gray-400 text-xs uppercase font-bold">TC Kimlik</label>
                      <p className="font-medium text-slate-800">{selectedPatient.tc}</p>
                    </div>
                    <div>
                      <label className="block text-gray-400 text-xs uppercase font-bold">Telefon</label>
                      <p className="font-medium text-slate-800">{selectedPatient.phone}</p>
                    </div>
                    <div className="bg-red-50 p-3 rounded-lg border border-red-100">
                      <label className="block text-red-400 text-xs uppercase font-bold">Sağlık Geçmişi</label>
                      <p className="font-medium text-red-800 mt-1">{selectedPatient.medicalHistory || 'Belirtilmedi'}</p>
                    </div>
                 </div>

                 <div className="mt-8">
                    <h3 className="font-bold mb-2">SMS Gönder</h3>
                    <textarea 
                      className="w-full border rounded p-2 text-sm"
                      placeholder="Mesajınızı yazın..."
                      rows={3}
                      value={smsMessage}
                      onChange={(e) => setSmsMessage(e.target.value)}
                    ></textarea>
                    <button onClick={handleSendSMS} className="w-full mt-2 bg-green-600 text-white py-2 rounded font-bold hover:bg-green-700">
                       Gönder 📤
                    </button>
                 </div>
              </div>

              {/* Right: Appointment History */}
              <div className="md:w-2/3 p-8">
                 <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-bold text-slate-900">Randevu Geçmişi</h3>
                    <button onClick={() => setSelectedPatient(null)} className="text-gray-400 hover:text-gray-600">✕ Kapat</button>
                 </div>
                 <div className="space-y-4">
                    {selectedPatient.appointments.slice().reverse().map((apt: Appointment) => (
                      <div key={apt.id} className="border border-gray-100 rounded-xl p-4 hover:bg-gray-50 transition">
                         <div className="flex justify-between mb-2">
                            <span className="font-bold text-primary-700">{apt.date} {apt.time}</span>
                            <span className={`text-xs px-2 py-1 rounded font-bold ${apt.status === 'completed' ? 'bg-blue-100 text-blue-700' : 'bg-gray-200 text-gray-700'}`}>{apt.status}</span>
                         </div>
                         <div className="flex justify-between items-end">
                            <div>
                               <p className="text-sm text-gray-600 mb-1">Dr. {doctors.find(d => d.id === apt.doctorId)?.name}</p>
                               <p className="text-xs text-blue-500 font-bold">{apt.visitReason}</p>
                            </div>
                         </div>
                         {apt.notes && <p className="text-xs text-gray-400 italic mt-2">Not: {apt.notes}</p>}
                      </div>
                    ))}
                 </div>
              </div>
           </div>
        </div>
      )}

      {/* Simple Modals for Doctor/Service Add (keeping them simple for brevity) */}
      {isDocModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white p-6 rounded-xl w-full max-w-md">
            <h3 className="font-bold text-lg mb-4">Yeni Doktor</h3>
            <form onSubmit={handleAddDoctor} className="space-y-3">
              <input className="w-full border p-2 rounded" placeholder="Ad Soyad" value={newDoc.name} onChange={e=>setNewDoc({...newDoc, name: e.target.value})} />
              <input className="w-full border p-2 rounded" placeholder="Uzmanlık" value={newDoc.specialty} onChange={e=>setNewDoc({...newDoc, specialty: e.target.value})} />
              <input className="w-full border p-2 rounded" placeholder="Resim URL" value={newDoc.image} onChange={e=>setNewDoc({...newDoc, image: e.target.value})} />
              <div className="flex justify-end gap-2"><button type="button" onClick={()=>setIsDocModalOpen(false)}>İptal</button><button className="bg-primary-600 text-white px-4 py-2 rounded">Kaydet</button></div>
            </form>
          </div>
        </div>
      )}

      {isSvcModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white p-6 rounded-xl w-full max-w-md">
            <h3 className="font-bold text-lg mb-4">Yeni Hizmet</h3>
            <form onSubmit={handleAddService} className="space-y-3">
              <input className="w-full border p-2 rounded" placeholder="Hizmet Adı" value={newSvc.name} onChange={e=>setNewSvc({...newSvc, name: e.target.value})} />
              <input className="w-full border p-2 rounded" placeholder="Fiyat" value={newSvc.priceRange} onChange={e=>setNewSvc({...newSvc, priceRange: e.target.value})} />
              <div className="flex justify-end gap-2"><button type="button" onClick={()=>setIsSvcModalOpen(false)}>İptal</button><button className="bg-primary-600 text-white px-4 py-2 rounded">Kaydet</button></div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default AdminPage;
