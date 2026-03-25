import type { AccountsPayload, AdminConfigPayload, HealthPayload, VersionPayload } from '@/lib/services/admin/types';
import { InfoCard, KeyValueGrid, PanelHeader, StatCard } from '@/components/admin/shared';

const FEATURE_TILE = 'surface-subtle px-4 py-4';
const META_TILE = 'surface-subtle px-4 py-4';

export function DashboardPanel({
  configPayload,
  versionPayload,
  healthPayload,
  accountsPayload,
}: {
  configPayload: AdminConfigPayload | null;
  versionPayload: VersionPayload | null;
  healthPayload: HealthPayload | null;
  accountsPayload: AccountsPayload | null;
}) {
  const session = configPayload?.session;
  const runtime = configPayload?.session_refresh_runtime;
  const models = configPayload?.models || [];
  const features = configPayload?.config?.features || {};
  const featureLines: Array<[string, string]> = [
    ['工具桥接', '已移除'],
    ['默认联网', features.use_web_search ? '开启' : '关闭'],
    ['只读模式', features.use_read_only_mode ? '开启' : '关闭'],
    ['强制关闭“可以进行更改”', features.force_disable_upstream_edits === false ? '关闭' : '开启'],
    ['Writer Mode', features.writer_mode ? '开启' : '关闭'],
    ['图片生成', features.enable_generate_image ? '开启' : '关闭'],
    ['CSV 附件', features.enable_csv_attachment_support ? '开启' : '关闭'],
    ['AI Surface', String(features.ai_surface || 'ai_module')],
    ['Thread Type', String(features.thread_type || 'workflow')],
  ];

  return (
    <div className="space-y-6">
      <PanelHeader
        eyebrow="Dashboard"
        title="运行状态"
        description="查看服务、会话与刷新状态。"
      />

      <div className="grid gap-4 md:grid-cols-2 2xl:grid-cols-4">
        <StatCard label="健康状态" value={healthPayload?.session_ready ? 'READY' : healthPayload?.ok ? 'NO SESSION' : 'UNKNOWN'} hint={versionPayload?.version || '-'} />
        <StatCard label="模型数量" value={String(models.length)} hint={[...new Set(models.map((item) => item.family).filter(Boolean))].join(' · ') || '-'} />
        <StatCard label="当前用户" value={session?.user_email || '-'} hint={session?.space_name || '-'} />
        <StatCard label="活跃账号" value={accountsPayload?.active_account || '-'} hint={accountsPayload?.session_ready ? 'session ready' : 'session not ready'} />
      </div>

      <div className="grid gap-6 2xl:grid-cols-[minmax(0,1.05fr)_360px]">
        <div className="min-w-0 space-y-6">
          <InfoCard title="当前协议会话" description="服务端实时快照。">
            <KeyValueGrid
              items={[
                { label: 'Probe', value: session?.probe_path },
                { label: 'Client Version', value: session?.client_version },
                { label: 'User ID', value: session?.user_id },
                { label: 'Space ID', value: session?.space_id },
                { label: 'User Name', value: session?.user_name },
                { label: 'Workspace', value: session?.space_name },
              ]}
            />
          </InfoCard>

          <InfoCard title="默认能力开关" description="当前默认能力位。">
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
              {featureLines.map(([label, value]) => (
                <div key={label} className={FEATURE_TILE}>
                  <div className="text-[11px] font-bold uppercase tracking-[0.18em] text-muted-foreground">{label}</div>
                  <div className="mt-2 text-sm font-medium">{value}</div>
                </div>
              ))}
            </div>
          </InfoCard>
        </div>

        <div className="space-y-6 self-start xl:sticky xl:top-6">
          <InfoCard title="刷新运行态" description="最近刷新、错误与版本。">
            <div className="grid gap-3">
              {[
                ['Last Refresh', runtime?.last_refresh_at || '-'],
                ['Refresh Error', runtime?.last_error || '-'],
                ['Session Ready', accountsPayload?.session_ready ? 'yes' : 'no'],
                ['Version', versionPayload?.version || '-'],
              ].map(([label, value]) => (
                <div key={label} className={META_TILE}>
                  <div className="text-[11px] font-bold uppercase tracking-[0.18em] text-muted-foreground">{label}</div>
                  <div className="mt-2 value-box pretty-scroll">{value}</div>
                </div>
              ))}
            </div>
          </InfoCard>

          <InfoCard title="部署提示" description="上线前优先核对。">
            <div className="rounded-md border border-dashed bg-muted/30 px-4 py-4 text-sm leading-6 text-muted-foreground">
              建议持久化 SQLite、会话目录和管理配置；若 `session ready` 长期为 `NO`，先检查活跃账号与最近刷新错误。
            </div>
          </InfoCard>
        </div>
      </div>
    </div>
  );
}
