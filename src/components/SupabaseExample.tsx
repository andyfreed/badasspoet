'use client';

import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { env } from '../lib/env';

interface ExampleItem {
  id: number;
  title: string;
  content: string;
  is_published: boolean;
  created_at: string;
}

export default function SupabaseExample() {
  const [data, setData] = useState<ExampleItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        // Check if environment variables are configured
        if (!env.isSupabaseConfigured()) {
          throw new Error('Supabase environment variables are not configured');
        }

        // Fetch data from the examples table
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
        if (error instanceof Error) {
          setError(error.message || 'Failed to fetch data');
        } else {
          setError('Failed to fetch data. Please check your Supabase configuration.');
        }
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  // Show environment variable status for debugging
  const EnvStatus = () => (
    <div className="env-status" style={{ marginTop: '20px', padding: '10px', backgroundColor: '#f8f9fa', borderRadius: '5px' }}>
      <h3>Environment Variables</h3>
      <p>NEXT_PUBLIC_SUPABASE_URL: {env.SUPABASE_URL || 'Not set'}</p>
      <p>NEXT_PUBLIC_SUPABASE_ANON_KEY: {env.SUPABASE_ANON_KEY ? 'Set' : 'Not set'}</p>
      <p><strong>Note:</strong> If using local development, restart your dev server after updating .env.local</p>
      
      <div style={{ marginTop: '15px' }}>
        <h4>Setup Instructions:</h4>
        <ol>
          <li>Create a <a href="https://supabase.com" target="_blank" rel="noopener noreferrer">Supabase</a> account and project</li>
          <li>Get your URL and Anon Key from the Supabase dashboard</li>
          <li>Create a <code>.env.local</code> file in your project root with:
            <pre style={{ background: '#f1f1f1', padding: '10px', marginTop: '5px' }}>
              NEXT_PUBLIC_SUPABASE_URL=your_supabase_url<br/>
              NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
            </pre>
          </li>
          <li>Restart your development server</li>
        </ol>
      </div>
    </div>
  );

  // Check for connection issues with Supabase
  if (error) {
    return (
      <div className="supabase-example error">
        <h2>Supabase Connection Error</h2>
        <p className="error-message" style={{ color: 'red' }}>{error}</p>
        <p>Make sure your .env.local file has the correct Supabase credentials.</p>
        <EnvStatus />
      </div>
    );
  }

  return (
    <div className="supabase-example">
      <h2>Supabase Connection</h2>
      {loading ? (
        <p>Loading data...</p>
      ) : data.length > 0 ? (
        <div>
          <h3>Data from Supabase:</h3>
          <ul>
            {data.map((item) => (
              <li key={item.id}>
                <strong>{item.title}</strong> {item.is_published ? '' : '(Draft)'} - <span>{item.content}</span>
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <div>
          <p>
            No data found. Make sure you have:
          </p>
          <ol>
            <li>Created a Supabase project</li>
            <li>Added your Supabase URL and anon key to .env.local</li>
            <li>Created an "examples" table with some data</li>
          </ol>
          <EnvStatus />
        </div>
      )}
    </div>
  );
} 