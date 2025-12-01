import React, { useState, useEffect } from 'react';
import { db } from '../services/db';
import { Link } from 'react-router-dom';
import { Service } from '../types';

const PricingPage: React.FC = () => {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedServices, setSelectedServices] = useState<string[]>([]);

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const data = await db.getServices();
        setServices(data);
      } catch (error) {
        console.error("Hizmetler yüklenirken hata oluştu:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchServices();
  }, []);

  const toggleService = (id: string) => {
    if (selectedServices.includes(id)) {
      setSelectedServices(selectedServices.filter(s => s !== id));
    } else {
      setSelectedServices([...selectedServices, id]);
    }
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin text-4xl">🦷</div></div>;
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-12">
      <div className="text-center mb-12">
        <h1 className="text-3xl font-bold text-slate-900">Tedavi Ücretleri & Hesaplama</h1>
        <p className="text-gray-600 mt-2">Şeffaf fiyat politikası ile sürpriz ödemelere son.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-4">
          {services.map(service => (
             <div 
               key={service.id} 
               className={`p-5 rounded-xl border-2 cursor-pointer transition flex items-center justify-between ${selectedServices.includes(service.id) ? 'border-primary-500 bg-primary-50' : 'border-gray-100 bg-white hover:border-primary-200'}`}
               onClick={() => toggleService(service.id)}
             >
                <div>
                   <h3 className="font-bold text-lg text-slate-800">{service.name}</h3>
                   <p className="text-sm text-gray-500">{service.duration} • {service.description}</p>
                </div>
                <div className="text-right">
                   <p className="font-bold text-primary-700">{service.priceRange}</p>
                   {selectedServices.includes(service.id) && <span className="text-xs text-green-600 font-bold">✓ Seçildi</span>}
                </div>
             </div>
          ))}
        </div>

        <div className="lg:col-span-1">
           <div className="bg-white p-6 rounded-2xl shadow-lg sticky top-24">
              <h2 className="text-xl font-bold mb-4 border-b pb-2">Tahmini Tutar</h2>
              {selectedServices.length === 0 ? (
                <p className="text-gray-400 text-sm">Hesaplamak için listeden işlem seçin.</p>
              ) : (
                <div className="space-y-4">
                  <ul className="space-y-2">
                    {selectedServices.map(id => {
                      const s = services.find(x => x.id === id);
                      return (
                        <li key={id} className="flex justify-between text-sm text-gray-600">
                          <span>{s?.name}</span>
                          <span className="font-medium">{s?.priceRange}</span>
                        </li>
                      );
                    })}
                  </ul>
                  <div className="bg-yellow-50 p-3 rounded text-xs text-yellow-800">
                    *Fiyatlar tahmini aralıktır. Kesin fiyat muayene sonrası belirlenir.
                  </div>
                  <Link to="/appointment" className="block w-full bg-primary-600 text-white text-center py-3 rounded-lg font-bold hover:bg-primary-700">
                    Seçilenler İçin Randevu Al
                  </Link>
                </div>
              )}
           </div>
        </div>
      </div>
    </div>
  );
};

export default PricingPage;