import { useEffect, useState } from 'react';
import liff from '@line/liff';
import './App.css';

function App() {
  const [liffState, setLiffState] = useState('Initializing...');
  const [profile, setProfile] = useState(null);
  const [acData, setAcData] = useState({ left: null, right: null });
  const [loading, setLoading] = useState(false);

  const GAS_URL = import.meta.env.VITE_GAS_URL;
  const LIFF_ID = import.meta.env.VITE_LIFF_ID;

  useEffect(() => {
    // 1. Initialize LIFF
    liff.init({ liffId: LIFF_ID })
      .then(() => {
        setLiffState('Connected');
        if (liff.isLoggedIn()) {
          liff.getProfile().then(p => setProfile(p));
           fetchStatus();
        } else {
          // Force login if running in external browser
          liff.login();
        }
      })
      .catch((err) => {
        console.error('LIFF Init Error:', err);
        setLiffState('Connection Failed');
      });

    // 2. Fetch Initial AC Status
   
  }, []);

 async function fetchStatus() {
  try {
    const res = await fetch(GAS_URL);
    const data = await res.json();
    setAcData(data);
  } catch (err) {
    console.error('Failed to fetch status', err);
  }
}

  const updateAC = async (target, action) => {
    setLoading(true);
    // Use system clock for the timestamp
    const timestamp = new Date().toLocaleString(); 
    const userName = profile ? profile.displayName : 'Unknown User';

    const payload = { target, action, user: userName, timestamp };

    try {
      // Send as plain text string to bypass GAS CORS preflight
      await fetch(GAS_URL, {
        method: 'POST',
        body: JSON.stringify(payload),
      });
      await fetchStatus(); // Refresh status after update
    } catch (err) {
      console.error('Failed to update log', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <header className="header">
        <h1>AC Control Log</h1>
        <div className={`status-badge ${liffState === 'Connected' ? 'success' : 'error'}`}>
          LIFF Status: {liffState}
        </div>
      </header>

      <div className="profile-section">
        <h3>User Account</h3>
        <p>{profile ? profile.displayName : 'Loading profile...'}</p>
      </div>

      <div className="status-grid">
        <div className="status-card">
          <h3>Left AC</h3>
          {acData.left ? (
            <ul>
              <li><strong>Status:</strong> {acData.left.status}</li>
              <li><strong>By:</strong> {acData.left.user}</li>
              <li><strong>Time:</strong> {acData.left.time}</li>
            </ul>
          ) : <p>Loading...</p>}
        </div>

        <div className="status-card">
          <h3>Right AC</h3>
          {acData.right ? (
            <ul>
              <li><strong>Status:</strong> {acData.right.status}</li>
              <li><strong>By:</strong> {acData.right.user}</li>
              <li><strong>Time:</strong> {acData.right.time}</li>
            </ul>
          ) : <p>Loading...</p>}
        </div>
      </div>

      <div className="control-panel">
        <h3>Update Status Log</h3>
        <div className="button-group">
          <div className="control-column">
            <h4>Left</h4>
            <button className="btn btn-on" disabled={loading} onClick={() => updateAC('LEFT', 'ON')}>Turn ON</button>
            <button className="btn btn-off" disabled={loading} onClick={() => updateAC('LEFT', 'OFF')}>Turn OFF</button>
          </div>
          
          <div className="control-column">
            <h4>Both</h4>
            <button className="btn btn-on" disabled={loading} onClick={() => updateAC('BOTH', 'ON')}>Turn ON</button>
            <button className="btn btn-off" disabled={loading} onClick={() => updateAC('BOTH', 'OFF')}>Turn OFF</button>
          </div>

          <div className="control-column">
            <h4>Right</h4>
            <button className="btn btn-on" disabled={loading} onClick={() => updateAC('RIGHT', 'ON')}>Turn ON</button>
            <button className="btn btn-off" disabled={loading} onClick={() => updateAC('RIGHT', 'OFF')}>Turn OFF</button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;