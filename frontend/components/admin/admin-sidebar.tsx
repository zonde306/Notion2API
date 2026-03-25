'use client';

import type { ComponentType } from 'react';
import { Text } from '@radix-ui/themes';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import type { TabKey } from '@/lib/services/admin/types';
import { Braces, History, KeyRound, LayoutDashboard, LogOut, Settings2, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

const tabMeta: Array<{ key: TabKey; label: string; icon: ComponentType<{ className?: string }> }> = [
  { key: 'dashboard', label: '状态', icon: LayoutDashboard },
  { key: 'tester', label: 'API Tester', icon: Sparkles },
  { key: 'conversations', label: '会话', icon: History },
  { key: 'settings', label: '设置', icon: Settings2 },
  { key: 'accounts', label: '账号', icon: KeyRound },
  { key: 'models', label: '模型', icon: Braces },
];

function SidebarContent({
  activeTab,
  onTabChange,
  authState,
  defaultModel,
  spaceName,
  activeAccount,
  onLogout,
  onNavigate,
}: {
  activeTab: TabKey;
  onTabChange: (tab: TabKey) => void;
  authState: string;
  defaultModel?: string;
  spaceName?: string;
  activeAccount?: string;
  onLogout: () => void;
  onNavigate?: () => void;
}) {
  const runtimeItems = [
    ['认证', authState],
    ['默认模型', defaultModel || '-'],
    ['当前空间', spaceName || '-'],
    ['活跃账号', activeAccount || '-'],
  ];

  return (
    <div className="pretty-scroll sidebar-scroll flex h-full min-w-0 flex-col gap-6 overflow-y-auto px-4 py-4 lg:px-3 lg:py-4">
      <div className="space-y-4">
        <div className="flex items-start gap-3 rounded-md border bg-card px-3 py-3">
          <div className="flex size-9 shrink-0 items-center justify-center rounded-md bg-primary text-primary-foreground">
            N
          </div>
          <div className="min-w-0 space-y-1">
            <div className="text-sm font-semibold tracking-tight">Nation2API</div>
            <Text size="1" className="block leading-5 text-muted-foreground">
              协议管理台
            </Text>
          </div>
        </div>

        <div className="min-w-0 overflow-hidden rounded-md border bg-card px-3 py-3">
          <div className="mb-3 flex items-center justify-between gap-2">
            <div className="text-xs font-medium uppercase tracking-[0.14em] text-muted-foreground">运行摘要</div>
            <Badge variant="secondary">{authState}</Badge>
          </div>
          <div className="grid gap-2">
            {runtimeItems.map(([label, value]) => (
              <div key={label} className="min-w-0 overflow-hidden rounded-md border bg-muted/40 px-3 py-2">
                <Text size="1" className="block uppercase tracking-[0.12em] text-muted-foreground">
                  {label}
                </Text>
                <div className="mt-2 max-w-full overflow-hidden rounded-md border bg-background/80 px-2.5 py-2">
                  <div className="pretty-scroll max-h-16 w-full overflow-x-hidden overflow-y-auto break-all pr-1 text-[12px] font-medium leading-5 text-foreground/92">
                    {value}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="space-y-5">
        <div className="space-y-2">
          <div className="px-2 text-xs font-medium uppercase tracking-[0.14em] text-muted-foreground">工作台</div>
          <nav className="grid gap-1">
            {tabMeta.slice(0, 3).map((item) => {
              const Icon = item.icon;
              const active = activeTab === item.key;
              return (
                <button
                  key={item.key}
                  type="button"
                  onClick={() => {
                    onTabChange(item.key);
                    onNavigate?.();
                  }}
                  className={cn(
                    'flex items-center gap-3 rounded-md px-3 py-2.5 text-left text-sm transition-colors',
                    active
                      ? 'border border-primary/20 bg-primary/6 text-foreground'
                      : 'border border-transparent text-muted-foreground hover:bg-muted/60 hover:text-foreground',
                  )}
                >
                  <Icon className="size-4 shrink-0" />
                  <span className="truncate">{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        <div className="space-y-2">
          <div className="px-2 text-xs font-medium uppercase tracking-[0.14em] text-muted-foreground">配置</div>
          <nav className="grid gap-1">
            {tabMeta.slice(3).map((item) => {
              const Icon = item.icon;
              const active = activeTab === item.key;
              return (
                <button
                  key={item.key}
                  type="button"
                  onClick={() => {
                    onTabChange(item.key);
                    onNavigate?.();
                  }}
                  className={cn(
                    'flex items-center gap-3 rounded-md px-3 py-2.5 text-left text-sm transition-colors',
                    active
                      ? 'border border-primary/20 bg-primary/6 text-foreground'
                      : 'border border-transparent text-muted-foreground hover:bg-muted/60 hover:text-foreground',
                  )}
                >
                  <Icon className="size-4 shrink-0" />
                  <span className="truncate">{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      <div className="mt-auto space-y-3">
        <div className="rounded-md border bg-card px-3 py-3">
          <div className="text-xs font-medium uppercase tracking-[0.14em] text-muted-foreground">使用提示</div>
          <Text size="2" className="mt-2 block leading-6 text-muted-foreground">
            先核对状态，再处理账号与回归；长内容统一在滚动区查看。
          </Text>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="flex-1 justify-center" onClick={() => { onLogout(); onNavigate?.(); }}>
            <LogOut className="size-4" />
            退出
          </Button>
          <div className="flex items-center rounded-md border px-3 text-xs text-muted-foreground">
            admin
          </div>
        </div>
      </div>
    </div>
  );
}

export function AdminSidebar({
  activeTab,
  onTabChange,
  authState,
  defaultModel,
  spaceName,
  activeAccount,
  onLogout,
  mobileOpen,
  onMobileOpenChange,
}: {
  activeTab: TabKey;
  onTabChange: (tab: TabKey) => void;
  authState: string;
  defaultModel?: string;
  spaceName?: string;
  activeAccount?: string;
  onLogout: () => void;
  mobileOpen: boolean;
  onMobileOpenChange: (open: boolean) => void;
}) {
  return (
    <>
      <aside className="sidebar-shell hidden w-[272px] shrink-0 border-r lg:sticky lg:top-0 lg:block lg:h-screen">
        <SidebarContent
          activeTab={activeTab}
          onTabChange={onTabChange}
          authState={authState}
          defaultModel={defaultModel}
          spaceName={spaceName}
          activeAccount={activeAccount}
          onLogout={onLogout}
        />
      </aside>

      <Dialog open={mobileOpen} onOpenChange={onMobileOpenChange}>
        <DialogContent
          showCloseButton
          className="sidebar-shell lg:hidden !left-0 !top-0 !h-screen !w-[min(92vw,320px)] !max-w-[320px] !translate-x-0 !translate-y-0 rounded-none border-0 border-r p-0 shadow-xl"
        >
          <DialogTitle className="sr-only">导航菜单</DialogTitle>
          <SidebarContent
            activeTab={activeTab}
            onTabChange={onTabChange}
            authState={authState}
            defaultModel={defaultModel}
            spaceName={spaceName}
            activeAccount={activeAccount}
            onLogout={onLogout}
            onNavigate={() => onMobileOpenChange(false)}
          />
        </DialogContent>
      </Dialog>
    </>
  );
}
