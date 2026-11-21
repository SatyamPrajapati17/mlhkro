import React, { useState, useEffect } from 'react';
import { GlassCard } from '../../components/ui/GlassCard';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';
import { Receipt, Download, Eye, DollarSign, ArrowRight } from 'lucide-react';

export const PayslipsPage: React.FC = () => {
  const [payslips, setPayslips] = useState<any[]>([]);
  const [selectedPayslip, setSelectedPayslip] = useState<any | null>(null);

  useEffect(() => {
    async function loadPayslips() {
      try {
        const res = await fetch('/api/payroll/my-payslips');
        const data = await res.json();
        if (res.ok && data.success) {
          setPayslips(data.payslips);
        }
      } catch (e) {
        console.error(e);
      }
    }
    loadPayslips();
  }, []);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between border-b-2 border-wt-white/20 pb-4">
        <div>
          <div className="font-mono text-xs text-wt-gray uppercase tracking-widest">EARNINGS & TAX STATEMENTS</div>
          <h2 className="font-display text-3xl font-black text-wt-white uppercase">MY PAYSLIPS</h2>
        </div>
        <Badge status="PAID" label="PAYSLIP ENGINE" size="md" />
      </div>

      {/* Payslips Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {payslips.map((ps) => (
          <GlassCard key={ps.id} variant="yellow" hud interactive className="p-6 bg-wt-black/95 font-mono">
            <div className="flex items-center justify-between border-b border-wt-white/20 pb-3 mb-4">
              <span className="font-bold text-wt-white text-base">{ps.periodMonth}</span>
              <Badge status={ps.status} size="sm" />
            </div>

            <div className="space-y-2 mb-6">
              <div className="flex justify-between text-xs text-wt-gray">
                <span>GROSS SALARY:</span>
                <span className="text-wt-white font-bold">₹{ps.gross.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-xs text-wt-gray">
                <span>DEDUCTIONS (PF & PT):</span>
                <span className="text-wt-red font-bold">-₹{ps.deductions.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm pt-2 border-t border-wt-white/10">
                <span className="text-wt-yellow font-black">NET TAKE-HOME:</span>
                <span className="text-wt-yellow font-black text-lg">₹{ps.net.toLocaleString()}</span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button variant="primary" size="sm" fullWidth onClick={() => setSelectedPayslip(ps)}>
                <Eye className="w-3.5 h-3.5 mr-1.5" /> VIEW BREAKDOWN
              </Button>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => alert(`Downloading signed PDF statement for ${ps.periodMonth}...`)}
              >
                <Download className="w-3.5 h-3.5" />
              </Button>
            </div>
          </GlassCard>
        ))}
      </div>

      {/* Payslip PDF Stub Modal */}
      {selectedPayslip && (
        <Modal
          isOpen={!!selectedPayslip}
          onClose={() => setSelectedPayslip(null)}
          title={`OFFICIAL PAYSLIP: ${selectedPayslip.periodMonth}`}
        >
          <div className="p-4 border-2 border-wt-white bg-wt-black font-mono text-xs space-y-4">
            <div className="flex justify-between border-b-2 border-wt-white pb-3">
              <div>
                <div className="font-display text-xl font-black text-wt-white">WORKTAK TECHNOLOGIES</div>
                <div className="text-[10px] text-wt-gray">CONFIDENTIAL SALARY DISBURSEMENT STATEMENT</div>
              </div>
              <div className="text-right">
                <div className="text-wt-yellow font-bold">{selectedPayslip.periodMonth}</div>
                <div className="text-[10px] text-wt-gray">DATE: {selectedPayslip.payDate}</div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 border-b border-wt-white/20 pb-3">
              <div>
                <div className="text-wt-yellow font-bold uppercase mb-2">EARNINGS</div>
                <div className="flex justify-between py-1"><span>Basic Salary:</span><span className="text-wt-white font-bold">₹47,500</span></div>
                <div className="flex justify-between py-1"><span>HRA Allowance:</span><span className="text-wt-white font-bold">₹23,750</span></div>
                <div className="flex justify-between py-1"><span>Special Allowance:</span><span className="text-wt-white font-bold">₹23,750</span></div>
              </div>
              <div>
                <div className="text-wt-red font-bold uppercase mb-2">DEDUCTIONS</div>
                <div className="flex justify-between py-1"><span>Provident Fund (12%):</span><span className="text-wt-red font-bold">₹5,700</span></div>
                <div className="flex justify-between py-1"><span>Professional Tax:</span><span className="text-wt-red font-bold">₹200</span></div>
                <div className="flex justify-between py-1"><span>LOP Deduction (0 days):</span><span className="text-wt-gray">₹0</span></div>
              </div>
            </div>

            <div className="flex items-center justify-between p-3 bg-wt-yellow/10 border-2 border-wt-yellow">
              <span className="font-bold text-wt-white uppercase">NET PAYOUT TRANSFERRED</span>
              <span className="font-display text-2xl font-black text-wt-yellow">₹{selectedPayslip.net.toLocaleString()}</span>
            </div>

            <div className="flex justify-end pt-2">
              <Button
                variant="primary"
                size="md"
                onClick={() => {
                  window.print();
                }}
              >
                <Download className="w-4 h-4 mr-1.5" /> PRINT / SAVE AS PDF
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
