import { useEffect, useState } from 'react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { ScrollArea } from './ui/scroll-area';
import { Input } from './ui/input';
import { cashierService } from '../services/cashier.service';
import { 
  Loader2, 
  LogOut, 
  LayoutDashboard,
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle,
  Download,
  FileText,
  Eye,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from './ui/dialog';
import React from 'react';

const PesoIcon = (props: any) => (
  <span {...props} className={(props.className || '') + ' inline-flex items-center'}>₱</span>
);
import api from '../utils/api';

interface CashierDashboardProps {
  onLogout: () => void;
}

export default function CashierDashboard({ onLogout }: CashierDashboardProps) {
  const [activeSection, setActiveSection] = useState('Dashboard');
  const [loading, setLoading] = useState(true);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [allTransactions, setAllTransactions] = useState<any[]>([]);
  const [error, setError] = useState('');
  const [stats, setStats] = useState({ pending: 0, completed: 0, rejected: 0, totalAmount: 0 });
  const [analytics, setAnalytics] = useState({ totalCollections: 0, outstandingBalances: 0, pendingCount: 0 });
  const [filters, setFilters] = useState({ status: 'Pending', search: '', school_year: '', semester: '' });
  const [expandedTx, setExpandedTx] = useState<number | null>(null);
  const [selectedTx, setSelectedTx] = useState<any>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [assessments, setAssessments] = useState<any[]>([]);
  const [loadingAssessments, setLoadingAssessments] = useState(false);
  const [pendingTransactions, setPendingTransactions] = useState<any[]>([]);
  const [loadingPending, setLoadingPending] = useState(false);
  const [installmentPayments, setInstallmentPayments] = useState<any[]>([]);
  const [loadingInstallments, setLoadingInstallments] = useState(false);
  const [rejectingPaymentId, setRejectingPaymentId] = useState<number | null>(null);
  const [rejectReason, setRejectReason] = useState('');

  const loadTransactions = async () => {
    try {
      setLoading(true);
      setError('');
      const resp = await cashierService.listTransactions(filters);
      const txList = resp?.data || resp || [];
      setTransactions(txList);
      setAllTransactions(txList);

      // Calculate stats from full list
      const pending = txList.filter((t: any) => t.status === 'Pending').length;
      const completed = txList.filter((t: any) => t.status === 'Completed').length;
      const rejected = txList.filter((t: any) => t.status === 'Rejected').length;
      const totalAmount = txList.reduce((sum: number, t: any) => sum + (t.amount || 0), 0);
      setStats({ pending, completed, rejected, totalAmount });

      // Pull aggregated analytics
      const snap = await cashierService.getAnalyticsSnapshot();
      const data = snap?.data || snap || {};
      setAnalytics({
        totalCollections: data.totalCollections || 0,
        outstandingBalances: data.outstandingBalances || 0,
        pendingCount: data.pendingCount || pending
      });
    } catch (err: any) {
      setError(err.message || 'Failed to load transactions');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadTransactions(); }, [filters]);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      if (activeSection !== 'Tuition Assessments') return;
      try {
        setLoadingAssessments(true);
        const resp = await cashierService.getTuitionAssessments();
        if (!mounted) return;
        setAssessments(resp?.data || resp || []);
      } catch (err) {
        console.error('Failed loading assessments', err);
      } finally {
        if (mounted) setLoadingAssessments(false);
      }
    };
    load();
    return () => { mounted = false; };
  }, [activeSection]);

  useEffect(() => {
    let mounted = true;
    const loadPending = async () => {
      if (activeSection !== 'Pending Verifications') return;
      try {
        setLoadingPending(true);
        const resp = await cashierService.listPending();
        if (!mounted) return;
        setPendingTransactions(resp?.data || resp || []);
        
        // Also load installment payments
        const installmentResp = await cashierService.getInstallmentPayments({ status: 'Pending' });
        if (mounted) {
          setInstallmentPayments(installmentResp?.data || installmentResp || []);
        }
      } catch (err) {
        console.error('Failed loading pending transactions', err);
      } finally {
        if (mounted) setLoadingPending(false);
      }
    };
    loadPending();
    return () => { mounted = false; };
  }, [activeSection]);

  const handleProcess = async (txId: number, action: 'complete' | 'reject') => {
    try {
      setLoading(true);
      await cashierService.process(txId, action, action === 'reject' ? 'Rejected by cashier' : 'Processed by cashier');
      await loadTransactions();
    } catch (err: any) {
      setError(err.message || 'Failed to process transaction');
      setLoading(false);
    }
  };

  const formatTimeAgo = (dateString: string) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} mins ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours} hours ago`;
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays} days ago`;
  };

  const handleDownloadReceipt = async (receiptPath: string, filename: string) => {
    try {
      const response = await api.get(`/students/documents/download?path=${encodeURIComponent(receiptPath)}`, {
        responseType: 'blob'
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', filename || 'receipt');
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err: any) {
      alert('Failed to download receipt');
    }
  };

  const viewTransactionDetails = (tx: any) => {
    setSelectedTx(tx);
    setDetailsOpen(true);
  };

  const updateFilter = (key: keyof typeof filters, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const menuItems = [
    { name: 'Dashboard', icon: LayoutDashboard },
    { name: 'Tuition Assessments', icon: FileText },
    { name: 'Pending Verifications', icon: Clock },
    { name: 'Transaction Logs', icon: FileText },
  ];

  const statCards = [
    { label: 'Total Collections', value: `₱${analytics.totalCollections.toLocaleString('en-US', { minimumFractionDigits: 2 })}`, icon: PesoIcon, color: 'from-green-500 to-green-600' },
    { label: 'Outstanding Balances', value: `₱${analytics.outstandingBalances.toLocaleString('en-US', { minimumFractionDigits: 2 })}`, icon: AlertCircle, color: 'from-orange-500 to-orange-600' },
    { label: 'Pending Transactions', value: (analytics.pendingCount || stats.pending).toString(), icon: Clock, color: 'from-amber-500 to-amber-600' },
    { label: 'Logged Transactions', value: allTransactions.length.toString(), icon: FileText, color: 'from-purple-500 to-purple-600' },
  ];

  const renderDashboardContent = () => {
    if (loading) {
      return (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        </div>
      );
    }

    return (
      <>
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {statCards.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <Card key={index} className="p-6 border-0 shadow-lg hover:shadow-xl transition-all bg-white">
                <div className="flex items-start justify-between mb-4">
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center shadow-md`}>
                    <Icon className="h-6 w-6 text-white" />
                  </div>
                </div>
                <h3 className="text-3xl mb-1">{stat.value}</h3>
                <p className="text-sm text-slate-600">{stat.label}</p>
              </Card>
            );
          })}
        </div>

        {/* Recent Transactions */}
        <Card className="border-0 shadow-lg overflow-hidden">
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-4">
            <h3 className="text-white font-medium">Recent Pending Transactions</h3>
          </div>
          <ScrollArea className="h-[400px]">
            <div className="p-4">
              {transactions.length === 0 ? (
                <p className="text-sm text-slate-500 text-center py-8">No pending transactions</p>
              ) : (
                <div className="space-y-3">
                  {transactions.slice(0, 5).map((tx) => (
                    <div key={tx.id} className="p-4 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors">
                      <div className="flex items-center justify-between mb-2">
                        <div>
                          <p className="text-sm font-medium text-slate-900">{tx.student_name || 'Unknown Student'}</p>
                          <p className="text-xs text-slate-500">
                            {tx.payment_method || 'N/A'} • Ref: {tx.reference_number || '—'}
                          </p>
                        </div>
                        <Badge className="bg-orange-100 text-orange-700 border-0">
                          {tx.status || 'Pending'}
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <p className="text-lg font-semibold text-blue-600">
                          ₱{(tx.amount || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                        </p>
                        <p className="text-xs text-slate-400">{formatTimeAgo(tx.created_at)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </ScrollArea>
        </Card>
      </>
    );
  };

  const renderTransactionsContent = () => {
    if (loading) {
      return (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        </div>
      );
    }

    return (
      <Card className="border-0 shadow-lg">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Transactions</h3>
          </div>

          {/* Filters */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-4">
            <Input
              placeholder="Search student or reference"
              value={filters.search}
              onChange={(e) => updateFilter('search', e.target.value)}
            />
            <select
              className="border rounded-md px-3 py-2 text-sm"
              value={filters.status}
              onChange={(e) => updateFilter('status', e.target.value)}
            >
              <option value="Pending">Pending</option>
              <option value="Completed">Completed</option>
              <option value="Rejected">Rejected</option>
              <option value="">All</option>
            </select>
            <select
              className="border rounded-md px-3 py-2 text-sm"
              value={filters.school_year}
              onChange={(e) => updateFilter('school_year', e.target.value)}
            >
              <option value="">All Years</option>
              <option value="2023-2024">2023-2024</option>
              <option value="2024-2025">2024-2025</option>
              <option value="2025-2026">2025-2026</option>
              <option value="2026-2027">2026-2027</option>
            </select>
            <select
              className="border rounded-md px-3 py-2 text-sm"
              value={filters.semester}
              onChange={(e) => updateFilter('semester', e.target.value)}
            >
              <option value="">All Semesters</option>
              <option value="1st">1st</option>
              <option value="2nd">2nd</option>
              <option value="Summer">Summer</option>
            </select>
          </div>
          {transactions.length === 0 ? (
            <p className="text-sm text-slate-500 text-center py-8">No transactions found</p>
          ) : (
            <div className="space-y-4">
              {transactions.map((tx) => (
                <div key={tx.id} className="border rounded-lg overflow-hidden">
                  {/* Transaction Header */}
                  <div 
                    className="p-4 bg-slate-50 cursor-pointer hover:bg-slate-100 transition-colors"
                    onClick={() => setExpandedTx(expandedTx === tx.id ? null : tx.id)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                          <PesoIcon className="h-5 w-5 text-blue-600" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="font-medium text-slate-900">{tx.student_name || 'Unknown Student'}</h4>
                            <Badge className="bg-orange-100 text-orange-700 border-0 text-xs">
                              {tx.status || 'Pending'}
                            </Badge>
                          </div>
                          <p className="text-sm text-slate-500">
                            {tx.course || 'N/A'} • Year {tx.year_level || 'N/A'} • {tx.school_year} {tx.semester} Sem
                          </p>
                          <p className="text-xs text-slate-600">
                            Outstanding: ₱{(tx.outstanding_balance ?? 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <p className="text-lg font-semibold text-blue-600">
                            ₱{(tx.amount || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                          </p>
                          <p className="text-xs text-slate-400">{formatTimeAgo(tx.created_at)}</p>
                        </div>
                        {expandedTx === tx.id ? (
                          <ChevronUp className="h-5 w-5 text-slate-400" />
                        ) : (
                          <ChevronDown className="h-5 w-5 text-slate-400" />
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Expanded Details */}
                  {expandedTx === tx.id && (
                    <div className="p-4 border-t bg-white">
                      <div className="grid grid-cols-2 gap-6">
                        {/* Payment Details */}
                        <div>
                          <h5 className="font-medium text-slate-900 mb-3 flex items-center gap-2">
                            <FileText className="h-4 w-4" />
                            Payment Details
                          </h5>
                          <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                              <span className="text-slate-500">Student ID</span>
                              <span className="font-medium">{tx.student_id || 'N/A'}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-slate-500">Payment Method</span>
                              <span className="font-medium">{tx.payment_method || 'N/A'}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-slate-500">Reference Number</span>
                              <span className="font-medium">{tx.reference_number || '—'}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-slate-500">Transaction Type</span>
                              <span className="font-medium">{tx.transaction_type || 'Enrollment Fee'}</span>
                            </div>
                          </div>
                          
                          {/* Proof of Payment */}
                          <div className="mt-4 pt-4 border-t">
                            <h6 className="text-sm font-medium text-slate-700 mb-2">Proof of Payment</h6>
                            {tx.receipt_path ? (
                              <Button 
                                size="sm" 
                                variant="outline"
                                onClick={() => handleDownloadReceipt(tx.receipt_path, tx.receipt_filename || 'receipt')}
                                className="w-full"
                              >
                                <Download className="h-4 w-4 mr-2" />
                                Download Receipt
                              </Button>
                            ) : (
                              <p className="text-sm text-slate-400 italic">No receipt uploaded</p>
                            )}
                          </div>
                        </div>

                        {/* Assessment Breakdown */}
                        <div>
                          <h5 className="font-medium text-slate-900 mb-3 flex items-center gap-2">
                            <PesoIcon className="h-4 w-4" />
                            Assessment Breakdown
                          </h5>
                          <div className="space-y-2 text-sm bg-slate-50 rounded-lg p-3">
                            {tx.tuition > 0 && (
                              <div className="flex justify-between">
                                <span className="text-slate-500">Tuition Fee</span>
                                <span>₱{tx.tuition?.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                              </div>
                            )}
                            {tx.registration > 0 && (
                              <div className="flex justify-between">
                                <span className="text-slate-500">Registration Fee</span>
                                <span>₱{tx.registration?.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                              </div>
                            )}
                            {tx.library > 0 && (
                              <div className="flex justify-between">
                                <span className="text-slate-500">Library Fee</span>
                                <span>₱{tx.library?.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                              </div>
                            )}
                            {tx.lab > 0 && (
                              <div className="flex justify-between">
                                <span className="text-slate-500">Laboratory Fee</span>
                                <span>₱{tx.lab?.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                              </div>
                            )}
                            {tx.id_fee > 0 && (
                              <div className="flex justify-between">
                                <span className="text-slate-500">ID Fee</span>
                                <span>₱{tx.id_fee?.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                              </div>
                            )}
                            {tx.others > 0 && (
                              <div className="flex justify-between">
                                <span className="text-slate-500">Other Fees</span>
                                <span>₱{tx.others?.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                              </div>
                            )}
                            <div className="flex justify-between font-semibold border-t pt-2 mt-2">
                              <span>Total Amount</span>
                              <span className="text-blue-600">₱{tx.total_amount?.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                            </div>
                          </div>
                          {tx.enrollment_remarks && (
                            <p className="text-xs text-slate-500 mt-2">
                              <span className="font-medium">Remarks:</span> {tx.enrollment_remarks}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex gap-3 mt-4 pt-4 border-t justify-end">
                        <Button 
                          variant="outline"
                          onClick={() => viewTransactionDetails(tx)}
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          Full Details
                        </Button>
                        <Button 
                          variant="destructive"
                          onClick={() => handleProcess(tx.id, 'reject')}
                        >
                          <XCircle className="h-4 w-4 mr-2" />
                          Reject Payment
                        </Button>
                        <Button 
                          onClick={() => handleProcess(tx.id, 'complete')}
                        >
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Approve Payment
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </Card>
    );
  };

  const renderTuitionAssessmentsContent = () => {
    if (loadingAssessments) return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );

    return (
      <Card className="border-0 shadow-lg">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Tuition Assessments</h3>
            <p className="text-sm text-slate-500">Review system-generated tuition assessments and approve.</p>
          </div>

          {assessments.length === 0 ? (
            <p className="text-sm text-slate-500">No assessments awaiting cashier review.</p>
          ) : (
            <div className="space-y-3">
              {assessments.map((a: any) => (
                <div key={a.id} className="border rounded-lg p-4 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">{a.student_name} • {a.student_id}</p>
                    <p className="text-xs text-slate-500">{a.course} • Year {a.year_level} • {a.school_year} {a.semester}</p>
                    <p className="text-sm text-slate-700">Total: ₱{(a.total_amount || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" onClick={async () => {
                      if (!confirm('Approve this tuition assessment and mark Ready for Payment?')) return;
                      try {
                        await cashierService.approveAssessment(a.id);
                        alert('Assessment approved');
                        // refresh list
                        const resp = await cashierService.getTuitionAssessments();
                        setAssessments(resp?.data || resp || []);
                      } catch (err: any) {
                        alert(err.message || 'Failed to approve assessment');
                      }
                    }}>
                      Approve
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </Card>
    );
  };

  const renderPendingVerificationsContent = () => {
    if (loadingPending) return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );

    const refreshPending = async () => {
      try {
        setLoadingPending(true);
        const resp = await cashierService.listPending();
        setPendingTransactions(resp?.data || resp || []);
        
        // Also refresh installment payments
        const installmentResp = await cashierService.getInstallmentPayments({ status: 'Pending' });
        setInstallmentPayments(installmentResp?.data || installmentResp || []);
      } catch (err) {
        console.error('Failed refreshing pending', err);
      } finally {
        setLoadingPending(false);
      }
    };

    const handleApproveInstallment = async (paymentId: number) => {
      if (!confirm('Approve this installment payment?')) return;
      try {
        await cashierService.approveInstallmentPayment(paymentId);
        alert('Installment payment approved');
        await refreshPending();
        await loadTransactions(); // Refresh analytics
      } catch (err: any) {
        alert(err.message || 'Failed to approve installment payment');
      }
    };

    const handleRejectInstallment = async (paymentId: number) => {
      if (!rejectReason.trim()) {
        alert('Please provide a rejection reason');
        return;
      }
      try {
        await cashierService.rejectInstallmentPayment(paymentId, rejectReason);
        alert('Installment payment rejected');
        setRejectingPaymentId(null);
        setRejectReason('');
        await refreshPending();
        await loadTransactions(); // Refresh analytics
      } catch (err: any) {
        alert(err.message || 'Failed to reject installment payment');
      }
    };

    return (
      <Card className="border-0 shadow-lg">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold">Pending Verifications</h3>
            <p className="text-sm text-slate-500">Payments uploaded by students and awaiting cashier verification.</p>
          </div>

          {/* Installment Payments Section */}
          <div className="mb-8">
            <h4 className="font-semibold text-base mb-4 flex items-center gap-2">
              <Clock className="h-5 w-5 text-orange-600" />
              Installment Payments
            </h4>
            {installmentPayments.length === 0 ? (
              <p className="text-sm text-slate-500 ml-7">No pending installment payments.</p>
            ) : (
              <div className="space-y-3 ml-7">
                {installmentPayments.map((ip: any) => (
                  <div key={ip.id} className="border rounded-lg p-4 bg-orange-50 border-orange-200">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <p className="text-sm font-medium">{ip.student_name} • {ip.student_id}</p>
                        <p className="text-xs text-slate-500">{ip.course} • Year {ip.year_level} • {ip.school_year} {ip.semester}</p>
                        <div className="mt-2 space-y-1">
                          <p className="text-sm text-slate-700">Period: <span className="font-semibold">{ip.period}</span></p>
                          <p className="text-sm text-slate-700">Amount: <span className="font-semibold">₱{(ip.amount || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}</span></p>
                          <p className="text-xs text-slate-500">Payment Method: {ip.payment_method}</p>
                          {ip.reference_number && <p className="text-xs text-slate-500">Reference: {ip.reference_number}</p>}
                        </div>
                      </div>
                      <div className="flex flex-col gap-2">
                        {rejectingPaymentId === ip.id ? (
                          <div className="w-48 space-y-2 border rounded-lg p-2 bg-white">
                            <textarea
                              placeholder="Enter rejection reason..."
                              className="w-full text-xs p-2 border rounded"
                              value={rejectReason}
                              onChange={(e) => setRejectReason(e.target.value)}
                              rows={3}
                            />
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => handleRejectInstallment(ip.id)}
                              >
                                Confirm
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => {
                                  setRejectingPaymentId(null);
                                  setRejectReason('');
                                }}
                              >
                                Cancel
                              </Button>
                            </div>
                          </div>
                        ) : (
                          <>
                            <Button
                              size="sm"
                              onClick={() => handleApproveInstallment(ip.id)}
                            >
                              <CheckCircle className="h-4 w-4 mr-2" />
                              Approve
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => setRejectingPaymentId(ip.id)}
                            >
                              <XCircle className="h-4 w-4 mr-2" />
                              Reject
                            </Button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Regular Pending Transactions Section */}
          <div>
            <h4 className="font-semibold text-base mb-4 flex items-center gap-2">
              <Clock className="h-5 w-5 text-blue-600" />
              Regular Payments
            </h4>
            {pendingTransactions.length === 0 ? (
              <p className="text-sm text-slate-500 ml-7">No pending regular payments for verification.</p>
            ) : (
              <div className="space-y-3 ml-7">
                {pendingTransactions.map((pt: any) => (
                  <div key={pt.id} className="border rounded-lg p-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-sm font-medium">{pt.student_name} • {pt.student_id}</p>
                        <p className="text-xs text-slate-500">{pt.course} • Year {pt.year_level} • {pt.school_year} {pt.semester}</p>
                        <p className="text-sm text-slate-700 mt-2">Amount: ₱{(pt.amount || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}</p>
                        <p className="text-xs text-slate-500">Outstanding: ₱{(pt.outstanding_balance || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}</p>
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        {pt.receipt_path ? (
                          <Button size="sm" variant="outline" onClick={() => handleDownloadReceipt(pt.receipt_path, pt.receipt_filename || 'receipt') }>
                            <Download className="h-4 w-4 mr-2" />
                            Download Receipt
                          </Button>
                        ) : (
                          <p className="text-xs italic text-slate-400">No receipt uploaded</p>
                        )}
                        <div className="flex gap-2">
                          <Button variant="destructive" size="sm" onClick={async () => {
                            if (!confirm('Reject this payment?')) return;
                            try {
                              await cashierService.process(pt.id, 'reject', 'Rejected by cashier');
                              alert('Payment rejected');
                              await refreshPending();
                              await loadTransactions();
                            } catch (err: any) {
                              alert(err.message || 'Failed to reject payment');
                            }
                          }}>
                            <XCircle className="h-4 w-4 mr-2" />
                            Reject
                          </Button>
                          <Button size="sm" onClick={async () => {
                            if (!confirm('Approve this payment?')) return;
                            try {
                              await cashierService.process(pt.id, 'complete', 'Approved by cashier');
                              alert('Payment approved');
                              await refreshPending();
                              await loadTransactions();
                            } catch (err: any) {
                              alert(err.message || 'Failed to approve payment');
                            }
                          }}>
                            <CheckCircle className="h-4 w-4 mr-2" />
                            Approve
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </Card>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-6">
      <div className="max-w-[1600px] mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl mb-1">Cashier Dashboard</h1>
            <p className="text-sm text-slate-600">Payment processing and transaction management</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3 px-4 py-2 bg-white rounded-xl shadow-md">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center text-white">
                <PesoIcon className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-900">Cashier</p>
                <p className="text-xs text-slate-500">Payment Processing</p>
              </div>
            </div>
            <Button 
              onClick={onLogout}
              variant="outline" 
              className="gap-2 hover:bg-red-50 hover:text-red-600 hover:border-red-200"
            >
              <LogOut className="h-4 w-4" />
              Logout
            </Button>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center gap-2 text-red-700">
              <AlertCircle className="h-5 w-5" />
              <p>{error}</p>
            </div>
          </div>
        )}

        {/* Main Content */}
        <div className="grid grid-cols-12 gap-6">
          {/* Sidebar */}
          <div className="col-span-3">
            <Card className="border-0 shadow-lg p-4 sticky top-6">
              <ScrollArea className="h-[calc(100vh-200px)]">
                <div className="space-y-2">
                  {menuItems.map((item) => {
                    const Icon = item.icon;
                    return (
                      <Button
                        key={item.name}
                        variant={activeSection === item.name ? 'default' : 'ghost'}
                        className={`w-full justify-start gap-3 ${
                          activeSection === item.name
                            ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white'
                            : 'hover:bg-slate-100'
                        }`}
                        onClick={() => setActiveSection(item.name)}
                      >
                        <Icon className="h-5 w-5" />
                        {item.name}
                      </Button>
                    );
                  })}
                </div>
              </ScrollArea>
            </Card>
          </div>

          {/* Content Area */}
          <div className="col-span-9">
            {activeSection === 'Dashboard' && renderDashboardContent()}
            {activeSection === 'Tuition Assessments' && renderTuitionAssessmentsContent()}
            {activeSection === 'Pending Verifications' && renderPendingVerificationsContent()}
            {activeSection === 'Transaction Logs' && renderTransactionsContent()}
          </div>
        </div>
      </div>

      {/* Transaction Details Dialog */}
      <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Transaction Details</DialogTitle>
            <DialogDescription>
              Full details for payment verification
            </DialogDescription>
          </DialogHeader>
          {selectedTx && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <h4 className="font-medium">Student Information</h4>
                  <div className="text-sm space-y-1">
                    <p><span className="text-slate-500">Name:</span> {selectedTx.student_name}</p>
                    <p><span className="text-slate-500">Student ID:</span> {selectedTx.student_id}</p>
                    <p><span className="text-slate-500">Course:</span> {selectedTx.course || 'N/A'}</p>
                    <p><span className="text-slate-500">Year Level:</span> {selectedTx.year_level || 'N/A'}</p>
                  </div>
                </div>
                <div className="space-y-2">
                  <h4 className="font-medium">Payment Information</h4>
                  <div className="text-sm space-y-1">
                    <p><span className="text-slate-500">Method:</span> {selectedTx.payment_method}</p>
                    <p><span className="text-slate-500">Reference:</span> {selectedTx.reference_number || '—'}</p>
                    <p><span className="text-slate-500">Amount:</span> ₱{selectedTx.amount?.toLocaleString('en-US', { minimumFractionDigits: 2 })}</p>
                    <p><span className="text-slate-500">Date:</span> {new Date(selectedTx.created_at).toLocaleDateString()}</p>
                  </div>
                </div>
              </div>
              
              <div className="space-y-2">
                <h4 className="font-medium">Assessment Breakdown</h4>
                <div className="bg-slate-50 rounded-lg p-4 text-sm space-y-2">
                  {selectedTx.tuition > 0 && (
                    <div className="flex justify-between">
                      <span>Tuition Fee</span>
                      <span>₱{selectedTx.tuition?.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                    </div>
                  )}
                  {selectedTx.registration > 0 && (
                    <div className="flex justify-between">
                      <span>Registration Fee</span>
                      <span>₱{selectedTx.registration?.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                    </div>
                  )}
                  {selectedTx.library > 0 && (
                    <div className="flex justify-between">
                      <span>Library Fee</span>
                      <span>₱{selectedTx.library?.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                    </div>
                  )}
                  {selectedTx.lab > 0 && (
                    <div className="flex justify-between">
                      <span>Laboratory Fee</span>
                      <span>₱{selectedTx.lab?.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                    </div>
                  )}
                  {selectedTx.id_fee > 0 && (
                    <div className="flex justify-between">
                      <span>ID Fee</span>
                      <span>₱{selectedTx.id_fee?.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                    </div>
                  )}
                  {selectedTx.others > 0 && (
                    <div className="flex justify-between">
                      <span>Other Fees</span>
                      <span>₱{selectedTx.others?.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                    </div>
                  )}
                  <div className="flex justify-between font-semibold border-t pt-2">
                    <span>Total</span>
                    <span className="text-blue-600">₱{selectedTx.total_amount?.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                  </div>
                </div>
              </div>

              {selectedTx.receipt_path && (
                <div className="space-y-2">
                  <h4 className="font-medium">Proof of Payment</h4>
                  <Button 
                    variant="outline"
                    onClick={() => handleDownloadReceipt(selectedTx.receipt_path, selectedTx.receipt_filename || 'receipt')}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Download Receipt
                  </Button>
                </div>
              )}

              <div className="flex gap-3 pt-4 border-t justify-end">
                <Button variant="outline" onClick={() => setDetailsOpen(false)}>
                  Close
                </Button>
                <Button 
                  variant="destructive"
                  onClick={() => {
                    handleProcess(selectedTx.id, 'reject');
                    setDetailsOpen(false);
                  }}
                >
                  <XCircle className="h-4 w-4 mr-2" />
                  Reject
                </Button>
                <Button 
                  onClick={() => {
                    handleProcess(selectedTx.id, 'complete');
                    setDetailsOpen(false);
                  }}
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Approve
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
