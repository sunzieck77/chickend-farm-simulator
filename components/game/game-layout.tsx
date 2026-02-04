'use client'

import React from "react"
import { Home, Menu } from 'lucide-react'
import { useState } from 'react'
import { useGame } from '@/lib/game-context'
import { Farm } from './farm'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Store, Package, Volume2, VolumeX, Coins, Clock, X, Minus, Plus, Check, Star, Info } from 'lucide-react'
import { cn } from '@/lib/utils'
import { CHICKEN_DATA, FOOD_ITEMS, CHICKEN_PRICE, ChickenBreed, getEggPrice } from '@/lib/game-types'

const BREED_ORDER: ChickenBreed[] = ['egg', 'meat', 'fighting', 'bantam']

const BREED_DESCRIPTIONS: Record<ChickenBreed, string> = {
  egg: 'ออกไข่ได้เร็ว แต่หิวเร็ว',
  meat: 'ออกไข่ช้า แต่คุณภาพดี หิวช้า',
  fighting: 'ออกไข่เร็ว คุณภาพปานกลาง',
  bantam: 'ออกไข่ช้า แต่คุณภาพสูงสุด',
}

interface CartItem {
  type: 'chicken' | 'food'
  id: string
  name: string
  price: number
  quantity: number
}

export function GameLayout() {
  const { state, toggleSound, playSound, buyChicken, buyFood, sellEggs, sellFood } = useGame()
  const [showMenu, setShowMenu] = useState(false)
  const [sellMessage, setSellMessage] = useState<string | null>(null)
  const { resetGame } = useGame()
  const [showShop, setShowShop] = useState(false)
  const [showInventory, setShowInventory] = useState(false)
  const [cart, setCart] = useState<CartItem[]>([])
  const [selectedFood, setSelectedFood] = useState<typeof FOOD_ITEMS[0] | null>(null)

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const isLowTime = state.timeRemaining < 60

  // Cart logic
  const totalCartPrice = cart.reduce((sum, item) => sum + item.price * item.quantity, 0)
  const canCheckout = totalCartPrice > 0 && totalCartPrice <= state.money

  const getCartQuantity = (type: 'chicken' | 'food', id: string) => {
    const item = cart.find(c => c.type === type && c.id === id)
    return item?.quantity || 0
  }

  const getMaxQuantity = (price: number, currentQty: number) => {
    const remainingMoney = state.money - totalCartPrice + (price * currentQty)
    return Math.floor(remainingMoney / price)
  }

  const updateCart = (type: 'chicken' | 'food', id: string, name: string, price: number, delta: number) => {
    setCart(prev => {
      const existing = prev.find(c => c.type === type && c.id === id)
      const currentQty = existing?.quantity || 0
      const newQty = Math.max(0, currentQty + delta)
      const maxQty = getMaxQuantity(price, currentQty)

      if (newQty > maxQty) return prev
      
      if (newQty === 0) {
        return prev.filter(c => !(c.type === type && c.id === id))
      }
      
      if (existing) {
        return prev.map(c => 
          c.type === type && c.id === id ? { ...c, quantity: newQty } : c
        )
      }
      
      return [...prev, { type, id, name, price, quantity: newQty }]
    })
    playSound('click')
  }

  const handleCheckout = () => {
    if (!canCheckout) return
    
    playSound('buy')
    
    for (const item of cart) {
      for (let i = 0; i < item.quantity; i++) {
        if (item.type === 'chicken') {
          buyChicken(item.id as ChickenBreed)
        } else {
          buyFood(item.id)
        }
      }
    }
    
    setCart([])
    setShowShop(false)
  }

  // Egg logic
  const totalEggValue = state.eggs.reduce((sum, egg) => sum + getEggPrice(egg.quality), 0)

  const handleSellEggs = () => {
    if (state.eggs.length > 0) {
      playSound('buy')
      sellEggs()
    }
  }

  function getQualityLabel(quality: number): { label: string; color: string } {
    if (quality >= 3) return { label: 'พรีเมี่ยม', color: 'text-chart-4' }
    if (quality >= 2) return { label: 'ดีมาก', color: 'text-chart-2' }
    if (quality >= 1.5) return { label: 'ดี', color: 'text-primary' }
    return { label: 'ธรรมดา', color: 'text-muted-foreground' }
  }

  // Group eggs by quality tier
  const groupedEggs = state.eggs.reduce((acc, egg) => {
    const price = getEggPrice(egg.quality)
    const key = price.toString()
    if (!acc[key]) {
      acc[key] = { price, eggs: [], avgQuality: 0 }
    }
    acc[key].eggs.push(egg)
    return acc
  }, {} as Record<string, { price: number; eggs: typeof state.eggs; avgQuality: number }>)

  Object.values(groupedEggs).forEach(group => {
    group.avgQuality = group.eggs.reduce((sum, e) => sum + e.quality, 0) / group.eggs.length
  })

  const foodItems = FOOD_ITEMS.map(food => ({
    ...food,
    quantity: state.inventory[food.id] || 0,
  })).filter(f => f.quantity > 0)

  return (
    <div className="min-h-screen flex flex-col relative ">
      {/* Background */}
      <div 
        className="fixed inset-0 bg-cover bg-center bg-no-repeat -z-10"
        style={{
          backgroundImage: 'url(https://mir-s3-cdn-cf.behance.net/project_modules/max_1200_webp/b952dc19204877.562d67ed78485.jpg)',
        }}
      />
      <div className="fixed inset-0 bg-background/80 backdrop-blur-sm -z-10" />

      {/* Top Bar */}
      <header className="sticky top-0 z-40 bg-card/95 backdrop-blur-sm border-b border-border shadow-lg">
        <div className="flex items-center justify-between p-3 max-w-5xl mx-auto">
          <div className="flex items-center gap-2 sm:gap-4">
            {/* Money */}
            <div className="flex items-center gap-2 bg-chart-4/20 px-3 py-2 rounded-md">
              <Coins className="w-4 h-4 text-chart-4" />
              <span className="text-sm font-bold text-foreground">
                {state.money.toLocaleString()}
              </span>
              <span className="text-xs text-muted-foreground hidden sm:inline">บาท</span>
            </div>

            {/* Timer */}
            <div className={cn(
              'flex items-center gap-2 px-2 py-2 rounded-md',
              isLowTime ? 'bg-destructive/20 animate-pulse' : 'bg-primary/20'
            )}>
              <Clock className={cn('w-4 h-4', isLowTime ? 'text-destructive' : 'text-primary')} />
              <span className={cn('text-sm font-bold', isLowTime ? 'text-destructive' : 'text-foreground')}>
                {formatTime(state.timeRemaining)}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Shop Button */}
            <button
              onClick={() => {
                playSound('click')
                setShowShop(true)
              }}
              className="bg-primary/20 hover:bg-primary/30 p-2 rounded-md transition-colors relative"
            >
              <Store className="w-5 h-5 text-primary" />
            </button>

            {/* Inventory Button */}
            <button
              onClick={() => {
                playSound('click')
                setShowInventory(true)
              }}
              className="bg-chart-4/20 hover:bg-chart-4/30 p-2 rounded-md transition-colors relative"
            >
              <Package className="w-5 h-5 text-chart-4" />
              {state.eggs.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-destructive text-destructive-foreground text-xs min-w-5 h-5 px-1 rounded-full flex items-center justify-center font-bold animate-bounce">
                  {state.eggs.length}
                </span>
              )}
            </button>

              {/* Sound Toggle */}
                      <div className="relative">
                        <button
                          onClick={() => setShowMenu(v => !v)}
                          className="bg-gray-500/90 p-2 rounded-md hover:bg-secondary/80 transition-colors"
                        >
                          <Menu className="w-5 h-5 text-white" />
                        </button>

                        {showMenu && (
                          <div className="absolute right-2 mt-2 bg-card border border-border rounded-md shadow-lg overflow-hidden z-50">
                            
                            {/* Toggle Sound */}
                            <button
                              onClick={() => {
                                toggleSound()
                                setShowMenu(false)
                              }}
                              className="flex items-center gap-2 px-4 py-2 hover:bg-secondary w-full text-left"
                            >
                            {state.soundEnabled ? (
                                <Volume2 className="w-12 h-12 pt-4 pb-2" />
                              ) : (
                                <VolumeX className="w-12 h-12 pt-4 pb-2 text-red-500" />
                              )}
                            </button>

                            {/* Reset Game */}
                            <button
                              onClick={() => {
                                resetGame()
                                setShowMenu(false)
                              }}
                              className="flex items-center gap-2 px-4 py-2 hover:bg-secondary w-full text-left text-red-500"
                            >
                              <span><Home className="w-12 h-12 pt-4 pb-2" /></span>
                            </button>
                          </div>
                        )}
                      </div>
          </div>
        </div>
      </header>

      {/* Main Content - Farm is always shown */}
      <main className="flex-1 overflow-auto pb-4">
        <div className="max-w-5xl mx-auto">
          <Farm />
        </div>
      </main>

      {/* Shop Modal */}
      {showShop && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-card w-full max-w-2xl max-h-[90vh] rounded-3xl shadow-2xl flex flex-col overflow-hidden border-2 border-primary/20">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-4 border-b border-border bg-primary/5">
              <h2 className="text-2xl font-bold text-foreground flex items-center gap-3">
                <Store className="w-7 h-7 text-primary" />
                ร้านค้า
              </h2>
              <button
                onClick={() => {
                  setShowShop(false)
                  setCart([])
                }}
                className="p-2 rounded-xl hover:bg-secondary transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="flex-1 overflow-auto p-4 space-y-4">
              {/* Chickens */}
              <div>
                <h3 className="text-lg font-bold text-foreground mb-3 flex items-center gap-2">
                  <span className="text-2xl">🐔</span>
                  ไก่ (ตัวละ {CHICKEN_PRICE} บาท)
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  {BREED_ORDER.map((breed) => {
                    const data = CHICKEN_DATA[breed]
                    const qty = getCartQuantity('chicken', breed)
                    const maxQty = getMaxQuantity(CHICKEN_PRICE, qty)

                    return (
                      <div
                        key={breed}
                        className={cn(
                          'bg-secondary/50 rounded-2xl p-4 text-center transition-all',
                          qty > 0 && 'ring-2 ring-primary bg-primary/10'
                        )}
                      >
                        <img
                          src={breed === 'meat' ? 'https://i.ibb.co/sdq6dkpn/C1.png' :
                               breed === 'egg' ? 'https://i.ibb.co/N2FmTHL7/C2.png' :
                               breed === 'bantam' ? 'https://i.ibb.co/GvWRybyk/C3.png' :
                               'https://i.ibb.co/QqJBywn/C4.png'}
                          alt={data.name}
                          className="w-16 h-16 mx-auto mb-2 object-contain"
                        />
                        <h4 className="font-bold text-foreground">{data.name}</h4>
                        <p className="text-xs text-muted-foreground mb-3">{BREED_DESCRIPTIONS[breed]}</p>
                        
                        <div className="flex items-center justify-center gap-2">
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => updateCart('chicken', breed, data.name, CHICKEN_PRICE, -1)}
                            disabled={qty === 0}
                            className="h-9 w-9 rounded-xl"
                          >
                            <Minus className="w-4 h-4" />
                          </Button>
                          <span className="text-xl font-bold min-w-[32px] text-foreground">{qty}</span>
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => updateCart('chicken', breed, data.name, CHICKEN_PRICE, 1)}
                            disabled={maxQty <= qty}
                            className="h-9 w-9 rounded-xl"
                          >
                            <Plus className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* Food */}
              <div>
                <h3 className="text-lg font-bold text-foreground mb-3 flex items-center gap-2">
                  <span className="text-2xl">🌾</span>
                  อาหาร
                </h3>
                <div className="space-y-2">
                  {FOOD_ITEMS.map((food) => {
                    const qty = getCartQuantity('food', food.id)
                    const maxQty = getMaxQuantity(food.price, qty)
                    const inInventory = state.inventory[food.id] || 0

                    return (
                      <div
                        key={food.id}
                        className={cn(
                          'flex items-center gap-3 bg-secondary/50 rounded-xl p-3 transition-all',
                          qty > 0 && 'ring-2 ring-chart-2 bg-chart-2/10' 
                        )}
                      > 
                        <div onClick={() => setSelectedFood(food)} className="w-12 h-12 rounded-xl bg-background flex items-center justify-center shrink-0">
                          <span className="text-2xl">
                            {food.type === 'food' ? '🍗' : food.type === 'growth-potion' ? '⚗️' : '💉'}
                          </span>
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <h4 className="font-bold text-foreground text-sm" onClick={() => setSelectedFood(food)} >{food.name}</h4>
                            <button
                              onClick={() => setSelectedFood(food)}
                              className="p-1 rounded-full hover:bg-background/50 text-muted-foreground hover:text-foreground"
                            >
                              <Info className="w-7 h-7 bg-green-600 text-white p-1 rounded-sm" />
                            </button>
                            {inInventory > 0 && (
                              <span className="text-xs bg-primary/20 text-primary px-2 py-0.5 rounded-full">
                                มี {inInventory}
                              </span>
                            )}
                          </div>
                          <p className="text-lg font-bold text-chart-2">{food.price} บาท</p>
                        </div>
                        
                        <div className="flex items-center gap-2 shrink-0">
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => updateCart('food', food.id, food.name, food.price, -1)}
                            disabled={qty === 0}
                            className="h-9 w-9 rounded-xl"
                          >
                            <Minus className="w-4 h-4" />
                          </Button>
                          <span className="text-xl font-bold min-w-[32px] text-center text-foreground">{qty}</span>
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => updateCart('food', food.id, food.name, food.price, 1)}
                            disabled={maxQty <= qty}
                            className="h-9 w-9 rounded-xl"
                          >
                            <Plus className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>

            {/* Fixed Checkout Footer */}
            <div className="border-t border-border bg-card p-4">
              {cart.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-3">
                  {cart.map(item => (
                    <span 
                      key={`${item.type}-${item.id}`}
                      className="text-sm bg-secondary px-3 py-1 rounded-full text-foreground"
                    >
                      {item.name} x{item.quantity}
                    </span>
                  ))}
                </div>
              )}
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">รวมทั้งหมด</p>
                  <p className="text-2xl font-bold text-foreground">{totalCartPrice.toLocaleString()} บาท</p>
                </div>
                <Button
                  size="lg"
                  onClick={handleCheckout}
                  disabled={!canCheckout}
                  className="h-14 px-8 text-lg bg-primary hover:bg-primary/90"
                >
                  <Check className="w-6 h-6 mr-2" />
                  ยืนยันซื้อ
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Food Detail Modal */}
      {selectedFood && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-card w-full max-w-md rounded-3xl shadow-2xl overflow-hidden border-2 border-chart-2/20">
            <div className="flex items-center justify-between p-4 border-b border-border bg-chart-2/5">
              <h2 className="text-xl font-bold text-foreground flex items-center gap-3">
                <span className="text-3xl">
                  {selectedFood.type === 'food' ? '🍗' : selectedFood.type === 'growth-potion' ? '⚗️' : '💉'}
                </span>
                {selectedFood.name}
              </h2>
              <button
                onClick={() => setSelectedFood(null)}
                className="p-2 rounded-xl hover:bg-secondary transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="text-center">
                <span className="text-6xl">
                  {selectedFood.type === 'food' ? '🍗' : selectedFood.type === 'growth-potion' ? '⚗️' : '💉'}
                </span>
                <p className="text-3xl font-bold text-chart-2 mt-4">{selectedFood.price} บาท</p>
              </div>
              
              <div className="bg-secondary/50 rounded-2xl p-4 space-y-3">
                {selectedFood.type === 'food' && (
                  <>
                    <div className="flex justify-between items-center py-2 border-b border-border">
                      <span className="text-muted-foreground">เติมความหิว</span>
                      <span className="font-bold text-chart-2 text-lg">+{selectedFood.hungerBoost}%</span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-border">
                      <span className="text-muted-foreground">ชะลอความหิว</span>
                      <span className="font-bold text-primary text-lg">{selectedFood.hungerSlowdown} วินาที</span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-border">
                      <span className="text-muted-foreground">เพิ่มคุณภาพไข่</span>
                      <span className="font-bold text-chart-4 text-lg">+{selectedFood.qualityBoost}x</span>
                    </div>
                    {selectedFood.growthBoost > 0 && (
                      <div className="flex justify-between items-center py-2">
                        <span className="text-muted-foreground">เร่งการเติบโต</span>
                        <span className="font-bold text-primary text-lg">+{selectedFood.growthBoost}%</span>
                      </div>
                    )}
                  </>
                )}
                {selectedFood.type === 'growth-potion' && (
                  <>
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">เพิ่มระดับ</span>
                      <span className="font-bold text-primary text-lg">+1 ระดับทันที</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">ผลต่อคุณภาพ</span>
                      <span className="font-bold text-destructive text-lg">{selectedFood.qualityBoost}x</span>
                    </div>
                    <p className="text-sm text-muted-foreground pt-2 border-t border-border">
                      ใช้ได้กับไก่ระดับ 1-2 เท่านั้น
                    </p>
                  </>
                )}
                {selectedFood.type === 'egg-potion' && (
                  <>
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">เร่งการออกไข่</span>
                      <span className="font-bold text-primary text-lg">+50%</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">ผลต่อคุณภาพ</span>
                      <span className="font-bold text-destructive text-lg">{selectedFood.qualityBoost}x</span>
                    </div>
                    <p className="text-sm text-muted-foreground pt-2 border-t border-border">
                      ใช้ได้กับไก่ระดับ 3 ที่ยังไม่มีไข่เท่านั้น
                    </p>
                  </>
                )}
              </div>
              
              <Button
                onClick={() => setSelectedFood(null)}
                className="w-full h-12 text-lg"
              >
                ปิด
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Inventory Modal */}
      {showInventory && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-card w-full max-w-2xl max-h-[90vh] rounded-3xl shadow-2xl flex flex-col overflow-hidden border-2 border-chart-4/20">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-4 border-b border-border bg-chart-4/5">
              <h2 className="text-2xl font-bold text-foreground flex items-center gap-3">
                <Package className="w-7 h-7 text-chart-4" />
                กระเป๋า
              </h2>
              <button
                onClick={() => setShowInventory(false)}
                className="p-2 rounded-xl hover:bg-secondary transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="flex-1 overflow-auto p-4 space-y-4">
              {/* Eggs */}
              <div>
                <h3 className="text-lg font-bold text-foreground mb-3 flex items-center gap-2">
                  <span className="text-2xl">🥚</span>
                  ไข่ที่เก็บได้ ({state.eggs.length} ฟอง)
                </h3>
                
                {state.eggs.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground bg-secondary/50 rounded-2xl">
                    <span className="text-5xl block mb-3">🥚</span>
                    <p className="font-medium">ยังไม่มีไข่ในกระเป๋า</p>
                    <p className="text-sm mt-1">รอให้ไก่ออกไข่แล้วมาเก็บนะ!</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-3">
                    {Object.entries(groupedEggs)
                      .sort(([, a], [, b]) => b.price - a.price)
                      .map(([key, group]) => {
                        const qualityInfo = getQualityLabel(group.avgQuality)
                        return (
                          <div
                            key={key}
                            className="bg-secondary/50 rounded-2xl p-4 text-center"
                          >
                            <div className="flex items-center justify-center gap-1 mb-2">
                              <span className="text-3xl">🥚</span>
                              <span className="text-2xl font-bold text-foreground">x{group.eggs.length}</span>
                            </div>
                            <div className={cn('text-sm font-medium flex items-center justify-center gap-1', qualityInfo.color)}>
                              <Star className="w-4 h-4" />
                              {qualityInfo.label}
                            </div>
                            <p className="text-lg font-bold text-chart-2 mt-1">
                              {group.price} บาท/ฟอง
                            </p>
                          </div>
                        )
                      })}
                  </div>
                )}
              </div>

              {/* Food */}
              {foodItems.length > 0 && (
                <div>
                  <h3 className="text-lg font-bold text-foreground mb-3 flex items-center gap-2">
                    <span className="text-2xl">📦</span>
                    อาหารในคลัง
                  </h3>
                  <div className="space-y-2">
                    {foodItems.map((food) => (
                      <div
                        key={food.id}
                        className="flex items-center gap-3 bg-secondary/50 rounded-xl p-3"
                      >
                        <div className="w-10 h-10 rounded-xl bg-background flex items-center justify-center shrink-0">
                          <span className="text-xl">
                            {food.type === 'food' ? '🍗' : food.type === 'growth-potion' ? '⚗️' : '💉'}
                          </span>
                        </div>
                        <span className="flex-1 font-medium text-foreground">{food.name}</span>
                        <div className="flex flex-col items-end gap-2 shrink-0 w-28">
                          <span className="bg-primary text-primary-foreground h-10 flex items-center justify-center rounded-sm text-lg font-bold w-full">
                            x{food.quantity}
                          </span>

                          <button
                            onClick={() => {
                              sellFood(food.id)
                              setSellMessage(`+${food.price} บาท`)
                              setTimeout(() => setSellMessage(null), 1000)
                            }}
                            disabled={food.quantity <= 0}
                            className="bg-red-500 hover:bg-red-600 text-white h-10 w-full flex items-center justify-center rounded-sm text-sm font-semibold"
                          >
                            ขาย {food.price} บาท
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Fixed Sell Footer */}
            {state.eggs.length > 0 && (
              <div className="border-t border-border bg-card p-4">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">มูลค่ารวม</p>
                    <p className="text-2xl font-bold text-chart-2 flex items-center gap-2">
                      <Coins className="w-6 h-6" />
                      {totalEggValue.toLocaleString()} บาท
                    </p>
                  </div>
                  <Button
                    size="lg"
                    onClick={handleSellEggs}
                    className="h-14 px-8 text-lg bg-chart-2 hover:bg-chart-2/90"
                  >
                    <Coins className="w-6 h-6 mr-2" />
                    ขายไข่
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
