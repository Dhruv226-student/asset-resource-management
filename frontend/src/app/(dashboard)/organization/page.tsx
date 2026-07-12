'use client';

import React, { useEffect, useState } from 'react';
import { getEmployees, createEmployee, updateEmployee, updateEmployeeRole } from '@/services/employee.service';
import { getDepartments, createDepartment } from '@/services/department.service';
import { getCategories, createCategory } from '@/services/category.service';
import { useAppStore } from '@/store/useAppStore';
import PageHeader from '@/components/PageHeader';
import StatusBadge from '@/components/StatusBadge';
import UserAvatar from '@/components/UserAvatar';
import SearchInput from '@/components/SearchInput';
import LoadingSkeleton from '@/components/LoadingSkeleton';
import EmptyState from '@/components/EmptyState';
import RoleGuard from '@/components/RoleGuard';
import { User, Department, AssetCategory, UserRole } from '@/types';
import { Plus, Pencil, Users, Building2, Tag, X, ChevronRight } from 'lucide-react';

type Tab = 'employees' | 'departments' | 'categories';

export default function OrganizationPage() {
  const showToast = useAppStore(s => s.showToast);
  const currentRole = useAppStore(s => s.currentRole);

  const [tab, setTab] = useState<Tab>('employees');
  const [employees, setEmployees] = useState<User[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [categories, setCategories] = useState<AssetCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [saving, setSaving] = useState(false);

  // Employee edit modal
  const [empModal, setEmpModal] = useState(false);
  const [editEmp, setEditEmp] = useState<User | null>(null);
  const [empForm, setEmpForm] = useState<{
    name: string;
    email: string;
    employeeId: string;
    departmentId: string;
    role: UserRole;
    status: 'active' | 'inactive';
  }>({ name: '', email: '', employeeId: '', departmentId: '', role: 'employee', status: 'active' });

  // Dept modal
  const [deptModal, setDeptModal] = useState(false);
  const [deptForm, setDeptForm] = useState({ name: '', code: '', head: '', description: '', status: 'active' as const });

  // Category modal
  const [catModal, setCatModal] = useState(false);
  const [catForm, setCatForm] = useState({ name: '', code: '', description: '', status: 'active' as const, warrantyTrackingEnabled: true, maintenanceInterval: 180 });

  useEffect(() => {
    Promise.all([getEmployees(), getDepartments(), getCategories()])
      .then(([e, d, c]) => { setEmployees(e); setDepartments(d); setCategories(c); })
      .finally(() => setLoading(false));
  }, []);

  const filteredEmp = employees.filter(e => !search || e.name.toLowerCase().includes(search.toLowerCase()) || e.email.toLowerCase().includes(search.toLowerCase()) || e.employeeId.toLowerCase().includes(search.toLowerCase()));

  const openEditEmp = (emp: User) => {
    setEditEmp(emp);
    setEmpForm({ name: emp.name, email: emp.email, employeeId: emp.employeeId, departmentId: emp.departmentId || '', role: emp.role, status: emp.status });
    setEmpModal(true);
  };

  const handleSaveEmp = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editEmp) {
        const updated = await updateEmployee(editEmp.id, empForm);
        if (empForm.role !== editEmp.role) await updateEmployeeRole(editEmp.id, empForm.role);
        setEmployees(prev => prev.map(e => e.id === updated.id ? { ...updated, role: empForm.role } : e));
        showToast(`Employee "${updated.name}" updated.`);
      } else {
        const dept = departments.find(d => d.id === empForm.departmentId);
        const newEmp = await createEmployee({ ...empForm, departmentName: dept?.name || 'Unassigned', avatar: undefined });
        setEmployees(prev => [...prev, newEmp]);
        showToast(`Employee "${newEmp.name}" added.`);
      }
      setEmpModal(false);
    } catch (err: any) { showToast(err.message, 'error'); }
    finally { setSaving(false); }
  };

  const handleSaveDept = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const newDept = await createDepartment(deptForm);
      setDepartments(prev => [...prev, newDept]);
      showToast(`Department "${newDept.name}" created.`);
      setDeptModal(false);
    } catch (err: any) { showToast(err.message, 'error'); }
    finally { setSaving(false); }
  };

  const handleSaveCat = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const newCat = await createCategory(catForm);
      setCategories(prev => [...prev, newCat]);
      showToast(`Category "${newCat.name}" created.`);
      setCatModal(false);
    } catch (err: any) { showToast(err.message, 'error'); }
    finally { setSaving(false); }
  };

  const ROLE_LABELS: Record<UserRole, string> = { admin: 'Administrator', 'asset-manager': 'Asset Manager', 'department-head': 'Dept. Head', employee: 'Employee' };

  if (loading) return <div className="space-y-6"><div className="h-10 bg-gray-200 dark:bg-zinc-800 rounded w-48 animate-pulse" /><LoadingSkeleton type="table" count={5} /></div>;

  return (
    <div className="space-y-6 page-enter">
      <PageHeader
        title="Organization"
        description="Manage employees, departments, and asset categories."
        breadcrumbs={[{ label: 'Organization' }]}
        actions={
          <RoleGuard allowedRoles={['admin']}>
            <div className="flex gap-2">
              {tab === 'employees' && <button onClick={() => { setEditEmp(null); setEmpForm({ name: '', email: '', employeeId: '', departmentId: '', role: 'employee', status: 'active' }); setEmpModal(true); }} className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-lg transition-colors shadow-sm"><Plus className="w-4 h-4" /> Add Employee</button>}
              {tab === 'departments' && <button onClick={() => setDeptModal(true)} className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-lg transition-colors shadow-sm"><Plus className="w-4 h-4" /> Add Department</button>}
              {tab === 'categories' && <button onClick={() => setCatModal(true)} className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-lg transition-colors shadow-sm"><Plus className="w-4 h-4" /> Add Category</button>}
            </div>
          </RoleGuard>
        }
      />

      {/* Tabs */}
      <div className="flex items-center gap-1 bg-gray-100 dark:bg-zinc-800 p-1 rounded-lg w-fit">
        {[
          { key: 'employees', label: 'Employees', icon: <Users className="w-4 h-4" />, count: employees.length },
          { key: 'departments', label: 'Departments', icon: <Building2 className="w-4 h-4" />, count: departments.length },
          { key: 'categories', label: 'Categories', icon: <Tag className="w-4 h-4" />, count: categories.length },
        ].map(t => (
          <button key={t.key} onClick={() => setTab(t.key as Tab)} className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-semibold transition-all ${tab === t.key ? 'bg-white dark:bg-zinc-900 text-gray-900 dark:text-zinc-100 shadow-sm' : 'text-gray-500 dark:text-zinc-400 hover:text-gray-700 dark:hover:text-zinc-200'}`}>
            {t.icon} {t.label} <span className="text-xs font-bold bg-gray-200 dark:bg-zinc-700 text-gray-600 dark:text-zinc-400 px-1.5 py-0.5 rounded-full">{t.count}</span>
          </button>
        ))}
      </div>

      {/* === EMPLOYEES TABLE === */}
      {tab === 'employees' && (
        <>
          <SearchInput value={search} onChange={e => setSearch(e.target.value)} onClear={() => setSearch('')} placeholder="Search employees…" className="max-w-sm" />
          <div className="bg-white dark:bg-zinc-900 border border-gray-150 dark:border-zinc-800 rounded-xl overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead className="bg-gray-50 dark:bg-zinc-850/80 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-zinc-400">
                  <tr>
                    <th className="px-5 py-4 text-left">Employee</th>
                    <th className="px-5 py-4 text-left hidden md:table-cell">ID</th>
                    <th className="px-5 py-4 text-left hidden lg:table-cell">Department</th>
                    <th className="px-5 py-4 text-left">Role</th>
                    <th className="px-5 py-4 text-left">Status</th>
                    <th className="px-5 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-zinc-800/60">
                  {filteredEmp.length > 0 ? filteredEmp.map(emp => (
                    <tr key={emp.id} className="hover:bg-gray-50/40 dark:hover:bg-zinc-850/20 transition-colors">
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <UserAvatar name={emp.name} avatarUrl={emp.avatar} size="sm" />
                          <div>
                            <p className="font-semibold text-gray-800 dark:text-zinc-200">{emp.name}</p>
                            <p className="text-xs text-gray-400 dark:text-zinc-500">{emp.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-4 hidden md:table-cell"><code className="text-xs font-mono text-gray-600 dark:text-zinc-400">{emp.employeeId}</code></td>
                      <td className="px-5 py-4 text-gray-600 dark:text-zinc-400 hidden lg:table-cell">{emp.departmentName}</td>
                      <td className="px-5 py-4"><StatusBadge status={emp.role} /></td>
                      <td className="px-5 py-4"><StatusBadge status={emp.status} /></td>
                      <td className="px-5 py-4 text-right">
                        <RoleGuard allowedRoles={['admin']}>
                          <button onClick={() => openEditEmp(emp)} className="p-1.5 rounded-lg text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-950/20 transition-colors" title="Edit">
                            <Pencil className="w-4 h-4" />
                          </button>
                        </RoleGuard>
                      </td>
                    </tr>
                  )) : <tr><td colSpan={6} className="py-12"><EmptyState title="No employees found" /></td></tr>}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* === DEPARTMENTS GRID === */}
      {tab === 'departments' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {departments.map(dept => (
            <div key={dept.id} className="bg-white dark:bg-zinc-900 border border-gray-150 dark:border-zinc-800 rounded-xl p-5 hover:shadow-md transition-all">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <p className="font-bold text-gray-800 dark:text-zinc-200">{dept.name}</p>
                  <code className="text-xs text-gray-400 dark:text-zinc-500">{dept.code}</code>
                </div>
                <StatusBadge status={dept.status} />
              </div>
              <p className="text-xs text-gray-500 dark:text-zinc-400 mb-3">{dept.description || 'No description'}</p>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="bg-gray-50 dark:bg-zinc-800 rounded-lg p-2.5 text-center">
                  <p className="font-bold text-lg text-gray-800 dark:text-zinc-200">{dept.employeeCount}</p>
                  <p className="text-gray-400 dark:text-zinc-500">Employees</p>
                </div>
                <div className="bg-gray-50 dark:bg-zinc-800 rounded-lg p-2.5 text-center">
                  <p className="font-bold text-lg text-gray-800 dark:text-zinc-200">{dept.assetCount}</p>
                  <p className="text-gray-400 dark:text-zinc-500">Assets</p>
                </div>
              </div>
              <p className="mt-3 text-xs text-gray-500 dark:text-zinc-400">Head: <span className="font-semibold text-gray-700 dark:text-zinc-300">{dept.head}</span></p>
            </div>
          ))}
        </div>
      )}

      {/* === CATEGORIES GRID === */}
      {tab === 'categories' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {categories.map(cat => (
            <div key={cat.id} className="bg-white dark:bg-zinc-900 border border-gray-150 dark:border-zinc-800 rounded-xl p-5 hover:shadow-md transition-all">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <p className="font-bold text-gray-800 dark:text-zinc-200">{cat.name}</p>
                  <code className="text-xs text-gray-400 dark:text-zinc-500">{cat.code}</code>
                </div>
                <StatusBadge status={cat.status} />
              </div>
              <p className="text-xs text-gray-500 dark:text-zinc-400 mb-3 line-clamp-2">{cat.description || '—'}</p>
              <div className="flex items-center justify-between text-xs">
                <span className="text-gray-600 dark:text-zinc-400">{cat.assetCount} assets</span>
                {cat.warrantyTrackingEnabled && <span className="bg-indigo-50 dark:bg-indigo-950/20 text-indigo-700 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-900/30 px-2 py-0.5 rounded-full text-[10px] font-semibold">Warranty Tracked</span>}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Employee Modal */}
      {empModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-zinc-900 border border-gray-150 dark:border-zinc-800 rounded-2xl shadow-2xl w-full max-w-lg">
            <div className="px-6 py-4 border-b border-gray-150 dark:border-zinc-800 flex items-center justify-between">
              <h2 className="text-lg font-bold text-gray-900 dark:text-zinc-100">{editEmp ? 'Edit Employee' : 'Add Employee'}</h2>
              <button onClick={() => setEmpModal(false)} className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 dark:hover:bg-zinc-800"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleSaveEmp} className="p-6 space-y-4">
              {[
                { label: 'Full Name *', key: 'name', type: 'text' },
                { label: 'Email *', key: 'email', type: 'email' },
                { label: 'Employee ID *', key: 'employeeId', type: 'text' },
              ].map(f => (
                <div key={f.key}>
                  <label className="block text-xs font-semibold text-gray-600 dark:text-zinc-400 uppercase tracking-wider mb-1.5">{f.label}</label>
                  <input required={f.label.includes('*')} type={f.type} value={empForm[f.key as keyof typeof empForm] as string} onChange={e => setEmpForm(p => ({ ...p, [f.key]: e.target.value }))} className="w-full border border-gray-300 dark:border-zinc-700 rounded-lg px-3 py-2.5 text-sm bg-white dark:bg-zinc-900 focus:ring-2 focus:ring-indigo-500 text-gray-800 dark:text-zinc-200" />
                </div>
              ))}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 dark:text-zinc-400 uppercase tracking-wider mb-1.5">Department</label>
                  <select value={empForm.departmentId} onChange={e => setEmpForm(p => ({ ...p, departmentId: e.target.value }))} className="w-full border border-gray-300 dark:border-zinc-700 rounded-lg px-3 py-2.5 text-sm bg-white dark:bg-zinc-900 focus:ring-2 focus:ring-indigo-500 text-gray-800 dark:text-zinc-200">
                    <option value="">Select Dept.</option>
                    {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 dark:text-zinc-400 uppercase tracking-wider mb-1.5">Role</label>
                  <select value={empForm.role} onChange={e => setEmpForm(p => ({ ...p, role: e.target.value as UserRole }))} className="w-full border border-gray-300 dark:border-zinc-700 rounded-lg px-3 py-2.5 text-sm bg-white dark:bg-zinc-900 focus:ring-2 focus:ring-indigo-500 text-gray-800 dark:text-zinc-200">
                    {Object.entries(ROLE_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                  </select>
                </div>
              </div>
              <div className="flex gap-3 justify-end pt-1">
                <button type="button" onClick={() => setEmpModal(false)} className="px-5 py-2.5 border border-gray-300 dark:border-zinc-700 rounded-lg text-sm font-medium text-gray-700 dark:text-zinc-300 hover:bg-gray-50 dark:hover:bg-zinc-850 transition-colors">Cancel</button>
                <button type="submit" disabled={saving} className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-lg disabled:opacity-60 transition-colors">{saving ? 'Saving…' : 'Save Employee'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Dept Modal */}
      {deptModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-zinc-900 border border-gray-150 dark:border-zinc-800 rounded-2xl shadow-2xl w-full max-w-md">
            <div className="px-6 py-4 border-b border-gray-150 dark:border-zinc-800 flex items-center justify-between">
              <h2 className="text-lg font-bold text-gray-900 dark:text-zinc-100">Create Department</h2>
              <button onClick={() => setDeptModal(false)} className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 dark:hover:bg-zinc-800"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleSaveDept} className="p-6 space-y-4">
              {[
                { label: 'Name *', key: 'name', placeholder: 'Engineering' },
                { label: 'Code *', key: 'code', placeholder: 'ENG' },
                { label: 'Head *', key: 'head', placeholder: 'Employee Name' },
                { label: 'Description', key: 'description', placeholder: 'Brief description' },
              ].map(f => (
                <div key={f.key}>
                  <label className="block text-xs font-semibold text-gray-600 dark:text-zinc-400 uppercase tracking-wider mb-1.5">{f.label}</label>
                  <input required={f.label.includes('*')} type="text" value={deptForm[f.key as keyof typeof deptForm] as string} onChange={e => setDeptForm(p => ({ ...p, [f.key]: e.target.value }))} placeholder={f.placeholder} className="w-full border border-gray-300 dark:border-zinc-700 rounded-lg px-3 py-2.5 text-sm bg-white dark:bg-zinc-900 focus:ring-2 focus:ring-indigo-500 text-gray-800 dark:text-zinc-200" />
                </div>
              ))}
              <div className="flex gap-3 justify-end pt-1">
                <button type="button" onClick={() => setDeptModal(false)} className="px-5 py-2.5 border border-gray-300 dark:border-zinc-700 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors">Cancel</button>
                <button type="submit" disabled={saving} className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-lg disabled:opacity-60 transition-colors">{saving ? 'Creating…' : 'Create'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Category Modal */}
      {catModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-zinc-900 border border-gray-150 dark:border-zinc-800 rounded-2xl shadow-2xl w-full max-w-md">
            <div className="px-6 py-4 border-b border-gray-150 dark:border-zinc-800 flex items-center justify-between">
              <h2 className="text-lg font-bold text-gray-900 dark:text-zinc-100">Create Category</h2>
              <button onClick={() => setCatModal(false)} className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 dark:hover:bg-zinc-800"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleSaveCat} className="p-6 space-y-4">
              {[
                { label: 'Name *', key: 'name', placeholder: 'Networking Devices' },
                { label: 'Code *', key: 'code', placeholder: 'NET' },
                { label: 'Description', key: 'description', placeholder: 'Category description' },
              ].map(f => (
                <div key={f.key}>
                  <label className="block text-xs font-semibold text-gray-600 dark:text-zinc-400 uppercase tracking-wider mb-1.5">{f.label}</label>
                  <input required={f.label.includes('*')} type="text" value={catForm[f.key as keyof typeof catForm] as string} onChange={e => setCatForm(p => ({ ...p, [f.key]: e.target.value }))} placeholder={f.placeholder} className="w-full border border-gray-300 dark:border-zinc-700 rounded-lg px-3 py-2.5 text-sm bg-white dark:bg-zinc-900 focus:ring-2 focus:ring-indigo-500 text-gray-800 dark:text-zinc-200" />
                </div>
              ))}
              <label className="flex items-center gap-2 text-sm text-gray-700 dark:text-zinc-300 cursor-pointer">
                <input type="checkbox" checked={catForm.warrantyTrackingEnabled} onChange={e => setCatForm(p => ({ ...p, warrantyTrackingEnabled: e.target.checked }))} className="accent-indigo-600" />
                Enable warranty tracking
              </label>
              <div className="flex gap-3 justify-end pt-1">
                <button type="button" onClick={() => setCatModal(false)} className="px-5 py-2.5 border border-gray-300 dark:border-zinc-700 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors">Cancel</button>
                <button type="submit" disabled={saving} className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-lg disabled:opacity-60 transition-colors">{saving ? 'Creating…' : 'Create'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
