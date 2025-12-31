import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { UserPlus, Trash2, UserCheck, UserX } from 'lucide-react';
import api from '@/lib/axios';

interface Employee {
  id: string;
  name: string;
  email: string;
  role: string;
  isActive: boolean;
  createdAt: string;
}

const EmployeeManagement = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
  });

  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    try {
      setLoading(true);
      const response = await api.get('/users');
      setEmployees(response.data.data || []);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to load employees',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateEmployee = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await api.post('/users', formData);

      toast({
        title: 'Success',
        description: 'Employee created successfully',
      });

      setIsDialogOpen(false);
      setFormData({ name: '', email: '', password: '' });
      fetchEmployees();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to create employee',
        variant: 'destructive',
      });
    }
  };

  const handleToggleStatus = async (id: string, currentStatus: boolean) => {
    try {
      await api.patch(`/users/${id}/toggle-status`);

      toast({
        title: 'Success',
        description: `Employee ${currentStatus ? 'deactivated' : 'activated'} successfully`,
      });

      fetchEmployees();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to update employee status',
        variant: 'destructive',
      });
    }
  };

  const handleDeleteEmployee = async (id: string) => {
    if (!confirm('Are you sure you want to delete this employee? This action cannot be undone.')) {
      return;
    }

    try {
      await api.delete(`/users/${id}`);

      toast({
        title: 'Success',
        description: 'Employee deleted successfully',
      });

      fetchEmployees();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to delete employee',
        variant: 'destructive',
      });
    }
  };

  if (user?.role !== 'ADMIN') {
    return (
      <DashboardLayout title="Employee Management">
        <div className="flex items-center justify-center h-full">
          <p className="text-muted-foreground">Access denied. Admin only.</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Employee Management">
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold gradient-text">Employee Management</h1>
            <p className="text-muted-foreground mt-1">Manage your store employees</p>
          </div>

          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <UserPlus className="w-4 h-4" />
                Add Employee
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Employee</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleCreateEmployee} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                    placeholder="Enter employee name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                    placeholder="employee@example.com"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    required
                    placeholder="Minimum 6 characters"
                    minLength={6}
                  />
                </div>
                <div className="flex gap-2 justify-end">
                  <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit">Create Employee</Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-64">
            <p className="text-muted-foreground">Loading employees...</p>
          </div>
        ) : employees.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center h-64">
              <UserPlus className="w-12 h-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground mb-2">No employees yet</p>
              <p className="text-sm text-muted-foreground">Click "Add Employee" to create your first employee account</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {employees.map((employee) => (
              <Card key={employee.id}>
                <CardContent className="flex items-center justify-between p-6">
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                        <span className="text-lg font-semibold text-primary">
                          {employee.name.charAt(0)}
                        </span>
                      </div>
                      <div>
                        <h3 className="font-semibold text-lg">{employee.name}</h3>
                        <p className="text-sm text-muted-foreground">{employee.email}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="inline-block px-2 py-0.5 rounded text-xs font-semibold bg-green-500/20 text-green-600 dark:text-green-400">
                            {employee.role}
                          </span>
                          <span className={`inline-block px-2 py-0.5 rounded text-xs font-semibold ${
                            employee.isActive
                              ? 'bg-blue-500/20 text-blue-600 dark:text-blue-400'
                              : 'bg-gray-500/20 text-gray-600 dark:text-gray-400'
                          }`}>
                            {employee.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleToggleStatus(employee.id, employee.isActive)}
                      className="gap-2"
                    >
                      {employee.isActive ? (
                        <>
                          <UserX className="w-4 h-4" />
                          Deactivate
                        </>
                      ) : (
                        <>
                          <UserCheck className="w-4 h-4" />
                          Activate
                        </>
                      )}
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDeleteEmployee(employee.id)}
                      className="gap-2"
                    >
                      <Trash2 className="w-4 h-4" />
                      Delete
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default EmployeeManagement;
