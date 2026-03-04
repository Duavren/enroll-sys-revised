import { useEffect, useState } from 'react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Input } from './ui/input';
import { Label } from './ui/label';
import coursesService from '../services/courses.service';
import { Loader2 } from 'lucide-react';

export default function CoursesManagement() {
  const [loading, setLoading] = useState(true);
  const [courses, setCourses] = useState<any[]>([]);
  const [error, setError] = useState('');
  const [form, setForm] = useState({ program_code: '', program_name: '', description: '' });

  const loadCourses = async () => {
    try {
      setLoading(true);
      const resp = await coursesService.listCourses();
      setCourses(resp?.data || []);
    } catch (err: any) {
      setError(err.message || 'Failed to load courses');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadCourses(); }, []);

  const handleCreate = async () => {
    try {
      setLoading(true);
      await coursesService.createCourse(form);
      setForm({ program_code: '', program_name: '', description: '' });
      await loadCourses();
    } catch (err: any) {
      setError(err.message || 'Failed to create course');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      setLoading(true);
      await coursesService.deleteCourse(id);
      await loadCourses();
    } catch (err: any) {
      setError(err.message || 'Failed to delete course');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2 className="text-xl mb-4">Courses / Programs Management</h2>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div>
          <Card className="p-4">
            <h4 className="mb-2">Create Course</h4>
            <div className="space-y-2">
              <div>
                <Label>Code</Label>
                <Input value={form.program_code} onChange={(e) => setForm({ ...form, program_code: e.target.value })} />
              </div>
              <div>
                <Label>Name</Label>
                <Input value={form.program_name} onChange={(e) => setForm({ ...form, program_name: e.target.value })} />
              </div>
              <div>
                <Label>Description</Label>
                <Input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
              </div>
              <div className="flex gap-2 mt-3">
                <Button onClick={handleCreate}>Create</Button>
              </div>
            </div>
          </Card>
        </div>

        <div className="lg:col-span-2">
          <Card className="p-4">
            <h4 className="mb-3">Existing Courses</h4>
            {loading ? (
              <div className="py-8 flex items-center justify-center"><Loader2 className="h-6 w-6 animate-spin" /></div>
            ) : (
              <div className="space-y-2">
                {courses.length === 0 ? (
                  <p className="text-sm text-slate-500">No courses found</p>
                ) : courses.map(c => (
                  <div key={c.id} className="flex items-center justify-between p-2 border rounded">
                    <div>
                      <div className="font-medium">{c.program_code} — {c.program_name}</div>
                      <div className="text-xs text-slate-500">{c.description}</div>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" onClick={() => alert('Edit UI not implemented')}>Edit</Button>
                      <Button size="sm" variant="destructive" onClick={() => handleDelete(c.id)}>Delete</Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
