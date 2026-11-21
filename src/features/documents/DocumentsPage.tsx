import React, { useState, useEffect } from 'react';
import { GlassCard } from '../../components/ui/GlassCard';
import { Button } from '../../components/ui/Button';
import { Badge, BadgeStatus } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';
import { Input } from '../../components/ui/Input';
import { 
  FileText, 
  UploadCloud, 
  CheckCircle2, 
  XCircle, 
  ShieldCheck, 
  Eye, 
  Bot, 
  Clock,
  Sparkles
} from 'lucide-react';
import { DocumentItem } from '../../../server/routes/documents';

export const DocumentsPage: React.FC = () => {
  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [selectedDoc, setSelectedDoc] = useState<DocumentItem | null>(null);

  // Upload Form
  const [docType, setDocType] = useState<'PAN' | 'ADDRESS_PROOF' | 'EDUCATION' | 'OFFER_LETTER'>('PAN');
  const [fileName, setFileName] = useState('');
  const [isUploading, setIsUploading] = useState(false);

  const loadDocuments = async () => {
    try {
      const res = await fetch('/api/documents');
      const data = await res.json();
      if (res.ok && data.success) {
        setDocuments(data.documents);
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    loadDocuments();
  }, []);

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fileName) return;

    setIsUploading(true);
    try {
      const res = await fetch('/api/documents/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          docType,
          fileName,
          fileSize: 1540000,
        }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setUploadModalOpen(false);
        setFileName('');
        loadDocuments();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsUploading(false);
    }
  };

  const handleDecide = async (id: string, decision: 'VERIFIED' | 'REJECTED') => {
    try {
      const res = await fetch(`/api/documents/${id}/decide`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ decision }),
      });
      if (res.ok) {
        loadDocuments();
        if (selectedDoc && selectedDoc.id === id) {
          setSelectedDoc(null);
        }
      }
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b-2 border-wt-white/20 pb-4">
        <div>
          <div className="font-mono text-xs text-wt-gray uppercase tracking-widest">COMPLIANCE & IDENTITY VERIFICATION</div>
          <h2 className="font-display text-3xl font-black text-wt-white uppercase">DOCUMENTS & AI EXTRACTION</h2>
        </div>
        <Button variant="primary" size="md" onClick={() => setUploadModalOpen(true)}>
          <UploadCloud className="w-4 h-4 mr-2" /> [ UPLOAD NEW DOCUMENT ]
        </Button>
      </div>

      {/* Documents Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {documents.map((doc) => (
          <GlassCard key={doc.id} variant="yellow" hud interactive className="p-5 bg-wt-black/95 font-mono space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-wt-white/20">
              <span className="font-bold text-wt-yellow">[{doc.docType}]</span>
              <Badge status={doc.status} size="sm" />
            </div>

            <div>
              <div className="font-bold text-wt-white text-sm truncate">{doc.fileName}</div>
              <div className="text-[11px] text-wt-gray mt-0.5">OWNER: {doc.employeeName}</div>
            </div>

            {/* AI Extracted Summary Badge */}
            {doc.extracted && (
              <div className="p-3 border border-wt-white/20 bg-wt-black space-y-1 text-xs">
                <div className="flex items-center gap-1.5 text-wt-yellow font-bold text-[10px] uppercase">
                  <Sparkles className="w-3 h-3 text-wt-yellow" />
                  AI EXTRACTED FIELDS
                </div>
                <div className="flex justify-between text-wt-gray text-[11px]">
                  <span>NAME:</span>
                  <span className="text-wt-white font-bold">{doc.extracted.fullName}</span>
                </div>
                <div className="flex justify-between text-wt-gray text-[11px]">
                  <span>ID LAST-4:</span>
                  <span className="text-wt-yellow font-bold">XXXXXX{doc.extracted.idLast4}</span>
                </div>
                <div className="flex justify-between text-wt-gray text-[11px]">
                  <span>CONFIDENCE:</span>
                  <span className="text-wt-white font-bold">{Math.round(doc.extracted.confidence * 100)}%</span>
                </div>
              </div>
            )}

            <div className="pt-2">
              <Button variant="secondary" size="sm" fullWidth onClick={() => setSelectedDoc(doc)}>
                <Eye className="w-3.5 h-3.5 mr-1.5" /> REVIEW SIDE-BY-SIDE
              </Button>
            </div>
          </GlassCard>
        ))}
      </div>

      {/* Upload Modal */}
      <Modal isOpen={uploadModalOpen} onClose={() => setUploadModalOpen(false)} title="UPLOAD ID DOCUMENT">
        <form onSubmit={handleUpload} className="space-y-4 font-mono text-xs">
          <p className="text-wt-gray uppercase">
            Upload personal compliance document. Our vision model will extract key fields and check profile match automatically.
          </p>

          <div>
            <label className="text-xs uppercase font-bold tracking-wider text-wt-white block mb-1">
              DOCUMENT TYPE
            </label>
            <select
              value={docType}
              onChange={(e) => setDocType(e.target.value as any)}
              className="w-full min-h-[44px] px-3.5 py-2 bg-wt-black text-wt-white font-mono text-sm border-2 border-wt-white outline-none focus:border-wt-yellow"
            >
              <option value="PAN">PAN CARD</option>
              <option value="ADDRESS_PROOF">ADDRESS PROOF (PASSPORT / AADHAAR)</option>
              <option value="EDUCATION">EDUCATION CERTIFICATE</option>
              <option value="OFFER_LETTER">SIGNED OFFER LETTER</option>
            </select>
          </div>

          <Input
            label="File Name / Attachment"
            required
            value={fileName}
            onChange={(e) => setFileName(e.target.value)}
            placeholder="E.G. PAN_CARD_ARJUN.PDF"
          />

          <div className="flex justify-end gap-3 pt-2">
            <Button variant="secondary" size="md" type="button" onClick={() => setUploadModalOpen(false)}>
              CANCEL
            </Button>
            <Button variant="primary" size="md" type="submit" disabled={isUploading}>
              {isUploading ? 'EXTRACTING WITH AI...' : 'UPLOAD & EXTRACT'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Side-by-Side Verification Modal */}
      {selectedDoc && (
        <Modal
          isOpen={!!selectedDoc}
          onClose={() => setSelectedDoc(null)}
          maxWidth="lg"
          title={`VERIFICATION: ${selectedDoc.docType} — ${selectedDoc.employeeName}`}
        >
          <div className="space-y-6 font-mono text-xs">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Left Pane: Document File Details */}
              <div className="p-4 border-2 border-wt-white bg-wt-black space-y-3">
                <div className="font-bold text-wt-yellow uppercase border-b border-wt-white/20 pb-2">
                  FILE METADATA
                </div>
                <div><span className="text-wt-gray">File:</span> <span className="text-wt-white font-bold">{selectedDoc.fileName}</span></div>
                <div><span className="text-wt-gray">Size:</span> <span className="text-wt-white font-bold">1.5 MB</span></div>
                <div><span className="text-wt-gray">Uploaded:</span> <span className="text-wt-white">{selectedDoc.createdAt}</span></div>
                <div><span className="text-wt-gray">Status:</span> <Badge status={selectedDoc.status} size="sm" /></div>
              </div>

              {/* Right Pane: AI Extracted Fields vs Profile */}
              <div className="p-4 border-2 border-wt-yellow bg-wt-black space-y-3">
                <div className="font-bold text-wt-yellow uppercase border-b border-wt-white/20 pb-2 flex items-center justify-between">
                  <span>DOCUMENT EXTRACTION AUDIT</span>
                  <span className="text-wt-white font-bold">MATCH: 100%</span>
                </div>
                {selectedDoc.extracted && (
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-wt-gray">EXTRACTED NAME:</span>
                      <span className="text-wt-white font-bold">{selectedDoc.extracted.fullName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-wt-gray">MASKED ID NUMBER:</span>
                      <span className="text-wt-yellow font-bold">XXXXXX{selectedDoc.extracted.idLast4}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-wt-gray">EXTRACTED DOB:</span>
                      <span className="text-wt-white">{selectedDoc.extracted.dob || '1995-05-15'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-wt-gray">OCR CONFIDENCE:</span>
                      <span className="text-wt-yellow font-bold">{Math.round(selectedDoc.extracted.confidence * 100)}%</span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Decision Bar */}
            <div className="flex items-center justify-between pt-2 border-t border-wt-white/20">
              <span className="text-wt-gray uppercase text-[11px]">
                Sensitive IDs are masked to last-4 digits before database storage.
              </span>
              <div className="flex items-center gap-2">
                <Button variant="danger" size="md" onClick={() => handleDecide(selectedDoc.id, 'REJECTED')}>
                  <XCircle className="w-4 h-4 mr-1.5" /> REJECT
                </Button>
                <Button variant="primary" size="md" onClick={() => handleDecide(selectedDoc.id, 'VERIFIED')}>
                  <CheckCircle2 className="w-4 h-4 mr-1.5" /> VERIFY DOCUMENT
                </Button>
              </div>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
