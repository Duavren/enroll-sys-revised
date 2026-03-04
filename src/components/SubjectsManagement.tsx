import { useEffect, useState } from 'react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Loader2, Plus, AlertCircle, Edit, Trash2 } from 'lucide-react';
import { maintenanceService } from '../services/maintenance.service';

export default function SubjectsManagement() {
  const [loading, setLoading] = useState(true);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [subjectType, setSubjectType] = useState<'College' | 'SHS'>('College');
  const [error, setError] = useState('');
  const [addOpen, setAddOpen] = useState(false);
  const [form, setForm] = useState({ subject_code: '', subject_name: '', units: 3, course: '', year_level: 1, semester: '1st' });
  const [editOpen, setEditOpen] = useState(false);
  const [editingSubject, setEditingSubject] = useState<any>(null);
  const [editForm, setEditForm] = useState({ subject_code: '', subject_name: '', units: 3, course: '', year_level: 1, semester: '1st' });
  const [schedulesOpenFor, setSchedulesOpenFor] = useState<any>(null);
  const [schedules, setSchedules] = useState<any[]>([]);
  const [scheduleForm, setScheduleForm] = useState({ day_time: '', room: '', instructor: '', capacity: 0 });
  const [editingSchedule, setEditingSchedule] = useState<any>(null);

  const load = async () => {
    try {
      setLoading(true);
      setError('');
      const resp = await maintenanceService.getAllSubjectsByType({ subject_type: subjectType });
      if (resp.success) setSubjects(resp.data || []);
    } catch (err: any) {
      setError(err.message || 'Failed to load subjects');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [subjectType]);

  const handleCreate = async () => {
    try {
      setLoading(true);
      await maintenanceService.createSubject({ ...form, subject_type: subjectType });
      setForm({ subject_code: '', subject_name: '', units: 3, course: '', year_level: 1, semester: '1st' });
      setAddOpen(false);
      await load();
    } catch (err: any) {
      setError(err.message || 'Failed to create subject');
    } finally { setLoading(false); }
  };

  const loadSchedules = async (subjectId: number) => {
    try {
      setLoading(true);
      setError('');
      const resp = await maintenanceService.getSchedules(subjectId);
      if (resp.success) setSchedules(resp.data || []);
    } catch (err: any) {
      setError(err.message || 'Failed to load schedules');
    } finally { setLoading(false); }
  };

  const handleOpenSchedules = async (subject: any) => {
    setSchedulesOpenFor(subject);
    setEditingSchedule(null);
    setScheduleForm({ day_time: '', room: '', instructor: '', capacity: 0 });
    await loadSchedules(subject.id);
  };

  const handleCreateSchedule = async () => {
    if (!schedulesOpenFor) return;
    try {
      setLoading(true);
      await maintenanceService.createSchedule(schedulesOpenFor.id, scheduleForm);
      await loadSchedules(schedulesOpenFor.id);
      setScheduleForm({ day_time: '', room: '', instructor: '', capacity: 0 });
    } catch (err: any) {
      setError(err.message || 'Failed to create schedule');
    } finally { setLoading(false); }
  };

  const handleEditSchedule = async (sch: any) => {
    setEditingSchedule(sch);
    setScheduleForm({ day_time: sch.day_time || '', room: sch.room || '', instructor: sch.instructor || '', capacity: sch.capacity || 0 });
  };

  const handleSaveSchedule = async () => {
    if (!editingSchedule || !schedulesOpenFor) return;
    try {
      setLoading(true);
      await maintenanceService.updateSchedule(editingSchedule.id, scheduleForm);
      await loadSchedules(schedulesOpenFor.id);
      setEditingSchedule(null);
      setScheduleForm({ day_time: '', room: '', instructor: '', capacity: 0 });
    } catch (err: any) {
      setError(err.message || 'Failed to update schedule');
    } finally { setLoading(false); }
  };

  const handleDeleteSchedule = async (id: number) => {
    if (!confirm('Remove this schedule?')) return;
    try {
      setLoading(true);
      await maintenanceService.deleteSchedule(id);
      if (schedulesOpenFor) await loadSchedules(schedulesOpenFor.id);
    } catch (err: any) {
      setError(err.message || 'Failed to delete schedule');
    } finally { setLoading(false); }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl">Subjects Management</h2>
        <div className="flex items-center gap-2">
          <Select value={subjectType} onValueChange={(v: any) => setSubjectType(v)}>
            <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="College">College</SelectItem>
              <SelectItem value="SHS">SHS</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={() => setAddOpen(true)} className="bg-gradient-to-r from-blue-600 to-indigo-600"><Plus className="h-4 w-4 mr-2"/>Add Subject</Button>
        </div>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center gap-2 text-red-700">
            <AlertCircle className="h-5 w-5" />
            <p>{error}</p>
          </div>
        </div>
      )}

      <Card className="p-4">
        {loading ? (
          <div className="py-8 flex items-center justify-center"><Loader2 className="h-6 w-6 animate-spin" /></div>
        ) : (
          <div className="space-y-2">
            {subjects.length === 0 ? (
              <p className="text-sm text-slate-500">No {subjectType} subjects found</p>
            ) : subjects.map((s) => (
                <div key={s.id} className="flex items-center justify-between p-2 border rounded">
                  <div>
                    <div className="font-medium">{s.subject_code} — {s.subject_name}</div>
                    <div className="text-xs text-slate-500">{s.units} units {s.course ? `• ${s.course}` : ''}</div>
                  </div>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" onClick={() => {
                        setEditingSubject(s);
                        setEditForm({
                          subject_code: s.subject_code || '',
                          subject_name: s.subject_name || '',
                          units: s.units || 3,
                          course: s.course || '',
                          year_level: s.year_level || 1,
                          semester: s.semester || '1st'
                        });
                        setEditOpen(true);
                      }}><Edit className="h-4 w-4"/></Button>
                      <Button size="sm" onClick={() => handleOpenSchedules(s)}>Schedules</Button>
                      <Button size="sm" variant="destructive" onClick={async () => {
                        if (!confirm('Delete this subject?')) return;
                        try {
                          setLoading(true);
                          await maintenanceService.deleteSubject(s.id);
                          await load();
                        } catch (err: any) {
                          setError(err.message || 'Failed to delete subject');
                        } finally { setLoading(false); }
                      }}><Trash2 className="h-4 w-4"/></Button>
                    </div>
                </div>
              ))}
          </div>
        )}
      </Card>

      {/* Add modal - simple inline form */}
      {addOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-30 z-50">
          <div className="bg-white p-6 rounded shadow-lg w-[500px]">
            <h3 className="text-lg mb-4">Add Subject ({subjectType})</h3>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Code</Label>
                <Input value={form.subject_code} onChange={(e: any) => setForm({ ...form, subject_code: e.target.value })} />
              </div>
              <div>
                <Label>Name</Label>
                <Input value={form.subject_name} onChange={(e: any) => setForm({ ...form, subject_name: e.target.value })} />
              </div>
              <div>
                <Label>Units</Label>
                <Input value={String(form.units)} onChange={(e: any) => setForm({ ...form, units: Number(e.target.value) })} />
              </div>
              <div>
                <Label>Course (optional)</Label>
                <Input value={form.course} onChange={(e: any) => setForm({ ...form, course: e.target.value })} />
              </div>
            </div>
            <div className="flex gap-2 justify-end mt-4">
              <Button variant="outline" onClick={() => setAddOpen(false)}>Cancel</Button>
              <Button onClick={handleCreate}>Create</Button>
            </div>
          </div>
        </div>
      )}

      {/* Edit modal */}
      {editOpen && editingSubject && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-30 z-50">
          <div className="bg-white p-6 rounded shadow-lg w-[500px]">
            <h3 className="text-lg mb-4">Edit Subject ({editingSubject.subject_code})</h3>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Code</Label>
                <Input value={editForm.subject_code} onChange={(e: any) => setEditForm({ ...editForm, subject_code: e.target.value })} />
              </div>
              <div>
                <Label>Name</Label>
                <Input value={editForm.subject_name} onChange={(e: any) => setEditForm({ ...editForm, subject_name: e.target.value })} />
              </div>
              <div>
                <Label>Units</Label>
                <Input value={String(editForm.units)} onChange={(e: any) => setEditForm({ ...editForm, units: Number(e.target.value) })} />
              </div>
              <div>
                <Label>Course (optional)</Label>
                <Input value={editForm.course} onChange={(e: any) => setEditForm({ ...editForm, course: e.target.value })} />
              </div>
            </div>
            <div className="flex gap-2 justify-end mt-4">
              <Button variant="outline" onClick={() => { setEditOpen(false); setEditingSubject(null); }}>Cancel</Button>
              <Button onClick={async () => {
                try {
                  setLoading(true);
                  await maintenanceService.updateSubject(editingSubject.id, editForm);
                  setEditOpen(false);
                  setEditingSubject(null);
                  await load();
                } catch (err: any) {
                  setError(err.message || 'Failed to update subject');
                } finally { setLoading(false); }
              }}>Save</Button>
            </div>
          </div>
        </div>
      )}

      {/* Schedules modal */}
      {schedulesOpenFor && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-30 z-50">
          <div className="bg-white p-6 rounded shadow-lg w-[600px] max-h-[80vh] overflow-auto">
            <h3 className="text-lg mb-4">Schedules for {schedulesOpenFor.subject_code} — {schedulesOpenFor.subject_name}</h3>
            <div className="space-y-3 mb-4">
              {schedules.length === 0 ? (
                <p className="text-sm text-slate-500">No schedules yet</p>
              ) : schedules.map((sch) => (
                <div key={sch.id} className="flex items-center justify-between p-2 border rounded">
                  <div>
                    <div className="font-medium">{sch.day_time}</div>
                    <div className="text-xs text-slate-500">{sch.room || 'Room TBA'} • {sch.instructor || 'Instructor TBA'}</div>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" onClick={() => handleEditSchedule(sch)}>Edit</Button>
                    <Button size="sm" variant="destructive" onClick={() => handleDeleteSchedule(sch.id)}>Remove</Button>
                  </div>
                </div>
              ))}
            </div>

            <div className="border-t pt-4">
              <h4 className="font-medium mb-2">Add / Edit Schedule</h4>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Day & Time</Label>
                  <Input value={scheduleForm.day_time} onChange={(e: any) => setScheduleForm({ ...scheduleForm, day_time: e.target.value })} placeholder="Mon 08:00-09:30" />
                </div>
                <div>
                  <Label>Room</Label>
                  <Input value={scheduleForm.room} onChange={(e: any) => setScheduleForm({ ...scheduleForm, room: e.target.value })} />
                </div>
                <div>
                  <Label>Instructor</Label>
                  <Input value={scheduleForm.instructor} onChange={(e: any) => setScheduleForm({ ...scheduleForm, instructor: e.target.value })} />
                </div>
                <div>
                  <Label>Capacity</Label>
                  <Input value={String(scheduleForm.capacity)} onChange={(e: any) => setScheduleForm({ ...scheduleForm, capacity: Number(e.target.value) })} />
                </div>
              </div>
              <div className="flex gap-2 justify-end mt-4">
                <Button variant="outline" onClick={() => { setSchedulesOpenFor(null); setSchedules([]); }}>Close</Button>
                {editingSchedule ? (
                  <Button onClick={handleSaveSchedule}>Save</Button>
                ) : (
                  <Button onClick={handleCreateSchedule}>Create Schedule</Button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
