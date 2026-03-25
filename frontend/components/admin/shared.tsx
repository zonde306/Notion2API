import type { ReactNode } from 'react';
import { Box, Flex, Heading, Text } from '@radix-ui/themes';
import { cn, formatDateTime } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { CopyIcon } from 'lucide-react';
import type { ConversationMessageAttachment } from '@/lib/services/admin/types';

export function PanelHeader({
  eyebrow,
  title,
  description,
  actions,
}: {
  eyebrow: string;
  title: string;
  description?: string;
  actions?: ReactNode;
}) {
  return (
    <Flex
      direction={{ initial: 'column', lg: 'row' }}
      justify="between"
      align={{ initial: 'start', lg: 'center' }}
      gap="4"
      className="min-w-0"
    >
      <Box className="min-w-0 space-y-2">
        <p className="section-eyebrow">{eyebrow}</p>
        <div className="space-y-1">
          <Heading size="6" className="text-2xl font-semibold tracking-tight md:text-3xl">
            {title}
          </Heading>
          {description ? (
            <Text size="2" className="max-w-2xl text-sm leading-5 text-muted-foreground">
              {description}
            </Text>
          ) : null}
        </div>
      </Box>
      {actions ? (
        <Flex wrap="wrap" gap="3" align="center" className="min-w-0 w-full lg:w-auto lg:justify-end">
          {actions}
        </Flex>
      ) : null}
    </Flex>
  );
}

export function StatCard({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <Card className="panel-card gap-3 py-0">
      <CardContent className="space-y-2 px-5 py-5">
        <Text size="1" weight="medium" className="tracking-[0.16em] text-muted-foreground uppercase">
          {label}
        </Text>
        <div className="metric-value">{value}</div>
        {hint ? <Text size="1" className="leading-5 text-muted-foreground">{hint}</Text> : null}
      </CardContent>
    </Card>
  );
}

export function InfoCard({
  title,
  description,
  children,
  actions,
  className,
}: {
  title: string;
  description?: string;
  children: ReactNode;
  actions?: ReactNode;
  className?: string;
}) {
  return (
    <Card className={cn('panel-card min-w-0 gap-4 py-0', className)}>
      <CardHeader className="border-b px-5 pb-3.5 pt-4">
        <Flex
          direction={{ initial: 'column', md: 'row' }}
          justify="between"
          align={{ initial: 'start', md: 'start' }}
          gap="4"
          className="min-w-0"
        >
          <div className="min-w-0 space-y-2">
            <CardTitle className="text-base tracking-tight md:text-lg">{title}</CardTitle>
            {description ? <CardDescription className="max-w-2xl text-sm leading-5">{description}</CardDescription> : null}
          </div>
          {actions ? <Flex wrap="wrap" gap="2" align="center" className="min-w-0">{actions}</Flex> : null}
        </Flex>
      </CardHeader>
      <CardContent className="px-5 py-4">{children}</CardContent>
    </Card>
  );
}

export function KeyValueGrid({ items }: { items: Array<{ label: string; value?: string | number | null }> }) {
  return (
    <div className="grid gap-3 md:grid-cols-2 2xl:grid-cols-3">
      {items.map((item) => (
        <div key={item.label} className="surface-subtle min-w-0 px-3 py-3">
          <Text size="1" weight="medium" className="mb-2 tracking-[0.14em] uppercase text-muted-foreground">
            {item.label}
          </Text>
          <div className="value-box pretty-scroll">{String(item.value ?? '-')}</div>
        </div>
      ))}
    </div>
  );
}

export function JsonPreview({ title, value, onCopy, minHeight = 260 }: { title: string; value: string; onCopy?: () => void; minHeight?: number }) {
  return (
    <InfoCard
      title={title}
      actions={onCopy ? (
        <Button variant="outline" size="sm" onClick={onCopy}>
          <CopyIcon className="size-4" />
          复制
        </Button>
      ) : null}
    >
      <ScrollArea
        className="code-surface pretty-scroll overflow-hidden rounded-md border"
        style={{ minHeight, maxHeight: 520 }}
      >
        <pre className="min-h-full whitespace-pre-wrap px-4 py-3 font-mono text-[12px] leading-6">{value}</pre>
      </ScrollArea>
    </InfoCard>
  );
}

export function StatusPill({ status }: { status?: string }) {
  const normalized = (status || 'unknown').toLowerCase();
  const variant = normalized.includes('fail') || normalized.includes('error')
    ? 'destructive'
    : normalized.includes('pending') || normalized.includes('start') || normalized.includes('new')
      ? 'secondary'
      : 'default';
  return <Badge variant={variant}>{status || 'unknown'}</Badge>;
}

export function FileChips({ items }: { items?: ConversationMessageAttachment[] }) {
  if (!items?.length) return null;
  return (
    <Flex wrap="wrap" gap="2">
      {items.map((item, index) => {
        const label = [item.name || 'attachment', item.content_type || item.contentType || ''].filter(Boolean).join(' · ');
        return (
          <Badge key={`${label}-${index}`} variant="secondary" className="normal-case tracking-normal">
            {label}
          </Badge>
        );
      })}
    </Flex>
  );
}

export function EmptyHint({ title, description }: { title: string; description: string }) {
  return (
    <div className="surface-subtle px-6 py-8 text-center">
      <Heading size="4" className="text-lg font-semibold tracking-tight">{title}</Heading>
      <Text size="2" className="mx-auto mt-2 block max-w-xl leading-6 text-muted-foreground">
        {description}
      </Text>
    </div>
  );
}

export function formatMaybeDate(value?: string) {
  return value ? formatDateTime(value) : '-';
}
