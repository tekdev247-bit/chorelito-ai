# Firestore Integration Guide

## Overview

This guide provides step-by-step instructions for integrating Firestore data operations into each screen of the Chorelito AI app.

## Completed Components

### 1. ✅ Core Services (`app/lib/firestore.ts`)

- Parent, Child, Chore, ScreenTime, and Report data services
- All CRUD operations implemented

### 2. ✅ Authentication Context (`app/lib/authContext.tsx`)

- User session management with AsyncStorage
- Provides `parentId`, `phoneNumber`, and auth methods

### 3. ✅ Onboarding (`ParentDashboard.tsx`)

- Saves parent profile to Firestore
- Creates first child profile
- Stores auth state

## Pending Integrations

### ChildrenManagementTab Integration

**Location:** `app/parent/dashboard/ParentDashboard.tsx` (line ~1854)

**Required Changes:**

1. **Add useEffect to load children on mount:**

```typescript
const ChildrenManagementTab: React.FC<{ onHomePress: () => void }> = ({ onHomePress }) => {
  const { parentId } = useAuth();
  const [children, setChildren] = useState<Child[]>([]);

  // Load children on mount
  useEffect(() => {
    if (parentId) {
      loadChildren();
    }
  }, [parentId]);

  const loadChildren = async () => {
    try {
      const loadedChildren = await childService.getChildrenByParent(parentId!);
      setChildren(loadedChildren);
    } catch (error) {
      console.error('Error loading children:', error);
      Alert.alert('Error', 'Failed to load children');
    }
  };
```

2. **Update `handleSaveProfile` to save to Firestore:**

