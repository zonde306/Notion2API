'use client';

import { useMemo, useState } from 'react';
import { Callout, Flex, Heading, Text } from '@radix-ui/themes';
import { useTheme } from 'next-themes';
import { AlertTriangle, LoaderCircle, Maximize2, Menu, Minimize2, Monitor, Moon, RefreshCcw, Sun } from 'lucide-react';
import { AccountsPanel } from '@/components/admin/accounts-panel';
import { AdminSidebar } from '@/components/admin/admin-sidebar';
import { ConversationsPanel } from '@/components/admin/conversations-panel';
import { DashboardPanel } from '@/components/admin/dashboard-panel';
import { ACCENT_THEME_OPTIONS, useAccentTheme } from '@/components/layout/theme-provider';
import { LoginOverlay } from '@/components/admin/login-overlay';
import { ModelsPanel } from '@/components/admin/models-panel';
import { SettingsPanel } from '@/components/admin/settings-panel';
import { TesterPanel } from '@/components/admin/tester-panel';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAdminConsole } from '@/hooks/use-admin-console';
import { cn } from '@/lib/utils';
import type { TabKey } from '@/lib/services/admin/types';

export function AdminConsole() {
  const consoleState = useAdminConsole();
  const [activeTab, setActiveTab] = useState<TabKey>('dashboard');
  const [loginBusy, setLoginBusy] = useState(false);
  const [loginMessage, setLoginMessage] = useState('');
  const [isFullWidth, setIsFullWidth] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const { theme, setTheme } = useTheme();
  const { accentTheme, setAccentTheme } = useAccentTheme();

  const {
    verify,
    configPayload,
    versionPayload,
    healthPayload,
    accountsPayload,
    conversations,
    selectedConversation,
    selectedConversationId,
    streamState,
    bootLoading,
    bootError,
    setSelectedConversationId,
    loadConversationDetail,
    loadConversations,
    refreshConversations,
    refreshAll,
    refreshAccounts,
    refreshConfigBundle,
    login,
    logout,
    deleteConversation,
    batchDeleteConversations,
    services,
  } = consoleState;

  const authenticated = Boolean(verify?.authenticated);
  const passwordConfigured = Boolean(verify?.password_configured);
  const shouldShowOverlay = Boolean(verify) && !authenticated;
  const models = configPayload?.models || [];
  const defaultModel = configPayload?.config?.default_model || configPayload?.config?.model_id || versionPayload?.default_model;
  const defaultWebSearch = Boolean(configPayload?.config?.features?.use_web_search);

  const authState = useMemo(() => {
    if (authenticated) return '已认证';
    if (!verify?.admin_enabled) return '未启用';
    if (!passwordConfigured) return '未配置密码';
    return '待登录';
  }, [authenticated, passwordConfigured, verify?.admin_enabled]);

  const activeTabLabel = useMemo(() => {
    switch (activeTab) {
      case 'tester':
        return 'API Tester';
      case 'conversations':
        return '会话';
      case 'settings':
        return '设置';
      case 'accounts':
        return '账号';
      case 'models':
        return '模型';
      case 'dashboard':
      default:
        return '状态';
    }
  }, [activeTab]);

  const themeMode = theme === 'light' || theme === 'dark' || theme === 'system' ? theme : 'system';

  const renderActivePanel = () => {
    switch (activeTab) {
      case 'tester':
        return (
          <TesterPanel
            models={models}
            defaultModel={defaultModel}
            defaultWebSearch={defaultWebSearch}
            onRun={async (payload) => {
              const result = await services.testPrompt(payload);
              await loadConversations();
              return result;
            }}
          />
        );
      case 'conversations':
        return (
          <ConversationsPanel
            conversations={conversations}
            selectedConversationId={selectedConversationId}
            selectedConversation={selectedConversation}
            streamState={streamState}
            onRefresh={refreshConversations}
            onSelect={async (conversationId) => {
              setSelectedConversationId(conversationId);
              await loadConversationDetail(conversationId, false);
            }}
            onDelete={deleteConversation}
            onBatchDelete={batchDeleteConversations}
          />
        );
      case 'settings':
        return configPayload ? (
          <SettingsPanel
            config={configPayload.config}
            models={models}
            adminPasswordSet={Boolean(configPayload.secrets?.admin_password_set)}
            onSave={async (config) => {
              const payload = await services.updateSettings(config);
              await refreshAll();
              return payload;
            }}
            onImport={async (config) => {
              const payload = await services.importConfig(config);
              await refreshAll();
              return payload;
            }}
            onExport={services.exportConfig}
            onCreateSnapshot={services.createConfigSnapshot}
            onListSnapshot={services.listConfigSnapshots}
            onTestPrompt={async (payload) => {
              const result = await services.testPrompt(payload);
              await loadConversations();
              return result;
            }}
          />
        ) : null;
      case 'accounts':
        return (
          <AccountsPanel
            accountsPayload={accountsPayload}
            models={models}
            defaultModel={defaultModel}
            onRefresh={refreshAccounts}
            onStartLogin={async (email) => {
              const payload = await services.startAccountLogin(email);
              await refreshAccounts();
              await refreshConfigBundle();
              return payload;
            }}
            onVerifyCode={async (email, code) => {
              const payload = await services.verifyAccountCode(email, code);
              await refreshAll();
              return payload;
            }}
            onImportAccount={async (payload) => {
              const result = await services.importAccount(payload);
              await refreshAll();
              return result;
            }}
            onQuickTest={async (payload) => {
              const result = await services.quickTestAccount(payload);
              await loadConversations();
              return result;
            }}
            onActivate={async (email) => {
              const payload = await services.activateAccount(email);
              await refreshAll();
              return payload;
            }}
            onDelete={async (email) => {
              const payload = await services.deleteAccount(email);
              await refreshAll();
              return payload;
            }}
            onSaveAccountSettings={async (payload) => {
              const result = await services.saveAccountSettings(payload);
              await refreshAccounts();
              await refreshConfigBundle();
              return result;
            }}
          />
        );
      case 'models':
        return <ModelsPanel models={models} defaultModel={defaultModel} />;
      case 'dashboard':
      default:
        return (
          <DashboardPanel
            configPayload={configPayload}
            versionPayload={versionPayload}
            healthPayload={healthPayload}
            accountsPayload={accountsPayload}
          />
        );
    }
  };

  if (bootLoading && !verify) {
    return (
      <main className="console-surface flex min-h-screen items-center justify-center px-4 py-8">
        <Card className="panel-card w-full max-w-md py-0">
          <CardContent className="px-6 py-8">
            <Flex direction="column" align="center" gap="5">
              <div className="surface-subtle flex size-16 items-center justify-center rounded-md">
                <LoaderCircle className="size-7 animate-spin text-primary" />
              </div>
              <div className="space-y-2 text-center">
                <Heading size="6" className="text-2xl font-semibold tracking-tight">
                  控制台启动中
                </Heading>
                <Text size="2" className="mx-auto block max-w-lg leading-6 text-muted-foreground">
                  正在建立管理面认证状态、模型索引、账号池快照和会话流订阅。
                </Text>
              </div>
            </Flex>
          </CardContent>
        </Card>
      </main>
    );
  }

  return (
    <main className="console-surface">
      <div className="flex min-h-screen min-w-0 bg-background">
        <AdminSidebar
          activeTab={activeTab}
          onTabChange={setActiveTab}
          authState={authState}
          defaultModel={defaultModel}
          spaceName={configPayload?.session?.space_name || accountsPayload?.session?.space_name}
          activeAccount={accountsPayload?.active_account}
          onLogout={() => void logout()}
          mobileOpen={mobileNavOpen}
          onMobileOpenChange={setMobileNavOpen}
        />

        <section className="min-w-0 flex-1">
          <header className="topbar-shell sticky top-0 z-20 border-b">
            <div
              className={cn(
                'mx-auto flex min-h-[72px] w-full flex-wrap items-center gap-3 px-4 py-3 md:px-8 md:py-0',
                isFullWidth ? 'max-w-full' : 'max-w-[1360px]',
              )}
            >
              <Button variant="outline" size="icon" className="lg:hidden" onClick={() => setMobileNavOpen(true)}>
                <Menu className="size-4" />
              </Button>

              <div className="min-w-0 flex-1">
                <div className="text-sm font-medium tracking-tight">{activeTabLabel}</div>
                <div className="text-xs text-muted-foreground">Nation2API 管理台</div>
              </div>

              <div className="ml-auto flex w-full flex-wrap items-center justify-end gap-2 lg:w-auto">
                <div className="status-chip hidden md:flex text-[11px]">
                  认证 · {authState}
                </div>
                <div className="status-chip hidden max-w-[240px] xl:flex text-[11px]" title={accountsPayload?.active_account || '-'}>
                  <span className="truncate">账号 · {accountsPayload?.active_account || '-'}</span>
                </div>
                <div className="status-chip hidden md:flex text-[11px]">
                  Stream · {streamState}
                </div>
                <Select value={themeMode} onValueChange={(value) => setTheme(value)}>
                  <SelectTrigger className="h-10 min-w-[124px] bg-background/80 md:w-[136px]">
                    <SelectValue placeholder="主题模式" />
                  </SelectTrigger>
                  <SelectContent align="end">
                    <SelectItem value="system">
                      <span className="flex items-center gap-2">
                        <Monitor className="size-4 text-muted-foreground" />
                        <span>跟随系统</span>
                      </span>
                    </SelectItem>
                    <SelectItem value="light">
                      <span className="flex items-center gap-2">
                        <Sun className="size-4 text-muted-foreground" />
                        <span>浅色</span>
                      </span>
                    </SelectItem>
                    <SelectItem value="dark">
                      <span className="flex items-center gap-2">
                        <Moon className="size-4 text-muted-foreground" />
                        <span>深色</span>
                      </span>
                    </SelectItem>
                  </SelectContent>
                </Select>
                <Select value={accentTheme} onValueChange={(value) => setAccentTheme(value as typeof accentTheme)}>
                  <SelectTrigger className="h-10 min-w-[124px] bg-background/80 md:w-[136px]">
                    <SelectValue placeholder="主题色" />
                  </SelectTrigger>
                  <SelectContent align="end">
                    {ACCENT_THEME_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        <span className="flex items-center gap-2">
                          <span
                            className="size-2.5 rounded-full border border-black/10"
                            style={{ backgroundColor: option.preview }}
                          />
                          <span>{option.label}</span>
                        </span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button variant="ghost" size="icon" onClick={() => setIsFullWidth((current) => !current)}>
                  {isFullWidth ? <Minimize2 className="size-4" /> : <Maximize2 className="size-4" />}
                </Button>
                <Button variant="outline" onClick={() => void refreshAll()}>
                  <RefreshCcw className="size-4" />
                  重新同步
                </Button>
              </div>
            </div>
          </header>

          <div className="min-w-0 overflow-x-hidden">
            <div
              className={cn(
                'mx-auto w-full min-w-0 px-4 py-6 pb-8 md:px-8',
                isFullWidth ? 'max-w-full' : 'max-w-[1360px]',
              )}
            >
              {bootError ? (
                <Callout.Root color="violet" variant="surface" className="mb-6 border px-4 py-3 shadow-none">
                  <Callout.Icon>
                    <AlertTriangle className="size-4" />
                  </Callout.Icon>
                  <Callout.Text>
                    <span className="font-semibold">加载异常：</span>
                    {bootError}
                  </Callout.Text>
                </Callout.Root>
              ) : null}

              {authenticated ? renderActivePanel() : null}
            </div>
          </div>
        </section>
      </div>

      {shouldShowOverlay ? (
        <LoginOverlay
          passwordConfigured={passwordConfigured}
          message={loginMessage || bootError || (passwordConfigured ? '请输入密码登录。' : '未检测到 admin.password。')}
          busy={loginBusy}
          onSubmit={async (password) => {
            setLoginBusy(true);
            setLoginMessage('');
            try {
              await login(password);
              setLoginMessage('');
            } catch (error) {
              const message = error instanceof Error ? error.message : '登录失败';
              setLoginMessage(message);
              throw error;
            } finally {
              setLoginBusy(false);
            }
          }}
        />
      ) : null}
    </main>
  );
}
