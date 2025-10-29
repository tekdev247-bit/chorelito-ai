// app/lib/firestore.ts
import { db } from './firebase';
import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  setDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy,
  addDoc,
  Timestamp,
  serverTimestamp 
} from 'firebase/firestore';

// Types
export interface Parent {
  id: string;
  name: string;
  phone: string;
  avatar: string;
  role: 'parent';
  createdAt: Timestamp;
  updatedAt: Timestamp;
  settings: {
    defaultDailyLimit: number;
    quietHoursStart: string;
    quietHoursEnd: string;
    maxRequests: number;
  };
}

export interface Child {
  id: string;
  parentId: string;
  firstName: string;
  age: number;
  points: number;
  level: number;
  avatar: string;
  dailyScreenTimeLimit: number;
  screenTimeStartTime: string;
  screenTimeEndTime: string;
  phone?: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface FamilyChore {
  id: string;
  parentId: string;
  name: string;
  icon: string;
  points: number;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface Chore {
  id: string;
  parentId: string;
  childId: string;
  familyChoreId: string;
  status: 'pending' | 'completed' | 'approved' | 'rejected';
  dateAssigned: string; // YYYY-MM-DD
  dateCompleted?: string; // YYYY-MM-DD
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface ScreenTimeEntry {
  id: string;
  childId: string;
  date: string; // YYYY-MM-DD
  usedMinutes: number;
  budgetMinutes: number;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface Report {
  id: string;
  childId: string;
  weekOf: string; // YYYY-MM-DD
  choresCompleted: number;
  choresTotal: number;
  pointsEarned: number;
  screenTimeUsed: number;
  screenTimeAllowed: number;
  achievements: string[];
  createdAt: Timestamp;
}

// Parent operations
export const parentService = {
  // Create or update parent
  async saveParent(parentId: string, data: Partial<Parent>): Promise<string> {
    const parentRef = doc(db, 'parents', parentId);
    const existingDoc = await getDoc(parentRef);
    
    if (existingDoc.exists()) {
      await updateDoc(parentRef, {
        ...data,
        updatedAt: serverTimestamp(),
      });
    } else {
      await setDoc(parentRef, {
        id: parentId,
        role: 'parent',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        ...data,
      });
    }
    
    return parentId;
  },

  // Get parent
  async getParent(parentId: string): Promise<Parent | null> {
    const parentRef = doc(db, 'parents', parentId);
    const parentSnap = await getDoc(parentRef);
    
    if (parentSnap.exists()) {
      return { id: parentSnap.id, ...parentSnap.data() } as Parent;
    }
    return null;
  },

  // Update parent settings
  async updateSettings(parentId: string, settings: Partial<Parent['settings']>): Promise<void> {
    const parentRef = doc(db, 'parents', parentId);
    await updateDoc(parentRef, {
      'settings': settings,
      updatedAt: serverTimestamp(),
    });
  },

  // Find parent by phone
  async findByPhone(phone: string): Promise<Parent | null> {
    const parentsRef = collection(db, 'parents');
    const q = query(parentsRef, where('phone', '==', phone));
    const querySnapshot = await getDocs(q);
    
    if (!querySnapshot.empty) {
      const doc = querySnapshot.docs[0];
      return { id: doc.id, ...doc.data() } as Parent;
    }
    return null;
  }
};

// Child operations
export const childService = {
  // Create child
  async createChild(parentId: string, childData: Omit<Child, 'id' | 'parentId' | 'createdAt' | 'updatedAt'>): Promise<string> {
    const childrenRef = collection(db, 'children');
    const docRef = await addDoc(childrenRef, {
      parentId,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      ...childData,
    });
    return docRef.id;
  },

  // Get child by ID
  async getChild(childId: string): Promise<Child | null> {
    const childRef = doc(db, 'children', childId);
    const childSnap = await getDoc(childRef);
    
    if (childSnap.exists()) {
      return { id: childSnap.id, ...childSnap.data() } as Child;
    }
    return null;
  },

  // Get all children for a parent
  async getChildrenByParent(parentId: string): Promise<Child[]> {
    const childrenRef = collection(db, 'children');
    const q = query(childrenRef, where('parentId', '==', parentId));
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as Child));
  },

  // Update child
  async updateChild(childId: string, updates: Partial<Child>): Promise<void> {
    const childRef = doc(db, 'children', childId);
    await updateDoc(childRef, {
      ...updates,
      updatedAt: serverTimestamp(),
    });
  },

  // Delete child
  async deleteChild(childId: string): Promise<void> {
    const childRef = doc(db, 'children', childId);
    await deleteDoc(childRef);
  },

  // Find child by phone (for child app login)
  async findByPhone(phone: string): Promise<Child | null> {
    const childrenRef = collection(db, 'children');
    const q = query(childrenRef, where('phone', '==', phone));
    const querySnapshot = await getDocs(q);
    
    if (!querySnapshot.empty) {
      const doc = querySnapshot.docs[0];
      return { id: doc.id, ...doc.data() } as Child;
    }
    return null;
  }
};

// Family Chore operations
export const familyChoreService = {
  // Create family chore
  async createFamilyChore(parentId: string, choreData: Omit<FamilyChore, 'id' | 'parentId' | 'createdAt' | 'updatedAt'>): Promise<string> {
    const familyChoresRef = collection(db, 'family_chores');
    const docRef = await addDoc(familyChoresRef, {
      parentId,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      ...choreData,
    });
    return docRef.id;
  },

  // Get family chore by ID
  async getFamilyChore(choreId: string): Promise<FamilyChore | null> {
    const choreRef = doc(db, 'family_chores', choreId);
    const choreSnap = await getDoc(choreRef);

    if (choreSnap.exists()) {
      return { id: choreSnap.id, ...choreSnap.data() } as FamilyChore;
    }
    return null;
  },

  // Get all family chores for a parent
  async getFamilyChoresByParent(parentId: string): Promise<FamilyChore[]> {
    const familyChoresRef = collection(db, 'family_chores');
    const q = query(familyChoresRef, where('parentId', '==', parentId), orderBy('createdAt', 'desc'));
    const querySnapshot = await getDocs(q);

    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as FamilyChore));
  },

