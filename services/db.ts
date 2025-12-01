
import { 
  collection, 
  getDocs, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  query, 
  where,
  getDoc,
  setDoc
} from 'firebase/firestore';
import { firestore } from './firebase';
import { Doctor, Service, Appointment, AIAnalysisLog, Review, AdminUser } from '../types';

// Seed Data (Veritabanı boşsa yüklenecek ilk veriler)
const SEED_DOCTORS: Omit<Doctor, 'id'>[] = [
  { name: 'Dr. Ahmet Yılmaz', specialty: 'Çene Cerrahisi', image: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=300', availableDays: [1, 2, 3, 4, 5], averageRating: 4.8 },
  { name: 'Dr. Ayşe Demir', specialty: 'Ortodonti', image: 'https://images.unsplash.com/photo-1594824476967-48c8b964273f?auto=format&fit=crop&q=80&w=300', availableDays: [1, 3, 5], averageRating: 4.9 },
  { name: 'Dr. Mehmet Öz', specialty: 'Pedodonti (Çocuk)', image: 'https://images.unsplash.com/photo-1537368910025-700350fe46c7?auto=format&fit=crop&q=80&w=300', availableDays: [2, 4, 6], averageRating: 4.7 },
  { name: 'Dr. Elif Kaya', specialty: 'Estetik Diş Hekimliği', image: 'https://images.unsplash.com/photo-1651008376811-b90baee60c1f?auto=format&fit=crop&q=80&w=300', availableDays: [1, 2, 4, 5], averageRating: 5.0 },
];

const SEED_SERVICES: Omit<Service, 'id'>[] = [
  { name: 'Diş Beyazlatma', priceRange: '2000 - 3500 TL', duration: '45 dk', description: 'Lazerle profesyonel diş beyazlatma işlemi.' },
  { name: 'İmplant Tedavisi', priceRange: '15000 - 25000 TL', duration: '60 dk', description: 'Titanyum vida ile eksik diş telafisi.' },
  { name: 'Kanal Tedavisi', priceRange: '3000 - 5000 TL', duration: '90 dk', description: 'Enfekte sinirlerin temizlenmesi ve doldurulması.' },
  { name: 'Diş Taşı Temizliği', priceRange: '1000 - 1500 TL', duration: '30 dk', description: 'Ultrasonik cihazlarla plak ve taş temizliği.' },
  { name: 'Zirkonyum Kaplama', priceRange: '4000 - 6000 TL', duration: '120 dk', description: 'Estetik ve dayanıklı porselen kaplama.' },
];

const COLLECTIONS = {
  DOCTORS: 'doctors',
  SERVICES: 'services',
  APPOINTMENTS: 'appointments',
  AI_LOGS: 'ai_logs',
  REVIEWS: 'reviews',
  ADMINS: 'admins'
};

export const db = {
  // --- Auth (Admin) ---
  authenticateAdmin: async (username: string, password: string): Promise<boolean> => {
    const colRef = collection(firestore, COLLECTIONS.ADMINS);
    const snapshot = await getDocs(colRef);

    // Eğer veritabanında hiç admin yoksa, varsayılan admin oluştur
    if (snapshot.empty) {
      console.log("Admin tablosu boş, varsayılan admin oluşturuluyor...");
      await addDoc(colRef, { username: 'admin', password: '12345' });
      return username === 'admin' && password === '12345';
    }

    // Basit eşleşme kontrolü (Gerçek uygulamada şifreler hashlenmelidir)
    const foundUser = snapshot.docs.find(doc => {
      const data = doc.data();
      return data.username === username && data.password === password;
    });

    return !!foundUser;
  },

  // --- Doctors ---
  getDoctors: async (): Promise<Doctor[]> => {
    const colRef = collection(firestore, COLLECTIONS.DOCTORS);
    const snapshot = await getDocs(colRef);
    
    // Eğer veritabanı boşsa, seed verilerini yükle
    if (snapshot.empty) {
      console.log("Veritabanı boş, doktorlar yükleniyor...");
      const promises = SEED_DOCTORS.map(docData => addDoc(colRef, docData));
      await Promise.all(promises);
      const newSnapshot = await getDocs(colRef);
      return newSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Doctor));
    }

    const doctors = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Doctor));
    
    // Ratingleri güncelle
    const reviews = await db.getReviews();
    return doctors.map(doc => {
      const docReviews = reviews.filter(r => r.doctorId === doc.id);
      const avg = docReviews.length > 0 
        ? docReviews.reduce((acc, curr) => acc + curr.rating, 0) / docReviews.length 
        : (doc.averageRating || 5.0);
      
      return { 
        ...doc, 
        averageRating: parseFloat(avg.toFixed(1)),
        reviews: docReviews 
      };
    });
  },
  
  addDoctor: async (doctor: Doctor) => {
    const { id, ...data } = doctor; // ID'yi firestore oluşturacak
    await addDoc(collection(firestore, COLLECTIONS.DOCTORS), data);
  },

  deleteDoctor: async (id: string) => {
    await deleteDoc(doc(firestore, COLLECTIONS.DOCTORS, id));
  },

  // --- Services ---
  getServices: async (): Promise<Service[]> => {
    const colRef = collection(firestore, COLLECTIONS.SERVICES);
    const snapshot = await getDocs(colRef);

    if (snapshot.empty) {
      console.log("Hizmetler yükleniyor...");
      const promises = SEED_SERVICES.map(svc => addDoc(colRef, svc));
      await Promise.all(promises);
      const newSnapshot = await getDocs(colRef);
      return newSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Service));
    }

    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Service));
  },
  
  addService: async (service: Service) => {
    const { id, ...data } = service;
    await addDoc(collection(firestore, COLLECTIONS.SERVICES), data);
  },

  deleteService: async (id: string) => {
    await deleteDoc(doc(firestore, COLLECTIONS.SERVICES, id));
  },

  // --- Appointments ---
  getAppointments: async (): Promise<Appointment[]> => {
    const snapshot = await getDocs(collection(firestore, COLLECTIONS.APPOINTMENTS));
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Appointment));
  },
  
  addAppointment: async (apt: Appointment) => {
    const colRef = collection(firestore, COLLECTIONS.APPOINTMENTS);
    
    // Çifte Randevu Kontrolü - BASİTLEŞTİRİLDİ
    const q = query(
      colRef, 
      where("doctorId", "==", apt.doctorId),
      where("date", "==", apt.date),
      where("time", "==", apt.time)
    );
    
    const snapshot = await getDocs(q);
    
    // Javascript tarafında iptal edilmemiş randevu var mı diye bakıyoruz
    const hasActiveAppointment = snapshot.docs.some(doc => doc.data().status !== 'cancelled');

    if (hasActiveAppointment) {
      throw new Error("Bu randevu saati maalesef doludur. Lütfen başka bir saat seçiniz.");
    }

    const { id, ...data } = apt;
    await addDoc(colRef, data);
  },
  
  updateAppointmentStatus: async (id: string, status: Appointment['status']) => {
    const docRef = doc(firestore, COLLECTIONS.APPOINTMENTS, id);
    await updateDoc(docRef, { status });
  },

  // Randevuyu tamamen silme fonksiyonu
  deleteAppointment: async (id: string) => {
    await deleteDoc(doc(firestore, COLLECTIONS.APPOINTMENTS, id));
  },

  // --- Patient Management ---
  getPatients: async () => {
    const snapshot = await getDocs(collection(firestore, COLLECTIONS.APPOINTMENTS));
    const appointments = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Appointment));
    
    const uniqueTCs = Array.from(new Set(appointments.map(a => a.patientTC)));
    
    return uniqueTCs.map(tc => {
      const patientApts = appointments.filter(a => a.patientTC === tc);
      if (patientApts.length === 0) return null;
      
      const latestInfo = patientApts[patientApts.length - 1];
      
      return {
        tc: tc,
        name: latestInfo.patientName,
        phone: latestInfo.patientPhone,
        age: latestInfo.patientAge,
        medicalHistory: latestInfo.medicalHistory,
        appointments: patientApts
      };
    }).filter(p => p !== null);
  },

  // --- AI Logs ---
  getAILogs: async (): Promise<AIAnalysisLog[]> => {
    const snapshot = await getDocs(collection(firestore, COLLECTIONS.AI_LOGS));
    const logs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as AIAnalysisLog));
    return logs.sort((a, b) => b.timestamp - a.timestamp);
  },
  
  addAILog: async (log: AIAnalysisLog) => {
    const { id, ...data } = log;
    await addDoc(collection(firestore, COLLECTIONS.AI_LOGS), data);
  },

  // --- Reviews ---
  getReviews: async (): Promise<Review[]> => {
    const snapshot = await getDocs(collection(firestore, COLLECTIONS.REVIEWS));
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Review));
  },

  addReview: async (review: Review) => {
    const { id, ...data } = review;
    await addDoc(collection(firestore, COLLECTIONS.REVIEWS), data);
  }
};
