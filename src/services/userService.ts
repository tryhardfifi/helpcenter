import { db } from "../lib/firebase";
import { doc, getDoc } from "firebase/firestore";

// Get user document with companyId
export const getUserCompanyId = async (userEmail) => {
  if (!userEmail) {
    console.warn("No user email provided to getUserCompanyId");
    return null;
  }

  try {
    const userRef = doc(db, "users", userEmail);
    const userSnap = await getDoc(userRef);

    if (userSnap.exists()) {
      const userData = userSnap.data();
      return userData.companyId || null;
    }

    console.warn(`User document not found for email: ${userEmail}`);
    return null;
  } catch (error) {
    console.error("Error fetching user companyId from Firestore:", error);
    return null;
  }
};

// Get full user document
export const getUserData = async (userEmail) => {
  if (!userEmail) {
    return null;
  }

  try {
    const userRef = doc(db, "users", userEmail);
    const userSnap = await getDoc(userRef);

    if (userSnap.exists()) {
      return { email: userEmail, ...userSnap.data() };
    }

    return null;
  } catch (error) {
    console.error("Error fetching user data from Firestore:", error);
    return null;
  }
};
