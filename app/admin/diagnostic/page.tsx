'use client';

import { useState } from 'react';
import { AuthDiagnostic } from '@/components/AuthDiagnostic';
import { Home, LayoutDashboard, Users, Activity, LogOut, Menu, X, TrendingUp } from 'lucide-react';
import Link from 'next/link';

export default function AdminDiagnosticPage() {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(true);

  return (
    <div className="min-h-screen bg-slate-50 flex">
      <aside
        className={`bg-white border-r border-slate-200 flex-shrink-0 transition-all duration-300 ${
          isSidebarCollapsed ? 'w-16' : 'w-64'
        }`}
      >
        <div className="h-full flex flex-col">
          <div className="p-4 border-b border-slate-200 flex items-center justify-between">
            {!isSidebarCollapsed && (
              <Link href="/" className="flex items-center gap-2">
                <div className="w-10 h-10 bg-[#8dbf65] rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-xl">N</span>
                </div>
                <div>
                  <h2 className="font-bold text-slate-900">Nugget</h2>
                  <p className="text-xs text-slate-500">Admin Panel</p>
                </div>
              </Link>
            )}
            {isSidebarCollapsed && (
              <div className="w-full flex justify-center">
                <div className="w-10 h-10 bg-[#8dbf65] rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-xl">N</span>
                </div>
              </div>
            )}
          </div>

          <div className="p-2 border-b border-slate-200">
            <button
              onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
              className="w-full flex items-center justify-center px-3 py-2 text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
              title={isSidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            >
              {isSidebarCollapsed ? <Menu className="h-5 w-5" /> : <X className="h-5 w-5" />}
            </button>
          </div>

          <nav className="flex-1 p-2">
            <div className="space-y-1">
              <Link
                href="/"
                className="flex items-center gap-3 px-3 py-2 text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
                title="Homepage"
              >
                <Home className="h-5 w-5 flex-shrink-0" />
                {!isSidebarCollapsed && <span className="font-medium">Homepage</span>}
              </Link>
              <Link
                href="/admin"
                className="flex items-center gap-3 px-3 py-2 text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
                title="Dashboard"
              >
                <LayoutDashboard className="h-5 w-5 flex-shrink-0" />
                {!isSidebarCollapsed && <span className="font-medium">Dashboard</span>}
              </Link>
              <Link
                href="/admin/local-heroes"
                className="flex items-center gap-3 px-3 py-2 text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
                title="Manage Local Heroes"
              >
                <TrendingUp className="h-5 w-5 flex-shrink-0" />
                {!isSidebarCollapsed && <span className="font-medium">Local Heroes</span>}
              </Link>
              <Link
                href="/admin/users"
                className="flex items-center gap-3 px-3 py-2 text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
                title="Manage Users"
              >
                <Users className="h-5 w-5 flex-shrink-0" />
                {!isSidebarCollapsed && <span className="font-medium">Users</span>}
              </Link>
              <Link
                href="/admin/diagnostic"
                className="flex items-center gap-3 px-3 py-2 bg-[#8dbf65] text-white rounded-lg"
                title="Authentication Diagnostic"
              >
                <Activity className="h-5 w-5 flex-shrink-0" />
                {!isSidebarCollapsed && <span className="font-medium">Diagnostic</span>}
              </Link>
            </div>
          </nav>

          <div className="p-2 border-t border-slate-200">
            <button
              className="w-full flex items-center gap-3 px-3 py-2 text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
              title="Logout"
            >
              <LogOut className="h-5 w-5 flex-shrink-0" />
              {!isSidebarCollapsed && <span className="font-medium">Logout</span>}
            </button>
          </div>
        </div>
      </aside>

      <div className="flex-1 flex flex-col">
        <div className="border-b bg-white shadow-sm">
          <div className="px-6 py-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-slate-900">Authentication Diagnostic</h1>
                <p className="text-sm text-slate-600 mt-1">
                  Debug and monitor authentication status, user profiles, and permissions
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-auto">
          <div className="px-6 py-6">
            <AuthDiagnostic />
          </div>
        </div>
      </div>
    </div>
  );
}
