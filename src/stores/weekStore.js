import { defineStore } from 'pinia'
import { ref, reactive, computed } from 'vue'

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

// Per-day caloric targets based on training load (Mon–Sun)
const DAY_BASE_TARGETS = [2400, 2150, 2350, 2100, 2750, 2750, 2100]

function createDefaultMeals() {
  return [
    // Dilluns — natació matinal 60 min
    {
      breakfast: { label: 'Esmorzar', kcal: 560, carbs: 70, protein: 24, fat: 14,
        items: ['Civada 80g', 'Plàtan', 'Pols de proteïna', 'Llet semidesnatada'] },
      lunch:     { label: 'Dinar',    kcal: 780, carbs: 96, protein: 52, fat: 18,
        items: ['Arròs integral 150g', 'Pit de pollastre 180g', 'Bròcoli al vapor', 'AOVE'] },
      snack:     { label: 'Berenar',  kcal: 245, carbs: 22, protein: 18, fat: 9,
        items: ['Iogurt grec 0% 200g', 'Nous 20g', 'Mel'] },
      dinner:    { label: 'Sopar',    kcal: 815, carbs: 72, protein: 48, fat: 22,
        items: ['Salmó al forn 200g', 'Patata dolça 220g', 'Espinacs saltats', 'AOVE'] },
      total: 2400, targetKcal: 2400, status: 'ok',
    },
    // Dimarts — descans
    {
      breakfast: { label: 'Esmorzar', kcal: 420, carbs: 40, protein: 20, fat: 16,
        items: ['Pa integral torrat', 'Aguacate 1/2', 'Ous remenats x2', 'Tomàquet cherry'] },
      lunch:     { label: 'Dinar',    kcal: 680, carbs: 88, protein: 30, fat: 12,
        items: ['Llenties pardines 150g', 'Pastanaga', 'Pebrot vermell', 'Pa moreno'] },
      snack:     { label: 'Berenar',  kcal: 190, carbs: 24, protein: 5, fat: 7,
        items: ['Poma Golden', 'Ametlles 20g'] },
      dinner:    { label: 'Sopar',    kcal: 860, carbs: 80, protein: 52, fat: 20,
        items: ['Pollastre al forn 200g', 'Batata 220g', 'Mongetes verdes', 'Pa moreno', 'All i pebre'] },
      total: 2150, targetKcal: 2150, status: 'ok',
    },
    // Dimecres — força upper body 75 min
    {
      breakfast: { label: 'Esmorzar', kcal: 490, carbs: 54, protein: 28, fat: 16,
        items: ['Torrades d\'espelta x3', 'Crema de cacauets', 'Ou dur x2', 'Nabius'] },
      lunch:     { label: 'Dinar',    kcal: 760, carbs: 100, protein: 44, fat: 14,
        items: ['Pasta integral 130g', 'Tonyina en escabetx', 'Tomàquet', 'Alfàbrega', 'AOVE'] },
      snack:     { label: 'Berenar',  kcal: 255, carbs: 32, protein: 24, fat: 4,
        items: ['Batut proteic de xocolata', 'Plàtan petit'] },
      dinner:    { label: 'Sopar',    kcal: 845, carbs: 78, protein: 56, fat: 20,
        items: ['Filet de vedella 200g', 'Arròs basmati 120g', 'Espàrrecs a la planxa', 'Pebre negre'] },
      total: 2350, targetKcal: 2350, status: 'ok',
    },
    // Dijous — descans
    {
      breakfast: { label: 'Esmorzar', kcal: 400, carbs: 52, protein: 12, fat: 10,
        items: ['Muesli sense sucre 70g', 'Llet vegetal d\'avena', 'Poma ratllada', 'Canyella'] },
      lunch:     { label: 'Dinar',    kcal: 720, carbs: 92, protein: 28, fat: 16,
        items: ['Cigrons al curri 200g', 'Arròs basmati 100g', 'Espinacs', 'Cúrcuma i gingebre'] },
      snack:     { label: 'Berenar',  kcal: 220, carbs: 30, protein: 8, fat: 6,
        items: ['Iogurt natural sencer', 'Kiwi x2', 'Grana de lli'] },
      dinner:    { label: 'Sopar',    kcal: 760, carbs: 62, protein: 52, fat: 18,
        items: ['Bacallà a la llauna 200g', 'Puré de pèsols', 'Tomàquet confitat', 'Pa integral'] },
      total: 2100, targetKcal: 2100, status: 'ok',
    },
    // Divendres — ciclisme 2h (càrrega alta)
    {
      breakfast: { label: 'Esmorzar', kcal: 620, carbs: 80, protein: 30, fat: 14,
        items: ['Pancakes de civada x4', 'Mel de flors', 'Maduixes', 'Pols de proteïna'] },
      lunch:     { label: 'Dinar',    kcal: 900, carbs: 124, protein: 56, fat: 18,
        items: ['Pasta integral 160g', 'Pit de pollastre 200g', 'Pesto casolà', 'Pa artesà'] },
      snack:     { label: 'Berenar',  kcal: 300, carbs: 52, protein: 6, fat: 8,
        items: ['Dàtils 60g', 'Ametlles 25g', 'Plàtan gran'] },
      dinner:    { label: 'Sopar',    kcal: 800, carbs: 78, protein: 52, fat: 20,
        items: ['Truita de tonyina x3 ous', 'Arròs integral 120g', 'Amanida Niçoise'] },
      total: 2620, targetKcal: 2750, status: 'ok',
    },
    // Dissabte — ciclisme 2h
    {
      breakfast: { label: 'Esmorzar', kcal: 680, carbs: 72, protein: 38, fat: 22,
        items: ['Tortilla francesa x3 ous', 'Torrades integrals x4', 'Taronja', 'Cafè amb llet'] },
      lunch:     { label: 'Dinar',    kcal: 880, carbs: 114, protein: 46, fat: 20,
        items: ['Paella de pollastre i verdures', 'Amanida mixta', 'Pa de pagès', 'Allioli lleuger'] },
      snack:     { label: 'Berenar',  kcal: 330, carbs: 44, protein: 22, fat: 10,
        items: ['Batut de recuperació (llet+proteïna)', 'Fruits secs mix 30g'] },
      dinner:    { label: 'Sopar',    kcal: 860, carbs: 82, protein: 54, fat: 22,
        items: ['Salmó teriyaki 220g', 'Arròs blanc 130g', 'Edamame', 'Gingebre ratllat'] },
      total: 2750, targetKcal: 2750, status: 'ok',
    },
    // Diumenge — descans (dinar familiar)
    {
      breakfast: { label: 'Esmorzar', kcal: 460, carbs: 58, protein: 18, fat: 12,
        items: ['Crepes de fajol x3', 'Fruits vermells', 'Formatge fresc desnatat', 'Mel'] },
      lunch:     { label: 'Dinar',    kcal: 820, carbs: 88, protein: 44, fat: 22,
        items: ['Llom de porc al forn 200g', 'Patates rostides', 'Pebrots confitats', 'AOVE'] },
      snack:     { label: 'Berenar',  kcal: 230, carbs: 26, protein: 6, fat: 12,
        items: ['Pinya fresca', 'Nous de Brasil 20g', 'Xocolata negra 85% 20g'] },
      dinner:    { label: 'Sopar',    kcal: 590, carbs: 56, protein: 36, fat: 16,
        items: ['Ou poché x2', 'Espinacs a la catalana', 'Cigrons 100g', 'Torrades integrals'] },
      total: 2100, targetKcal: 2100, status: 'ok',
    },
  ]
}

