import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

const DAYS = ['Dl', 'Dt', 'Dc', 'Dj', 'Dv', 'Ds', 'Dg']
const DAYS_FULL = ['Dilluns', 'Dimarts', 'Dimecres', 'Dijous', 'Divendres', 'Dissabte', 'Diumenge']

const SESSION_TYPES = {
  cycling: { label: 'Ciclisme', icon: 'directions_bike', color: '#6366F1' },
  swimming: { label: 'Natació', icon: 'pool', color: '#0EA5E9' },
  strength: { label: 'Força', icon: 'fitness_center', color: '#8B5CF6' },
  running: { label: 'Córrer', icon: 'directions_run', color: '#F59E0B' },
  yoga: { label: 'Ioga', icon: 'self_improvement', color: '#10B981' },
  double: { label: 'Sessió doble', icon: 'repeat', color: '#EF4444' }
}

function createDefaultSessions() {
  return [
    { id: 1, day: 0, type: 'swimming', duration: 60,  intensity: 'Moderada', label: 'Natació matinal',    kcal: 420, load: 'normal', startTime: 7   },
    { id: 2, day: 2, type: 'strength', duration: 75,  intensity: 'Alta',     label: 'Força — upper body', kcal: 380, load: 'normal', startTime: 18  },
    { id: 3, day: 4, type: 'cycling',  duration: 120, intensity: 'Moderada', label: 'Ruta de bici',       kcal: 680, load: 'normal', startTime: 9   },
    { id: 4, day: 5, type: 'cycling',  duration: 120, intensity: 'Moderada', label: 'Ruta dissabte',      kcal: 680, load: 'normal', startTime: 8   },
  ]
}

function createDefaultMeals() {
  const mealTemplate = (dayOffset) => ({
    breakfast: { label: 'Esmorzar', kcal: 480, carbs: 65, protein: 22, fat: 14, items: ['Farina de civada', 'Plàtan', 'Llet semi'] },
    lunch: { label: 'Dinar', kcal: 720, carbs: 90, protein: 45, fat: 18, items: ['Arròs integral', 'Pit de pollastre', 'Bròcoli'] },
    snack: { label: 'Berenar', kcal: 220, carbs: 30, protein: 12, fat: 6, items: ['Iogurt grec', 'Fruits secs'] },
    dinner: { label: 'Sopar', kcal: 580, carbs: 55, protein: 38, fat: 16, items: ['Pasta integral', 'Salmó', 'Amanida'] },
    total: 2000, targetKcal: 2000, status: 'ok'
  })
  return DAYS.map((_, i) => mealTemplate(i))
}

export const useWeekStore = defineStore('week', () => {
  const sessions = ref(createDefaultSessions())
  const meals = ref(createDefaultMeals())
  const nextId = ref(10)

  const days = DAYS
  const daysFull = DAYS_FULL
  const sessionTypes = SESSION_TYPES

  // Get sessions for a specific day
  const sessionsByDay = computed(() => {
    const map = {}
    days.forEach((_, i) => { map[i] = [] })
    sessions.value.forEach(s => {
      if (map[s.day] !== undefined) map[s.day].push(s)
    })
    return map
  })

  function addSession(dayIndex, type, duration = 60, intensity = 'Moderada', startTime = 8) {
    const typeData = SESSION_TYPES[type]
    const kcal = Math.round((duration / 60) * (intensity === 'Alta' ? 560 : intensity === 'Baixa' ? 280 : 400))
    const newSession = {
      id: nextId.value++,
      day: dayIndex,
      type,
      duration,
      intensity,
      label: typeData.label,
      kcal,
      load: intensity === 'Alta' || duration >= 240 ? 'high' : 'normal',
      startTime
    }
    sessions.value.push(newSession)
    checkLoadAndUpdateMeals(dayIndex)
    return newSession
  }

  function updateSession(id, changes) {
    const idx = sessions.value.findIndex(s => s.id === id)
    if (idx === -1) return
    const session = sessions.value[idx]
    Object.assign(session, changes)
    // Recalculate kcal
    session.kcal = Math.round((session.duration / 60) * (session.intensity === 'Alta' ? 560 : session.intensity === 'Baixa' ? 280 : 400))
    session.load = session.intensity === 'Alta' || session.duration >= 240 ? 'high' : 'normal'
    checkLoadAndUpdateMeals(session.day)
  }

  function removeSession(id) {
    const idx = sessions.value.findIndex(s => s.id === id)
    if (idx !== -1) {
      const day = sessions.value[idx].day
      sessions.value.splice(idx, 1)
      checkLoadAndUpdateMeals(day)
    }
  }

  function checkLoadAndUpdateMeals(dayIndex) {
    const daySessions = sessionsByDay.value[dayIndex] || []
    const totalKcal = daySessions.reduce((sum, s) => sum + s.kcal, 0)
    const isHighLoad = daySessions.some(s => s.load === 'high') || totalKcal > 900

    const meal = meals.value[dayIndex]
    if (isHighLoad) {
      meal.targetKcal = Math.round(meal.total * 1.15)
      meal.status = 'warning'
    } else {
      meal.targetKcal = 2000
      meal.status = 'ok'
    }
  }

  function applyAIMealAdjustment(dayIndex, extraKcal = 300) {
    const meal = meals.value[dayIndex]
    meal.dinner.kcal += extraKcal
    meal.dinner.carbs += 60
    meal.dinner.items = [...meal.dinner.items, 'Hidrats extra (arròs o pasta)']
    meal.total = meal.breakfast.kcal + meal.lunch.kcal + meal.snack.kcal + meal.dinner.kcal
    meal.status = 'ok'
    meal.aiAdjusted = true
  }

  function applyAIWeekAdjustment(startDay, endDay) {
    for (let d = startDay; d <= endDay; d++) {
      const meal = meals.value[d]
      meal.targetKcal = Math.round(meal.total * 1.15)
      meal.lunch.kcal += 150
      meal.lunch.carbs += 30
      meal.total += 150
      meal.status = 'ok'
      meal.aiAdjusted = true
    }
  }

  function getSessionById(id) {
    return sessions.value.find(s => s.id === id)
  }

  function getWeekTotals() {
    const totalSessions = sessions.value.length
    const totalKcalBurned = sessions.value.reduce((s, sess) => s + sess.kcal, 0)
    const highLoadDays = [...new Set(sessions.value.filter(s => s.load === 'high').map(s => s.day))].length
    return { totalSessions, totalKcalBurned, highLoadDays }
  }

  return {
    sessions, meals, days, daysFull, sessionTypes,
    sessionsByDay,
    addSession, updateSession, removeSession,
    applyAIMealAdjustment, applyAIWeekAdjustment,
    getSessionById, getWeekTotals
  }
})
