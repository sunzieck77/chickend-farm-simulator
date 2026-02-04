'use client'

import { useGame } from '@/lib/game-context'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { FOOD_ITEMS, getEggPrice } from '@/lib/game-types'
import { Egg, Package, Coins, Star } from 'lucide-react'
import { cn } from '@/lib/utils'

function getQualityLabel(quality: number): { label: string; color: string } {
  if (quality >= 3) return { label: 'พรีเมี่ยม', color: 'text-chart-4' }
  if (quality >= 2) return { label: 'ดีมาก', color: 'text-chart-2' }
  if (quality >= 1.5) return { label: 'ดี', color: 'text-primary' }
  return { label: 'ธรรมดา', color: 'text-muted-foreground' }
}

export function Inventory() {
  const { state, sellEggs, playSound } = useGame()

  const totalEggValue = state.eggs.reduce((sum, egg) => sum + getEggPrice(egg.quality), 0)

  const foodItems = FOOD_ITEMS.map(food => ({
    
    ...food,
    
    quantity: state.inventory[food.id] || 0,
  })).filter(f => f.quantity > 0)

  const handleSellEggs = () => {
    if (state.eggs.length > 0) {
      playSound('buy')
      sellEggs()
    }
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

  // Calculate average quality for each group
  Object.values(groupedEggs).forEach(group => {
    group.avgQuality = group.eggs.reduce((sum, e) => sum + e.quality, 0) / group.eggs.length
  })

  return (
    <div className="p-4 space-y-4">
      {/* Eggs Section */}
      <Card className="border-2 border-chart-4/20">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center gap-3 text-chart-4 text-xl">
              <span className="text-3xl">🥚</span>
              ไข่ที่เก็บได้
            </span>
            <span className="text-base font-normal text-muted-foreground">
              {state.eggs.length} ฟอง
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {state.eggs.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <span className="text-6xl block mb-4">🥚</span>
              <p className="text-xl font-medium">ยังไม่มีไข่ในกระเป๋า</p>
              <p className="text-base mt-2">รอให้ไก่ออกไข่แล้วมาเก็บนะ!</p>
            </div>
          ) : (
            <>
              {/* Grouped Eggs Display */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
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
                          <span className="text-4xl">🥚</span>
                          <span className="text-2xl font-bold text-foreground">x{group.eggs.length}</span>
                        </div>
                        <div className={cn('text-sm font-medium flex items-center justify-center gap-1', qualityInfo.color)}>
                          <Star className="w-4 h-4" />
                          {qualityInfo.label}
                        </div>
                        <p className="text-lg font-bold text-chart-2 mt-1">
                          {group.price} บาท/ฟอง
                        </p>
                        <p className="text-sm text-muted-foreground">
                          รวม {(group.price * group.eggs.length).toLocaleString()} บาท
                        </p>
                      </div>
                    )
                  })}
              </div>
              
              {/* Sell All Section */}
              <div className="bg-primary/10 rounded-2xl p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="text-center sm:text-left">
                  <p className="text-sm text-muted-foreground">มูลค่ารวมทั้งหมด</p>
                  <p className="text-3xl font-bold text-primary flex items-center gap-2">
                    <Coins className="w-7 h-7" />
                    {totalEggValue.toLocaleString()} บาท
                  </p>
                </div>
                <Button
                  onClick={handleSellEggs}
                  className="bg-chart-2 hover:bg-chart-2/90 text-primary-foreground h-14 px-8 text-lg"
                >
                  <Coins className="w-6 h-6 mr-2" />
                  ขายทั้งหมด
                </Button>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Food Items Section */}
      <Card className="border-2 border-chart-3/20">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-3 text-chart-3 text-xl">
            <span className="text-3xl">📦</span>
            อาหารในคลัง
          </CardTitle>
        </CardHeader>
        <CardContent>
          {foodItems.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <span className="text-6xl block mb-4">📦</span>
              <p className="text-xl font-medium">ยังไม่มีอาหารในคลัง</p>
              <p className="text-base mt-2">ไปซื้ออาหารที่ร้านค้าเพื่อให้ไก่กิน!</p>
            </div>
          ) : (
            <div className="space-y-3">
              {foodItems.map((food) => (
                <div
                  key={food.id}
                  className="flex items-center gap-4 bg-secondary/50 rounded-2xl p-4"
                >
                  <div className="w-14 h-14 rounded-xl bg-background flex items-center justify-center shrink-0">
                    <span className="text-3xl">
                      {food.type === 'food' ? '🍗' : food.type === 'growth-potion' ? '⚗️' : '💉'}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">

                    <p className="font-bold text-foreground">{food.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {food.type === 'food' 
                        ? `+${food.hungerBoost} หิว | +${food.qualityBoost}x คุณภาพ${food.growthBoost > 0 ? ` | +${food.growthBoost}% เติบโต` : ''}`
                        : food.type === 'growth-potion'
                        ? `เพิ่มระดับ 1 ทันที | ${food.qualityBoost}x คุณภาพ`
                        : `เร่งไข่ 50% (ระดับ 3) | ${food.qualityBoost}x คุณภาพ`
                      }
                    </p>
                  </div>
           
                    <span className="bg-primary text-primary-foreground px-4 py-2 rounded-xl text-lg font-bold">
                      x{food.quantity}
                    </span>
                   
     
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
