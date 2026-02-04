'use client'

import React, { createContext, useContext, useReducer, useCallback, useEffect, useRef } from 'react'
import {
  GameState,
  Chicken,
  ChickenBreed,
  Egg,
  CHICKEN_DATA,
  FOOD_ITEMS,
  CHICKEN_PRICE,
  STARTING_MONEY,
  GAME_DURATION,
  getEggPrice,
} from './game-types'

type GameAction =
  | { type: 'SET_PLAYER_NAME'; name: string }
  | { type: 'START_GAME' }
  | { type: 'END_GAME' }
  | { type: 'TOGGLE_SOUND' }
  | { type: 'BUY_CHICKEN'; breed: ChickenBreed }
  | { type: 'BUY_FOOD'; foodId: string }
  | { type: 'SELL_FOOD'; foodId: string }
  | { type: 'FEED_CHICKEN'; chickenId: string; foodId: string }
  | { type: 'COLLECT_EGG'; chickenId: string }
  | { type: 'SELL_EGGS' }
  | { type: 'TICK' }
  | { type: 'RESET_GAME' }

const initialState: GameState = {
  playerName: '',
  money: STARTING_MONEY,
  chickens: [],
  inventory: {},
  eggs: [],
  timeRemaining: GAME_DURATION,
  gameStarted: false,
  gameEnded: false,
  totalEggsSold: 0,
  totalEggsSoldValue: 0,
  totalEggsProduced: 0,
  totalChickensBought: 0,
  totalFoodSpent: 0,
  soundEnabled: true,
  gameOver: false,
}

function generateId(): string {
  return Math.random().toString(36).substring(2, 9)
}



function gameReducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case 'SET_PLAYER_NAME':
      return { ...state, playerName: action.name }

    case 'START_GAME':
      return { ...state, gameStarted: true }

    case 'END_GAME':
      return { ...state, gameEnded: true }

    case 'TOGGLE_SOUND':
      return { ...state, soundEnabled: !state.soundEnabled }

    case 'BUY_CHICKEN': {
      if (state.money < CHICKEN_PRICE) return state
      const chickenData = CHICKEN_DATA[action.breed]
      const newChicken: Chicken = {
        id: generateId(),
        breed: action.breed,
        level: 1,
        hunger: 100,
        eggQuality: chickenData.baseQuality,
        hasEgg: false,
        growthProgress: 0,
        eggProgress: 0,
        isDead: false,
        hungerSlowdownUntil: 0,
      }
      return {
        ...state,
        money: state.money - CHICKEN_PRICE,
        chickens: [...state.chickens, newChicken],
        totalChickensBought: state.totalChickensBought + 1,
      }
    }

    case 'BUY_FOOD': {
      const food = FOOD_ITEMS.find(f => f.id === action.foodId)
      if (!food || state.money < food.price) return state
      return {
        ...state,
        money: state.money - food.price,
        inventory: {
          ...state.inventory,
          [action.foodId]: (state.inventory[action.foodId] || 0) + 1,
        },
        totalFoodSpent: state.totalFoodSpent + food.price,
      }
    }

    case 'SELL_FOOD': {
      const food = FOOD_ITEMS.find(f => f.id === action.foodId)
      const quantity = state.inventory[action.foodId] || 0

      if (!food || quantity <= 0) return state

      return {
        ...state,
        money: state.money + food.price,
        inventory: {
          ...state.inventory,
          [action.foodId]: quantity - 1,
        },
      }
    }

    case 'FEED_CHICKEN': {
      const food = FOOD_ITEMS.find(f => f.id === action.foodId)
      if (!food || !state.inventory[action.foodId]) return state

      const chickenIndex = state.chickens.findIndex(c => c.id === action.chickenId)
      if (chickenIndex === -1) return state

      const chicken = state.chickens[chickenIndex]
      if (chicken.isDead) return state

      const updatedChickens = [...state.chickens]
      const updatedChicken = { ...chicken }

      if (food.type === 'growth-potion') {
        if (updatedChicken.level < 3) {
          updatedChicken.level = (updatedChicken.level + 1) as 1 | 2 | 3
          updatedChicken.growthProgress = 0
          updatedChicken.eggQuality = Math.max(0.1, updatedChicken.eggQuality + food.qualityBoost)
        }
      } else if (food.type === 'egg-potion') {
        if (updatedChicken.level === 3) {
          updatedChicken.eggProgress = Math.min(100, updatedChicken.eggProgress + 50)
          updatedChicken.eggQuality = Math.max(0.1, updatedChicken.eggQuality + food.qualityBoost)
        }
      } else {
        updatedChicken.hunger = Math.min(100, updatedChicken.hunger + food.hungerBoost)
        updatedChicken.eggQuality = Math.max(0.1, updatedChicken.eggQuality + food.qualityBoost)
        // Growth boost from food grades
        if (updatedChicken.level < 3 && food.growthBoost > 0) {
          updatedChicken.growthProgress = Math.min(100, updatedChicken.growthProgress + food.growthBoost)
          if (updatedChicken.growthProgress >= 100) {
            updatedChicken.level = (updatedChicken.level + 1) as 1 | 2 | 3
            updatedChicken.growthProgress = 0
          }
        }
        // Hunger slowdown effect
        if (food.hungerSlowdown > 0) {
          const newSlowdownEnd = state.timeRemaining - food.hungerSlowdown
          // Extend if already has slowdown, otherwise set new
          if (updatedChicken.hungerSlowdownUntil > newSlowdownEnd) {
            // Keep existing longer slowdown
          } else {
            updatedChicken.hungerSlowdownUntil = newSlowdownEnd
          }
        }
      }

      updatedChickens[chickenIndex] = updatedChicken

      return {
        ...state,
        chickens: updatedChickens,
        inventory: {
          ...state.inventory,
          [action.foodId]: state.inventory[action.foodId] - 1,
        },
      }
    }

    case 'COLLECT_EGG': {
      const chickenIndex = state.chickens.findIndex(c => c.id === action.chickenId)
      if (chickenIndex === -1) return state

      const chicken = state.chickens[chickenIndex]
      if (!chicken.hasEgg) return state

      const newEgg: Egg = {
        id: generateId(),
        quality: chicken.eggQuality,
        chickenId: chicken.id,
      }

      const updatedChickens = [...state.chickens]
      updatedChickens[chickenIndex] = { ...chicken, hasEgg: false, eggProgress: 0 }

      return {
        ...state,
        chickens: updatedChickens,
        eggs: [...state.eggs, newEgg],
        totalEggsProduced: state.totalEggsProduced + 1,
      }
    }

    case 'SELL_EGGS': {
    const totalValue = state.eggs.reduce(
    (sum, egg) => sum + getEggPrice(egg.quality),
    0
    )


    return {
    ...state,
    money: state.money + totalValue,
    eggs: [],
    totalEggsSold: state.totalEggsSold + state.eggs.length,
    totalEggsSoldValue: state.totalEggsSoldValue + totalValue,
    }
    }

    case 'TICK': {
      if (!state.gameStarted || state.gameEnded) return state

      const newTimeRemaining = state.timeRemaining - 1
      if (newTimeRemaining <= 0) {
        return { ...state, timeRemaining: 0, gameEnded: true }
      }

      const updatedChickens = state.chickens.map(chicken => {

        if (chicken.isDead) return chicken

        const chickenData = CHICKEN_DATA[chicken.breed]
        // Check if hunger slowdown is active
        const hasSlowdown = chicken.hungerSlowdownUntil > 0 && newTimeRemaining >= chicken.hungerSlowdownUntil
        // Hunger rate is halved when slowdown is active
        const hungerMultiplier = hasSlowdown ? 0.5 : 1.2
        let newHunger = chicken.hunger - chickenData.hungerRate * hungerMultiplier * 0.5
        
        if (newHunger <= 0) {
          return { ...chicken, hunger: 0, isDead: true }
        }

        let newGrowthProgress = chicken.growthProgress
        let newLevel = chicken.level
        let newEggProgress = chicken.eggProgress
        let newHasEgg = chicken.hasEgg

        if (chicken.level < 3) {
          // Faster growth (2x speed)
          newGrowthProgress += 1.5
          if (newGrowthProgress >= 100) {
            newLevel = (chicken.level + 1) as 1 | 2 | 3
            newGrowthProgress = 0
          }
        } else if (!chicken.hasEgg) {
          // Faster egg production (2x speed)
          newEggProgress += chickenData.eggSpeed * 1.5
          if (newEggProgress >= 100) {
            newHasEgg = true
            newEggProgress = 100
          }
        }

        return {
          ...chicken,
          hunger: newHunger,
          level: newLevel,
          growthProgress: newGrowthProgress,
          eggProgress: newEggProgress,
          hasEgg: newHasEgg,
        }
      })

      const aliveChickens = updatedChickens.filter(c => !c.isDead)

      // ✅ ต้องเคยมีไก่มาก่อน ถึงจะ game over
      if (state.chickens.length > 0 && aliveChickens.length === 0) {
        return {
          ...state,
          chickens: updatedChickens,
          gameOver: true,
          gameEnded: true,
        }
      }

      return {
        ...state,
        timeRemaining: newTimeRemaining,
        chickens: updatedChickens,
      }
    }

    case 'RESET_GAME':
      return { ...initialState }

    default:
      return state
  }
}

