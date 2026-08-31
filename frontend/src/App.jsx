import React, { useState, useEffect } from 'react';
import Login from './pages/login';
import ValidationPage from './pages/ValidationDashboard';
import AdminDashboard from './pages/AdminDashboard';


// // TODO Step berikutnya: ganti dengan AdminDashboard sesungguhnya
// function AdminPlaceholder({ user, onLogout }) {
//   return (
//     <div className="min-h-screen flex flex-col items-center justify-center gap-4">
//       <p className="text-lg">Login sebagai admin: <b>{user.username}</b> (Admin panel: coming next step)</p>
//       <button onClick={onLogout} className="px-4 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800">
//         Logout
//       </button>
//     </div>
//   );
// }

export default function App() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    try {
      const storedUser = localStorage.getItem('val_user');
      if (storedUser) {
        const parsed = JSON.parse(storedUser);
        if (parsed && parsed.username) {
          setUser(parsed);
        } else {
          localStorage.removeItem('val_user');
        }
      }
    } catch (e) {
      console.error('Gagal membaca session tersimpan', e);
      localStorage.removeItem('val_user');
    }
  }, []);

  const handleLogin = (userData) => {
    setUser(userData);
    localStorage.setItem('val_user', JSON.stringify(userData));
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('val_user');
  };

  if (!user) {
    return <Login onLogin={handleLogin} />;
  }

  return user.role === 'admin' ? (
    <AdminDashboard user={user} onLogout={handleLogout} />
  ) : (
    <ValidationPage user={user} onLogout={handleLogout} />
  );
}

// import React, { useState, useEffect } from 'react';
// import Login from './pages/Login';

// // TODO Step 8: ganti placeholder ini dengan ValidationDashboard (Sudah/Belum/Semua Laporan)
// // TODO Step berikutnya: buat AdminDashboard untuk role admin
// function PlaceholderDashboard({ user, onLogout }) {
//   return (
//     <div className="min-h-screen flex flex-col items-center justify-center gap-4">
//       <p className="text-lg">
//         Login berhasil sebagai <b>{user.username}</b> (role: {user.role})
//       </p>
//       <button
//         onClick={onLogout}
//         className="px-4 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800"
//       >
//         Logout
//       </button>
//     </div>
//   );
// }

// export default function App() {
//   const [user, setUser] = useState(null);

//   useEffect(() => {
//     try {
//       const storedUser = localStorage.getItem('val_user');
//       if (storedUser) {
//         const parsed = JSON.parse(storedUser);
//         if (parsed && parsed.username) {
//           setUser(parsed);
//         } else {
//           localStorage.removeItem('val_user');
//         }
//       }
//     } catch (e) {
//       console.error('Gagal membaca session tersimpan', e);
//       localStorage.removeItem('val_user');
//     }
//   }, []);

//   const handleLogin = (userData) => {
//     setUser(userData);
//     localStorage.setItem('val_user', JSON.stringify(userData));
//   };

//   const handleLogout = () => {
//     setUser(null);
//     localStorage.removeItem('val_user');
//   };

//   if (!user) {
//     return <Login onLogin={handleLogin} />;
//   }

//   return <PlaceholderDashboard user={user} onLogout={handleLogout} />;
// }

// import { useState } from 'react'
// import reactLogo from './assets/react.svg'
// import viteLogo from './assets/vite.svg'
// import heroImg from './assets/hero.png'
// import './App.css'

// function App() {
//   const [count, setCount] = useState(0)

//   return (
//     <>
//       <section id="center">
//         <div className="hero">
//           <img src={heroImg} className="base" width="170" height="179" alt="" />
//           <img src={reactLogo} className="framework" alt="React logo" />
//           <img src={viteLogo} className="vite" alt="Vite logo" />
//         </div>
//         <div>
//           <h1>Get started</h1>
//           <p>
//             Edit <code>src/App.jsx</code> and save to test <code>HMR</code>
//           </p>
//         </div>
//         <button
//           type="button"
//           className="counter"
//           onClick={() => setCount((count) => count + 1)}
//         >
//           Count is {count}
//         </button>
//       </section>

//       <div className="ticks"></div>

//       <section id="next-steps">
//         <div id="docs">
//           <svg className="icon" role="presentation" aria-hidden="true">
//             <use href="/icons.svg#documentation-icon"></use>
//           </svg>
//           <h2>Documentation</h2>
//           <p>Your questions, answered</p>
//           <ul>
//             <li>
//               <a href="https://vite.dev/" target="_blank">
//                 <img className="logo" src={viteLogo} alt="" />
//                 Explore Vite
//               </a>
//             </li>
//             <li>
//               <a href="https://react.dev/" target="_blank">
//                 <img className="button-icon" src={reactLogo} alt="" />
//                 Learn more
//               </a>
//             </li>
//           </ul>
//         </div>
//         <div id="social">
//           <svg className="icon" role="presentation" aria-hidden="true">
//             <use href="/icons.svg#social-icon"></use>
//           </svg>
//           <h2>Connect with us</h2>
//           <p>Join the Vite community</p>
//           <ul>
//             <li>
//               <a href="https://github.com/vitejs/vite" target="_blank">
//                 <svg
//                   className="button-icon"
//                   role="presentation"
//                   aria-hidden="true"
//                 >
//                   <use href="/icons.svg#github-icon"></use>
//                 </svg>
//                 GitHub
//               </a>
//             </li>
//             <li>
//               <a href="https://chat.vite.dev/" target="_blank">
//                 <svg
//                   className="button-icon"
//                   role="presentation"
//                   aria-hidden="true"
//                 >
//                   <use href="/icons.svg#discord-icon"></use>
//                 </svg>
//                 Discord
//               </a>
//             </li>
//             <li>
//               <a href="https://x.com/vite_js" target="_blank">
//                 <svg
//                   className="button-icon"
//                   role="presentation"
//                   aria-hidden="true"
//                 >
//                   <use href="/icons.svg#x-icon"></use>
//                 </svg>
//                 X.com
//               </a>
//             </li>
//             <li>
//               <a href="https://bsky.app/profile/vite.dev" target="_blank">
//                 <svg
//                   className="button-icon"
//                   role="presentation"
//                   aria-hidden="true"
//                 >
//                   <use href="/icons.svg#bluesky-icon"></use>
//                 </svg>
//                 Bluesky
//               </a>
//             </li>
//           </ul>
//         </div>
//       </section>

//       <div className="ticks"></div>
//       <section id="spacer"></section>
//     </>
//   )
// }

// export default App
