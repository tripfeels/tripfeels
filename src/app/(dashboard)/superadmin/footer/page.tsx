'use client'

import { useEffect, useMemo, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { z } from 'zod'
import { DynamicButton } from '@/components/ui/dynamic-theme-components'

const schema = z.object({
  social: z
    .object({
      facebook: z.string().url().nullable().optional(),
      instagram: z.string().url().nullable().optional(),
      community: z.string().url().nullable().optional(),
    })
    .partial()
    .optional(),
  privacyContent: z.string().nullable().optional(),
  termsContent: z.string().nullable().optional(),
})

// Deep merge helper to preserve existing footer fields
function mergeFooterSettings(existing: any, partial: any) {
  const base = existing ?? {}
  const next: any = { ...base, ...partial }
  if (base.social || partial?.social) {
    next.social = { ...(base.social ?? {}), ...(partial?.social ?? {}) }
  }
  return next
}

export default function SuperadminFooterPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState<z.infer<typeof schema>>({
    social: { facebook: '', instagram: '', community: '' },
    privacyContent: '',
    termsContent: '',
  })

  useEffect(() => {
    if (status === 'loading') return
    if (!session?.user || session.user.role !== 'SuperAdmin') {
      router.replace('/')
      return
    }
    try {
      const raw = localStorage.getItem('tripfeels-footer-settings')
      if (raw) {
        const s = JSON.parse(raw)
        setForm({
          social: {
            facebook: s?.social?.facebook ?? '',
            instagram: s?.social?.instagram ?? '',
            community: s?.social?.community ?? '',
          },
          privacyContent: s?.privacyContent ?? '',
          termsContent: s?.termsContent ?? '',
        })
      }
    } catch (e) {
      console.error('footer load error', e)
    } finally {
      setLoading(false)
    }
  }, [session, status, router])

  const disabled = useMemo(() => saving || loading, [saving, loading])

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    try {
      const payload = schema.parse({
        social: {
          facebook: form.social?.facebook || null,
          instagram: form.social?.instagram || null,
          community: form.social?.community || null,
        },
        privacyContent: form.privacyContent ?? null,
        termsContent: form.termsContent ?? null,
      })
      const prevRaw = localStorage.getItem('tripfeels-footer-settings')
      const prev = prevRaw ? JSON.parse(prevRaw) : {}
      const merged = mergeFooterSettings(prev, payload)
      localStorage.setItem('tripfeels-footer-settings', JSON.stringify(merged))
    } catch (e) {
      console.error(e)
      alert((e as Error).message)
    } finally {
      setSaving(false)
    }
  }

  const onSaveFacebookOnly = async () => {
    setSaving(true)
    try {
      const payload = schema.parse({
        social: { facebook: form.social?.facebook || null },
      })
      const prevRaw = localStorage.getItem('tripfeels-footer-settings')
      const prev = prevRaw ? JSON.parse(prevRaw) : {}
      const merged = mergeFooterSettings(prev, payload)
      localStorage.setItem('tripfeels-footer-settings', JSON.stringify(merged))
    } catch (e) {
      console.error(e)
      alert((e as Error).message)
    } finally {
      setSaving(false)
    }
  }

  const onSaveInstagramOnly = async () => {
    setSaving(true)
    try {
      const payload = schema.parse({
        social: { instagram: form.social?.instagram || null },
      })
      const prevRaw = localStorage.getItem('tripfeels-footer-settings')
      const prev = prevRaw ? JSON.parse(prevRaw) : {}
      const merged = mergeFooterSettings(prev, payload)
      localStorage.setItem('tripfeels-footer-settings', JSON.stringify(merged))
    } catch (e) {
      console.error(e)
      alert((e as Error).message)
    } finally {
      setSaving(false)
    }
  }

  const onSaveCommunityOnly = async () => {
    setSaving(true)
    try {
      const payload = schema.parse({
        social: { community: form.social?.community || null },
      })
      const prevRaw = localStorage.getItem('tripfeels-footer-settings')
      const prev = prevRaw ? JSON.parse(prevRaw) : {}
      const merged = mergeFooterSettings(prev, payload)
      localStorage.setItem('tripfeels-footer-settings', JSON.stringify(merged))
    } catch (e) {
      console.error(e)
      alert((e as Error).message)
    } finally {
      setSaving(false)
    }
  }

  const onSavePrivacyOnly = async () => {
    setSaving(true)
    try {
      const payload = schema.parse({
        privacyContent: form.privacyContent ?? null,
      })
      const prevRaw = localStorage.getItem('tripfeels-footer-settings')
      const prev = prevRaw ? JSON.parse(prevRaw) : {}
      const merged = mergeFooterSettings(prev, payload)
      localStorage.setItem('tripfeels-footer-settings', JSON.stringify(merged))
    } catch (e) {
      console.error(e)
      alert((e as Error).message)
    } finally {
      setSaving(false)
    }
  }

  const onSaveTermsOnly = async () => {
    setSaving(true)
    try {
      const payload = schema.parse({
        termsContent: form.termsContent ?? null,
      })
      const prevRaw = localStorage.getItem('tripfeels-footer-settings')
      const prev = prevRaw ? JSON.parse(prevRaw) : {}
      const merged = mergeFooterSettings(prev, payload)
      localStorage.setItem('tripfeels-footer-settings', JSON.stringify(merged))
    } catch (e) {
      console.error(e)
      alert((e as Error).message)
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return <div className="p-6 text-sm text-gray-600 dark:text-gray-400">Loading...</div>
  }

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Footer</h1>

      <form onSubmit={onSubmit} className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Social Links</h2>
            <div>
              <label className="block text-sm mb-1 text-gray-700 dark:text-gray-300">Facebook URL</label>
              <input
                type="url"
                value={form.social?.facebook ?? ''}
                onChange={(e) => setForm((f) => ({ ...f, social: { ...f.social, facebook: e.target.value } }))}
                className="glass-input w-full"
                placeholder="https://facebook.com/yourpage"
              />
              <div className="mt-2">
                <DynamicButton type="button" variant="secondary" disabled={disabled} onClick={onSaveFacebookOnly}>
                  {saving ? 'Saving...' : 'Save Facebook only'}
                </DynamicButton>
              </div>
            </div>
            <div>
              <label className="block text-sm mb-1 text-gray-700 dark:text-gray-300">Instagram URL</label>
              <input
                type="url"
                value={form.social?.instagram ?? ''}
                onChange={(e) => setForm((f) => ({ ...f, social: { ...f.social, instagram: e.target.value } }))}
                className="glass-input w-full"
                placeholder="https://instagram.com/yourpage"
              />
              <div className="mt-2">
                <DynamicButton type="button" variant="secondary" disabled={disabled} onClick={onSaveInstagramOnly}>
                  {saving ? 'Saving...' : 'Save Instagram only'}
                </DynamicButton>
              </div>
            </div>
            <div>
              <label className="block text-sm mb-1 text-gray-700 dark:text-gray-300">Community URL</label>
              <input
                type="url"
                value={form.social?.community ?? ''}
                onChange={(e) => setForm((f) => ({ ...f, social: { ...f.social, community: e.target.value } }))}
                className="glass-input w-full"
                placeholder="https://discord.gg/yourinvite"
              />
              <div className="mt-2">
                <DynamicButton type="button" variant="secondary" disabled={disabled} onClick={onSaveCommunityOnly}>
                  {saving ? 'Saving...' : 'Save Community only'}
                </DynamicButton>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Legal Content</h2>
            <div>
              <label className="block text-sm mb-1 text-gray-700 dark:text-gray-300">Privacy Policy</label>
              <textarea
                value={form.privacyContent ?? ''}
                onChange={(e) => setForm((f) => ({ ...f, privacyContent: e.target.value }))}
                className="glass-input w-full min-h-[160px]"
                placeholder="Write your Privacy Policy content here"
              />
              <div className="mt-2">
                <DynamicButton type="button" variant="secondary" disabled={disabled} onClick={onSavePrivacyOnly}>
                  {saving ? 'Saving...' : 'Save Privacy only'}
                </DynamicButton>
              </div>
            </div>
            <div>
              <label className="block text-sm mb-1 text-gray-700 dark:text-gray-300">Terms & Conditions</label>
              <textarea
                value={form.termsContent ?? ''}
                onChange={(e) => setForm((f) => ({ ...f, termsContent: e.target.value }))}
                className="glass-input w-full min-h-[160px]"
                placeholder="Write your Terms & Conditions content here"
              />
              <div className="mt-2">
                <DynamicButton type="button" variant="secondary" disabled={disabled} onClick={onSaveTermsOnly}>
                  {saving ? 'Saving...' : 'Save Terms only'}
                </DynamicButton>
              </div>
            </div>
          </div>
        </div>

        <div className="flex gap-3">
          <DynamicButton
            type="submit"
            disabled={disabled}
            variant="primary"
            className="px-4"
          >
            {saving ? 'Saving...' : 'Save'}
          </DynamicButton>
        </div>
      </form>
    </div>
  )
}