interface GameContextType {
  state: GameState
  setPlayerName: (name: string) => void
  startGame: () => void
  endGame: () => void
  toggleSound: () => void
  buyChicken: (breed: ChickenBreed) => void
  buyFood: (foodId: string) => void
  sellFood: (foodId: string) => void
  feedChicken: (chickenId: string, foodId: string) => void
  collectEgg: (chickenId: string) => void
  sellEggs: () => void
  resetGame: () => void
  playSound: (sound: 'click' | 'buy' | 'egg' | 'death' | 'levelup') => void
}

const GameContext = createContext<GameContextType | null>(null)

export function GameProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(gameReducer, initialState)
  const audioRef = useRef<HTMLAudioElement | null>(null)

  const playSound = useCallback((sound: 'click' | 'buy' | 'egg' | 'death' | 'levelup') => {
    if (!state.soundEnabled) return
    
    const frequencies: Record<string, number> = {
      click: 800,
      buy: 600,
      egg: 1000,
      death: 200,
      levelup: 1200,
    }
    
    try {
      const audioContext = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)()
      const oscillator = audioContext.createOscillator()
      const gainNode = audioContext.createGain()
      
      oscillator.connect(gainNode)
      gainNode.connect(audioContext.destination)
      
      oscillator.frequency.value = frequencies[sound]
      oscillator.type = 'sine'
      
      gainNode.gain.setValueAtTime(0.1, audioContext.currentTime)
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.2)
      
      oscillator.start(audioContext.currentTime)
      oscillator.stop(audioContext.currentTime + 0.2)
    } catch {
      // Audio not supported
    }
  }, [state.soundEnabled])

  useEffect(() => {
    if (!state.gameStarted || state.gameEnded) return

    const interval = setInterval(() => {
      dispatch({ type: 'TICK' })
    }, 1500)

    return () => clearInterval(interval)
  }, [state.gameStarted, state.gameEnded])


    const sellFood = (foodId: string) => {
      dispatch({ type: 'SELL_FOOD', foodId })
    } 
  const value: GameContextType = {
    state,
    setPlayerName: (name) => dispatch({ type: 'SET_PLAYER_NAME', name }),
    startGame: () => dispatch({ type: 'START_GAME' }),
    endGame: () => dispatch({ type: 'END_GAME' }),
    toggleSound: () => dispatch({ type: 'TOGGLE_SOUND' }),
    buyChicken: (breed) => dispatch({ type: 'BUY_CHICKEN', breed }),
    buyFood: (foodId) => dispatch({ type: 'BUY_FOOD', foodId }),
    sellFood,
    feedChicken: (chickenId, foodId) => dispatch({ type: 'FEED_CHICKEN', chickenId, foodId }),
    collectEgg: (chickenId) => dispatch({ type: 'COLLECT_EGG', chickenId }),
    sellEggs: () => dispatch({ type: 'SELL_EGGS' }),
    resetGame: () => dispatch({ type: 'RESET_GAME' }),
    playSound,
  }

  return (
    <GameContext.Provider value={value}>
      {children}
      <audio ref={audioRef} />
    </GameContext.Provider>
  )
}


export function useGame() {
  const context = useContext(GameContext)
  if (!context) {
    throw new Error('useGame must be used within a GameProvider')
  }
  return context
}


