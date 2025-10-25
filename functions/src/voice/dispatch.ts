import * as admin from 'firebase-admin';
import * as functions from 'firebase-functions';
import { Intent, Entities } from './parseIntent';

type Payload = { intent: Intent; entities: Entities };

export const dispatch = functions.https.onCall(async (data: Payload, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'Sign in required.');
  }

  const uid = context.auth.uid;
  const { intent, entities } = data || {};

  if (!intent) {
    return { ok: false, say: 'I did not understand the command.' };
  }

  const db = admin.firestore();

  // Check user role - only parents can perform privileged actions
  const userDoc = await db.collection('users').doc(uid).get();
  const userRole = userDoc.data()?.role;
  
  if (!userRole) {
    throw new functions.https.HttpsError('permission-denied', 'User role not found.');
  }

  const isParent = userRole === 'parent';

  try {
    switch (intent) {
      case 'add_child':
        if (!isParent) {
          throw new functions.https.HttpsError('permission-denied', 'Only parents can add children.');
        }
        
        const childName = entities?.child || 'New Child';
        const phone = entities?.phone;
        
        if (!phone) {
          return { ok: false, say: 'Please provide a phone number for the child.' };
        }

        // Validate phone number format
        const cleanPhone = phone.replace(/\D/g, '');
        if (cleanPhone.length < 10) {
          return { ok: false, say: 'Please provide a valid phone number.' };
        }

        // Create pending invite with transaction
        const inviteResult = await db.runTransaction(async (tx) => {
          const inviteRef = db.collection('invites').doc();
          
          tx.set(inviteRef, {
            parentId: uid,
            childName,
            phone: cleanPhone,
            status: 'pending',
            createdAt: admin.firestore.FieldValue.serverTimestamp()
          });

          // Write audit event
          const auditRef = db.collection('events').doc();
          tx.set(auditRef, {
            type: 'child_invite_created',
            actorId: uid,
            payload: { childName, phone: cleanPhone, inviteId: inviteRef.id },
            createdAt: admin.firestore.FieldValue.serverTimestamp()
          });

          return { inviteId: inviteRef.id };
        });

        return { ok: true, say: `Invited ${childName} to join the family.` };

      case 'assign_chore':
        if (!isParent) {
          throw new functions.https.HttpsError('permission-denied', 'Only parents can assign chores.');
        }

        const task = entities?.task || 'custom task';
        const assignedChild = entities?.child;
        
        if (assignedChild) {
          // Assign to specific child
          const result = await db.runTransaction(async (tx) => {
            // Find child by name
            const childrenSnapshot = await tx.get(
              db.collection('children')
                .where('parentId', '==', uid)
                .where('name', '==', assignedChild)
            );
            
            if (childrenSnapshot.empty) {
              throw new Error(`Could not find child named ${assignedChild}.`);
            }

            const childDoc = childrenSnapshot.docs[0];
            const choreRef = db.collection('chores').doc();
            
            tx.set(choreRef, {
              childId: childDoc.id,
              title: task,
              type: task,
              status: 'open',
              assignedBy: uid,
              createdAt: admin.firestore.FieldValue.serverTimestamp()
            });

            // Write audit event
            const auditRef = db.collection('events').doc();
            tx.set(auditRef, {
              type: 'chore_assigned',
              actorId: uid,
              payload: { childId: childDoc.id, childName: assignedChild, task },
              createdAt: admin.firestore.FieldValue.serverTimestamp()
            });

            return { childName: assignedChild };
          });
          
          return { ok: true, say: `Assigned ${task} to ${assignedChild}.` };
        } else {
          // Assign to all children
          const result = await db.runTransaction(async (tx) => {
            const childrenSnapshot = await tx.get(
              db.collection('children').where('parentId', '==', uid)
            );
            
            if (childrenSnapshot.empty) {
              throw new Error('No children found to assign chores to.');
            }

            const childCount = childrenSnapshot.docs.length;
            
            // Assign chore to each child
            childrenSnapshot.docs.forEach(childDoc => {
              const choreRef = db.collection('chores').doc();
              tx.set(choreRef, {
                childId: childDoc.id,
                title: task,
                type: task,
                status: 'open',
                assignedBy: uid,
                createdAt: admin.firestore.FieldValue.serverTimestamp()
              });
            });

            // Write audit event
            const auditRef = db.collection('events').doc();
            tx.set(auditRef, {
              type: 'chore_assigned_bulk',
              actorId: uid,
              payload: { task, childCount },
              createdAt: admin.firestore.FieldValue.serverTimestamp()
            });

            return { childCount };
          });
          
          return { ok: true, say: `Assigned ${task} to all children.` };
        }

      case 'show_usage':
        const targetChild = entities?.child;
        
        if (targetChild) {
          // Get usage for specific child
          const childrenSnapshot = await db.collection('children')
            .where('parentId', '==', uid)
            .where('name', '==', targetChild)
            .get();
          
          if (childrenSnapshot.empty) {
            return { ok: false, say: `Could not find child named ${targetChild}.` };
          }

          const childId = childrenSnapshot.docs[0].id;
          const today = new Date().toISOString().slice(0, 10);
          const usageDoc = await db.collection('screenTime')
            .doc(`${childId}_${today}`)
            .get();
          
          const usage = usageDoc.data();
          const usedMinutes = usage?.usedMinutes || 0;
          const budgetMinutes = usage?.budgetMinutes || 0;
          
          // Write audit event
          await db.collection('events').add({
            type: 'usage_viewed',
            actorId: uid,
            payload: { childId, childName: targetChild, usedMinutes, budgetMinutes },
            createdAt: admin.firestore.FieldValue.serverTimestamp()
          });
          
          return { 
            ok: true, 
            say: `${targetChild} has used ${usedMinutes} minutes out of ${budgetMinutes} today.` 
          };
        } else {
          // Get usage for all children
          const childrenSnapshot = await db.collection('children')
            .where('parentId', '==', uid)
            .get();
          
          if (childrenSnapshot.empty) {
            return { ok: false, say: 'No children found.' };
          }

          let totalUsed = 0;
          let totalBudget = 0;
          const today = new Date().toISOString().slice(0, 10);
          
          for (const childDoc of childrenSnapshot.docs) {
            const usageDoc = await db.collection('screenTime')
              .doc(`${childDoc.id}_${today}`)
              .get();
            
            const usage = usageDoc.data();
            totalUsed += usage?.usedMinutes || 0;
            totalBudget += usage?.budgetMinutes || 0;
          }
          
          // Write audit event
          await db.collection('events').add({
            type: 'usage_viewed_bulk',
            actorId: uid,
            payload: { totalUsed, totalBudget, childCount: childrenSnapshot.docs.length },
            createdAt: admin.firestore.FieldValue.serverTimestamp()
          });
          
          return { 
            ok: true, 
            say: `Total usage: ${totalUsed} minutes out of ${totalBudget} across all children.` 
          };
        }

      case 'grant_bonus':
        if (!isParent) {
          throw new functions.https.HttpsError('permission-denied', 'Only parents can grant bonuses.');
        }

        const bonusMinutes = entities?.minutes || 15;
        const bonusChild = entities?.child;
        
        if (!bonusChild) {
          return { ok: false, say: 'Please specify which child to grant bonus time to.' };
        }

        if (bonusMinutes <= 0 || bonusMinutes > 120) {
          return { ok: false, say: 'Bonus time must be between 1 and 120 minutes.' };
        }

        // Find child and grant bonus with transaction
        const bonusResult = await db.runTransaction(async (tx) => {
          const bonusChildrenSnapshot = await tx.get(
            db.collection('children')
              .where('parentId', '==', uid)
              .where('name', '==', bonusChild)
          );
          
          if (bonusChildrenSnapshot.empty) {
            throw new Error(`Could not find child named ${bonusChild}.`);
          }

          const bonusChildId = bonusChildrenSnapshot.docs[0].id;
          const today = new Date().toISOString().slice(0, 10);
          const screenTimeRef = db.collection('screenTime').doc(`${bonusChildId}_${today}`);
          
          const screenTimeDoc = await tx.get(screenTimeRef);
          const currentData = screenTimeDoc.data();
          const newBudget = (currentData?.budgetMinutes || 0) + bonusMinutes;
          
          tx.set(screenTimeRef, {
            childId: bonusChildId,
            date: today,
            budgetMinutes: newBudget,
            usedMinutes: currentData?.usedMinutes || 0,
            lastUpdated: admin.firestore.FieldValue.serverTimestamp()
          }, { merge: true });

          // Write audit event
          const auditRef = db.collection('events').doc();
          tx.set(auditRef, {
            type: 'bonus_granted',
            actorId: uid,
            payload: { childId: bonusChildId, childName: bonusChild, minutes: bonusMinutes },
            createdAt: admin.firestore.FieldValue.serverTimestamp()
          });

          return { childName: bonusChild };
        });

        return { ok: true, say: `Granted ${bonusMinutes} bonus minutes to ${bonusChild}.` };

      default:
        return { ok: false, say: 'I did not understand that command.' };
    }
  } catch (error: any) {
    console.error('Voice dispatch error:', error);
    
    // Handle specific error cases
    if (error.message?.includes('Could not find child')) {
      return { ok: false, say: error.message };
    }
    if (error.message?.includes('No children found')) {
      return { ok: false, say: error.message };
    }
    
    return { ok: false, say: 'Sorry, I could not complete that action.' };
  }
});
