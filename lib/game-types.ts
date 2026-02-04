export type ChickenBreed = 'egg' | 'meat' | 'fighting' | 'bantam'

export type ChickenLevel = 1 | 2 | 3

export interface Chicken {
  id: string
  breed: ChickenBreed
  level: ChickenLevel
  hunger: number
  eggQuality: number
  hasEgg: boolean
  growthProgress: number
  eggProgress: number
  isDead: boolean
  hungerSlowdownUntil: number // Timestamp when slowdown ends (timeRemaining)
}

export interface FoodItem {
  id: string
  name: string
  price: number
  hungerBoost: number
  qualityBoost: number
  growthBoost: number
  hungerSlowdown: number // Temporarily reduces hunger rate (in seconds)
  type: 'food' | 'growth-potion' | 'egg-potion'
}

export interface Inventory {
  [key: string]: number
}

export interface Egg {
  id: string
  quality: number
  chickenId: string
}

export interface GameState {
  playerName: string
  money: number
  chickens: Chicken[]
  inventory: Inventory
  eggs: Egg[]
  timeRemaining: number
  gameStarted: boolean
  gameEnded: boolean
  totalEggsSold: number
  totalEggsSoldValue: number
  totalEggsProduced: number
  totalChickensBought: number
  totalFoodSpent: number
  soundEnabled: boolean
  gameOver: boolean
}

export const CHICKEN_DATA: Record<ChickenBreed, {
  name: string
  eggSpeed: number
  hungerRate: number
  baseQuality: number
}> = {
  egg: {
    name: 'ไก่ไข่',
    eggSpeed: 2,
    hungerRate: 1.6,
    baseQuality: 2,
  },
  meat: {
    name: 'ไก่เนื้อ',
    eggSpeed: 1.6,
    hungerRate: 0.5,
    baseQuality: 1.2,
  },
  fighting: {
    name: 'ไก่ชน',
    eggSpeed: 1.2,
    hungerRate: 1,
    baseQuality: 1.5,
  },
  bantam: {
    name: 'ไก่แจ้',
    eggSpeed: 1,
    hungerRate: 0.3,
    baseQuality: 5,
  },
}

export const FOOD_ITEMS: FoodItem[] = [
  { id: 'grass', name: 'หญ้าอ่อน', price: 20, hungerBoost: 35, qualityBoost: 0.3, growthBoost: 18, hungerSlowdown: 20, type: 'food' },
  { id: 'food-good', name: 'อาหารเกรดดี', price: 40, hungerBoost: 50, qualityBoost: 0.3, growthBoost: 20, hungerSlowdown: 30, type: 'food' },
  { id: 'food-great', name: 'อาหารเกรดดีมาก', price: 60, hungerBoost: 50, qualityBoost: 0.5, growthBoost: 20, hungerSlowdown: 45, type: 'food' },
  { id: 'food-premium', name: 'อาหารเกรดพรีเมี่ยม', price: 90, hungerBoost: 60, qualityBoost: 0.8, growthBoost: 30, hungerSlowdown: 60, type: 'food' },
  { id: 'growth-potion', name: 'น้ำยาเร่งโต', price: 100, hungerBoost: 0, qualityBoost: -0.3, growthBoost: 0, hungerSlowdown: 0, type: 'growth-potion' },
  { id: 'egg-potion', name: 'น้ำยาเร่งไข่', price: 100, hungerBoost: 0, qualityBoost: -0.3, growthBoost: 0, hungerSlowdown: 0, type: 'egg-potion' },
]

export const CHICKEN_PRICE = 100
export const STARTING_MONEY = 1000
export const GAME_DURATION = 10 * 60

export function getEggPrice(quality: number): number {
  if (quality <= 1) return 80
  if (quality <= 2) return 120
  if (quality <= 3) return 170
  if (quality <= 4) return 240
  if (quality <= 5) return 270
  return 310
}

export function getChickenImage(breed: ChickenBreed, level: ChickenLevel): string {
  if (level === 1) return 'https://i.ibb.co/6RGn4ZRF/C0.png'
  
  const images: Record<ChickenBreed, string> = {
    meat: 'https://i.ibb.co/sdq6dkpn/C1.png',
    egg: 'https://i.ibb.co/N2FmTHL7/C2.png',
    bantam: 'https://i.ibb.co/GvWRybyk/C3.png',
    fighting: 'https://i.ibb.co/QqJBywn/C4.png',
  }
  
  return images[breed]
}

export function getLevelName(level: ChickenLevel): string {
  switch (level) {
    case 1: return 'ลูกไก่'
    case 2: return 'วัยรุ่น'
    case 3: return 'พร้อมออกไข่'
  }
}
