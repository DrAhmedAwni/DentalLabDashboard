import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://thdvkopgbjlfzirhgheo.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRoZHZrb3BnYmpsZnppcmhnaGVvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk1NTM2MDAsImV4cCI6MjA3NTEyOTYwMH0.SqpdwZhSApRlQNtGwV_x0SEekitpXtMJEMchFpfWqHE';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testConnection() {
    console.log('Node Version:', process.version);
    console.log('Fetch available:', typeof fetch !== 'undefined');

    try {
        // raw fetch test
        console.log('Attempting raw fetch...');
        const res = await fetch(`${supabaseUrl}/rest/v1/`, {
            headers: {
                'apikey': supabaseAnonKey,
                'Authorization': `Bearer ${supabaseAnonKey}`
            }
        });
        console.log('Raw fetch status:', res.status, res.statusText);
        const text = await res.text();
        console.log('Raw fetch body preview:', text.slice(0, 100));

        // Raw Table Test
        console.log('Attempting raw fetch to cases table...');
        const tableRes = await fetch(`${supabaseUrl}/rest/v1/cases?select=*&limit=1`, {
            headers: {
                'apikey': supabaseAnonKey,
                'Authorization': `Bearer ${supabaseAnonKey}`
            }
        });
        console.log('Table fetch status:', tableRes.status, tableRes.statusText);
        const tableText = await tableRes.text();
        console.log('Table fetch body:', tableText);

        // Client test
        console.log('Testing Supabase Client...');
        const { count, error } = await supabase
            .from('cases')
            .select('*', { count: 'exact', head: true });

        if (error) {
            console.error('Client Connection Failed:', JSON.stringify(error, null, 2));
        } else {
            console.log('Client Connection Successful!');
            console.log(`Found ${count} records in 'cases' table.`);
        }
    } catch (err) {
        console.error('Unexpected Error:', err);
    }
}

testConnection();
