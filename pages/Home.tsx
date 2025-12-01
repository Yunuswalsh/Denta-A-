import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { db } from '../services/db';
import { Doctor, Service, Review } from '../types';

const Home: React.FC = () => {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [reviewForm, setReviewForm] = useState({ doctorId: '', name: '', comment: '', rating: 5 });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [docsData, svcsData, reviewsData] = await Promise.all([
          db.getDoctors(),
          db.getServices(),
          db.getReviews()
        ]);
        setDoctors(docsData);
        setServices(svcsData);
        setReviews(reviewsData.slice(0, 4));
      } catch (e) {
        console.error("Veri yükleme hatası:", e);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if(reviewForm.doctorId) {
      await db.addReview({
        id: '', // Firestore auto-id kullanacak
        doctorId: reviewForm.doctorId,
        patientName: reviewForm.name,
        comment: reviewForm.comment,
        rating: reviewForm.rating,
        date: new Date().toISOString().split('T')[0]
      });
      setIsReviewModalOpen(false);
      setReviewForm({ doctorId: '', name: '', comment: '', rating: 5 });
      alert("Yorumunuz için teşekkürler!");
      // Refresh reviews
      const r = await db.getReviews();
      setReviews(r.slice(0,4));
    }
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin text-4xl">🦷</div></div>;
  }

  return (
    <div className="space-y-20 pb-20">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-slate-900 to-slate-800 text-white py-24 overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1629909613654-28e377c37b09?auto=format&fit=crop&q=80&w=1920')] opacity-20 bg-cover bg-center" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 flex flex-col md:flex-row items-center">
          <div className="md:w-1/2 space-y-6">
            <h1 className="text-4xl md:text-6xl font-extrabold leading-tight">
              Yapay Zeka Destekli <br/> <span className="text-primary-400">Geleceğin Gülüşü</span>
            </h1>
            <p className="text-lg text-slate-300 max-w-lg">
              Evden çıkmadan AI ile ön muayene olun, teşhis alın ve saniyeler içinde uzman doktorlarımızdan randevu oluşturun.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <Link to="/ai-checkup" className="px-8 py-4 bg-primary-500 hover:bg-primary-600 text-white rounded-xl font-bold text-lg shadow-lg shadow-primary-500/30 transition transform hover:-translate-y-1 text-center">
                 🔍 Ücretsiz AI Muayene
              </Link>
              <Link to="/appointment" className="px-8 py-4 bg-white text-slate-900 hover:bg-gray-100 rounded-xl font-bold text-lg shadow-lg transition transform hover:-translate-y-1 text-center">
                 📅 Randevu Al
              </Link>
            </div>
          </div>
          <div className="md:w-1/2 mt-12 md:mt-0 flex justify-center">
             <img src="https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?auto=format&fit=crop&q=80&w=600" alt="Happy Patient" className="rounded-full border-8 border-white/10 shadow-2xl w-80 h-80 md:w-96 md:h-96 object-cover" />
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-slate-900">Hizmetlerimiz</h2>
          <p className="text-gray-600 mt-2">Modern teknoloji ile ağrısız ve estetik çözümler.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {services.map((service) => (
            <div key={service.id} className="bg-white p-6 rounded-2xl shadow-sm hover:shadow-md transition border border-gray-100">
              <div className="w-12 h-12 bg-primary-100 text-primary-600 rounded-lg flex items-center justify-center mb-4 text-2xl">
                🦷
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">{service.name}</h3>
              <p className="text-gray-500 text-sm mb-4 line-clamp-2">{service.description}</p>
              <Link to="/pricing" className="text-primary-600 font-medium text-sm hover:underline">Fiyatları Gör &rarr;</Link>
            </div>
          ))}
        </div>
      </section>

      {/* Doctors Section */}
      <section className="bg-primary-50 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
             <h2 className="text-3xl font-bold text-slate-900">Uzman Kadromuz</h2>
             <p className="text-gray-600 mt-2">Alanında deneyimli hekimlerimizle tanışın.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {doctors.map((doctor) => (
              <div key={doctor.id} className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition duration-300 flex flex-col">
                <img src={doctor.image} alt={doctor.name} className="w-full h-64 object-cover" />
                <div className="p-6 flex-grow">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-xl font-bold text-slate-900">{doctor.name}</h3>
                    <div className="flex items-center bg-yellow-100 px-2 py-1 rounded text-yellow-700 text-xs font-bold">
                       ⭐ {doctor.averageRating || 5.0}
                    </div>
                  </div>
                  <p className="text-primary-600 font-medium mb-4">{doctor.specialty}</p>
                  <Link to="/appointment" className="block w-full py-2 border border-primary-600 text-primary-600 text-center rounded-lg font-medium hover:bg-primary-600 hover:text-white transition">
                    Randevu Al
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

       {/* Reviews Section */}
       <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-end mb-12">
          <div>
            <h2 className="text-3xl font-bold text-slate-900">Mutlu Hastalar</h2>
            <p className="text-gray-600 mt-2">Klinigimiz hakkında yapılan gerçek yorumlar.</p>
          </div>
          <button 
            onClick={() => setIsReviewModalOpen(true)}
            className="hidden md:block text-primary-600 font-bold hover:underline"
          >
            Yorum Yap +
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {reviews.map((review) => {
            const doc = doctors.find(d => d.id === review.doctorId);
            return (
              <div key={review.id} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <div className="flex text-yellow-400 mb-2">
                  {[...Array(5)].map((_, i) => (
                    <span key={i}>{i < review.rating ? '★' : '☆'}</span>
                  ))}
                </div>
                <p className="text-gray-700 italic mb-4">"{review.comment}"</p>
                <div className="flex justify-between items-center text-xs">
                   <span className="font-bold text-slate-900">- {review.patientName}</span>
                   <span className="text-gray-400">{doc ? `Dr. ${doc.name.split(' ')[1]}` : ''}</span>
                </div>
              </div>
            );
          })}
        </div>
        <div className="mt-8 text-center md:hidden">
           <button 
            onClick={() => setIsReviewModalOpen(true)}
            className="text-primary-600 font-bold hover:underline"
          >
            Yorum Yap +
          </button>
        </div>
      </section>

      {/* Map/Contact Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-3xl shadow-xl overflow-hidden grid grid-cols-1 md:grid-cols-2">
           <div className="p-10 flex flex-col justify-center space-y-6">
              <h2 className="text-3xl font-bold text-slate-900">Bize Ulaşın</h2>
              <div className="space-y-4">
                <div className="flex items-start">
                   <div className="bg-green-100 p-2 rounded-full mr-4 text-green-600">📱</div>
                   <div>
                     <p className="font-semibold">WhatsApp & Telefon</p>
                     <p className="text-gray-600">+90 (212) 555 00 00</p>
                     <button className="mt-2 text-sm text-green-600 font-bold">WhatsApp'tan Yaz &rarr;</button>
                   </div>
                </div>
                <div className="flex items-start">
                   <div className="bg-blue-100 p-2 rounded-full mr-4 text-blue-600">📍</div>
                   <div>
                     <p className="font-semibold">Adres</p>
                     <p className="text-gray-600">Merkez Mah. Abide-i Hürriyet Cad. No:123 Şişli/İstanbul</p>
                   </div>
                </div>
              </div>
           </div>
           <div className="h-80 md:h-auto bg-gray-200 relative">
             <img src="https://images.unsplash.com/photo-1596524430615-b46476ddff6e?auto=format&fit=crop&q=80&w=800" alt="Map Location" className="w-full h-full object-cover opacity-80" />
             <div className="absolute inset-0 flex items-center justify-center bg-black/20 text-white font-bold text-xl drop-shadow-md">
               Google Maps Konumu
             </div>
           </div>
        </div>
      </section>

      {/* Review Modal */}
      {isReviewModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
           <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-md">
              <h2 className="text-2xl font-bold mb-4">Deneyimini Paylaş</h2>
              <form onSubmit={handleReviewSubmit} className="space-y-4">
                 <div>
                   <label className="block text-sm font-medium mb-1">Hangi Doktor?</label>
                   <select 
                     className="w-full p-2 border rounded-lg"
                     required
                     value={reviewForm.doctorId}
                     onChange={(e) => setReviewForm({...reviewForm, doctorId: e.target.value})}
                   >
                     <option value="">Doktor Seçin</option>
                     {doctors.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                   </select>
                 </div>
                 <div>
                   <label className="block text-sm font-medium mb-1">Puanınız</label>
                   <div className="flex space-x-2">
                     {[1,2,3,4,5].map(star => (
                       <button 
                        type="button"
                        key={star} 
                        onClick={() => setReviewForm({...reviewForm, rating: star})}
                        className={`text-2xl ${reviewForm.rating >= star ? 'text-yellow-400' : 'text-gray-300'}`}
                       >★</button>
                     ))}
                   </div>
                 </div>
                 <div>
                   <label className="block text-sm font-medium mb-1">Adınız</label>
                   <input 
                     type="text" 
                     className="w-full p-2 border rounded-lg"
                     required
                     value={reviewForm.name}
                     onChange={(e) => setReviewForm({...reviewForm, name: e.target.value})}
                   />
                 </div>
                 <div>
                   <label className="block text-sm font-medium mb-1">Yorumunuz</label>
                   <textarea 
                     className="w-full p-2 border rounded-lg"
                     rows={3}
                     required
                     value={reviewForm.comment}
                     onChange={(e) => setReviewForm({...reviewForm, comment: e.target.value})}
                   ></textarea>
                 </div>
                 <div className="flex gap-2 justify-end pt-2">
                   <button 
                     type="button" 
                     onClick={() => setIsReviewModalOpen(false)}
                     className="px-4 py-2 text-gray-500 hover:text-gray-800"
                   >
                     İptal
                   </button>
                   <button 
                     type="submit" 
                     className="px-4 py-2 bg-primary-600 text-white rounded-lg font-bold"
                   >
                     Gönder
                   </button>
                 </div>
              </form>
           </div>
        </div>
      )}
    </div>
  );
};

export default Home;