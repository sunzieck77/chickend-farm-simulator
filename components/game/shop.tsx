'use client'

import { useState } from 'react'
import { useGame } from '@/lib/game-context'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { CHICKEN_DATA, FOOD_ITEMS, CHICKEN_PRICE, ChickenBreed } from '@/lib/game-types'
import { ShoppingCart, Minus, Plus, Check, X } from 'lucide-react'
import { cn } from '@/lib/utils'

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

export function Shop() {
  const { state, buyChicken, buyFood, playSound } = useGame()
  const [cart, setCart] = useState<CartItem[]>([])

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
  }

  const clearCart = () => {
    setCart([])
    playSound('click')
  }

  return (
    <div className="space-y-4 p-4">
      {/* Cart Summary - Fixed at top */}
      <Card className={cn(
        'border-2 sticky top-0 z-10 transition-colors',
        cart.length > 0 ? 'border-primary bg-primary/5' : 'border-border'
      )}>
        <CardContent className="p-4">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                <ShoppingCart className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">ตะกร้าสินค้า</p>
                <p className="text-xl font-bold text-foreground">
                  {totalCartPrice.toLocaleString()} บาท
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              {cart.length > 0 && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={clearCart}
                  className="text-muted-foreground hover:text-destructive"
                >
                  <X className="w-5 h-5" />
                </Button>
              )}
              <Button
                size="lg"
                onClick={handleCheckout}
                disabled={!canCheckout}
                className="px-6 text-base"
              >
                <Check className="w-5 h-5 mr-2" />
                ยืนยันซื้อ
              </Button>
            </div>
          </div>
          
          {cart.length > 0 && (
            <div className="mt-3 pt-3 border-t border-border/50 flex flex-wrap gap-2">
              {cart.map(item => (
                <span 
                  key={`${item.type}-${item.id}`}
                  className="text-sm bg-secondary px-3 py-1 rounded-full"
                >
                  {item.name} x{item.quantity}
                </span>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Chickens Section */}
      <Card className="border-2 border-primary/20">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-3 text-primary text-xl">
            <span className="text-3xl">🐔</span>
            ร้านขายไก่
            <span className="text-sm font-normal text-muted-foreground ml-auto">
              ตัวละ {CHICKEN_PRICE} บาท
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {BREED_ORDER.map((breed) => {
              const data = CHICKEN_DATA[breed]
              const qty = getCartQuantity('chicken', breed)
              const maxQty = getMaxQuantity(CHICKEN_PRICE, qty)

              return (
                <div
                  key={breed}
                  className={cn(
                    'bg-secondary/50 rounded-2xl p-5 text-center transition-all',
                    qty > 0 && 'ring-2 ring-primary bg-primary/5'
                  )}
                >
                  <img
                    src={breed === 'meat' ? 'https://i.ibb.co/sdq6dkpn/C1.png' :
                         breed === 'egg' ? 'https://i.ibb.co/N2FmTHL7/C2.png' :
                         breed === 'bantam' ? 'https://i.ibb.co/GvWRybyk/C3.png' :
                         'https://i.ibb.co/QqJBywn/C4.png'}
                    alt={data.name}
                    className="w-20 h-20 mx-auto mb-3 object-contain"
                  />
                  <h3 className="font-bold text-lg text-foreground">{data.name}</h3>
                  <p className="text-sm text-muted-foreground mb-4 min-h-[40px]">
                    {BREED_DESCRIPTIONS[breed]}
                  </p>
                  
                  {/* Quantity Selector */}
                  <div className="flex items-center justify-center gap-3">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => updateCart('chicken', breed, data.name, CHICKEN_PRICE, -1)}
                      disabled={qty === 0}
                      className="h-10 w-10 rounded-xl"
                    >
                      <Minus className="w-4 h-4" />
                    </Button>
                    <span className="text-xl font-bold min-w-[40px] text-foreground">{qty}</span>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => updateCart('chicken', breed, data.name, CHICKEN_PRICE, 1)}
                      disabled={maxQty <= qty}
                      className="h-10 w-10 rounded-xl"
                    >
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Food Section */}
      <Card className="border-2 border-chart-2/20">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-3 text-chart-2 text-xl">
            <span className="text-3xl">🌾</span>
            ร้านขายอาหาร
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {FOOD_ITEMS.map((food) => {
              const qty = getCartQuantity('food', food.id)
              const maxQty = getMaxQuantity(food.price, qty)
              const inInventory = state.inventory[food.id] || 0

              return (
                <div
                  key={food.id}
                  className={cn(
                    'flex items-center gap-4 bg-secondary/50 rounded-2xl p-4 transition-all',
                    qty > 0 && 'ring-2 ring-chart-2 bg-chart-2/5'
                  )}
                >
                  {/* Icon */}
                  <div className="w-14 h-14 rounded-xl bg-background flex items-center justify-center shrink-0">
                    <span className="text-3xl">
                      {food.type === 'food' ? '🍗' : food.type === 'growth-potion' ? '⚗️' : '💉'}
                    </span>
                  </div>
                  
                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-foreground">{food.name}</h3>
                      {inInventory > 0 && (
                        <span className="text-xs bg-primary/20 text-primary px-2 py-0.5 rounded-full">
                          มี {inInventory}
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      {food.type === 'food' 
                        ? `+${food.hungerBoost} หิว | +${food.qualityBoost}x คุณภาพ${food.growthBoost > 0 ? ` | +${food.growthBoost}% เติบโต` : ''}`
                        : food.type === 'growth-potion'
                        ? `เพิ่มระดับ 1 ทันที | ${food.qualityBoost}x คุณภาพ`
                        : `เร่งไข่ 50% (ใช้ได้เฉพาะระดับ 3) | ${food.qualityBoost}x คุณภาพ`
                      }
                    </p>
                  </div>
                  
                  {/* Price */}
                  <div className="text-right shrink-0">
                    <p className="text-lg font-bold text-foreground">{food.price} บาท</p>
                  </div>
                  
                  {/* Quantity Selector */}
                  <div className="flex items-center gap-2 shrink-0">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => updateCart('food', food.id, food.name, food.price, -1)}
                      disabled={qty === 0}
                      className="h-10 w-10 rounded-xl"
                    >
                      <Minus className="w-4 h-4" />
                    </Button>
                    <span className="text-xl font-bold min-w-[40px] text-center text-foreground">{qty}</span>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => updateCart('food', food.id, food.name, food.price, 1)}
                      disabled={maxQty <= qty}
                      className="h-10 w-10 rounded-xl"
                    >
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
