'use client';

import { useEffect, useMemo, useState } from 'react';
import { DatabaseZap, Layers3, Sparkles } from 'lucide-react';
import { EmptyHint, InfoCard, KeyValueGrid, PanelHeader, StatCard } from '@/components/admin/shared';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import type { ModelItem } from '@/lib/services/admin/types';
import { cn } from '@/lib/utils';

const META_TILE_CLASS = 'surface-subtle px-4 py-4';

function uniqueValues(items: Array<string | undefined>) {
  return [...new Set(items.filter(Boolean))];
}

export function ModelsPanel({
  models,
  defaultModel,
}: {
  models: ModelItem[];
  defaultModel?: string;
}) {
  const [selectedModelId, setSelectedModelId] = useState(defaultModel || models[0]?.id || '');

  useEffect(() => {
    const fallback = defaultModel || models[0]?.id || '';
    setSelectedModelId((current) => (current && models.some((item) => item.id === current) ? current : fallback));
  }, [defaultModel, models]);

  const families = uniqueValues(models.map((item) => item.family));
  const groups = uniqueValues(models.map((item) => item.group));
  const betaCount = models.filter((item) => item.beta).length;
  const enabledCount = models.filter((item) => item.enabled !== false).length;
  const selectedModel = useMemo(
    () => models.find((item) => item.id === selectedModelId) || null,
    [models, selectedModelId],
  );

  return (
    <div className="space-y-6">
      <PanelHeader
        eyebrow="Models"
        title="模型注册表"
        description="查看模型映射、状态和内部目标。"
      />

      <div className="grid gap-4 md:grid-cols-2 2xl:grid-cols-4">
        <StatCard label="模型总数" value={String(models.length)} hint="public IDs" />
        <StatCard label="默认模型" value={defaultModel || '-'} hint="当前配置" />
        <StatCard label="Family 数" value={String(families.length)} hint={families.join(' · ') || '-'} />
        <StatCard label="Enabled / Beta" value={`${enabledCount} / ${betaCount}`} hint={groups.join(' · ') || '无分组'} />
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(320px,360px)_minmax(0,1fr)]">
        <InfoCard title="模型列表" description="选择模型后查看映射详情。">
          {models.length ? (
            <ScrollArea className="console-list-scroll pretty-scroll pr-3">
              <div className="space-y-3 pb-1">
                {models.map((model) => {
                  const selected = model.id === selectedModelId;
                  return (
                    <button
                      key={model.id}
                      type="button"
                      onClick={() => setSelectedModelId(model.id)}
                      className={cn(
                        'w-full rounded-lg border px-4 py-4 text-left transition-colors',
                        selected ? 'border-primary/40 bg-primary/5 shadow-sm' : 'border-border/70 bg-background hover:bg-muted/40',
                      )}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0 space-y-1">
                          <div className="break-all text-sm font-semibold">{model.id}</div>
                          <div className="text-sm text-muted-foreground">{model.name || '未命名模型'}</div>
                        </div>
                        <div className="flex flex-wrap justify-end gap-2">
                          <Badge className="normal-case tracking-normal">{model.enabled === false ? 'disabled' : 'enabled'}</Badge>
                          {model.beta ? <Badge variant="secondary" className="normal-case tracking-normal">beta</Badge> : null}
                        </div>
                      </div>
                      <div className="mt-3 grid gap-2 text-xs leading-5 text-muted-foreground sm:grid-cols-2">
                        <div>family · {model.family || '-'}</div>
                        <div>group · {model.group || '-'}</div>
                        <div className="sm:col-span-2 break-all">notion · {model.notion_model || '-'}</div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </ScrollArea>
          ) : (
            <EmptyHint title="还没有模型" description="请先确认 `/admin/config` 是否返回了 `models` 字段。" />
          )}
        </InfoCard>

        {selectedModel ? (
          <div className="space-y-6">
            <InfoCard
              title={selectedModel.name || selectedModel.id}
              description="当前路由模型的映射信息。"
            >
              <KeyValueGrid
                items={[
                  { label: 'Public ID', value: selectedModel.id },
                  { label: '显示名称', value: selectedModel.name || '-' },
                  { label: 'Family', value: selectedModel.family || '-' },
                  { label: 'Group', value: selectedModel.group || '-' },
                  { label: 'Notion Model', value: selectedModel.notion_model || '-' },
                  { label: '默认模型', value: selectedModel.id === defaultModel ? '是' : '否' },
                ]}
              />
            </InfoCard>

            <InfoCard title="状态标签" description="查看启用状态、Beta 标记和归类。">
              <div className="flex flex-wrap gap-3">
                <Badge className="normal-case tracking-normal px-3 py-1.5">
                  <DatabaseZap className="size-3.5" />
                  {selectedModel.enabled === false ? 'disabled' : 'enabled'}
                </Badge>
                {selectedModel.beta ? (
                  <Badge variant="secondary" className="normal-case tracking-normal px-3 py-1.5">
                    <Sparkles className="size-3.5" />
                    beta
                  </Badge>
                ) : null}
                {selectedModel.group ? (
                  <Badge variant="outline" className="normal-case tracking-normal px-3 py-1.5">
                    <Layers3 className="size-3.5" />
                    {selectedModel.group}
                  </Badge>
                ) : null}
              </div>
              <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                <div className={META_TILE_CLASS}>
                  <div className="text-[11px] font-bold uppercase tracking-[0.18em] text-muted-foreground">路由 ID</div>
                  <div className="mt-2 value-box pretty-scroll">{selectedModel.id}</div>
                </div>
                <div className={META_TILE_CLASS}>
                  <div className="text-[11px] font-bold uppercase tracking-[0.18em] text-muted-foreground">内部模型</div>
                  <div className="mt-2 value-box pretty-scroll">{selectedModel.notion_model || '-'}</div>
                </div>
                <div className={META_TILE_CLASS}>
                  <div className="text-[11px] font-bold uppercase tracking-[0.18em] text-muted-foreground">归类</div>
                  <div className="mt-2 value-box pretty-scroll">{[selectedModel.family || '-', selectedModel.group || '-'].join(' · ')}</div>
                </div>
              </div>
            </InfoCard>
          </div>
        ) : (
          <EmptyHint title="请选择一个模型" description="选择后查看映射详情。" />
        )}
      </div>
    </div>
  );
}
