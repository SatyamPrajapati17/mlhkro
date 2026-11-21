import { Router, Request, Response } from 'express';
import { requireAuth, requireRole } from '../middleware/auth';
import { logAudit } from '../db';
import { DocStatus } from '../db/types';

export const documentsRouter = Router();

export interface DocumentItem {
  id: string;
  companyId: string;
  employeeId: string;
  employeeName: string;
  employeeCode: string;
  docType: 'PAN' | 'ADDRESS_PROOF' | 'EDUCATION' | 'OFFER_LETTER';
  fileName: string;
  fileSize: number;
  status: DocStatus;
  extracted?: {
    fullName: string;
    dob?: string;
    idLast4: string;
    issueDate?: string;
    confidence: number;
  };
  nameMatchScore?: number;
  reviewedBy?: string;
  reviewedAt?: string;
  rejectionReason?: string;
  createdAt: string;
}

const documentsStore: DocumentItem[] = [
  {
    id: 'doc-1',
    companyId: '00000000-0000-0000-0000-000000000001',
    employeeId: '00000000-0000-0000-0000-000000000105',
    employeeName: 'Arjun Verma',
    employeeCode: 'EMP005',
    docType: 'PAN',
    fileName: 'pan_card_arjun.pdf',
    fileSize: 1048576,
    status: 'VERIFIED',
    extracted: {
      fullName: 'Arjun Verma',
      dob: '1996-08-14',
      idLast4: '4812',
      issueDate: '2018-05-10',
      confidence: 0.98,
    },
    nameMatchScore: 1.0,
    reviewedBy: 'Priya Sharma',
    reviewedAt: '2026-11-10T11:00:00Z',
    createdAt: '2026-11-09T14:00:00Z',
  },
  {
    id: 'doc-2',
    companyId: '00000000-0000-0000-0000-000000000001',
    employeeId: '00000000-0000-0000-0000-000000000105',
    employeeName: 'Arjun Verma',
    employeeCode: 'EMP005',
    docType: 'ADDRESS_PROOF',
    fileName: 'passport_scan.jpg',
    fileSize: 2097152,
    status: 'PENDING_REVIEW',
    extracted: {
      fullName: 'Arjun Verma',
      dob: '1996-08-14',
      idLast4: '9901',
      confidence: 0.94,
    },
    nameMatchScore: 1.0,
    createdAt: '2026-11-18T16:30:00Z',
  },
  {
    id: 'doc-3',
    companyId: '00000000-0000-0000-0000-000000000001',
    employeeId: '00000000-0000-0000-0000-000000000104',
    employeeName: 'Vikram Malhotra',
    employeeCode: 'EMP004',
    docType: 'PAN',
    fileName: 'vikram_pan.png',
    fileSize: 1540000,
    status: 'PENDING_REVIEW',
    extracted: {
      fullName: 'Vikram Malhotra',
      dob: '1989-11-22',
      idLast4: '3318',
      confidence: 0.96,
    },
    nameMatchScore: 1.0,
    createdAt: '2026-11-20T09:00:00Z',
  },
];

// 1. List Documents (Role Scoped)
documentsRouter.get('/', requireAuth, (req: Request, res: Response) => {
  const user = req.user!;
  let docs = documentsStore.filter((d) => d.companyId === user.companyId);

  if (user.role === 'EMPLOYEE') {
    docs = docs.filter((d) => d.employeeId === user.userId);
  }

  res.json({ success: true, documents: docs });
});

// 2. Upload Document & AI Extract
documentsRouter.post('/upload', requireAuth, async (req: Request, res: Response) => {
  const { docType, fileName, fileSize } = req.body;

  // AI Extraction Simulator / Vision LLM
  const last4 = String(Math.floor(1000 + Math.random() * 9000));
  const newDoc: DocumentItem = {
    id: `doc-${Date.now()}`,
    companyId: req.user!.companyId,
    employeeId: req.user!.userId,
    employeeName: req.user!.fullName || 'Employee',
    employeeCode: 'EMP' + req.user!.userId.slice(-3),
    docType: docType || 'OTHER',
    fileName: fileName || 'uploaded_document.pdf',
    fileSize: fileSize || 1024000,
    status: 'PENDING_REVIEW',
    extracted: {
      fullName: req.user!.fullName,
      idLast4: last4,
      confidence: 0.95,
      dob: '1995-05-15',
    },
    nameMatchScore: 1.0,
    createdAt: new Date().toISOString(),
  };

  documentsStore.unshift(newDoc);

  await logAudit({
    company_id: req.user!.companyId,
    actor_user_id: req.user!.userId,
    actor_role: req.user!.role,
    action: 'DOCUMENT_UPLOADED',
    entity: 'document',
    entity_id: newDoc.id,
    metadata: { docType: newDoc.docType, idLast4: last4 },
    ip: req.ip,
  });

  res.json({ success: true, document: newDoc });
});

// 3. HR Verify or Reject Document
documentsRouter.post('/:id/decide', requireAuth, requireRole('ADMIN', 'HR'), async (req: Request, res: Response) => {
  const { decision, reason } = req.body; // 'VERIFIED' | 'REJECTED'
  const doc = documentsStore.find((d) => d.id === req.params.id);
  if (!doc) return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Document not found.' } });

  doc.status = decision === 'VERIFIED' ? 'VERIFIED' : 'REJECTED';
  doc.reviewedBy = req.user!.fullName;
  doc.reviewedAt = new Date().toISOString();
  if (decision === 'REJECTED') {
    doc.rejectionReason = reason || 'Document clarity insufficient or details mismatch.';
  }

  await logAudit({
    company_id: req.user!.companyId,
    actor_user_id: req.user!.userId,
    actor_role: req.user!.role,
    action: `DOCUMENT_${decision}`,
    entity: 'document',
    entity_id: doc.id,
    metadata: { decision, reason },
    ip: req.ip,
  });

  res.json({ success: true, document: doc });
});
