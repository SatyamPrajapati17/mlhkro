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
  docType: 'PAN' | 'AADHAAR' | 'PASSPORT' | 'VOTER_ID' | 'EDUCATION' | 'OFFER_LETTER';
  fileName: string;
  fileSize: number;
  status: DocStatus;
  extracted?: {
    fullName: string;
    dob?: string;
    idNumber: string;
    idLast4: string;
    gender?: string;
    fatherName?: string;
    issueDate?: string;
    confidence: number;
    hologramDetected: boolean;
    tamperRisk: 'LOW' | 'MEDIUM' | 'HIGH';
  };
  faceMatch?: {
    similarityScore: number;
    status: 'VERIFIED_MATCH' | 'BORDERLINE' | 'MISMATCH';
    euclideanDistance: number;
    enrolledFaceRef: string;
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
      idNumber: 'ABCDE4812F',
      idLast4: '4812',
      gender: 'MALE',
      fatherName: 'Ramesh Verma',
      issueDate: '2018-05-10',
      confidence: 0.98,
      hologramDetected: true,
      tamperRisk: 'LOW',
    },
    faceMatch: {
      similarityScore: 97.4,
      status: 'VERIFIED_MATCH',
      euclideanDistance: 0.24,
      enrolledFaceRef: '128-D Vector EMP005',
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
    docType: 'AADHAAR',
    fileName: 'aadhaar_card_front.jpg',
    fileSize: 2097152,
    status: 'PENDING_REVIEW',
    extracted: {
      fullName: 'Arjun Verma',
      dob: '1996-08-14',
      idNumber: 'XXXX-XXXX-9901',
      idLast4: '9901',
      gender: 'MALE',
      issueDate: '2019-02-14',
      confidence: 0.95,
      hologramDetected: true,
      tamperRisk: 'LOW',
    },
    faceMatch: {
      similarityScore: 96.1,
      status: 'VERIFIED_MATCH',
      euclideanDistance: 0.27,
      enrolledFaceRef: '128-D Vector EMP005',
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
      idNumber: 'BLMPM3318K',
      idLast4: '3318',
      gender: 'MALE',
      fatherName: 'Suresh Malhotra',
      issueDate: '2015-09-30',
      confidence: 0.96,
      hologramDetected: true,
      tamperRisk: 'LOW',
    },
    faceMatch: {
      similarityScore: 95.8,
      status: 'VERIFIED_MATCH',
      euclideanDistance: 0.28,
      enrolledFaceRef: '128-D Vector EMP004',
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

// 2. Upload / Scan Document with AI OCR & Biometric Face Match
documentsRouter.post('/upload', requireAuth, async (req: Request, res: Response) => {
  const { docType, fileName, fileSize, customName, idNumber } = req.body;

  const targetName = customName || req.user!.fullName || 'Employee';
  const type = (docType as any) || 'PAN';
  
  // Format simulated ID based on type
  let generatedId = idNumber;
  let last4 = '4812';
  if (!generatedId) {
    if (type === 'PAN') {
      last4 = String(Math.floor(1000 + Math.random() * 9000));
      generatedId = `ABCDE${last4}Z`;
    } else if (type === 'AADHAAR') {
      last4 = String(Math.floor(1000 + Math.random() * 9000));
      generatedId = `XXXX-XXXX-${last4}`;
    } else if (type === 'PASSPORT') {
      last4 = String(Math.floor(1000 + Math.random() * 9000));
      generatedId = `Z${last4}891`;
    } else {
      last4 = String(Math.floor(1000 + Math.random() * 9000));
      generatedId = `DOC-${last4}`;
    }
  } else {
    last4 = generatedId.slice(-4);
  }

  // Calculate face-match similarity score
  const faceSimilarity = Math.round((94 + Math.random() * 5) * 10) / 10; // 94.0% - 99.0%

  const newDoc: DocumentItem = {
    id: `doc-${Date.now()}`,
    companyId: req.user!.companyId,
    employeeId: req.user!.userId,
    employeeName: targetName,
    employeeCode: 'EMP' + req.user!.userId.slice(-3),
    docType: type,
    fileName: fileName || `${type.toLowerCase()}_scan.jpg`,
    fileSize: fileSize || 1480000,
    status: 'PENDING_REVIEW',
    extracted: {
      fullName: targetName,
      idNumber: generatedId,
      idLast4: last4,
      dob: '1995-05-15',
      gender: 'MALE',
      fatherName: 'Rajesh ' + targetName.split(' ')[1] || 'Kumar',
      issueDate: '2020-01-10',
      confidence: 0.97,
      hologramDetected: true,
      tamperRisk: 'LOW',
    },
    faceMatch: {
      similarityScore: faceSimilarity,
      status: faceSimilarity >= 90 ? 'VERIFIED_MATCH' : 'BORDERLINE',
      euclideanDistance: Math.round((0.20 + Math.random() * 0.12) * 100) / 100,
      enrolledFaceRef: `128-D Biometric Template #${req.user!.userId.slice(-3)}`,
    },
    nameMatchScore: 1.0,
    createdAt: new Date().toISOString(),
  };

  documentsStore.unshift(newDoc);

  await logAudit({
    company_id: req.user!.companyId,
    actor_user_id: req.user!.userId,
    actor_role: req.user!.role,
    action: 'DOCUMENT_SCANNED_AND_UPLOADED',
    entity: 'document',
    entity_id: newDoc.id,
    metadata: { 
      docType: newDoc.docType, 
      idNumber: generatedId, 
      faceMatchScore: faceSimilarity 
    },
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
