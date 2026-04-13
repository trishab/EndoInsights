import Head from 'next/head';
import { useState, useEffect } from 'react';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../lib/firebase';
import DoctorCard from '../components/DoctorCard';
import SearchBar from '../components/SearchBar';

export default function Home() {
  const [doctors, setDoctors] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [queryText, setQueryText] = useState('');
  const [counts, setCounts] = useState({});

  useEffect(() => {
    const fetchDoctors = async () => {
      const q = query(collection(db, 'doctors'), where('approved', '==', true));
      const snap = await getDocs(q);
      const list = snap.docs.map(doc => doc.data());

      const byState = {};
      list.forEach(doc => {
        const state = doc.state || 'Unknown';
        byState[state] = (byState[state] || 0) + 1;
      });

      setCounts(byState);
      setDoctors(list);
      setFiltered(list);
    };

    fetchDoctors();
  }, []);

  useEffect(() => {
    const lower = queryText.toLowerCase();
    const filteredList = doctors.filter(doc =>
      (doc.name || '').toLowerCase().includes(lower) ||
      (doc.city || '').toLowerCase().includes(lower) ||
      (doc.state || '').toLowerCase().includes(lower)
    );
    setFiltered(filteredList);
  }, [queryText, doctors]);

  return (
    <div className="p-6">
      <Head>
        <title>Doctor Directory</title>
      </Head>
      <h1 className="text-2xl font-bold mb-4">Doctor Directory</h1>

      <SearchBar query={queryText} onChange={(e) => setQueryText(e.target.value)} />

      <div className="mt-4">
        <h2 className="font-semibold">Doctors by Region</h2>
        <ul className="text-sm text-gray-600">
          {Object.entries(counts).map(([state, count]) => (
            <li key={state}>{state}: {count}</li>
          ))}
        </ul>
      </div>

      <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((doctor, i) => (
          <DoctorCard key={i} doctor={doctor} />
        ))}
      </div>
    </div>
  );
}
