import { useCallback, useEffect, useState, type FormEvent, type ReactElement } from 'react'
import {
  ArrowLeft,
  Crown,
  Trash2,
  UserPlus,
  Link2,
  Copy,
  Check,
  RefreshCw,
  Save,
  Plus,
  X
} from 'lucide-react'
import { apiDelete, apiGet, apiPatch, apiPost } from '../api'
import { useToast } from '../components/Toast'
import { updateProduction } from '../utils/productions'
import type { Production, ProductionMember, ProductionInvite } from '../types'

type PermKey = 'is_chef' | 'can_create_events' | 'can_edit_events' | 'can_draw' | 'can_invite'

const PERMS: { key: PermKey; label: string }[] = [
  { key: 'is_chef', label: 'Chef' },
  { key: 'can_create_events', label: 'Créer' },
  { key: 'can_edit_events', label: 'Modifier' },
  { key: 'can_draw', label: 'Tirage' },
  { key: 'can_invite', label: 'Inviter' }
]

// Base du site web où les invitations seront ouvertes (surchargeable).
function siteBase(): string {
  try {
    const override = localStorage.getItem('pc_site_base')
    if (override) return override.replace(/\/+$/, '')
  } catch {
    // ignore
  }
  return 'http://localhost:3000'
}

function inviteUrl(token: string): string {
  return `${siteBase()}/join/${token}`
}

interface ProductionMembersProps {
  productionId: string
  onBack: () => void
}