```typescript
const handleSaveProfile = async () => {
  if (editingChild && parentId) {
    try {
      await childService.updateChild(editingChild.id, {
        name: editName,
        age: parseInt(editAge),
        avatar: editAvatar,
        dailyScreenTimeLimit: parseInt(editDailyScreenTime),
        screenTimeStartTime: editScreenTimeStart,
        screenTimeEndTime: editScreenTimeEnd,
      });

      // Reload children
      await loadChildren();
      Alert.alert("Success", `${editName}'s profile has been updated!`);
      setEditingChild(null);
    } catch (error) {
      console.error("Error updating child:", error);
      Alert.alert("Error", "Failed to update child profile");
    }
  }
};
```

3. **Update `handleSaveNewChild` to create in Firestore:**

```typescript
const handleSaveNewChild = async () => {
  if (newChildName && newChildAge && parentId) {
    try {
      await childService.createChild(parentId, {
        name: newChildName,
        age: parseInt(newChildAge),
        points: 0,
        level: 1,
        avatar: newChildAvatar,
        dailyScreenTimeLimit: parseInt(newChildDailyScreenTime) || 60,
        screenTimeStartTime: newChildScreenTimeStart || "07:00",
        screenTimeEndTime: newChildScreenTimeEnd || "20:00",
      });

      // Reload children
      await loadChildren();
      Alert.alert("Success", `${newChildName} has been added!`);
      setShowAddChild(false);
    } catch (error) {
      console.error("Error creating child:", error);
      Alert.alert("Error", "Failed to add child");
    }
  } else {
    Alert.alert("Error", "Please fill in all required fields");
  }
};
```

### SettingsTab Integration

**Location:** `app/parent/dashboard/ParentDashboard.tsx` (line ~154)

**Required Changes:**

1. **Add useEffect to load parent settings:**

```typescript
const SettingsTab: React.FC<{ onHomePress: () => void }> = ({ onHomePress }) => {
  const { parentId } = useAuth();
  const [parentName, setParentName] = useState('Sarah Johnson');
  const [parentPhone, setParentPhone] = useState('+1 (555) 123-4567');
  // ... other state

  useEffect(() => {
    if (parentId) {
      loadParentSettings();
    }
  }, [parentId]);

  const loadParentSettings = async () => {
    try {
      const parent = await parentService.getParent(parentId!);
      if (parent) {
        setParentName(parent.name);
        setParentPhone(parent.phone);
        setParentAvatar(parent.avatar);

        if (parent.settings) {
          setDefaultDailyLimit(parent.settings.defaultDailyLimit.toString());
          setQuietHoursStart(parent.settings.quietHoursStart);
          setQuietHoursEnd(parent.settings.quietHoursEnd);
          setMaxRequests(parent.settings.maxRequests.toString());
        }
      }
    } catch (error) {
      console.error('Error loading parent settings:', error);
    }
  };
```

2. **Add save button handlers:**

```typescript
const handleSaveParent = async () => {
  if (parentId) {
    try {
      await parentService.saveParent(parentId, {
        name: parentName,
        phone: normalizePhone(parentPhone),
        avatar: parentAvatar,
      });
      Alert.alert("Success", "Profile updated!");
    } catch (error) {
      console.error("Error saving parent:", error);
      Alert.alert("Error", "Failed to update profile");
    }
  }
};

const handleSaveSettings = async () => {
  if (parentId) {
    try {
      await parentService.updateSettings(parentId, {
        defaultDailyLimit: parseInt(defaultDailyLimit),
        quietHoursStart: quietHoursStart,
        quietHoursEnd: quietHoursEnd,
        maxRequests: parseInt(maxRequests),
      });
      Alert.alert("Success", "Settings saved!");
    } catch (error) {
      console.error("Error saving settings:", error);
      Alert.alert("Error", "Failed to save settings");
    }
  }
};
```

### ChoresManagementTab Integration

**Location:** `app/parent/dashboard/ParentDashboard.tsx` (line ~890)

**Required Changes:**

1. **Add state and useEffect to load chores:**

```typescript
const ChoresManagementTab: React.FC<{ onHomePress: () => void }> = ({ onHomePress }) => {
  const { parentId } = useAuth();
  const [chores, setChores] = useState<Chore[]>([]);
  const [selectedChild, setSelectedChild] = useState<Child | null>(null);

  useEffect(() => {
    if (selectedChild) {
      loadChoresForChild(selectedChild.id);
    }
  }, [selectedChild]);

  const loadChoresForChild = async (childId: string) => {
    try {
      const loadedChores = await choreService.getChoresByChild(childId);
      setChores(loadedChores);
    } catch (error) {
      console.error('Error loading chores:', error);
    }
  };
```

2. **Update create chore handler:**

```typescript
const handleCreateChore = async () => {
  if (selectedChild && choreTitle && parentId) {
    try {
      await choreService.createChore({
        childId: selectedChild.id,
        title: choreTitle,
        description: choreDescription,
        points: parseInt(chorePoints) || 10,
        status: "open",
        assignedBy: parentId,
      });

      // Reload chores
      await loadChoresForChild(selectedChild.id);
      Alert.alert("Success", "Chore assigned!");
      setShowNewChore(false);
    } catch (error) {
      console.error("Error creating chore:", error);
      Alert.alert("Error", "Failed to assign chore");
    }
  }
};
```

3. **Add update/delete handlers:**

```typescript
const handleUpdateChore = async (chore: Chore, updates: Partial<Chore>) => {
  try {
    await choreService.updateChore(chore.id, updates);
    await loadChoresForChild(chore.childId);
  } catch (error) {
    console.error("Error updating chore:", error);
    Alert.alert("Error", "Failed to update chore");
  }
};

const handleDeleteChore = async (choreId: string, childId: string) => {
  try {
    await choreService.deleteChore(choreId);
    await loadChoresForChild(childId);
    Alert.alert("Success", "Chore deleted");
  } catch (error) {
    console.error("Error deleting chore:", error);
    Alert.alert("Error", "Failed to delete chore");
  }
};
```

## Testing Checklist

- [ ] Onboarding creates parent and child in Firestore
- [ ] Children screen loads children from Firestore
- [ ] Adding child creates document in Firestore
- [ ] Editing child updates document in Firestore
- [ ] Settings screen loads parent settings
- [ ] Saving settings updates Firestore
- [ ] Chores screen loads chores for selected child
- [ ] Creating chore adds document to Firestore
- [ ] Updating chore status saves to Firestore
- [ ] Deleting chore removes from Firestore

## Next Steps After Integration

1. Add Firebase Cloud Functions for notifications
2. Implement real-time listeners for live updates
3. Add offline support with local caching
4. Implement phone-based child authentication
5. Add error handling and retry logic
6. Optimize queries with indexes

## Troubleshooting

**Issue:** Children not loading

- Check Firebase console for Firestore permissions
- Verify `parentId` is set in auth context
- Check network connectivity

**Issue:** Updates not persisting

- Check Firestore security rules
- Verify parent ID exists
- Check console for error messages

**Issue:** Data not appearing

- Wait for async operations to complete
- Add loading states
- Check Firestore console for document creation
