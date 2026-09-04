const firebaseConfig = {
    apiKey: "AIzaSyBwrBwv5I9daQ97E10_uZB7ojfou_h1CDQ",
    authDomain: "attention-social.firebaseapp.com",
    projectId: "attention-social",
    storageBucket: "attention-social.firebasestorage.app",
    messagingSenderId: "811858803917",
    appId: "1:811858803917:web:5caa2486e694737e797d84"
};

firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();
const auth = firebase.auth();