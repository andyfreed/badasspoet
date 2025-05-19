'use client';

import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

interface ExampleItem {
  id: number;
  name: string;
  created_at: string;
}

export default function SupabaseExample() {
  const [data, setData] = useState<ExampleItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        // Replace 'examples' with your actual table name
        const { data, error } = await supabase
          .from('examples')
          .select('*');

        if (error) {
          throw error;
        }

        if (data) {
          setData(data);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
        setError('Failed to fetch data. Please check your Supabase configuration.');
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  // Check for connection issues with Supabase
  if (error) {
    return (
      <div className="supabase-example error">
        <h2>Supabase Connection</h2>
        <p className="error-message">{error}</p>
        <p>Make sure your .env.local file has the correct Supabase credentials.</p>
      </div>
    );
  }

  return (
    <div className="supabase-example">
      <h2>Supabase Connection</h2>
      {loading ? (
        <p>Loading data...</p>
      ) : data.length > 0 ? (
        <ul>
          {data.map((item) => (
            <li key={item.id}>{item.name}</li>
          ))}
        </ul>
      ) : (
        <p>
          No data found. Make sure you have:
          <ol>
            <li>Created a Supabase project</li>
            <li>Added your Supabase URL and anon key to .env.local</li>
            <li>Created an "examples" table with some data</li>
          </ol>
        </p>
      )}
    </div>
  );
} 