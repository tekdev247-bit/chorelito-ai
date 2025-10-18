import { httpsCallable, getFunctions } from 'firebase/functions';

export type TimeRequestStatus = 'pending' | 'approved' | 'denied' | 'exceeded';

export type TimeRequest = {
  id: string;
  childId: string;
  minutesRequested: number;
  status: TimeRequestStatus;
  reason: string | null;
  createdAt: Date;
  decidedAt: Date | null;
  reviewerId: string | null;
};

export type SubmitRequestData = {
  childId: string;
  minutes: number;
  reason?: string;
};

export type SubmitRequestResponse = {
  ok: boolean;
  id?: string;
  error?: string;
};

export type ApproveRequestData = {
  requestId: string;
  approved: boolean;
  reason?: string;
};

export type ApproveRequestResponse = {
  ok: boolean;
  error?: string;
};

const functions = getFunctions();

export async function submitTimeRequest(data: SubmitRequestData): Promise<SubmitRequestResponse> {
  try {
    const submitRequest = httpsCallable(functions, 'time-submitRequest');
    const result = await submitRequest(data);
    return { ok: true, id: result.data?.id };
  } catch (error: any) {
    return { 
      ok: false, 
      error: error.message || 'Failed to submit time request' 
    };
  }
}

export async function approveTimeRequest(data: ApproveRequestData): Promise<ApproveRequestResponse> {
  try {
    const approveRequest = httpsCallable(functions, 'time-approveRequest');
    await approveRequest(data);
    return { ok: true };
  } catch (error: any) {
    return { 
      ok: false, 
      error: error.message || 'Failed to approve time request' 
    };
  }
}

export async function denyTimeRequest(data: ApproveRequestData): Promise<ApproveRequestResponse> {
  try {
    const denyRequest = httpsCallable(functions, 'time-denyRequest');
    await denyRequest(data);
    return { ok: true };
  } catch (error: any) {
    return { 
      ok: false, 
      error: error.message || 'Failed to deny time request' 
    };
  }
}
