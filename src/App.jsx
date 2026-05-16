import { useEffect, useState } from 'react';
import * as liff from '@line/liff';
import axios from 'axios';
import './App.css'; // Import our new CSS

const GAS_URL = import.meta.env.VITE_GAS_URL;
const LIFF_ID = import.meta.env.VITE_LIFF_ID;

function App() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [latestLog, setLatestLog] = useState(null);
  const [form, setForm] = useState({ leftAC: 'OFF', rightAC: 'OFF' });

  useEffect(() => {
    initLiff();
    fetchLatestLog();
  }, []);

  async function initLiff() {
    try {
      await liff.init({ liffId: LIFF_ID });
      if (!liff.isLoggedIn()) {
        liff.login();
      } else {
        const userProfile = await liff.getProfile();
        setProfile(userProfile);
      }
    } catch (err) {
      console.error("LIFF Error", err);
    } finally {
      setLoading(false);
    }
  }

  async function fetchLatestLog() {
    try {
      const res = await axios.get(GAS_URL);
      setLatestLog(res.data);
    } catch (err) {
      console.error("Fetch Error", err);
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = {
        userName: profile.displayName,
        leftAC: form.leftAC,
        rightAC: form.rightAC
      };
      await axios.post(GAS_URL, payload);
      alert("Log Saved!");
      await fetchLatestLog();
      setForm({ leftAC: 'OFF', rightAC:'OFF' });
    } catch (err) {
      console.error("Detailed Error:", err);
      alert("Error saving log");
    } finally {
      setLoading(false);
    }
  }

  if (loading && !profile) return <div className="loading">Loading...</div>;

  return (
    <div className="container">
      <header>
        <h1>AC Control Log</h1>
        {profile && (
          <div className="user-profile">
            👤 {profile.displayName}
          </div>
        )}
      </header>

      {/* Status Card */}
      <div className="card">
        <div className="card-title">Latest Status</div>
        {latestLog ? (
          <>
            <div className="status-row">
              <span className="status-label">Left AC</span>
              <span className={`status-value ${latestLog.leftAC === 'ON' ? 'on' : 'off'}`}>
                {latestLog.leftAC}
              </span>
            </div>
            <div className="status-row">
              <span className="status-label">Right AC</span>
              <span className={`status-value ${latestLog.rightAC === 'ON' ? 'on' : 'off'}`}>
                {latestLog.rightAC}
              </span>
            </div>
            <div className="timestamp">
              Updated by {latestLog.userName} <br/>
              {new Date(latestLog.timestamp).toLocaleString()}
            </div>
          </>
        ) : (
          <p className="status-label">No logs found.</p>
        )}
      </div>

      {/* Action Card */}
      <div className="card">
        <form onSubmit={handleSubmit}>
          <div className="card-title">Update Units</div>
          <div className="toggle-group">
            <div className="toggle-item">
              <p>Left</p>
              <button
                type="button"
                className={`toggle-btn ${form.leftAC === 'ON' ? 'active' : 'inactive'}`}
                onClick={() => setForm({...form, leftAC: form.leftAC === 'ON' ? 'OFF' : 'ON'})}
              >
                {form.leftAC}
              </button>
            </div>

            <div className="toggle-item">
              <p>Right</p>
              <button
                type="button"
                className={`toggle-btn ${form.rightAC === 'ON' ? 'active' : 'inactive'}`}
                onClick={() => setForm({...form, rightAC: form.rightAC === 'ON' ? 'OFF' : 'ON'})}
              >
                {form.rightAC}
              </button>
            </div>
          </div>

          <button type="submit" className="submit-btn" disabled={loading}>
            {loading ? "Processing..." : "Submit Changes"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default App;
