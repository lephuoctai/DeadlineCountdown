// Firebase Configuration
// Cấu hình Firebase project thực tế
export const firebaseConfig = {
    apiKey: "AIzaSyA6lRPc8F5ZDDM-YmoqwzoVanjh5vq0rhg",
    authDomain: "gamerankboard.firebaseapp.com",
    projectId: "gamerankboard",
    storageBucket: "gamerankboard.firebasestorage.app",
    messagingSenderId: "1068410694364",
    appId: "1:1068410694364:web:5e27a263a4818aa3e32219",
    measurementId: "G-LLXZPKHFGH"
};

// Firestore collection names
export const COLLECTIONS = {
    DEADLINES: 'deadlines',
    CHALLENGES: 'challenges'
};

// Default data structure
export const defaultDeadline = {
    name: 'Programming Challenge 2025',
    endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days from now
    startDate: new Date().toISOString(),
    isActive: true,
    description: 'Thử thách lập trình cuối năm',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
};

/*
Hướng dẫn cài đặt Firebase:

1. Tạo project mới tại https://console.firebase.google.com/
2. Kích hoạt Firestore Database
3. Tạo collection 'deadlines' 
4. Thay thế firebaseConfig ở trên với thông tin từ Firebase Console
5. Cấu hình rules cho Firestore:

rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /deadlines/{document} {
      allow read: if true;
      allow write: if true; // Trong production nên hạn chế quyền write
    }
  }
}
*/