export const useWeekStore = defineStore('week', () => {
  const sessions = ref(createDefaultSessions())
  const meals = ref(createDefaultMeals())
  const nextId = ref(10)

  const days = DAYS
  const daysFull = DAYS_FULL
  const sessionTypes = reactive({ ...SESSION_TYPES })

  // Get sessions for a specific day
  const sessionsByDay = computed(() => {
    const map = {}
    days.forEach((_, i) => { map[i] = [] })
    sessions.value.forEach(s => {
      if (map[s.day] !== undefined) map[s.day].push(s)
    })
    return map
  })

  function addSessionType(key, label, icon, color, kcalPerHour) {
    sessionTypes[key] = { label, icon, color, kcalPerHour }
  }

  function addSession(dayIndex, type, duration = 60, intensity = 'Moderada', startTime = 8) {
    const typeData = sessionTypes[type]
    const baseRate = typeData?.kcalPerHour ?? (intensity === 'Alta' ? 560 : intensity === 'Baixa' ? 280 : 400)
    const intensityMod = intensity === 'Alta' ? 1.25 : intensity === 'Baixa' ? 0.75 : 1
    const kcal = Math.round((duration / 60) * baseRate * intensityMod)
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
    const sessionKcal = daySessions.reduce((sum, s) => sum + s.kcal, 0)
    const isHighLoad = daySessions.some(s => s.load === 'high') || sessionKcal > 800

    const meal = meals.value[dayIndex]
    const base = DAY_BASE_TARGETS[dayIndex] ?? 2200
    if (isHighLoad) {
      meal.targetKcal = Math.round(base * 1.12)
      meal.status = meal.total >= meal.targetKcal * 0.95 ? 'ok' : 'warning'
    } else {
      meal.targetKcal = base
      meal.status = meal.total >= base * 0.95 ? 'ok' : 'warning'
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

  function addFoodToSlot(dayIndex, slot, { name, kcal = 0, carbs = 0, protein = 0, fat = 0 } = {}) {
    const meal = meals.value[dayIndex]
    if (!meal || !meal[slot]) return
    const s = meal[slot]
    s.kcal += kcal
    s.carbs += carbs
    s.protein += protein
    s.fat += fat
    if (name) s.items = [...s.items, name]
    meal.total = meal.breakfast.kcal + meal.lunch.kcal + meal.snack.kcal + meal.dinner.kcal
    checkLoadAndUpdateMeals(dayIndex)
  }

  function applyMealAdjustment(dayIndex, { mealSlot = 'dinner', extraKcal = 0, extraCarbs = 0, extraProtein = 0, item = null } = {}) {
    const meal = meals.value[dayIndex]
    if (!meal || !meal[mealSlot]) return
    const slot = meal[mealSlot]
    slot.kcal += extraKcal
    slot.carbs += extraCarbs
    slot.protein += extraProtein
    if (item) slot.items = [...slot.items, item]
    meal.total = meal.breakfast.kcal + meal.lunch.kcal + meal.snack.kcal + meal.dinner.kcal
    meal.status = 'ok'
    meal.aiAdjusted = true
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
    addSessionType, addSession, updateSession, removeSession,
    addFoodToSlot,
    applyAIMealAdjustment, applyAIWeekAdjustment, applyMealAdjustment,
    getSessionById, getWeekTotals
  }
})
