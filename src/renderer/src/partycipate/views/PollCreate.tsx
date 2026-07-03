import { useEffect, useState, type FormEvent, type ReactElement } from 'react'
import { ArrowLeft, PlusCircle, Trash2 } from 'lucide-react'
import { createPoll } from '../utils/polls'
import { useToast } from '../components/Toast'
import type { PartycipateSession, PartycipateView } from '../types'

const MIN_OPTIONS = 2
const MAX_OPTIONS = 6

interface PollCreateProps {
  session: PartycipateSession | null
  sessionReady: boolean
  onNavigate: (view: PartycipateView) => void
  onBack: () => void
}

export default function PollCreate({
  session,
  sessionReady,
  onNavigate,
  onBack
}: PollCreateProps): ReactElement {
  const [question, setQuestion] = useState('')
  const [options, setOptions] = useState<string[]>(['', ''])
  const [category, setCategory] = useState('')
  const [endsAt, setEndsAt] = useState('')
  const [loading, setLoading] = useState(false)
  const { showToast, ToastComponent } = useToast()

  useEffect(() => {
    if (!sessionReady) return
    if (!session) onNavigate({ type: 'auth-required' })
  }, [session, sessionReady, onNavigate])

  function updateOption(index: number, value: string): void {
    setOptions((opts) => opts.map((o, i) => (i === index ? value : o)))
  }

  function addOption(): void {
    setOptions((opts) => (opts.length < MAX_OPTIONS ? [...opts, ''] : opts))
  }

  function removeOption(index: number): void {
    setOptions((opts) => (opts.length > MIN_OPTIONS ? opts.filter((_, i) => i !== index) : opts))
  }

  async function handleSubmit(e: FormEvent): Promise<void> {
    e.preventDefault()
    if (!session) return onNavigate({ type: 'auth-required' })

    const cleanQuestion = question.trim()
    if (!cleanQuestion) return showToast('La question est requise.', 'error')

    const cleanOptions = [...new Set(options.map((o) => o.trim()).filter(Boolean))]
    if (cleanOptions.length < MIN_OPTIONS || cleanOptions.length > MAX_OPTIONS) {
      return showToast(`Entre ${MIN_OPTIONS} et ${MAX_OPTIONS} options sont requises.`, 'error')
    }

    setLoading(true)
    try {
      await createPoll({
        question: cleanQuestion,
        options: cleanOptions,
        category: category.trim() || undefined,
        ends_at: endsAt || undefined
      })
      showToast('Sondage créé !', 'success')
      setTimeout(() => onNavigate({ type: 'polls' }), 400)
    } catch (err) {
      showToast((err as Error).message || 'Erreur inattendue', 'error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="pc-view">
      <div className="pc-detail-header">
        <button type="button" className="pc-icon-btn" onClick={onBack}>
          <ArrowLeft size={16} />
        </button>
        <div>
          <p className="pc-view-kicker">Nouveau</p>
          <h2 className="pc-view-title">Créer un sondage</h2>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="pc-form">
        <label>
          Question *
          <input
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="Ex: Quel jeu pour la prochaine soirée ?"
          />
        </label>

        <label>Réponses * (2 à 6)</label>
        {options.map((opt, i) => (
          <div key={i} className="pc-poll-option-input-row">
            <input
              value={opt}
              onChange={(e) => updateOption(i, e.target.value)}
              placeholder={`Option ${i + 1}`}
            />
            {options.length > MIN_OPTIONS && (
              <button
                type="button"
                className="pc-icon-btn"
                onClick={() => removeOption(i)}
                title="Retirer cette option"
              >
                <Trash2 size={14} />
              </button>
            )}
          </div>
        ))}
        {options.length < MAX_OPTIONS && (
          <button type="button" className="pc-btn pc-btn-ghost pc-btn-sm" onClick={addOption}>
            <PlusCircle size={15} />
            Ajouter une option
          </button>
        )}

        <label>
          Catégorie (facultative)
          <input
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            placeholder="Ex: Gaming, Cinéma, Général…"
          />
        </label>

        <label>
          Date de fin (facultative)
          <input value={endsAt} onChange={(e) => setEndsAt(e.target.value)} type="datetime-local" />
        </label>

        <button type="submit" disabled={loading} className="pc-btn pc-btn-primary pc-btn-full">
          <PlusCircle size={18} />
          {loading ? 'En cours…' : 'Créer le sondage'}
        </button>
      </form>
      {ToastComponent}
    </div>
  )
}
