import React, { useEffect, useState } from 'react';
import {
  CreditCard,
  DollarSign,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  Printer,
  X,
  Receipt,
  Download,
  AlertCircle,
  Plus,
  Building,
} from 'lucide-react';
import { db, subscribeToTable } from '../../lib/supabaseClient';
import { FeeRecord, FeePayment, Student, SchoolClass } from '../../types/database.types';

export const FeeManagement: React.FC = () => {
  const [feeRecords, setFeeRecords] = useState<FeeRecord[]>([]);
  const [feePayments, setFeePayments] = useState<FeePayment[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [classes, setClasses] = useState<SchoolClass[]>([]);

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'All' | 'Paid' | 'Pending' | 'Partially Paid'>('All');
  const [monthFilter, setMonthFilter] = useState('All');

  // Modals
  const [payingRecord, setPayingRecord] = useState<FeeRecord | null>(null);
  const [receiptToPrint, setReceiptToPrint] = useState<FeePayment | null>(null);
  const [isGenerateMonthModalOpen, setIsGenerateMonthModalOpen] = useState(false);

  // Payment form state
  const [paymentAmount, setPaymentAmount] = useState<number>(0);
  const [paymentMethod, setPaymentMethod] = useState<'Cash' | 'Bank Transfer' | 'Online Card' | 'Cheque'>('Online Card');
  const [receivedBy, setReceivedBy] = useState('Bursar Office');
  const [paymentRemarks, setPaymentRemarks] = useState('');

  const loadData = async () => {
    const [records, payments, s, c] = await Promise.all([
      db.fees.getRecords(),
      db.fees.getPayments(),
      db.students.getAll(),
      db.classes.getAll(),
    ]);
    setFeeRecords(records);
    setFeePayments(payments);
    setStudents(s);
    setClasses(c);
  };

  useEffect(() => {
    loadData();
    const unsubF = subscribeToTable('fee_records', loadData);
    const unsubP = subscribeToTable('fee_payments', loadData);
    return () => {
      unsubF();
      unsubP();
    };
  }, []);

  // Filtered fee records
  const filteredRecords = feeRecords.filter((r) => {
    const matchesSearch =
      r.student_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.registration_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.class_name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'All' || r.status === statusFilter;
    const matchesMonth = monthFilter === 'All' || r.month_year === monthFilter;
    return matchesSearch && matchesStatus && matchesMonth;
  });

  // Totals
  const totalCollected = feeRecords.reduce((acc, curr) => acc + Number(curr.paid_amount || 0), 0);
  const totalOutstanding = feeRecords.reduce((acc, curr) => acc + Number(curr.balance_due || 0), 0);
  const totalBilled = totalCollected + totalOutstanding;

  const handleOpenPayment = (record: FeeRecord) => {
    setPayingRecord(record);
    setPaymentAmount(record.balance_due);
    setPaymentRemarks('Regular monthly fee installment');
  };

  const handleSubmitPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!payingRecord) return;

    try {
      const { payment } = await db.fees.submitPayment(payingRecord.id, {
        amount: Number(paymentAmount),
        payment_method: paymentMethod,
        received_by: receivedBy,
        remarks: paymentRemarks,
      });

      setPayingRecord(null);
      setReceiptToPrint(payment);
      loadData();
    } catch (err) {
      console.error(err);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* 3 Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold">Total Revenue Collected</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-emerald-700 tabular-nums">
            ${totalCollected.toLocaleString()}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">Verified payments processed in Supabase</div>
        </div>

        <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold">Outstanding Balance</span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center">
              <CreditCard className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-amber-700 tabular-nums">
            ${totalOutstanding.toLocaleString()}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">Pending student balances for active terms</div>
        </div>

        <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold">Collection Progress</span>
            <div className="w-8 h-8 rounded-lg bg-sky-50 text-sky-700 flex items-center justify-center">
              <Receipt className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-sky-700 tabular-nums">
            {totalBilled > 0 ? Math.round((totalCollected / totalBilled) * 100) : 0}%
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            Total Billed: ${totalBilled.toLocaleString()}
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by student name or reg #..."
              className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500"
            />
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500 font-semibold">Status:</span>
            {(['All', 'Pending', 'Partially Paid', 'Paid'] as const).map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg cursor-pointer transition-colors ${
                  statusFilter === st ? 'bg-sky-600 text-white shadow-xs' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                {st}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Fee Records Table */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase">
              <tr>
                <th className="py-3 px-4">Student & Class</th>
                <th className="py-3 px-4">Reg #</th>
                <th className="py-3 px-4">Billing Month</th>
                <th className="py-3 px-4">Tuition + Addons</th>
                <th className="py-3 px-4">Total Billed</th>
                <th className="py-3 px-4">Amount Paid</th>
                <th className="py-3 px-4">Balance Due</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filteredRecords.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-8 text-center text-slate-400">
                    No fee records found.
                  </td>
                </tr>
              ) : (
                filteredRecords.map((rec) => (
                  <tr key={rec.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3 px-4">
                      <div className="font-bold text-slate-900">{rec.student_name}</div>
                      <div className="text-[11px] text-slate-500">{rec.class_name}</div>
                    </td>
                    <td className="py-3 px-4 font-mono font-semibold text-sky-700">{rec.registration_number}</td>
                    <td className="py-3 px-4">{rec.month_year}</td>
                    <td className="py-3 px-4 text-slate-600 tabular-nums">
                      ${rec.tuition_fee} + ${rec.exam_fee + rec.computer_fee + rec.sports_fee}
                    </td>
                    <td className="py-3 px-4 font-bold text-slate-900 tabular-nums">${rec.total_amount}</td>
                    <td className="py-3 px-4 font-semibold text-emerald-700 tabular-nums">${rec.paid_amount}</td>
                    <td className="py-3 px-4 font-bold text-amber-700 tabular-nums">${rec.balance_due}</td>
                    <td className="py-3 px-4">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          rec.status === 'Paid'
                            ? 'bg-emerald-100 text-emerald-800'
                            : rec.status === 'Partially Paid'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-rose-100 text-rose-800'
                        }`}
                      >
                        {rec.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {rec.balance_due > 0 ? (
                          <button
                            onClick={() => handleOpenPayment(rec)}
                            className="px-3 py-1 bg-sky-600 hover:bg-sky-700 text-white font-semibold rounded-md shadow-xs cursor-pointer"
                          >
                            Collect Fee
                          </button>
                        ) : (
                          <button
                            onClick={() => {
                              const pay = feePayments.find((p) => p.fee_record_id === rec.id) || {
                                id: 'pay-mock',
                                fee_record_id: rec.id,
                                student_id: rec.student_id,
                                student_name: rec.student_name,
                                registration_number: rec.registration_number,
                                class_name: rec.class_name,
                                amount_paid: rec.paid_amount,
                                payment_date: new Date().toISOString().split('T')[0],
                                payment_method: 'Online Card',
                                receipt_number: 'REC-2026-PAID',
                                received_by: 'Bursar Office',
                                created_at: rec.created_at,
                              };
                              setReceiptToPrint(pay);
                            }}
                            className="px-2.5 py-1 text-slate-600 bg-slate-100 hover:bg-slate-200 font-semibold rounded-md flex items-center gap-1 cursor-pointer"
                          >
                            <Printer className="w-3.5 h-3.5" />
                            <span>Receipt</span>
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* COLLECT FEE MODAL */}
      {payingRecord && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full overflow-hidden shadow-2xl border border-slate-200">
            <div className="bg-sky-900 text-white px-6 py-4 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-sm">Collect Student Tuition Fee</h3>
                <p className="text-[11px] text-sky-200">Generate Official Payment Voucher</p>
              </div>
              <button onClick={() => setPayingRecord(null)} className="text-white/80 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitPayment} className="p-6 space-y-4 text-xs">
              <div className="p-3 bg-sky-50 rounded-xl border border-sky-100 space-y-1">
                <div className="flex justify-between font-bold text-slate-900">
                  <span>{payingRecord.student_name}</span>
                  <span className="font-mono text-sky-800">{payingRecord.registration_number}</span>
                </div>
                <div className="flex justify-between text-slate-600 text-[11px]">
                  <span>{payingRecord.class_name} · {payingRecord.month_year}</span>
                  <span className="font-bold text-amber-700">Outstanding: ${payingRecord.balance_due}</span>
                </div>
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">Payment Amount ($) *</label>
                <input
                  type="number"
                  required
                  min={1}
                  max={payingRecord.balance_due}
                  value={paymentAmount}
                  onChange={(e) => setPaymentAmount(Number(e.target.value))}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-sky-500 font-mono text-sm font-bold"
                />
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">Payment Method *</label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value as any)}
                  className="w-full px-3 py-2 border rounded-lg bg-white"
                >
                  <option value="Online Card">Online Card Payment</option>
                  <option value="Bank Transfer">Bank Transfer / Wire</option>
                  <option value="Cash">Cash (Bursar Counter)</option>
                  <option value="Cheque">Bankers Cheque</option>
                </select>
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">Received By</label>
                <input
                  type="text"
                  value={receivedBy}
                  onChange={(e) => setReceivedBy(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">Remarks / Note</label>
                <input
                  type="text"
                  value={paymentRemarks}
                  onChange={(e) => setPaymentRemarks(e.target.value)}
                  placeholder="e.g. Paid in full via debit card"
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>

              <div className="pt-3 border-t flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setPayingRecord(null)}
                  className="px-4 py-2 rounded-lg text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold shadow-xs"
                >
                  Confirm & Issue Receipt
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* PRINTABLE OFFICIAL FEE RECEIPT MODAL */}
      {receiptToPrint && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl border border-slate-200">
            {/* Header / Actions */}
            <div className="p-4 bg-slate-100 border-b flex items-center justify-between text-xs">
              <span className="font-bold text-slate-700">Official Student Fee Receipt</span>
              <div className="flex items-center gap-2">
                <button
                  onClick={handlePrint}
                  className="px-3 py-1.5 bg-sky-600 hover:bg-sky-700 text-white rounded-lg font-semibold flex items-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print Receipt</span>
                </button>
                <button
                  onClick={() => setReceiptToPrint(null)}
                  className="px-3 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-lg font-semibold"
                >
                  Close
                </button>
              </div>
            </div>

            {/* Printable Voucher Sheet */}
            <div id="printable-area" className="p-8 space-y-6 text-slate-900 bg-white">
              {/* Institution Title */}
              <div className="border-b-2 border-slate-900 pb-4 flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-extrabold tracking-tight">Teen School Academy</h2>
                  <p className="text-xs text-slate-600">450 Academy Way, Academic District · Admissions & Bursar Office</p>
                  <p className="text-[11px] text-slate-500">Contact: +1 (555) 234-8800 · finance@teenschool.edu</p>
                </div>
                <div className="text-right">
                  <span className="px-2.5 py-1 bg-emerald-100 text-emerald-800 text-xs font-bold rounded-md">
                    PAID VOUCHER
                  </span>
                  <div className="font-mono text-xs font-bold text-slate-800 mt-1">
                    {receiptToPrint.receipt_number}
                  </div>
                </div>
              </div>

              {/* Student Metadata */}
              <div className="grid grid-cols-2 gap-4 text-xs bg-slate-50 p-4 rounded-xl border border-slate-200">
                <div>
                  <span className="text-slate-400 block text-[11px]">Student Name:</span>
                  <span className="font-bold text-slate-900 text-sm">{receiptToPrint.student_name}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Registration Number:</span>
                  <span className="font-mono font-bold text-sky-700">{receiptToPrint.registration_number}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Academic Class:</span>
                  <span className="font-semibold">{receiptToPrint.class_name}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Transaction Date:</span>
                  <span className="font-semibold">{receiptToPrint.payment_date}</span>
                </div>
              </div>

              {/* Itemized Table */}
              <table className="w-full text-xs text-left">
                <thead className="border-b border-slate-200 text-slate-600 uppercase">
                  <tr>
                    <th className="py-2">Item Description</th>
                    <th className="py-2 text-right">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 tabular-nums">
                  <tr>
                    <td className="py-2">Tuition Fee & Academic Services</td>
                    <td className="py-2 text-right font-semibold">${receiptToPrint.amount_paid}</td>
                  </tr>
                  <tr>
                    <td className="py-2">Payment Method: {receiptToPrint.payment_method}</td>
                    <td className="py-2 text-right text-emerald-700 font-bold">Settled</td>
                  </tr>
                </tbody>
                <tfoot className="border-t-2 border-slate-900">
                  <tr>
                    <td className="py-3 font-bold text-sm">Total Paid Amount:</td>
                    <td className="py-3 text-right font-mono font-extrabold text-base text-emerald-700">
                      ${receiptToPrint.amount_paid}.00
                    </td>
                  </tr>
                </tfoot>
              </table>

              {/* Official Seal and Sign */}
              <div className="pt-8 border-t border-slate-200 flex justify-between items-end text-xs text-slate-500">
                <div>
                  <div className="w-16 h-16 rounded-full border-2 border-dashed border-sky-400 flex items-center justify-center text-[10px] text-sky-700 font-bold uppercase rotate-12 text-center p-1">
                    TSA Official Seal
                  </div>
                </div>
                <div className="text-right">
                  <div className="border-b border-slate-400 w-40 pb-1 mb-1" />
                  <span>Authorized Signature (Bursar)</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
