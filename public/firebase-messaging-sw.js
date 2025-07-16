// public/firebase-messaging-sw.js

importScripts(
  "https://www.gstatic.com/firebasejs/9.10.0/firebase-app-compat.js"
);
importScripts(
  "https://www.gstatic.com/firebasejs/9.10.0/firebase-messaging-compat.js"
);

const firebaseConfig = {
  apiKey: "AIzaSyBk6Pfie86kdusvUX3PJXvuaDnNOu9IqTY",
  authDomain: "medical-care-a94cb.firebaseapp.com",
  projectId: "medical-care-a94cb",
  storageBucket: "medical-care-a94cb.firebasestorage.app",
  messagingSenderId: "808855333105",
  appId: "1:808855333105:web:7f6986b0a3cb85a0252150",
  measurementId: "G-YJRCV1YBLN",
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

// Retrieve Firebase Messaging instance
const messaging = firebase.messaging();

// Handle background messages
messaging.onBackgroundMessage((payload) => {
  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: "/logo.svg", // Optional: Custom notification icon
  };
  self.registration.showNotification(notificationTitle, notificationOptions);
});