export default function ProductionMembers({
  productionId,
  onBack
}: ProductionMembersProps): ReactElement {
  const [production, setProduction] = useState<Production | null>(null)
  const [members, setMembers] = useState<ProductionMember[]>([])
  const [isChef, setIsChef] = useState(false)
  const [canInvite, setCanInvite] = useState(false)
  const [loading, setLoading] = useState(true)
  const [allowed, setAllowed] = useState<boolean | null>(null)
  const [newMember, setNewMember] = useState('')
  const [adding, setAdding] = useState(false)
  const [invites, setInvites] = useState<ProductionInvite[]>([])
  const [generating, setGenerating] = useState(false)
  const [copied, setCopied] = useState(false)

  // Édition du profil (chef).
  const [editName, setEditName] = useState('')
  const [editDescription, setEditDescription] = useState('')
  const [editAvatar, setEditAvatar] = useState('')
  const [editVideos, setEditVideos] = useState<string[]>([])
  const [savingInfo, setSavingInfo] = useState(false)

  const { showToast, ToastComponent } = useToast()

  const activeInvite = invites[0] ?? null

  const fillEditForm = useCallback((p: Production) => {
    setEditName(p.name ?? '')
    setEditDescription(p.description ?? '')
    setEditAvatar(p.avatar_url ?? '')
    setEditVideos(p.videos && p.videos.length ? p.videos : [])
  }, [])

  const loadInvites = useCallback(async () => {
    try {
      const data = await apiGet<{ invites: ProductionInvite[] }>(
        `/productions/${productionId}/invites`
      )
      setInvites(Array.isArray(data.invites) ? data.invites : [])
    } catch {
      // pas le droit d'inviter : on ignore
    }
  }, [productionId])

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const data = await apiGet<{
        production: Production
        members: ProductionMember[]
        is_chef: boolean
        can_invite: boolean
      }>(`/productions/${productionId}/members`)
      setProduction(data.production)
      fillEditForm(data.production)
      setMembers(Array.isArray(data.members) ? data.members : [])
      setIsChef(!!data.is_chef)
      setCanInvite(!!data.can_invite)
      setAllowed(true)
      if (data.can_invite) void loadInvites()
    } catch (err: unknown) {
      const msg = (err as Error).message || ''
      if (msg.includes('403') || msg.toLowerCase().includes('réservé')) setAllowed(false)
      else showToast(msg || 'Impossible de charger la production', 'error')
    } finally {
      setLoading(false)
    }
  }, [productionId, showToast, loadInvites, fillEditForm])

  async function saveInfo(e: FormEvent): Promise<void> {
    e.preventDefault()
    if (!editName.trim()) {
      showToast('Le nom est requis', 'error')
      return
    }
    setSavingInfo(true)
    try {
      const updated = await updateProduction(productionId, {
        name: editName.trim(),
        description: editDescription,
        avatar_url: editAvatar,
        videos: editVideos.map((v) => v.trim()).filter(Boolean)
      })
      setProduction(updated)
      fillEditForm(updated)
      showToast('Production mise à jour', 'success')
    } catch (err: unknown) {
      showToast((err as Error).message, 'error')
    } finally {
      setSavingInfo(false)
    }
  }

  useEffect(() => {
    if (productionId) void load()
  }, [productionId, load])

  async function updatePerm(
    member: ProductionMember,
    key: PermKey,
    value: boolean
  ): Promise<void> {
    const next: Record<PermKey, boolean> = {
      is_chef: member.is_chef,
      can_create_events: member.can_create_events,
      can_edit_events: member.can_edit_events,
      can_draw: member.can_draw,
      can_invite: member.can_invite
    }
    next[key] = value
    if (key === 'is_chef' && value) {
      next.can_create_events = true
      next.can_edit_events = true
      next.can_draw = true
      next.can_invite = true
    }

    setMembers((prev) => prev.map((m) => (m.id === member.id ? { ...m, ...next } : m)))
    try {
      const updated = await apiPatch<ProductionMember>(
        `/productions/${productionId}/members/${member.id}`,
        next
      )
      setMembers((prev) => prev.map((m) => (m.id === member.id ? updated : m)))
    } catch (err: unknown) {
      showToast((err as Error).message, 'error')
      void load()
    }
  }

  async function addMember(e: FormEvent): Promise<void> {
    e.preventDefault()
    const username = newMember.trim()
    if (!username) return
    setAdding(true)
    try {
      const created = await apiPost<ProductionMember>(
        `/productions/${productionId}/members`,
        { username }
      )
      setMembers((prev) => [...prev, created])
      setNewMember('')
      showToast(`${created.username ?? username} ajouté`, 'success')
    } catch (err: unknown) {
      showToast((err as Error).message, 'error')
    } finally {
      setAdding(false)
    }
  }

  async function removeMember(member: ProductionMember): Promise<void> {
    if (!window.confirm(`Retirer ${member.username ?? 'ce membre'} de la production ?`)) return
    try {
      await apiDelete(`/productions/${productionId}/members/${member.id}`)
      setMembers((prev) => prev.filter((m) => m.id !== member.id))
      showToast('Membre retiré', 'success')
    } catch (err: unknown) {
      showToast((err as Error).message, 'error')
    }
  }

  async function generateInvite(): Promise<void> {
    setGenerating(true)
    try {
      for (const inv of invites) {
        await apiDelete(`/productions/${productionId}/invites/${inv.token}`).catch(() => {})
      }
      const created = await apiPost<ProductionInvite>(`/productions/${productionId}/invites`, {})
      setInvites([created])
      showToast("Lien d'invitation généré", 'success')
    } catch (err: unknown) {
      showToast((err as Error).message, 'error')
    } finally {
      setGenerating(false)
    }
  }

  async function revokeInvite(): Promise<void> {
    if (!activeInvite) return
    if (!window.confirm('Révoquer ce lien ? Il ne fonctionnera plus.')) return
    try {
      await apiDelete(`/productions/${productionId}/invites/${activeInvite.token}`)
      setInvites([])
      showToast('Lien révoqué', 'success')
    } catch (err: unknown) {
      showToast((err as Error).message, 'error')
    }
  }

  async function copyInvite(): Promise<void> {
    if (!activeInvite) return
    try {
      await navigator.clipboard.writeText(inviteUrl(activeInvite.token))
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    } catch {
      showToast('Copie impossible', 'error')
    }
  }

  if (loading || allowed === null) {
    return <div className="pc-view pc-loading">Chargement…</div>
  }
  if (allowed === false) {
    return (
      <div className="pc-view pc-loading">
        Accès refusé — vous n&apos;êtes pas membre de cette production.
      </div>
    )
  }

  return (
    <div className="pc-view">
      <div className="pc-detail-header">
        <button type="button" className="pc-icon-btn" onClick={onBack}>
          <ArrowLeft size={16} />
        </button>
        <div>
          <p className="pc-view-kicker">Équipe de production</p>
          <h2 className="pc-view-title">{production?.name ?? 'Production'}</h2>
        </div>
      </div>

      {isChef && (
        <form onSubmit={saveInfo} className="pc-prod-edit">
          <h3 className="pc-section-title">Informations</h3>
          <label className="pc-field">
            <span>Nom</span>
            <input value={editName} onChange={(e) => setEditName(e.target.value)} maxLength={80} />
          </label>
          <label className="pc-field">
            <span>Photo de profil (URL)</span>
            <input
              value={editAvatar}
              onChange={(e) => setEditAvatar(e.target.value)}
              placeholder="https://…"
            />
          </label>
          <label className="pc-field">
            <span>Description</span>
            <textarea
              value={editDescription}
              onChange={(e) => setEditDescription(e.target.value)}
              rows={4}
              placeholder="Présentez votre production, ce que vous faites…"
            />
          </label>
          <div className="pc-field">
            <span>Vidéos (URL YouTube, Vimeo ou .mp4)</span>
            {editVideos.map((v, i) => (
              <div key={i} className="pc-invite-row">
                <input
                  className="pc-invite-input"
                  value={v}
                  onChange={(e) =>
                    setEditVideos((prev) => prev.map((x, j) => (j === i ? e.target.value : x)))
                  }
                  placeholder="https://youtube.com/watch?v=…"
                />
                <button
                  type="button"
                  className="pc-btn pc-btn-ghost"
                  onClick={() => setEditVideos((prev) => prev.filter((_, j) => j !== i))}
                  title="Retirer cette vidéo"
                >
                  <X size={16} />
                </button>
              </div>
            ))}
            <button
              type="button"
              className="pc-btn pc-btn-ghost pc-btn-sm"
              onClick={() => setEditVideos((prev) => [...prev, ''])}
            >
              <Plus size={15} />
              Ajouter une vidéo
            </button>
          </div>
          <div className="pc-prod-edit-actions">
            <button type="submit" className="pc-btn pc-btn-primary" disabled={savingInfo}>
              <Save size={16} />
              {savingInfo ? 'Enregistrement…' : 'Enregistrer'}
            </button>
          </div>
        </form>
      )}

      {canInvite && (
        <div className="pc-invite-box">
          <div className="pc-invite-head">
            <Link2 size={16} />
            <span>Lien d&apos;invitation</span>
          </div>
          <p className="pc-invite-hint">
            Partagez ce lien pour permettre à quelqu&apos;un de rejoindre la production. S&apos;il
            n&apos;a pas de compte, il lui sera proposé de se connecter.
          </p>
          {activeInvite ? (
            <div className="pc-invite-row">
              <input className="pc-invite-input" readOnly value={inviteUrl(activeInvite.token)} />
              <button
                type="button"
                className="pc-btn pc-btn-ghost"
                onClick={() => void copyInvite()}
              >
                {copied ? <Check size={16} /> : <Copy size={16} />}
                {copied ? 'Copié' : 'Copier'}
              </button>
              <button
                type="button"
                className="pc-btn pc-btn-ghost"
                onClick={() => void generateInvite()}
                disabled={generating}
                title="Générer un nouveau lien"
              >
                <RefreshCw size={16} />
              </button>
              <button
                type="button"
                className="pc-btn pc-btn-danger"
                onClick={() => void revokeInvite()}
              >
                <Trash2 size={16} />
              </button>
            </div>
          ) : (
            <button
              type="button"
              className="pc-btn pc-btn-primary"
              onClick={() => void generateInvite()}
              disabled={generating}
            >
              <Link2 size={16} />
              {generating ? 'Génération…' : 'Générer un lien'}
            </button>
          )}
        </div>
      )}

      {isChef && (
        <form onSubmit={addMember} className="pc-prod-add">
          <input
            value={newMember}
            onChange={(e) => setNewMember(e.target.value)}
            placeholder="Pseudo de l'utilisateur à ajouter"
          />
          <button type="submit" className="pc-btn pc-btn-primary" disabled={adding}>
            <UserPlus size={16} />
            {adding ? 'Ajout…' : 'Ajouter'}
          </button>
        </form>
      )}

      <div className="pc-member-list">
        {members.map((m) => (
          <div key={m.id} className="pc-member-card">
            <div className="pc-member-top">
              <div className="pc-participant-avatar">
                {m.profile_picture ? (
                  <img src={m.profile_picture} alt="" />
                ) : (
                  (m.username ?? '?').slice(0, 2).toUpperCase()
                )}
              </div>
              <span className="pc-member-name">
                {m.username ?? 'Utilisateur'}
                {m.is_chef && (
                  <span className="pc-prod-tag pc-prod-tag-chef">
                    <Crown size={11} /> Chef
                  </span>
                )}
              </span>
              {isChef && (
                <button
                  type="button"
                  className="pc-icon-btn pc-icon-btn-danger"
                  onClick={() => void removeMember(m)}
                  title="Retirer de la production"
                >
                  <Trash2 size={15} />
                </button>
              )}
            </div>

            <div className="pc-member-perms">
              {PERMS.map(({ key, label }) => {
                const checked = m[key]
                const forced = key !== 'is_chef' && m.is_chef
                return (
                  <label key={key} className="pc-perm-toggle">
                    <input
                      type="checkbox"
                      checked={checked}
                      disabled={!isChef || forced}
                      onChange={(e) => void updatePerm(m, key, e.target.checked)}
                    />
                    {label}
                  </label>
                )
              })}
            </div>
          </div>
        ))}
      </div>

      {ToastComponent}
    </div>
  )
}
