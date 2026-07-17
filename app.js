import { createApp } from 'https://unpkg.com/petite-vue?module'

const STORAGE_KEY = 'beer-temp-log'

function loadEntries() {
  try {
    const raw = JSON.parse(localStorage.getItem(STORAGE_KEY))
    return Array.isArray(raw) ? raw : []
  } catch {
    return []
  }
}

function round1(n) {
  return Math.round(n * 10) / 10
}

createApp({
  currentTemp: 20.0,
  entries: loadEntries(),

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

  formatTime(iso) {
    return new Date(iso).toLocaleTimeString()
  },
}).mount()
