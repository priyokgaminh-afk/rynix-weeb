import React, { useEffect, useState } from "react";

export default function App() {
  const [user, setUser] = useState(null);
  const [username, setUsername] = useState("");
  const [title, setTitle] = useState("");
  const [price, setPrice] = useState("");
  const [file, setFile] = useState(null);
  const [items, setItems] = useState([]);
  const [msg, setMsg] = useState("");

  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem("ue_items") || "[]");
    setItems(saved);
    const u = JSON.parse(localStorage.getItem("ue_user") || "null");
    setUser(u);
  }, []);

  useEffect(() => {
    localStorage.setItem("ue_items", JSON.stringify(items));
  }, [items]);

  useEffect(() => {
    localStorage.setItem("ue_user", JSON.stringify(user));
  }, [user]);

  function signUp(e) {
    e.preventDefault();
    if (!username.trim()) return setMsg("Enter username");
    setUser({ username: username.trim(), id: Date.now() });
    setUsername("");
    setMsg("Signed up");
  }

  function signOut() {
    setUser(null);
    setMsg("Signed out");
  }

  function handleFile(e) {
    setFile(e.target.files?.[0] ?? null);
  }

  function isForbidden(title, f) {
    const lower = (title || "").toLowerCase();
    const forbidden = ["illegal", "piracy", "malware", "weapon", "bomb"];
    if (forbidden.some(w => lower.includes(w))) return true;
    if (f && /\.(exe|bat|sh|js)$/i.test(f.name)) return true;
    return false;
  }

  function upload(e) {
    e.preventDefault();
    setMsg("");
    if (!user) return setMsg("Sign up first");
    if (!title.trim()) return setMsg("Add title");
    if (!file) return setMsg("Choose a file");
    if (isForbidden(title, file)) return setMsg("Upload blocked");

    const reader = new FileReader();
    reader.onload = () => {
      const newItem = {
        id: Date.now(),
        owner: user.username,
        title,
        price: Number(price) || 0,
        filename: file.name,
        preview: reader.result?.toString().slice(0, 200),
        createdAt: new Date().toISOString(),
        sold: false
      };
      setItems(prev => [newItem, ...prev]);
      setTitle("");
      setPrice("");
      setFile(null);
      setMsg("Uploaded (demo). Stored in your browser.");

      const el = document.querySelector('input[type=\"file\"]');
      if (el) el.value = "";
    };
    reader.readAsDataURL(file.slice(0, 100000));
  }

  function buy(id) {
    setItems(prev =>
      prev.map(it => (it.id === id ? { ...it, sold: true } : it))
    );
    setMsg("Purchase simulated");
  }

  function del(id) {
    setItems(prev => prev.filter(it => it.id !== id));
  }

  return (
    <div className="wrap">
      <h1>Rynix Web — Upload & Earn (Demo)</h1>

      {/* Sign up */}
      {!user ? (
        <form onSubmit={signUp} className="row">
          <input
            value={username}
            onChange={e => setUsername(e.target.value)}
            placeholder="Username"
          />
          <button>Sign up</button>
        </form>
      ) : (
        <div className="row">
          <span>Signed in as <b>{user.username}</b></span>
          <button onClick={signOut}>Sign out</button>
        </div>
      )}

      {/* Upload */}
      <div className="card">
        <h2>Upload Item</h2>
        <form onSubmit={upload} className="col">
          <input
            value={title}
            onChange={e => setTitle(e.target.value)}
            placeholder="Title"
          />
          <input type="file" onChange={handleFile} />
          <input
            value={price}
            onChange={e => setPrice(e.target.value)}
            placeholder="Price"
          />
          <button>Upload</button>
        </form>
      </div>

      {msg && <p className="msg">{msg}</p>}

      {/* Items */}
      <div className="card">
        <h2>Marketplace</h2>
        {items.length === 0 && <p>No items yet.</p>}
        {items.map(it => (
          <div key={it.id} className="item">
            <div>
              <b>{it.title}</b> — {it.filename} — ${it.price}
            </div>
            <div>
              {!it.sold ? (
                <button onClick={() => buy(it.id)}>Buy</button>
              ) : (
                <button disabled>Sold</button>
              )}
              {user?.username === it.owner && (
                <button className="danger" onClick={() => del(it.id)}>Delete</button>
              )}
            </div>
          </div>
        ))}
      </div>

      <footer>Demo only — no real upload or payment yet.</footer>
    </div>
  );
          }
