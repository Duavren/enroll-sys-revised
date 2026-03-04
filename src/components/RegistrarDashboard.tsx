import { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { 
  LogOut, 
  LayoutDashboard, 
  FileText,
  Users,
  ClipboardCheck,
  Award,
  Printer,
  Download,
  Search,
  Filter,
  Eye,
  Edit,
  CheckCircle,
  Loader2,
  AlertCircle,
  Plus,
  Trash2,
  Calendar,
  Clock,
  BookOpen,
  X
} from 'lucide-react';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { ScrollArea } from './ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Label } from './ui/label';
import { Input } from './ui/input';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from './ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from './ui/dialog';
import { registrarService } from '../services/registrar.service';
import { adminService } from '../services/admin.service';
import { gradesService } from '../services/grades.service';
import { maintenanceService } from '../services/maintenance.service';
import { subjectService } from '../services/subject.service';
import { enrollmentService } from '../services/enrollment.service';

interface RegistrarDashboardProps {
  onLogout: () => void;
}

export default function RegistrarDashboard({ onLogout }: RegistrarDashboardProps) {
  const [activeSection, setActiveSection] = useState('Dashboard');
  const [pendingEnrollments, setPendingEnrollments] = useState<any[]>([]);
  const [assessDialogOpen, setAssessDialogOpen] = useState(false);
  const [approvalDialogOpen, setApprovalDialogOpen] = useState(false);
  const [approvalAction, setApprovalAction] = useState<{ type: 'approve' | 'reject'; enrollment: any } | null>(null);
  const [approvalRemarks, setApprovalRemarks] = useState('');
  const [previewDocumentsOpen, setPreviewDocumentsOpen] = useState(false);
  const [previewEnrollment, setPreviewEnrollment] = useState<any>(null);
  const [selectedEnrollmentForAssess, setSelectedEnrollmentForAssess] = useState<any>(null);
  const [subjectAssessmentDetails, setSubjectAssessmentDetails] = useState<any>(null);
  const [availableSubjects, setAvailableSubjects] = useState<any[]>([]);
  const [subjectFilters, setSubjectFilters] = useState({
    course: '',
    year_level: '',
    semester: ''
  });
  const [assessmentForm, setAssessmentForm] = useState({
    tuition: 0,
    registration: 0,
    library: 0,
    lab: 0,
    id_fee: 0,
    others: 0,
    remarks: '',
    scholarship_coverage: ''
  });

  const SCHOLARSHIP_DEFINITIONS: any = {
    'Merit Scholarship': {
      coverage: ['Highest Honors — 100%','High Honors — 50%'],
      duties: 'Complete 50 hours of Student Assistance Work per term and maintain grade requirements based on scholarship level.'
    },
    'Academic Scholarship': {
      coverage: ['GWA 1.25 — 100%','GWA 1.50 — 50%','GWA 1.75 — 20%'],
      duties: 'Complete 50 hours of Student Assistance Work per term and maintain required academic standing.'
    },
    'Financial Assistance Scholarship': {
      coverage: ['50% scholarship'],
      duties: 'No failing grades. Complete 50 hours of Student Assistance Work per term.'
    },
    'Working Student Scholarship': {
      coverage: ['MI ≤ ₱17,500 — 50%','MI ₱20,000–22,499 — 40%','MI ₱22,500–25,000 — 30%'],
      duties: 'Complete 50 hours of Student Assistance Work per term. Maximum residency: 7 years and 1 term.'
    },
    'Partnership Scholarships': {
      coverage: ['AFP/NBI/PNP — per MOU','LGU — 50%'],
      duties: 'No failing grades. Complete program within allotted time.'
    },
    'Promotional Scholarship Grants': {
      coverage: ['Depends on approved grant/campaign'],
      duties: 'Duties depend on terms of the approved campaign or grant.'
    }
  };

  const calculateTuition = (coverage: string | undefined) => {
    const baseTuition = 14000;
    if (!coverage) return baseTuition;

    if (coverage.includes('100%')) return 0;
    if (coverage.includes('50%')) return baseTuition * 0.5;
    if (coverage.includes('40%')) return baseTuition * 0.6;
    if (coverage.includes('30%')) return baseTuition * 0.7;
    if (coverage.includes('25%')) return baseTuition * 0.75;
    if (coverage.includes('20%')) return baseTuition * 0.8;
    
    return baseTuition;
  };

  const getTuitionDeduction = (coverage: string | undefined, baseTuition: number = 14000) => {
    if (!coverage) return 0;
    if (coverage.includes('100%')) return baseTuition;
    if (coverage.includes('50%')) return baseTuition * 0.5;
    if (coverage.includes('40%')) return baseTuition * 0.4;
    if (coverage.includes('30%')) return baseTuition * 0.3;
    if (coverage.includes('25%')) return baseTuition * 0.25;
    if (coverage.includes('20%')) return baseTuition * 0.2;
    return 0;
  };
  const [loading, setLoading] = useState(true);
  const [dashboardStats, setDashboardStats] = useState<any>(null);
  const [studentRecords, setStudentRecords] = useState<any[]>([]);
  const [corRequests, setCorRequests] = useState<any[]>([]);
  const [clearanceRequests, setClearanceRequests] = useState<any[]>([]);
  const [gradeSubmissions, setGradeSubmissions] = useState<any[]>([]);
  const [error, setError] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState('');
  const [enrollmentReport, setEnrollmentReport] = useState<any>(null);
  const [sections, setSections] = useState<any[]>([]);
  const [assignDialogOpen, setAssignDialogOpen] = useState(false);
  const [assignForm, setAssignForm] = useState<{ enrollmentId: number | null; sectionId: string }>({ enrollmentId: null, sectionId: '' });
  const [selectedRecord, setSelectedRecord] = useState<any>(null);
  const [viewStudentOpen, setViewStudentOpen] = useState(false);
  const [editStudentForm, setEditStudentForm] = useState<any>({});

  useEffect(() => {
    fetchData();
  }, [activeSection]);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError('');

      if (activeSection === 'Dashboard') {
        const statsResponse = await registrarService.getDashboardStats();
        if (statsResponse.success) {
          setDashboardStats(statsResponse.data);
        }
        const reportResp = await registrarService.getEnrollmentReport();
        if (reportResp.success) {
          setEnrollmentReport(reportResp.data);
        }
        // Fetch recent CORs and clearances for dashboard
        const corsResponse = await registrarService.getAllCORs({ status: 'Pending' });
        if (corsResponse.success) {
          setCorRequests(corsResponse.data?.slice(0, 5) || []);
        }
        const clearancesResponse = await registrarService.getAllClearances({ status: 'Pending' });
        if (clearancesResponse.success) {
          setClearanceRequests(clearancesResponse.data?.slice(0, 5) || []);
        }
      } else if (activeSection === 'Student Records') {
        const studentsResponse = await adminService.getAllStudents();
        if (studentsResponse.success) {
          setStudentRecords(studentsResponse.data || []);
        }
      } else if (activeSection === 'COR Management') {
        const corsResponse = await registrarService.getAllCORs();
        if (corsResponse.success) {
          setCorRequests(corsResponse.data || []);
        }
      } else if (activeSection === 'Clearances') {
        const clearancesResponse = await registrarService.getAllClearances();
        if (clearancesResponse.success) {
          setClearanceRequests(clearancesResponse.data || []);
        }
      } else if (activeSection === 'Grades Management') {
        // For now, we'll show placeholder. In a real system, this would fetch from enrollment_subjects
        setGradeSubmissions([]);
        } else if (activeSection === 'Pending Enrollments') {
          // Fetch enrollments in both 'Pending Assessment' and 'For Admin Approval' status
          const pendingResp = await adminService.getAllEnrollments({ status: 'Pending Assessment' });
          const approvalResp = await adminService.getAllEnrollments({ status: 'For Admin Approval' });
          if (pendingResp || approvalResp) {
            const pending = pendingResp?.data || pendingResp || [];
            const approval = approvalResp?.data || approvalResp || [];
            setPendingEnrollments([...pending, ...approval]);
          }
          const sectionsResp = await maintenanceService.getAllSections();
          if (sectionsResp.success) {
            setSections(sectionsResp.data || []);
          }
      }
    } catch (err: any) {
      setError(err.message || 'Failed to fetch data');
      console.error('Fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateCOR = async (enrollmentId: number) => {
    try {
      setError('');
      await registrarService.generateCOR(enrollmentId);
      fetchData();
      alert('COR generated successfully!');
    } catch (err: any) {
      setError(err.message || 'Failed to generate COR');
    }
  };

  const openAssessDialog = async (enrollment: any) => {
    setSelectedEnrollmentForAssess(enrollment);
    const initialCoverage = enrollment.scholarship_type && enrollment.scholarship_type !== 'None'
      ? SCHOLARSHIP_DEFINITIONS[enrollment.scholarship_type]?.coverage?.[0]
      : '';
    setAssessmentForm({
      tuition: 14000,
      registration: 1500,
      library: 500,
      lab: 2000,
      id_fee: 200,
      others: 300,
      remarks: '',
      scholarship_coverage: initialCoverage
    });
    setAssessDialogOpen(true);
    try {
      const [detailsResp, subjResp] = await Promise.all([
        registrarService.getEnrollmentAssessmentDetails(enrollment.id),
        subjectService.getSubjectsByCourse(enrollment.course, enrollment.year_level, enrollment.semester)
      ]);
      const allSubjects: any[] = subjResp.success ? (subjResp.data || []) : [];
      const alreadyAdded: any[] = detailsResp.success ? (detailsResp.data?.subjects || []) : [];
      setAvailableSubjects(allSubjects);

      // Auto-add any subject not yet enrolled
      const alreadyIds = new Set(alreadyAdded.map((s: any) => s.subject_id));
      const toAdd = allSubjects.filter((s: any) => !alreadyIds.has(s.id));
      if (toAdd.length > 0) {
        await Promise.all(toAdd.map((s: any) => enrollmentService.addSubject(enrollment.id, s.id).catch(() => {})));
      }
      // Refresh after bulk-add
      const refreshed = await registrarService.getEnrollmentAssessmentDetails(enrollment.id);
      if (refreshed.success) {
        setSubjectAssessmentDetails(refreshed.data);
        const totalUnits = refreshed.data.subjects?.reduce((sum: number, s: any) => sum + (s.units || 0), 0) || 0;
        setAssessmentForm(prev => ({ ...prev, tuition: totalUnits * 700 }));
      } else {
        setSubjectAssessmentDetails(detailsResp.success ? detailsResp.data : null);
      }
    } catch (err) {
      console.error('Failed to load subjects for assessment:', err);
      setSubjectAssessmentDetails(null);
      setAvailableSubjects([]);
    }
  };

  const handleAddSubjectToEnrollment = async (subjectId: number) => {
    if (!selectedEnrollmentForAssess) return;
    try {
      setLoading(true);
      await enrollmentService.addSubject(selectedEnrollmentForAssess.id, subjectId);
      const resp = await registrarService.getEnrollmentAssessmentDetails(selectedEnrollmentForAssess.id);
      if (resp.success) {
        setSubjectAssessmentDetails(resp.data);
        const totalUnits = resp.data.subjects?.reduce((sum: number, s: any) => sum + (s.units || 0), 0) || 0;
        setAssessmentForm(prev => ({ ...prev, tuition: totalUnits * 700 }));
      }
    } catch (err: any) {
      alert(err.message || 'Failed to add subject');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveSubjectFromEnrollment = async (subjectId: number) => {
    if (!selectedEnrollmentForAssess) return;
    try {
      setLoading(true);
      await enrollmentService.removeSubject(selectedEnrollmentForAssess.id, subjectId);
      const resp = await registrarService.getEnrollmentAssessmentDetails(selectedEnrollmentForAssess.id);
      if (resp.success) {
        setSubjectAssessmentDetails(resp.data);
        const totalUnits = resp.data.subjects?.reduce((sum: number, s: any) => sum + (s.units || 0), 0) || 0;
        setAssessmentForm(prev => ({ ...prev, tuition: totalUnits * 700 }));
      }
    } catch (err: any) {
      alert(err.message || 'Failed to remove subject');
    } finally {
      setLoading(false);
    }
  };

  const handleAssignSection = async () => {
    if (!assignForm.enrollmentId || !assignForm.sectionId) return;
    try {
      setLoading(true);
      await registrarService.assignSection(assignForm.enrollmentId, Number(assignForm.sectionId));
      setAssignDialogOpen(false);
      setAssignForm({ enrollmentId: null, sectionId: '' });
      await fetchData();
      alert('Section assigned successfully');
    } catch (err: any) {
      setError(err.message || 'Failed to assign section');
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadScholarship = (path: string) => {
    const filename = path.split('/').pop();
    const token = localStorage.getItem('auth_token');
    const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';
    const url = `${baseUrl}/api/registrar/scholarships/download/${filename}?token=${token}`;
    window.open(url, '_blank');
  };

  const handleDownloadDocument = (docId: number) => {
    const token = localStorage.getItem('auth_token');
    const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';
    const url = `${baseUrl}/api/admin/documents/${docId}/download?token=${token}`;
    window.open(url, '_blank');
  };

  const handleAssessEnrollment = async () => {
    if (!selectedEnrollmentForAssess) return;
    if (!subjectAssessmentDetails?.subjects?.length) {
      alert('Please assign at least one subject before completing assessment.');
      return;
    }
    try {
      setLoading(true);
      // 1. Save fees (send actual post-scholarship tuition to backend)
      const finalTuition = assessmentForm.tuition - getTuitionDeduction(assessmentForm.scholarship_coverage, assessmentForm.tuition);
      const formToSubmit = { ...assessmentForm, tuition: finalTuition };
      await registrarService.assessEnrollment(selectedEnrollmentForAssess.id, formToSubmit);
      // 2. Forward to Dean
      await registrarService.approveSubjectAssessment(selectedEnrollmentForAssess.id, {
        ...formToSubmit,
        remarks: assessmentForm.remarks
      });
      setAssessDialogOpen(false);
      alert('Assessment complete. Enrollment forwarded to Dean for approval.');
      fetchData();
    } catch (err: any) {
      console.error(err);
      alert(err.message || 'Failed to complete assessment');
    } finally {
      setLoading(false);
    }
  };

  const handleApproveCOR = async (corId: number) => {
    try {
      setError('');
      await registrarService.approveCOR(corId);
      fetchData();
    } catch (err: any) {
      setError(err.message || 'Failed to approve COR');
    }
  };

  const handleResolveClearance = async (clearanceId: number) => {
    try {
      setError('');
      await registrarService.resolveClearance(clearanceId);
      fetchData();
    } catch (err: any) {
      setError(err.message || 'Failed to resolve clearance');
    }
  };

  const handleApproveEnrollment = async () => {
    if (!approvalAction?.enrollment) return;
    try {
      setLoading(true);
      await registrarService.approveEnrollment(approvalAction.enrollment.id, approvalRemarks);
      setApprovalDialogOpen(false);
      setApprovalAction(null);
      setApprovalRemarks('');
      alert(`Enrollment approved for ${approvalAction.enrollment.student}`);
      await fetchData();
    } catch (err: any) {
      console.error(err);
      alert(err.message || 'Failed to approve enrollment');
    } finally {
      setLoading(false);
    }
  };

  const handleRejectEnrollment = async () => {
    if (!approvalAction?.enrollment) return;
    try {
      setLoading(true);
      await registrarService.rejectEnrollment(approvalAction.enrollment.id, approvalRemarks);
      setApprovalDialogOpen(false);
      setApprovalAction(null);
      setApprovalRemarks('');
      alert(`Enrollment rejected${approvalRemarks ? ` with remarks: "${approvalRemarks}"` : ''}`);
      await fetchData();
    } catch (err: any) {
      console.error(err);
      alert(err.message || 'Failed to reject enrollment');
    } finally {
      setLoading(false);
    }
  };

  const formatTimeAgo = (dateString: string) => {
    if (!dateString) return 'N/A';
    
    // Parse the date - handle both ISO format and SQLite datetime format
    let date: Date;
    
    // Check if it's SQLite datetime format (YYYY-MM-DD HH:MM:SS) vs ISO format
    if (dateString.includes('T')) {
      // ISO format - parse directly
      date = new Date(dateString);
    } else if (dateString.includes(' ')) {
      // SQLite datetime format - treat as UTC
      date = new Date(dateString + 'Z');
    } else {
      // Try parsing as-is
      date = new Date(dateString);
    }
    
    const now = new Date();
    
    // If the date is invalid, return N/A
    if (isNaN(date.getTime())) return 'N/A';
    
    const diffMs = now.getTime() - date.getTime();
    
    // If the difference is negative (future date), show "Just now"
    if (diffMs < 0) return 'Just now';
    
    const diffMins = Math.floor(diffMs / 60000);
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} mins ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours} hours ago`;
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays} days ago`;
  };

  const openRecord = (student: any) => {
    setSelectedRecord(student);
    setEditStudentForm({
      first_name: student.first_name,
      middle_name: student.middle_name,
      last_name: student.last_name,
      course: student.course,
      year_level: student.year_level,
      status: student.status,
      clearance_status: student.clearance_status,
      contact_number: student.contact_number,
      address: student.address
    });
    setViewStudentOpen(true);
  };

  const handleUpdateStudentRecord = async () => {
    if (!selectedRecord) return;
    try {
      setLoading(true);
      await adminService.updateStudent(selectedRecord.id, editStudentForm);
      setViewStudentOpen(false);
      await fetchData();
      alert('Student record updated');
    } catch (err: any) {
      setError(err.message || 'Failed to update student');
    } finally {
      setLoading(false);
    }
  };

  const stats = dashboardStats ? [
    { 
      label: 'Total Records', 
      value: dashboardStats.totalRecords?.toString() || '0', 
      icon: FileText, 
      color: 'from-blue-500 to-blue-600',
      change: ''
    },
    { 
      label: 'Pending Grades', 
      value: dashboardStats.pendingGrades?.toString() || '0', 
      icon: ClipboardCheck, 
      color: 'from-orange-500 to-orange-600',
      change: ''
    },
    { 
      label: 'COR Requests', 
      value: dashboardStats.corRequests?.toString() || '0', 
      icon: Award, 
      color: 'from-green-500 to-green-600',
      change: ''
    },
    { 
      label: 'Clearances', 
      value: dashboardStats.clearances?.toString() || '0', 
      icon: CheckCircle, 
      color: 'from-purple-500 to-purple-600',
      change: ''
    },
  ] : [];

  const renderDashboardContent = () => {
    if (loading) {
      return (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        </div>
      );
    }

    if (error) {
      return (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg mb-6">
          <div className="flex items-center gap-2 text-red-700">
            <AlertCircle className="h-5 w-5" />
            <p>{error}</p>
          </div>
        </div>
      );
    }

    return (
      <>
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <Card key={index} className="p-6 border-0 shadow-lg hover:shadow-xl transition-all bg-white">
                <div className="flex items-start justify-between mb-4">
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center shadow-md`}>
                    <Icon className="h-6 w-6 text-white" />
                  </div>
                  {stat.change && (
                    <Badge variant="secondary" className="bg-blue-100 text-blue-700 border-0">
                      {stat.change}
                    </Badge>
                  )}
                </div>
                <h3 className="text-3xl mb-1">{stat.value}</h3>
                <p className="text-sm text-slate-600">{stat.label}</p>
              </Card>
            );
          })}
        </div>

        {/* Enrollment Analytics */}
        {enrollmentReport && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <Card className="border-0 shadow-lg">
              <div className="p-4 border-b">
                <h3 className="font-semibold text-slate-900">Enrollment Totals</h3>
                <p className="text-sm text-slate-500">Per semester and pending pipeline</p>
              </div>
              <div className="p-4 space-y-3">
                <div className="flex items-center justify-between bg-slate-50 rounded-lg p-3">
                  <span className="text-sm text-slate-600">Pending Enrollments</span>
                  <span className="font-semibold text-orange-600">{enrollmentReport.pending}</span>
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-800 mb-2">Per Semester</p>
                  <div className="space-y-1">
                    {enrollmentReport.perSemester?.map((row: any) => (
                      <div key={row.period} className="flex justify-between text-sm">
                        <span className="text-slate-600">{row.period}</span>
                        <span className="font-semibold">{row.total}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </Card>

            <Card className="border-0 shadow-lg">
              <div className="p-4 border-b">
                <h3 className="font-semibold text-slate-900">Students per Section</h3>
                <p className="text-sm text-slate-500">Helps balance assignments</p>
              </div>
              <div className="p-4 space-y-2 max-h-[320px] overflow-y-auto">
                {enrollmentReport.perSection?.map((row: any) => (
                  <div key={`${row.section_code}-${row.section_name}`} className="flex justify-between text-sm border-b py-1">
                    <span className="text-slate-600">{row.section_code} • {row.section_name}</span>
                    <span className="font-semibold">{row.total}</span>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        )}

        {/* Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent COR Requests */}
          <Card className="border-0 shadow-lg overflow-hidden">
            <div className="bg-gradient-to-r from-green-600 to-green-700 px-6 py-4">
              <h3 className="text-white">Recent COR Requests</h3>
            </div>
            <ScrollArea className="h-[400px]">
              <div className="p-4">
                {corRequests.length === 0 ? (
                  <p className="text-sm text-slate-500 text-center py-8">No COR requests</p>
                ) : (
                  <div className="space-y-3">
                    {corRequests.map((request) => (
                      <div key={request.id} className="p-3 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors">
                        <div className="flex items-center justify-between mb-2">
                          <div>
                            <p className="text-sm text-slate-900">{request.student_name}</p>
                            <p className="text-xs text-slate-500">{request.student_id} • {request.course}</p>
                          </div>
                          <Badge className={request.status === 'Approved' || request.status === 'Generated' ? 'bg-green-100 text-green-700 border-0 text-xs' : 'bg-orange-100 text-orange-700 border-0 text-xs'}>
                            {request.status}
                          </Badge>
                        </div>
                        <p className="text-xs text-slate-600">{request.semester}</p>
                        <p className="text-xs text-slate-400 mt-1">{formatTimeAgo(request.created_at)}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </ScrollArea>
          </Card>

          {/* Clearance Requests */}
          <Card className="border-0 shadow-lg overflow-hidden">
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-4">
              <h3 className="text-white">Pending Clearances</h3>
            </div>
            <ScrollArea className="h-[400px]">
              <div className="p-4">
                {clearanceRequests.length === 0 ? (
                  <p className="text-sm text-slate-500 text-center py-8">No pending clearances</p>
                ) : (
                  <div className="space-y-3">
                    {clearanceRequests.map((clearance) => (
                      <div key={clearance.id} className="p-3 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex-1">
                            <p className="text-sm text-slate-900">{clearance.student_name}</p>
                            <p className="text-xs text-slate-500">{clearance.student_id}</p>
                            <p className="text-xs text-slate-600 mt-1">{clearance.clearance_type}</p>
                            {clearance.issue_description && (
                              <p className="text-xs text-orange-600 mt-1">{clearance.issue_description}</p>
                            )}
                          </div>
                          <Badge className="bg-orange-100 text-orange-700 border-0 text-xs">
                            {clearance.status}
                          </Badge>
                        </div>
                        <p className="text-xs text-slate-400 mt-1">{formatTimeAgo(clearance.created_at)}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </ScrollArea>
          </Card>
        </div>
      </>
    );
  };

  const renderStudentRecordsContent = () => {
    if (loading) {
      return (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        </div>
      );
    }

    const filteredRecords = studentRecords.filter((student) => {
      if (!searchTerm) return true;
      const search = searchTerm.toLowerCase();
      return (
        student.student_id?.toLowerCase().includes(search) ||
        student.first_name?.toLowerCase().includes(search) ||
        student.last_name?.toLowerCase().includes(search) ||
        student.course?.toLowerCase().includes(search)
      );
    });

    return (
      <div>
        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center gap-2 text-red-700">
              <AlertCircle className="h-5 w-5" />
              <p>{error}</p>
            </div>
          </div>
        )}
        <div className="flex items-center justify-between mb-6">
          <div className="flex gap-2 flex-1 max-w-md">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input 
                placeholder="Search student records..." 
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </div>
        <Card className="border-0 shadow-lg">
          <div className="p-6">
            {filteredRecords.length === 0 ? (
              <p className="text-center text-slate-500 py-8">No student records found</p>
            ) : (
              <div className="space-y-3">
                {filteredRecords.map((student) => (
                  <div key={student.id} className="p-4 border rounded-lg hover:bg-slate-50">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <h4 className="text-slate-900">{student.first_name} {student.last_name}</h4>
                        <p className="text-sm text-slate-500">{student.student_id} • {student.course} • Year {student.year_level}</p>
                        <div className="flex gap-2 mt-2">
                          <Badge className={student.clearance_status === 'Clear' ? 'bg-green-100 text-green-700 border-0' : 'bg-orange-100 text-orange-700 border-0'}>
                            {student.clearance_status || 'Clear'}
                          </Badge>
                          <Badge variant="secondary">{student.status || 'Active'}</Badge>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" onClick={() => openRecord(student)}>
                          <Eye className="h-4 w-4 mr-1" />
                          View / Edit
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </Card>
      </div>
    );
  };

  const renderGradesManagementContent = () => (
    <div>
      <Card className="border-0 shadow-lg">
        <div className="p-6">
          <Tabs defaultValue="pending">
            <TabsList>
              <TabsTrigger value="pending">Pending Submissions</TabsTrigger>
              <TabsTrigger value="submitted">Submitted</TabsTrigger>
              <TabsTrigger value="finalized">Finalized</TabsTrigger>
            </TabsList>
            
            <TabsContent value="pending" className="mt-6">
              <div className="space-y-4">
                {gradeSubmissions.filter(g => g.status === 'Pending').map((submission) => (
                  <div key={submission.id} className="p-4 border border-red-200 bg-red-50 rounded-lg">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h4 className="text-slate-900">{submission.subject}</h4>
                        <p className="text-sm text-slate-600">{submission.faculty}</p>
                        <p className="text-sm text-slate-500 mt-1">{submission.section} • {submission.students} students</p>
                        <p className="text-xs text-red-600 mt-2">{submission.date}</p>
                      </div>
                      <Badge className="bg-red-100 text-red-700 border-0">
                        {submission.status}
                      </Badge>
                    </div>
                    <Button size="sm" variant="outline" className="text-blue-600 hover:bg-blue-50">
                      Send Reminder
                    </Button>
                  </div>
                ))}
              </div>
            </TabsContent>
            
            <TabsContent value="submitted" className="mt-6">
              <div className="space-y-4">
                {gradeSubmissions.filter(g => g.status === 'Submitted').map((submission) => (
                  <div key={submission.id} className="p-4 border rounded-lg">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h4 className="text-slate-900">{submission.subject}</h4>
                        <p className="text-sm text-slate-600">{submission.faculty}</p>
                        <p className="text-sm text-slate-500 mt-1">{submission.section} • {submission.students} students</p>
                        <p className="text-xs text-slate-400 mt-2">{submission.date}</p>
                      </div>
                      <Badge className="bg-green-100 text-green-700 border-0">
                        {submission.status}
                      </Badge>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline">
                        <Eye className="h-4 w-4 mr-1" />
                        Review
                      </Button>
                      <Button size="sm" className="bg-gradient-to-r from-blue-600 to-indigo-600">
                        Approve & Finalize
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </TabsContent>
            
            <TabsContent value="finalized" className="mt-6">
              <p className="text-center text-slate-500 py-8">No finalized grades for this period</p>
            </TabsContent>
          </Tabs>
        </div>
      </Card>
    </div>
  );

  const renderCORManagementContent = () => {
    if (loading) {
      return (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        </div>
      );
    }

    return (
      <div>
        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center gap-2 text-red-700">
              <AlertCircle className="h-5 w-5" />
              <p>{error}</p>
            </div>
          </div>
        )}
        <Card className="border-0 shadow-lg">
          <div className="p-6">
            {corRequests.length === 0 ? (
              <p className="text-center text-slate-500 py-8">No COR requests found</p>
            ) : (
              <div className="space-y-4">
                {corRequests.map((request) => (
                  <div key={request.id} className="p-4 border rounded-lg hover:bg-slate-50">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h4 className="text-slate-900">{request.student_name}</h4>
                        <p className="text-sm text-slate-500">{request.cor_number || `COR-${request.id}`} • {request.student_id}</p>
                        <p className="text-sm text-slate-600 mt-2">{request.course} • {request.semester}</p>
                        <p className="text-xs text-slate-400 mt-1">{formatTimeAgo(request.created_at)}</p>
                      </div>
                      <Badge className={request.status === 'Approved' || request.status === 'Generated' ? 'bg-green-100 text-green-700 border-0' : 'bg-orange-100 text-orange-700 border-0'}>
                        {request.status}
                      </Badge>
                    </div>
                    {request.status === 'Pending' && (
                      <div className="flex gap-2">
                        <Button 
                          size="sm" 
                          className="bg-gradient-to-r from-green-600 to-green-700"
                          onClick={() => handleGenerateCOR(request.enrollment_id)}
                        >
                          Generate COR
                        </Button>
                      </div>
                    )}
                    {(request.status === 'Generated' || request.status === 'Approved') && (
                      <div className="flex gap-2">
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => handleApproveCOR(request.id)}
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          Approve
                        </Button>
                        <Button size="sm" variant="outline">
                          <Printer className="h-4 w-4 mr-1" />
                          Print
                        </Button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </Card>
      </div>
    );
  };

  const renderClearanceContent = () => {
    if (loading) {
      return (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        </div>
      );
    }

    return (
      <div>
        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center gap-2 text-red-700">
              <AlertCircle className="h-5 w-5" />
              <p>{error}</p>
            </div>
          </div>
        )}
        <Card className="border-0 shadow-lg">
          <div className="p-6">
            <p className="text-slate-600 mb-6">Manage student clearances and requirements.</p>
            {clearanceRequests.length === 0 ? (
              <p className="text-center text-slate-500 py-8">No clearance requests found</p>
            ) : (
              <div className="space-y-4">
                {clearanceRequests.map((clearance) => (
                  <div key={clearance.id} className="p-4 border border-orange-200 bg-orange-50 rounded-lg">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h4 className="text-slate-900">{clearance.student_name}</h4>
                        <p className="text-sm text-slate-500">ID: {clearance.id} • {clearance.student_id}</p>
                        <div className="mt-2">
                          <Badge variant="secondary">{clearance.clearance_type}</Badge>
                        </div>
                        {clearance.issue_description && (
                          <p className="text-sm text-orange-700 mt-2">Issue: {clearance.issue_description}</p>
                        )}
                        <p className="text-xs text-slate-400 mt-1">{formatTimeAgo(clearance.created_at)}</p>
                      </div>
                      <Badge className="bg-orange-100 text-orange-700 border-0">
                        {clearance.status}
                      </Badge>
                    </div>
                    {clearance.status === 'Pending' && (
                      <div className="flex gap-2">
                        <Button 
                          size="sm" 
                          className="bg-gradient-to-r from-green-600 to-green-700"
                          onClick={() => handleResolveClearance(clearance.id)}
                        >
                          Mark Resolved
                        </Button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </Card>
      </div>
    );
  };

  const renderPendingEnrollmentsContent = () => {
    if (loading) {
      return (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        </div>
      );
    }

    return (
      <div>
        <Card className="border-0 shadow-lg">
          <div className="p-6">
            {pendingEnrollments.length === 0 ? (
              <p className="text-center text-slate-500 py-8">No pending enrollments</p>
            ) : (
              <div className="space-y-4">
                {pendingEnrollments.map((e) => (
                  <div key={e.id} className="p-4 border rounded-lg hover:bg-slate-50">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h4 className="text-slate-900">{e.first_name} {e.last_name}</h4>
                        <p className="text-sm text-slate-500">Enrollment #{e.id} • {e.school_year} • {e.semester}</p>
                        <p className="text-sm text-slate-600 mt-2">Status: {e.status}</p>
                        {e.status === 'For Admin Approval' && e.total_amount && (
                          <p className="text-sm text-green-700 font-medium mt-1">
                            Assessment: ₱{e.total_amount?.toLocaleString() || '0.00'}
                          </p>
                        )}
                        <p className="text-xs text-slate-400 mt-1">
                          {e.status === 'For Admin Approval' ? 'Assessed' : 'Submitted'} {formatTimeAgo(e.assessed_at || e.created_at)}
                        </p>
                        
                        {/* Show documents if any */}
                        {e.documents && e.documents.length > 0 && (
                          <div className="mt-2 pt-2 border-t">
                            <p className="text-xs font-medium text-slate-700 mb-1">Documents:</p>
                            <div className="flex flex-wrap gap-1">
                              {e.documents.map((doc: any, idx: number) => (
                                <a 
                                  key={idx}
                                  href={doc.file_path}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
                                >
                                  {doc.document_type || `Doc ${idx + 1}`}
                                </a>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                      <Badge className={e.status === 'For Admin Approval' ? 'bg-yellow-100 text-yellow-700 border-0 text-xs' : 'bg-orange-100 text-orange-700 border-0 text-xs'}>
                        {e.status}
                      </Badge>
                    </div>
                    
                    {/* Action buttons based on status */}
                    {e.status === 'Pending Assessment' && (
                      <div className="flex gap-2 flex-wrap">
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={async () => {
                            setPreviewEnrollment(e);
                            try {
                              const docsResp = await adminService.getEnrollmentDocuments(e.id);
                              if (docsResp.success) {
                                setPreviewEnrollment({ ...e, documents: docsResp.data });
                              }
                            } catch (err) {
                              console.error('Error fetching documents:', err);
                            }
                            setPreviewDocumentsOpen(true);
                          }}
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          View Documents
                        </Button>
                        <Button size="sm" className="bg-gradient-to-r from-green-600 to-green-700" onClick={() => openAssessDialog(e)}>
                          Assess
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => handleGenerateCOR(e.id)}>
                          Generate COR
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => {
                            setAssignForm({ enrollmentId: e.id, sectionId: '' });
                            setAssignDialogOpen(true);
                          }}
                        >
                          Assign Section
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline"
                          className="text-red-600 hover:bg-red-50 border-red-200"
                          onClick={() => {
                            setApprovalAction({ type: 'reject', enrollment: e });
                            setApprovalDialogOpen(true);
                          }}
                        >
                          Reject
                        </Button>
                      </div>
                    )}
                    
                    {e.status === 'For Admin Approval' && (
                      <div className="flex gap-2">
                        <Button 
                          size="sm" 
                          className="bg-gradient-to-r from-green-600 to-green-700"
                          onClick={() => {
                            setApprovalAction({ type: 'approve', enrollment: e });
                            setApprovalDialogOpen(true);
                          }}
                        >
                          Approve
                        </Button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </Card>
      </div>
    );
  };

  const menuItems = [
    { name: 'Dashboard', icon: LayoutDashboard },
    { name: 'Pending Enrollments', icon: FileText },
    { name: 'Student Records', icon: Users },
    { name: 'Grades Management', icon: ClipboardCheck },
    { name: 'COR Management', icon: Award },
    { name: 'Clearances', icon: CheckCircle },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-6">
      <div className="max-w-[1600px] mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl mb-1">Registrar Dashboard</h1>
            <p className="text-sm text-slate-600">Student records and academic documentation</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3 px-4 py-2 bg-white rounded-xl shadow-md">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center text-white">
                <FileText className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm text-slate-900">Registrar Ana Garcia</p>
                <p className="text-xs text-slate-500">Records Management</p>
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
            {activeSection === 'Student Records' && renderStudentRecordsContent()}
            {activeSection === 'Grades Management' && renderGradesManagementContent()}
            {activeSection === 'COR Management' && renderCORManagementContent()}
            {activeSection === 'Clearances' && renderClearanceContent()}
            {activeSection === 'Pending Enrollments' && renderPendingEnrollmentsContent()}
          </div>
        </div>
      </div>
      
      {/* Assessment Dialog */}
      <Dialog open={assessDialogOpen} onOpenChange={setAssessDialogOpen}>
        <DialogContent className="max-w-6xl sm:max-w-6xl max-h-[92vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Enrollment Assessment</DialogTitle>
            <DialogDescription>
              {selectedEnrollmentForAssess?.first_name} {selectedEnrollmentForAssess?.last_name} — {selectedEnrollmentForAssess?.course} Year {selectedEnrollmentForAssess?.year_level} • {selectedEnrollmentForAssess?.school_year} {selectedEnrollmentForAssess?.semester}
            </DialogDescription>
          </DialogHeader>

          <div className="grid grid-cols-2 gap-6">
            {/* LEFT: Subject Assignment */}
            <div className="space-y-4 border-r pr-6 flex flex-col">
              {/* ── Enrolled subjects (top) ── */}
              <div className="flex-1">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-bold text-slate-900 flex items-center gap-2 text-sm">
                    <ClipboardCheck className="h-4 w-4 text-emerald-600" /> Enrolled Subjects
                  </h4>
                  {loading && <Loader2 className="h-3.5 w-3.5 animate-spin text-slate-400" />}
                  {!!subjectAssessmentDetails?.subjects?.length && (
                    <span className="text-xs text-slate-400 font-medium">
                      {subjectAssessmentDetails.subjects.reduce((sum: number, s: any) => sum + (s.units || 0), 0)} units
                    </span>
                  )}
                </div>
                <div className="space-y-1.5 max-h-[320px] overflow-y-auto pr-0.5">
                  {!subjectAssessmentDetails?.subjects?.length ? (
                    <div className="p-4 border border-dashed rounded-lg text-center bg-slate-50">
                      <p className="text-xs text-slate-400">No subjects enrolled yet</p>
                    </div>
                  ) : (
                    subjectAssessmentDetails.subjects.map((s: any) => (
                      <div key={s.id} className="group flex items-center justify-between px-3 py-2 rounded-lg border border-slate-100 bg-white hover:border-red-200 hover:bg-red-50/30 transition-colors">
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-slate-800 truncate">{s.subject_code}</p>
                          <p className="text-[11px] text-slate-500 truncate">{s.subject_name} · {s.units}u</p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* ── Removed subjects (bottom) ── */}
              {(() => {
                const enrolledIds = new Set((subjectAssessmentDetails?.subjects || []).map((s: any) => s.subject_id));
                const removed = availableSubjects.filter((s: any) => !enrolledIds.has(s.id));
                if (removed.length === 0) return null;
                return (
                  <div className="pt-3 border-t">
                    <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-2">Removed — click to add back</h4>
                    <div className="space-y-1.5 max-h-[180px] overflow-y-auto pr-0.5">
                      {removed.map((s: any) => (
                        <div key={s.id} className="group flex items-center justify-between px-3 py-2 rounded-lg border border-dashed border-slate-200 bg-slate-50/60 hover:border-indigo-300 hover:bg-indigo-50/30 transition-colors">
                          <div className="min-w-0">
                            <p className="text-xs font-bold text-slate-500 truncate">{s.subject_code}</p>
                            <p className="text-[11px] text-slate-400 truncate">{s.subject_name} · {s.units}u</p>
                          </div>
                          <button
                            disabled={loading}
                            onClick={() => handleAddSubjectToEnrollment(s.id)}
                            className="ml-2 shrink-0 p-1 rounded text-slate-300 hover:text-indigo-600 hover:bg-indigo-100 transition-colors opacity-0 group-hover:opacity-100"
                          >
                            <Plus className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })()}
            </div>

            {/* RIGHT: Scholarship + Fees */}
            <div className="space-y-4">
              {selectedEnrollmentForAssess?.scholarship_type && selectedEnrollmentForAssess.scholarship_type !== 'None' && (
                <div className="p-4 bg-slate-100/50 border border-slate-200 rounded-xl">
                  <div className="flex justify-between items-center mb-3">
                    <div className="flex items-center gap-2 text-indigo-700">
                      <div className="h-7 w-7 rounded-full bg-indigo-100 flex items-center justify-center">
                        <FileText className="h-3.5 w-3.5" />
                      </div>
                      <h4 className="font-bold text-sm">Scholarship: {selectedEnrollmentForAssess.scholarship_type}</h4>
                    </div>
                    {selectedEnrollmentForAssess.scholarship_letter_path && (
                      <button onClick={() => handleDownloadScholarship(selectedEnrollmentForAssess.scholarship_letter_path)}
                        className="text-xs text-blue-600 flex items-center gap-1 bg-white px-2 py-1 rounded border shadow-sm hover:bg-slate-50">
                        <Download className="h-3 w-3" /> Letter
                      </button>
                    )}
                  </div>
                  <Label className="text-slate-500 text-xs font-medium mb-2 block">Select Coverage</Label>
                  <div className="grid grid-cols-1 gap-1.5">
                    {(SCHOLARSHIP_DEFINITIONS[selectedEnrollmentForAssess.scholarship_type]?.coverage || []).map((c: string) => (
                      <button key={c} type="button"
                        onClick={() => setAssessmentForm({ ...assessmentForm, scholarship_coverage: c })}
                        className={`px-3 py-2 rounded-lg text-xs font-bold text-left transition-all border-2 ${
                          assessmentForm.scholarship_coverage === c
                            ? 'bg-indigo-100 text-slate-900 border-indigo-500 shadow-sm'
                            : 'bg-white text-slate-700 border-slate-200 hover:border-indigo-300'
                        }`}>{c}</button>
                    ))}
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs">Tuition</Label>
                  <Input type="number" value={assessmentForm.tuition} disabled className="bg-slate-100" />
                </div>
                <div><Label className="text-xs">Registration</Label>
                  <Input type="number" value={assessmentForm.registration} disabled className="bg-slate-100" />
                </div>
                <div><Label className="text-xs">Library</Label>
                  <Input type="number" value={assessmentForm.library} disabled className="bg-slate-100" />
                </div>
                <div><Label className="text-xs">Lab</Label>
                  <Input type="number" value={assessmentForm.lab} disabled className="bg-slate-100" />
                </div>
                <div><Label className="text-xs">ID Fee</Label>
                  <Input type="number" value={assessmentForm.id_fee} disabled className="bg-slate-100" />
                </div>
                <div><Label className="text-xs">Others</Label>
                  <Input type="number" value={assessmentForm.others} disabled className="bg-slate-100" />
                </div>
              </div>

              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-sm space-y-2">
                {(() => {
                  const totalUnits = subjectAssessmentDetails?.subjects?.reduce((sum: number, s: any) => sum + (s.units || 0), 0) || 0;
                  const perUnit = totalUnits > 0 ? Math.round(assessmentForm.tuition / totalUnits) : 0;
                  return totalUnits > 0 ? (
                    <div className="flex justify-between text-slate-600">
                      <span>Tuition ({totalUnits} units × ₱{perUnit.toLocaleString()}/unit):</span>
                      <span>₱{assessmentForm.tuition.toLocaleString()}.00</span>
                    </div>
                  ) : null;
                })()}
                {assessmentForm.scholarship_coverage && (
                  <div className="flex justify-between text-emerald-600 font-semibold bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-100">
                    <span className="flex items-center gap-1.5"><div className="h-1.5 w-1.5 rounded-full bg-emerald-500" /> Scholarship Deduction:</span>
                    <span>- ₱{getTuitionDeduction(assessmentForm.scholarship_coverage, assessmentForm.tuition).toLocaleString()}.00</span>
                  </div>
                )}
                <div className="flex justify-between text-slate-500">
                  <span>Misc Fees:</span>
                  <span>₱{(assessmentForm.registration + assessmentForm.library + assessmentForm.lab + assessmentForm.id_fee + assessmentForm.others).toLocaleString()}.00</span>
                </div>
                <div className="h-px bg-slate-200" />
                <div className="flex justify-between font-bold text-slate-900 pt-1">
                  <span className="text-base">Total Assessment:</span>
                  <span className="text-2xl text-indigo-600 font-mono">
                    ₱{(assessmentForm.tuition - getTuitionDeduction(assessmentForm.scholarship_coverage, assessmentForm.tuition) + assessmentForm.registration + assessmentForm.library + assessmentForm.lab + assessmentForm.id_fee + assessmentForm.others).toLocaleString()}.00
                  </span>
                </div>
              </div>

              <div className="flex gap-2 justify-end pt-2">
                <Button variant="outline" onClick={() => setAssessDialogOpen(false)}>Cancel</Button>
                <Button onClick={handleAssessEnrollment} disabled={loading || !subjectAssessmentDetails?.subjects?.length}
                  className="">
                  {loading && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                  Complete & Forward to Dean
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Subject Assessment is now merged into the Enrollment Assessment dialog */}

      {/* Assign Section Dialog */}
      <Dialog open={assignDialogOpen} onOpenChange={setAssignDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Assign Section</DialogTitle>
            <DialogDescription>Select a section for this enrollment</DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <Label>Section</Label>
              <Select
                value={assignForm.sectionId}
                onValueChange={(v) => setAssignForm((prev) => ({ ...prev, sectionId: v }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Choose section" />
                </SelectTrigger>
                <SelectContent>
                  {sections.map((s) => (
                    <SelectItem key={s.id} value={s.id.toString()}>
                      {s.section_code} • {s.section_name} • {s.course} {s.year_level}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setAssignDialogOpen(false)}>Cancel</Button>
              <Button onClick={handleAssignSection} disabled={!assignForm.sectionId}>
                Assign Section
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Student Record Dialog */}
      <Dialog open={viewStudentOpen} onOpenChange={setViewStudentOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Student Record</DialogTitle>
            <DialogDescription>View and update basic details.</DialogDescription>
          </DialogHeader>
          {selectedRecord && (
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>First Name</Label>
                  <Input value={editStudentForm.first_name || ''} onChange={(e) => setEditStudentForm((p: any) => ({ ...p, first_name: e.target.value }))} />
                </div>
                <div>
                  <Label>Last Name</Label>
                  <Input value={editStudentForm.last_name || ''} onChange={(e) => setEditStudentForm((p: any) => ({ ...p, last_name: e.target.value }))} />
                </div>
                <div>
                  <Label>Course</Label>
                  <Input value={editStudentForm.course || ''} onChange={(e) => setEditStudentForm((p: any) => ({ ...p, course: e.target.value }))} />
                </div>
                <div>
                  <Label>Year Level</Label>
                  <Input type="number" value={editStudentForm.year_level || ''} onChange={(e) => setEditStudentForm((p: any) => ({ ...p, year_level: Number(e.target.value) }))} />
                </div>
                <div>
                  <Label>Status</Label>
                  <Select
                    value={editStudentForm.status || 'Active'}
                    onValueChange={(v) => setEditStudentForm((p: any) => ({ ...p, status: v }))}
                  >
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Active">Active</SelectItem>
                      <SelectItem value="Inactive">Inactive</SelectItem>
                      <SelectItem value="Graduated">Graduated</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Clearance Status</Label>
                  <Select
                    value={editStudentForm.clearance_status || 'Clear'}
                    onValueChange={(v) => setEditStudentForm((p: any) => ({ ...p, clearance_status: v }))}
                  >
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Clear">Clear</SelectItem>
                      <SelectItem value="Pending">Pending</SelectItem>
                      <SelectItem value="Blocked">Blocked</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <Label>Contact Number</Label>
                <Input value={editStudentForm.contact_number || ''} onChange={(e) => setEditStudentForm((p: any) => ({ ...p, contact_number: e.target.value }))} />
              </div>
              <div>
                <Label>Address</Label>
                <Input value={editStudentForm.address || ''} onChange={(e) => setEditStudentForm((p: any) => ({ ...p, address: e.target.value }))} />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <Button variant="outline" onClick={() => setViewStudentOpen(false)}>Close</Button>
                <Button onClick={handleUpdateStudentRecord}>Save Changes</Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Enrollment Approval Dialog */}
      <Dialog open={approvalDialogOpen} onOpenChange={setApprovalDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {approvalAction?.type === 'approve' ? 'Approve Enrollment' : 'Reject Enrollment'}
            </DialogTitle>
            <DialogDescription>
              {approvalAction?.type === 'approve' 
                ? `Approve enrollment for ${approvalAction?.enrollment?.first_name} ${approvalAction?.enrollment?.last_name}?`
                : `Reject enrollment for ${approvalAction?.enrollment?.first_name} ${approvalAction?.enrollment?.last_name}?`
              }
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <Label>Remarks (Optional)</Label>
              <textarea 
                placeholder="Add any notes or feedback..."
                value={approvalRemarks}
                onChange={(e) => setApprovalRemarks(e.target.value)}
                className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={3}
              />
            </div>
            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => {
                setApprovalDialogOpen(false);
                setApprovalAction(null);
                setApprovalRemarks('');
              }}>
                Cancel
              </Button>
              {approvalAction?.type === 'approve' ? (
                <Button 
                  className="bg-gradient-to-r from-green-600 to-green-700"
                  onClick={handleApproveEnrollment}
                  disabled={loading}
                >
                  {loading ? 'Approving...' : 'Approve'}
                </Button>
              ) : (
                <Button 
                  className="bg-red-600 hover:bg-red-700"
                  onClick={handleRejectEnrollment}
                  disabled={loading}
                >
                  {loading ? 'Rejecting...' : 'Reject'}
                </Button>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Preview Documents Dialog */}
      <Dialog open={previewDocumentsOpen} onOpenChange={setPreviewDocumentsOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              Documents - {previewEnrollment?.first_name} {previewEnrollment?.last_name}
            </DialogTitle>
            <DialogDescription>
              Enrollment #{previewEnrollment?.id} • {previewEnrollment?.school_year} • {previewEnrollment?.semester}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {!previewEnrollment?.documents || previewEnrollment?.documents?.length === 0 ? (
              <p className="text-sm text-slate-500 text-center py-8">No documents submitted</p>
            ) : (
              <div className="space-y-2">
                {previewEnrollment?.documents?.map((doc: any, idx: number) => (
                  <div key={idx} className="p-3 border rounded-lg hover:bg-slate-50">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <p className="text-sm font-medium text-slate-900">
                          {doc.document_type || `Document ${idx + 1}`}
                        </p>
                        <p className="text-xs text-slate-500 mt-1">
                          Uploaded: {doc.upload_date ? new Date(doc.upload_date).toLocaleDateString() : 'N/A'}
                        </p>
                      </div>
                      <button
                        onClick={() => handleDownloadDocument(doc.id)}
                        className="inline-flex items-center gap-2 px-3 py-1.5 text-xs bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
                      >
                        <Download className="h-4 w-4" />
                        Download
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
            <div className="flex justify-end pt-4 border-t">
              <Button variant="outline" onClick={() => setPreviewDocumentsOpen(false)}>
                Close
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};