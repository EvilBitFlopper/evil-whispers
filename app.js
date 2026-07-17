import { createApp } from 'https://unpkg.com/petite-vue?module'

const STORAGE_KEY = 'beer-temp-log'
const META_KEY = 'beer-meta'

function loadEntries() {
  try {
    const raw = JSON.parse(localStorage.getItem(STORAGE_KEY))
    return Array.isArray(raw) ? raw : []
  } catch {
    return []
  }
}

function defaultMeta() {
  return { name: '', batch: '', recipe: '', note: '' }
}

function loadMeta() {
  try {
    const raw = JSON.parse(localStorage.getItem(META_KEY))
    return raw && typeof raw === 'object' && !Array.isArray(raw)
      ? { ...defaultMeta(), ...raw }
      : defaultMeta()
  } catch {
    return defaultMeta()
  }
}

function round1(n) {
  return Math.round(n * 10) / 10
}

function slugify(text, fallback) {
  const cleaned = text
    .trim()
    .replace(/[^a-zA-Z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
  return cleaned.length > 0 ? cleaned : fallback
}

createApp({
  currentTemp: 20.0,
  entries: loadEntries(),
  ...loadMeta(),

  adjust(delta) {
    this.currentTemp = round1(this.currentTemp + delta)
  },

  addMeasurement() {
    this.entries.unshift({
      id: Date.now(),
      temp: this.currentTemp,
      time: new Date().toISOString(),
    })
    this.persist()
  },

  removeEntry(id) {
    this.entries = this.entries.filter((entry) => entry.id !== id)
    this.persist()
  },

  persist() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(this.entries))
  },

  persistMeta() {
    localStorage.setItem(
      META_KEY,
      JSON.stringify({
        name: this.name,
        batch: this.batch,
        recipe: this.recipe,
        note: this.note,
      })
    )
  },

  formatTime(iso) {
    return new Date(iso).toLocaleTimeString()
  },

  exportBeer() {
    const payload = {
      name: this.name,
      batch: this.batch,
      recipe: this.recipe,
      note: this.note,
      entries: this.entries,
      exportedAt: new Date().toISOString(),
    }

    const blob = new Blob([JSON.stringify(payload, null, 2)], {
      type: 'application/json',
    })
    const url = URL.createObjectURL(blob)

    const datePart = new Date().toISOString().slice(0, 10)
    const namePart = slugify(this.name, 'beer')
    const batchSlug = slugify(this.batch, '')
    const batchPart = batchSlug ? `-${batchSlug}` : ''
    const filename = `${namePart}${batchPart}-${datePart}.json`

    const a = document.createElement('a')
    a.href = url
    a.download = filename
    document.body.appendChild(a)
    a.click()
    a.remove()
    URL.revokeObjectURL(url)
  },
}).mount()