  // Update family chore
  async updateFamilyChore(choreId: string, updates: Partial<FamilyChore>): Promise<void> {
    const choreRef = doc(db, 'family_chores', choreId);
    await updateDoc(choreRef, {
      ...updates,
      updatedAt: serverTimestamp(),
    });
  },

  // Delete family chore
  async deleteFamilyChore(choreId: string): Promise<void> {
    const choreRef = doc(db, 'family_chores', choreId);
    await deleteDoc(choreRef);
  },

  // Create default family chores for new parent
  async createDefaultFamilyChores(parentId: string): Promise<void> {
    const defaultChores = [
      { name: 'Make bed', points: 5, icon: '🛏️' },
      { name: 'Brush teeth', points: 3, icon: '🦷' },
      { name: 'Put away toys', points: 5, icon: '🧸' },
      { name: 'Feed pet', points: 8, icon: '🐶' },
      { name: 'Set table', points: 4, icon: '🍽️' },
      { name: 'Take out trash', points: 6, icon: '🗑️' },
      { name: 'Water plants', points: 4, icon: '🌱' },
      { name: 'Clean room', points: 10, icon: '🧹' },
      { name: 'Do homework', points: 15, icon: '📚' },
      { name: 'Help with dishes', points: 8, icon: '🍽️' },
    ];

    for (const chore of defaultChores) {
      await this.createFamilyChore(parentId, chore);
    }
  }
};

// Chore Assignment operations
export const choreService = {
  // Assign family chore to child
  async assignChore(parentId: string, childId: string, familyChoreId: string): Promise<string> {
    const choresRef = collection(db, 'chores');
    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD format
    
    const docRef = await addDoc(choresRef, {
      parentId,
      childId,
      familyChoreId,
      status: 'pending',
      dateAssigned: today,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    return docRef.id;
  },

  // Get chore by ID
  async getChore(choreId: string): Promise<Chore | null> {
    const choreRef = doc(db, 'chores', choreId);
    const choreSnap = await getDoc(choreRef);

    if (choreSnap.exists()) {
      return { id: choreSnap.id, ...choreSnap.data() } as Chore;
    }
    return null;
  },

  // Get assignments for a child
  async getChoresByChild(childId: string): Promise<Chore[]> {
    const choresRef = collection(db, 'chores');
    const q = query(choresRef, where('childId', '==', childId), orderBy('createdAt', 'desc'));
    const querySnapshot = await getDocs(q);

    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as Chore));
  },

  // Update chore status
  async updateChore(choreId: string, updates: Partial<Chore>): Promise<void> {
    const choreRef = doc(db, 'chores', choreId);
    await updateDoc(choreRef, {
      ...updates,
      updatedAt: serverTimestamp(),
    });
  },

  // Delete chore assignment
  async deleteChore(choreId: string): Promise<void> {
    const choreRef = doc(db, 'chores', choreId);
    await deleteDoc(choreRef);
  }
};

