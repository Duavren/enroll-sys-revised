import { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { 
  User, 
  LogOut, 
  LayoutDashboard, 
  Users, 
  Shield,
  Settings,
  Database,
  Activity,
  UserCog,
  Key,
  Lock,
  ChevronDown,
  Plus,
  Edit,
  Trash2,
  Loader2,
  AlertCircle
} from 'lucide-react';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { ScrollArea } from './ui/scroll-area';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from './ui/collapsible';
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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from './ui/alert-dialog';
import { superadminService } from '../services/superadmin.service';

interface SuperadminDashboardProps {
  onLogout: () => void;
}

export default function SuperadminDashboard({ onLogout }: SuperadminDashboardProps) {
  const [activeSection, setActiveSection] = useState('Dashboard');
  const [systemOpen, setSystemOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [dashboardStats, setDashboardStats] = useState<any>(null);
  const [users, setUsers] = useState<any[]>([]);
  const [addUserOpen, setAddUserOpen] = useState(false);
  const [editUserOpen, setEditUserOpen] = useState(false);
  const [deleteUserOpen, setDeleteUserOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [backupLoading, setBackupLoading] = useState(false);
  const [lastBackup, setLastBackup] = useState<string>('');
  const [error, setError] = useState<string>('');

  const [newUserForm, setNewUserForm] = useState({
    username: '',
    password: '',
    role: 'admin' as 'admin' | 'dean' | 'registrar' | 'cashier',
    email: ''
  });

  const [editUserForm, setEditUserForm] = useState({
    username: '',
    password: '',
    role: 'admin' as 'admin' | 'dean' | 'registrar' | 'cashier',
    email: ''
  });

  useEffect(() => {
    fetchData();
  }, [activeSection]);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError('');

      if (activeSection === 'Dashboard') {
        const statsResponse = await superadminService.getDashboardStats();
        if (statsResponse.success) {
          setDashboardStats(statsResponse.data);
        }
      } else if (activeSection === 'User Management') {
        const usersResponse = await superadminService.getAllUsers();
        if (usersResponse.success) {
          setUsers(usersResponse.data || []);
        }
      }
    } catch (err: any) {
      setError(err.message || 'Failed to fetch data');
      console.error('Fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateUser = async () => {
    try {
      setError('');
      await superadminService.createUser(newUserForm);
      setAddUserOpen(false);
      setNewUserForm({ username: '', password: '', role: 'admin', email: '' });
      fetchData();
    } catch (err: any) {
      setError(err.message || 'Failed to create user');
    }
  };

  const handleUpdateUser = async () => {
    try {
      setError('');
      await superadminService.updateUser(selectedUser.id, editUserForm);
      setEditUserOpen(false);
      setSelectedUser(null);
      fetchData();
    } catch (err: any) {
      setError(err.message || 'Failed to update user');
    }
  };

  const handleDeleteUser = async () => {
    try {
      setError('');
      await superadminService.deleteUser(selectedUser.id);
      setDeleteUserOpen(false);
      setSelectedUser(null);
      fetchData();
    } catch (err: any) {
      setError(err.message || 'Failed to delete user');
    }
  };

  const handleBackupDatabase = async () => {
    try {
      setBackupLoading(true);
      setError('');
      const response = await superadminService.backupDatabase();
      if (response.success) {
        setLastBackup(new Date().toLocaleString());
        alert('Database backed up successfully!');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to backup database');
    } finally {
      setBackupLoading(false);
    }
  };

  const formatTimeAgo = (dateString: string) => {
    if (!dateString) return 'Never';
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

  const stats = dashboardStats ? [
    { 
      label: 'Total Users', 
      value: dashboardStats.totalUsers?.toString() || '0', 
      icon: Users, 
      color: 'from-blue-500 to-blue-600',
      change: ''
    },
    { 
      label: 'Active Sessions', 
      value: dashboardStats.activeSessions?.toString() || '0', 
      icon: Activity, 
      color: 'from-green-500 to-green-600',
      change: ''
    },
    { 
      label: 'System Health', 
      value: dashboardStats.systemHealth || 'OK', 
      icon: Database, 
      color: 'from-purple-500 to-purple-600',
      change: ''
    },
    { 
      label: 'Recent Activity', 
      value: dashboardStats.recentActivity?.toString() || '0', 
      icon: Shield, 
      color: 'from-red-500 to-red-600',
      change: 'Last 24h'
    },
  ] : [];

  const analyticsHighlights = dashboardStats ? [
    {
      label: 'Total Active Users Per Role',
      value: dashboardStats.totalActiveUsers?.toString() || '0',
      note: 'Current Active User',
      color: 'text-blue-700'
    },
    {
      label: 'Total Logins Per Day',
      value: dashboardStats.totalLoginsPerDay?.toString() || '0',
      note: 'Today',
      color: 'text-green-700'
    },
    {
      label: 'Number of Enrollments Submitted',
      value: dashboardStats.enrollmentsSubmittedPerDay?.toString() || '0',
      note: 'Today',
      color: 'text-amber-700'
    },
    {
      label: 'Number Approved',
      value: dashboardStats.approvedPerDay?.toString() || '0',
      note: 'Today',
      color: 'text-purple-700'
    }
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
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
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

        {/* Cross-role Analytics */}
        {analyticsHighlights.length > 0 && (
          <Card className="border-0 shadow-lg mb-8">
            <div className="p-4 border-b flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-slate-900">Automated Analytics</h3>
                <p className="text-sm text-slate-500">Key metrics across all system roles.</p>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 p-4">
              {analyticsHighlights.map((item) => (
                <div key={item.label} className="p-4 rounded-xl bg-slate-50 border">
                  <p className="text-xs uppercase text-slate-500">{item.note}</p>
                  <p className={`text-xl font-semibold ${item.color}`}>{item.value}</p>
                  <p className="text-sm text-slate-700 mt-1">{item.label}</p>
                  {item.label === 'Total Active Users Per Role' && dashboardStats?.activeUsersByRole && (
                    <div className="mt-3 pt-3 border-t border-slate-200 space-y-1">
                      {Object.entries(dashboardStats.activeUsersByRole).map(([role, count]: [string, any]) => (
                        <p key={role} className="text-sm text-slate-600">
                          <span className="capitalize">{role}</span> : {count}
                        </p>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* System Overview */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* System Users */}
          <Card className="border-0 shadow-lg overflow-hidden">
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-4">
              <h3 className="text-white">System Users</h3>
            </div>
            <ScrollArea className="h-[400px]">
              <div className="p-4">
                {users.length === 0 ? (
                  <p className="text-sm text-slate-500 text-center py-8">No users found</p>
                ) : (
                  <div className="space-y-3">
                    {users.slice(0, 10).map((user) => (
                      <div key={user.id} className="p-3 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors">
                        <div className="flex items-center justify-between mb-2">
                          <div>
                            <p className="text-sm text-slate-900">{user.username}</p>
                            <p className="text-xs text-slate-500">ID: {user.id} • {user.role}</p>
                          </div>
                          <Badge className="bg-green-100 text-green-700 border-0 text-xs">
                            Active
                          </Badge>
                        </div>
                        {user.email && (
                          <div className="text-xs text-slate-500">
                            {user.email}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </ScrollArea>
          </Card>

          {/* System Info */}
          <Card className="border-0 shadow-lg overflow-hidden">
            <div className="bg-gradient-to-r from-purple-600 to-purple-700 px-6 py-4">
              <h3 className="text-white">System Information</h3>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-slate-600 mb-1">System Status</p>
                  <Badge className="bg-green-100 text-green-700 border-0">
                    {dashboardStats?.systemHealth || 'OK'}
                  </Badge>
                </div>
                <div>
                  <p className="text-sm text-slate-600 mb-1">Total System Users</p>
                  <p className="text-2xl font-semibold">{dashboardStats?.totalUsers || 0}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-600 mb-1">Active Sessions (Last Hour)</p>
                  <p className="text-2xl font-semibold">{dashboardStats?.activeSessions || 0}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-600 mb-1">Recent Activity (Last 24h)</p>
                  <p className="text-2xl font-semibold">{dashboardStats?.recentActivity || 0}</p>
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Activity Log */}
        {dashboardStats?.activityLog && (
          <Card className="border-0 shadow-lg mt-6">
            <div className="p-4 border-b">
              <h3 className="font-semibold text-slate-900">System Activity Logs</h3>
              <p className="text-sm text-slate-500">Latest 10 actions across all roles.</p>
            </div>
            <div className="p-4">
              {dashboardStats.activityLog.length === 0 ? (
                <p className="text-sm text-slate-500">No activity yet.</p>
              ) : (
                <div className="space-y-2">
                  {dashboardStats.activityLog.map((log: any) => (
                    <div key={log.id} className="flex items-center justify-between border rounded-lg px-3 py-2">
                      <div>
                        <p className="text-sm text-slate-900">{log.action}</p>
                        <p className="text-xs text-slate-500">{log.description || '—'}</p>
                      </div>
                      <div className="text-right text-xs text-slate-500">
                        <p>{log.username || 'system'}</p>
                        <p>{new Date(log.created_at).toLocaleString()}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </Card>
        )}
      </>
    );
  };

  const renderUserManagementContent = () => {
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
        <div className="flex justify-end mb-6">
          <Button 
            className="bg-gradient-to-r from-blue-600 to-indigo-600"
            onClick={() => setAddUserOpen(true)}
          >
            <Plus className="h-4 w-4 mr-2" />
            Add New User
          </Button>
        </div>
        <Card className="border-0 shadow-lg">
          <div className="p-6">
            <p className="text-slate-600 mb-6">Manage system users and their roles.</p>
            {users.length === 0 ? (
              <p className="text-center text-slate-500 py-8">No users found</p>
            ) : (
              <div className="space-y-4">
                {users.map((user) => (
                  <div key={user.id} className="p-4 border rounded-lg hover:bg-slate-50">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex-1">
                        <h4 className="text-slate-900">{user.username}</h4>
                        <p className="text-sm text-slate-500">ID: {user.id} • {user.role}</p>
                        {user.email && (
                          <p className="text-sm text-slate-500">{user.email}</p>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => {
                            setSelectedUser(user);
                            setEditUserForm({
                              username: user.username,
                              password: '',
                              role: user.role as 'admin' | 'dean' | 'registrar',
                              email: user.email || ''
                            });
                            setEditUserOpen(true);
                          }}
                        >
                          <Edit className="h-4 w-4 mr-1" />
                          Edit
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="text-red-600 hover:bg-red-50"
                          onClick={() => {
                            setSelectedUser(user);
                            setDeleteUserOpen(true);
                          }}
                        >
                          <Trash2 className="h-4 w-4 mr-1" />
                          Remove
                        </Button>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Badge variant="secondary">{user.role}</Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </Card>

        {/* Add User Dialog */}
        <Dialog open={addUserOpen} onOpenChange={setAddUserOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New User</DialogTitle>
              <DialogDescription>Create a new admin, dean, or registrar user.</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Username</Label>
                <Input
                  value={newUserForm.username}
                  onChange={(e) => setNewUserForm({ ...newUserForm, username: e.target.value })}
                  placeholder="Enter username"
                />
              </div>
              <div className="space-y-2">
                <Label>Password</Label>
                <Input
                  type="password"
                  value={newUserForm.password}
                  onChange={(e) => setNewUserForm({ ...newUserForm, password: e.target.value })}
                  placeholder="Leave empty for default (admin123)"
                />
              </div>
              <div className="space-y-2">
                <Label>Role</Label>
                <Select
                  value={newUserForm.role}
                  onValueChange={(value: 'admin' | 'dean' | 'registrar' | 'cashier') => 
                    setNewUserForm({ ...newUserForm, role: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="admin">Admin</SelectItem>
                    <SelectItem value="dean">Dean</SelectItem>
                    <SelectItem value="registrar">Registrar</SelectItem>
                    <SelectItem value="cashier">Cashier</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Email (Optional)</Label>
                <Input
                  type="email"
                  value={newUserForm.email}
                  onChange={(e) => setNewUserForm({ ...newUserForm, email: e.target.value })}
                  placeholder="Enter email"
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setAddUserOpen(false)}>Cancel</Button>
                <Button onClick={handleCreateUser}>Create User</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Edit User Dialog */}
        <Dialog open={editUserOpen} onOpenChange={setEditUserOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit User</DialogTitle>
              <DialogDescription>Update user information.</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Username</Label>
                <Input
                  value={editUserForm.username}
                  onChange={(e) => setEditUserForm({ ...editUserForm, username: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Password (Leave empty to keep current)</Label>
                <Input
                  type="password"
                  value={editUserForm.password}
                  onChange={(e) => setEditUserForm({ ...editUserForm, password: e.target.value })}
                  placeholder="Enter new password"
                />
              </div>
              <div className="space-y-2">
                <Label>Role</Label>
                <Select
                  value={editUserForm.role}
                  onValueChange={(value: 'admin' | 'dean' | 'registrar' | 'cashier') => 
                    setEditUserForm({ ...editUserForm, role: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="admin">Admin</SelectItem>
                    <SelectItem value="dean">Dean</SelectItem>
                    <SelectItem value="registrar">Registrar</SelectItem>
                    <SelectItem value="cashier">Cashier</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Email</Label>
                <Input
                  type="email"
                  value={editUserForm.email}
                  onChange={(e) => setEditUserForm({ ...editUserForm, email: e.target.value })}
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setEditUserOpen(false)}>Cancel</Button>
                <Button onClick={handleUpdateUser}>Update User</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Delete User Dialog */}
        <AlertDialog open={deleteUserOpen} onOpenChange={setDeleteUserOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This will permanently delete user {selectedUser?.username}. This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleDeleteUser} className="bg-red-600 hover:bg-red-700">
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    );
  };

  const renderSystemSettingsContent = () => (
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
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg mb-6">
            <div className="flex items-center gap-2 mb-2">
              <Database className="h-5 w-5 text-blue-600" />
              <h4 className="text-blue-900">Database Management</h4>
            </div>
            <p className="text-sm text-blue-700">Backup and maintenance operations.</p>
          </div>
          <div className="space-y-4">
            <Button 
              onClick={handleBackupDatabase}
              disabled={backupLoading}
              className="bg-gradient-to-r from-blue-600 to-indigo-600"
            >
              {backupLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Backing up...
                </>
              ) : (
                <>
                  <Database className="h-4 w-4 mr-2" />
                  Backup Database
                </>
              )}
            </Button>
            {lastBackup && (
              <div className="space-y-2">
                <Label>Last Backup</Label>
                <Input disabled value={lastBackup} />
              </div>
            )}
          </div>
        </div>
      </Card>
    </div>
  );

  const menuItems = [
    { name: 'Dashboard', icon: LayoutDashboard },
    { name: 'User Management', icon: UserCog },
    { name: 'System Settings', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-6">
      <div className="max-w-[1600px] mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl mb-1">Superadmin Dashboard</h1>
            <p className="text-sm text-slate-600">Full system control and management</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3 px-4 py-2 bg-white rounded-xl shadow-md">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center text-white">
                <Shield className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm text-slate-900">Superadmin</p>
                <p className="text-xs text-slate-500">Full Access</p>
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
            {activeSection === 'User Management' && renderUserManagementContent()}
            {activeSection === 'System Settings' && renderSystemSettingsContent()}
          </div>
        </div>
      </div>
    </div>
  );
}
