import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-app.js";
import {
  getFirestore,
  doc,
  getDoc,
  updateDoc,
  increment
} from "https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyBwwudVMsy-dm2qPEwnNcXRUk23orQe4FE",
  authDomain: "joreik.firebaseapp.com",
  projectId: "joreik",
  storageBucket: "joreik.firebasestorage.app",
  messagingSenderId: "1052686026465",
  appId: "1:1052686026465:web:5d5e663fc6848e62dad9a0",
  measurementId: "G-0X3Z007DJM"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const counterRef = doc(db, "stats", "views");

async function updateViews() {
  const visitorCount = document.getElementById("visitor-count");

  try {
    const alreadyCounted = localStorage.getItem("joreik_viewed");

    if (!alreadyCounted) {
      await updateDoc(counterRef, {
        count: increment(1)
      });

      localStorage.setItem("joreik_viewed", "true");
    }

    const snapshot = await getDoc(counterRef);
    const count = snapshot.data()?.count || 0;

    visitorCount.textContent = Number(count).toLocaleString();
  } catch (err) {
    console.error("Counter error:", err);
    visitorCount.textContent = "0";
  }
}

updateViews();