// Screen time operations
export const screenTimeService = {
  // Get or create screen time entry
  async getOrCreateEntry(childId: string, date: string): Promise<ScreenTimeEntry> {
    const id = `${childId}_${date}`;
    const entryRef = doc(db, 'screenTime', id);
    const entrySnap = await getDoc(entryRef);
    
    if (entrySnap.exists()) {
      return { id: entrySnap.id, ...entrySnap.data() } as ScreenTimeEntry;
    } else {
      // Create new entry
      const child = await childService.getChild(childId);
      if (!child) {
        throw new Error('Child not found');
      }
      
      await setDoc(entryRef, {
        childId,
        date,
        usedMinutes: 0,
        budgetMinutes: child.dailyScreenTimeLimit,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      
      return { id, childId, date, usedMinutes: 0, budgetMinutes: child.dailyScreenTimeLimit, createdAt: Timestamp.now(), updatedAt: Timestamp.now() } as ScreenTimeEntry;
    }
  },

  // Update screen time usage
  async updateUsage(childId: string, date: string, usedMinutes: number): Promise<void> {
    const id = `${childId}_${date}`;
    const entryRef = doc(db, 'screenTime', id);
    await updateDoc(entryRef, {
      usedMinutes,
      updatedAt: serverTimestamp(),
    });
  },

  // Grant bonus time
  async grantBonus(childId: string, date: string, bonusMinutes: number): Promise<void> {
    const entry = await this.getOrCreateEntry(childId, date);
    const newBudget = Math.min(entry.budgetMinutes + bonusMinutes, 240); // Cap at 4 hours
    
    const entryRef = doc(db, 'screenTime', entry.id);
    await updateDoc(entryRef, {
      budgetMinutes: newBudget,
      updatedAt: serverTimestamp(),
    });
  }
};

// Report operations
export const reportService = {
  // Get weekly report for child
  async getWeeklyReport(childId: string, weekOf: string): Promise<Report | null> {
    const reportsRef = collection(db, 'reports');
    const q = query(reportsRef, where('childId', '==', childId), where('weekOf', '==', weekOf));
    const querySnapshot = await getDocs(q);
    
    if (!querySnapshot.empty) {
      const doc = querySnapshot.docs[0];
      return { id: doc.id, ...doc.data() } as Report;
    }
    return null;
  },

  // Create or update report
  async saveReport(childId: string, weekOf: string, data: Partial<Report>): Promise<void> {
    const reportsRef = collection(db, 'reports');
    const q = query(reportsRef, where('childId', '==', childId), where('weekOf', '==', weekOf));
    const querySnapshot = await getDocs(q);
    
    if (!querySnapshot.empty) {
      // Update existing
      const reportRef = querySnapshot.docs[0].ref;
      await updateDoc(reportRef, data);
    } else {
      // Create new
      await addDoc(reportsRef, {
        childId,
        weekOf,
        choresCompleted: 0,
        choresTotal: 0,
        pointsEarned: 0,
        screenTimeUsed: 0,
        screenTimeAllowed: 0,
        achievements: [],
        createdAt: serverTimestamp(),
        ...data,
      });
    }
  }
};

// Utility function to generate unique IDs
export const generateUniqueId = (): string => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2, 9);
};

// Utility function to normalize phone numbers
export const normalizePhone = (phone: string): string => {
  // Remove all non-digit characters
  const digits = phone.replace(/\D/g, '');
  
  // If starts with 1, remove it (US/Canada)
  if (digits.length === 11 && digits[0] === '1') {
    return digits.substring(1);
  }
  
  return digits;
};
