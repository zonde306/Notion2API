'use client';

import { useEffect, useState } from 'react';
import { LockKeyhole, ShieldAlert } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';

export function LoginOverlay({
  passwordConfigured,
  message,
  busy,
  onSubmit,
}: {
  passwordConfigured: boolean;
  message: string;
  busy: boolean;
  onSubmit: (password: string) => Promise<void>;
}) {
  const [password, setPassword] = useState('');
  const [localMessage, setLocalMessage] = useState('');

  useEffect(() => {
    setLocalMessage(message);
  }, [message]);

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-background/96">
      <div className="auth-shell absolute inset-0" />
      <div className="relative z-10 flex min-h-screen items-center justify-center px-4 py-10">
        <div className="w-full max-w-md space-y-6">
          <div className="space-y-3 text-center">
            <div className="mx-auto flex size-14 items-center justify-center rounded-md bg-primary text-primary-foreground shadow-sm">
              N
            </div>
            <div className="space-y-1">
              <h1 className="text-3xl font-bold tracking-tight text-foreground">Nation2API Console</h1>
              <p className="text-sm text-muted-foreground">管理账号、模型、会话与协议配置。</p>
            </div>
          </div>

          <Card className="panel-card w-full py-0">
            <CardHeader className="px-5 pt-5">
              <div className="mb-2 flex size-12 items-center justify-center rounded-md bg-primary/10 text-primary">
                {passwordConfigured ? <LockKeyhole className="size-5" /> : <ShieldAlert className="size-5" />}
              </div>
              <CardTitle className="text-lg tracking-tight">
                {passwordConfigured ? '进入控制台' : '管理面尚未就绪'}
              </CardTitle>
              <CardDescription className="leading-6">
                {passwordConfigured
                  ? '先完成管理密码认证。登录后会恢复账号、模型、会话和配置快照。'
                  : '请先在配置中设置 `admin.password`，否则 WebUI 不开放敏感操作。'}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 px-5 pb-5">
              {passwordConfigured ? (
                <form
                  className="space-y-3"
                  onSubmit={async (event) => {
                    event.preventDefault();
                    setLocalMessage('登录中...');
                    try {
                      await onSubmit(password);
                      setPassword('');
                    } catch (error) {
                      setLocalMessage(error instanceof Error ? error.message : '登录失败');
                    }
                  }}
                >
                  <Input
                    type="password"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    placeholder="请输入管理密码"
                    className="h-10 text-sm"
                  />
                  <Button type="submit" disabled={busy || !password.trim()} className="h-10 w-full justify-center">
                    {busy ? '登录中...' : '登录控制台'}
                  </Button>
                </form>
              ) : null}
              <div className="code-surface rounded-md border px-4 py-3 font-mono text-xs leading-6">
                {localMessage || (passwordConfigured ? '请输入密码登录。' : '未检测到 admin.password。')}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
