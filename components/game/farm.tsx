'use client'

import { Home, Menu } from 'lucide-react'
import { useState } from 'react'
import { useGame } from '@/lib/game-context'
import { STARTING_MONEY } from "@/lib/game-types"
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { 
  Chicken, 
  CHICKEN_DATA, 
  FOOD_ITEMS, 
  getChickenImage, 
  getLevelName,
  getEggPrice 
} from '@/lib/game-types'
import { X, Utensils, Egg, Heart, TrendingUp, Star, Clock, Info, Sparkles, Zap, Shield } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ChickenCardProps {
  chicken: Chicken
  onSelect: () => void
  timeRemaining: number
}

function ChickenCard({ chicken, onSelect, timeRemaining }: ChickenCardProps) {
  const chickenData = CHICKEN_DATA[chicken.breed]
  const isLowHunger = chicken.hunger < 30
  const isCritical = chicken.hunger < 15
  const hasSlowdown = chicken.hungerSlowdownUntil > 0 && timeRemaining >= chicken.hungerSlowdownUntil

  return (
    <div
      onClick={onSelect}
      className={cn(
        'relative bg-card rounded-3xl p-3 sm:p-4 cursor-pointer transition-all duration-300 border-3 hover:scale-[1.03] active:scale-[0.98]',
        'shadow-lg hover:shadow-xl',
        chicken.isDead && 'opacity-50 grayscale pointer-events-none',
        isCritical && !chicken.isDead && 'animate-pulse border-destructive bg-destructive/10',
        !isCritical && !chicken.isDead && 'border-transparent hover:border-primary/50',
        chicken.hasEgg && !chicken.isDead && 'border-chart-4 bg-chart-4/5'
      )}
    >
      {/* Status Badges */}
      <div className="absolute top-2 left-2 flex flex-col gap-1">
        {hasSlowdown && !chicken.isDead && (
          <div className="bg-chart-2/90 text-chart-2-foreground text-[10px] px-2 py-0.5 rounded-full flex items-center gap-1 animate-pulse">
            <Shield className="w-3 h-3" />
            <span>ชะลอหิว</span>
          </div>
        )}
      </div>

      {/* Egg Notification */}
      {chicken.hasEgg && !chicken.isDead && (
        <div className="absolute -top-3 -right-3 z-10">
          <div className="relative">
            <div className="bg-chart-4 text-foreground rounded-full p-2.5 shadow-lg animate-bounce">
              <Egg className="w-6 h-6" />
            </div>
            <div className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-[10px] font-bold rounded-full w-5 h-5 flex items-center justify-center">
              !
            </div>
          </div>
        </div>
      )}

      {/* Death Indicator */}
      {chicken.isDead && (
        <div className="absolute inset-0 flex items-center justify-center bg-background/80 rounded-3xl z-10">
          <div className="text-center">
            <span className="text-5xl block mb-2">💀</span>
            <span className="text-sm text-muted-foreground">ตายแล้ว</span>
          </div>
        </div>
      )}

      {/* Chicken Image */}
      <div className="relative flex items-center justify-center h-20 sm:h-28 mb-2">
        <img
          src={getChickenImage(chicken.breed, chicken.level) || "/placeholder.svg"}
          alt={chickenData.name}
          className={cn(
            'h-full w-auto object-contain transition-transform drop-shadow-lg',
            chicken.level === 1 && 'scale-75',
            chicken.level === 2 && 'scale-90',
            isLowHunger && !chicken.isDead && 'animate-wiggle'
          )}
        />
        {/* Level indicator */}
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 bg-primary/90 text-primary-foreground text-[10px] font-bold px-2 py-0.5 rounded-full">
          Lv.{chicken.level}
        </div>
      </div>

      {/* Info */}
      <div className="text-center mb-2">
        <p className="font-bold text-foreground text-sm sm:text-base">{chickenData.name}</p>
        <p className="text-xs text-muted-foreground">{getLevelName(chicken.level)}</p>
      </div>

      {/* Hunger Bar */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-1">
            <Heart className={cn(
              'w-3.5 h-3.5',
              isCritical ? 'text-destructive animate-pulse' : isLowHunger ? 'text-chart-5' : 'text-chart-2'
            )} />
            <span className="text-muted-foreground">ความหิว</span>
          </div>
          <span className={cn(
            'font-bold',
            isCritical ? 'text-destructive' : isLowHunger ? 'text-chart-5' : 'text-chart-2'
          )}>
            {Math.round(chicken.hunger)}%
          </span>
        </div>
        <Progress 
          value={chicken.hunger} 
          className={cn(
            'h-3 rounded-full',
            isCritical ? '[&>div]:bg-destructive' : isLowHunger ? '[&>div]:bg-chart-5' : '[&>div]:bg-chart-2'
          )}
        />
      </div>

      {/* Growth/Egg Progress */}
      {!chicken.isDead && (
        <div className="mt-2 space-y-1.5">
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-1">
              {chicken.level < 3 ? (
                <TrendingUp className="w-3.5 h-3.5 text-primary" />
              ) : (
                <Egg className="w-3.5 h-3.5 text-chart-4" />
              )}
              <span className="text-muted-foreground">
                {chicken.level < 3 ? 'การเติบโต' : 'ไข่'}
              </span>
            </div>
            <span className={cn('font-bold', chicken.level < 3 ? 'text-primary' : 'text-chart-4')}>
              {Math.round(chicken.level < 3 ? chicken.growthProgress : chicken.eggProgress)}%
            </span>
          </div>
          <Progress 
            value={chicken.level < 3 ? chicken.growthProgress : chicken.eggProgress} 
            className={cn(
              'h-3 rounded-full',
              chicken.level < 3 ? '[&>div]:bg-primary' : '[&>div]:bg-chart-4'
            )}
          />
        </div>
      )}

      {/* Click hint */}
      {!chicken.isDead && (
        <div className="mt-3 text-center">
          <span className="text-[10px] text-muted-foreground bg-secondary px-2 py-1 rounded-full">
            แตะเพื่อดูแล
          </span>
        </div>
      )}
    </div>
  )
}

interface ChickenDetailModalProps {
  chicken: Chicken
  onClose: () => void
  onFeed: (foodId: string) => void
  onCollectEgg: () => void
  inventory: Record<string, number>
  timeRemaining: number
}

function ChickenDetailModal({ chicken, onClose, onFeed, onCollectEgg, inventory, timeRemaining }: ChickenDetailModalProps) {
  const [selectedFood, setSelectedFood] = useState<typeof FOOD_ITEMS[0] | null>(null)
  const chickenData = CHICKEN_DATA[chicken.breed]
  const availableFoods = FOOD_ITEMS.filter(f => inventory[f.id] > 0)
  const isLowHunger = chicken.hunger < 30
  const isCritical = chicken.hunger < 15
  const estimatedEggPrice = getEggPrice(chicken.eggQuality)
  const hasSlowdown = chicken.hungerSlowdownUntil > 0 && timeRemaining >= chicken.hungerSlowdownUntil
  const slowdownRemaining = hasSlowdown ? timeRemaining - chicken.hungerSlowdownUntil : 0

  return (
    <div 
      className="fixed inset-0 bg-black/70 flex items-center justify-center p-3 z-50 animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div 
        className="bg-card rounded-3xl p-4 sm:p-6 w-full max-w-lg shadow-2xl animate-in zoom-in-95 duration-200 max-h-[92vh] overflow-y-auto border-2 border-primary/20"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center">
              <img
                src={getChickenImage(chicken.breed, chicken.level) || "/placeholder.svg"}
                alt={chickenData.name}
                className="w-10 h-10 object-contain"
              />
            </div>
            <div>
              <h3 className="text-xl font-bold text-foreground">{chickenData.name}</h3>
              <p className="text-sm text-muted-foreground">{getLevelName(chicken.level)}</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-secondary/80 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Status Badges */}
        {hasSlowdown && (
          <div className="bg-chart-2/20 border border-chart-2/30 rounded-2xl p-3 mb-4 flex items-center gap-3">
            <Shield className="w-6 h-6 text-chart-2" />
            <div>
              <p className="font-bold text-chart-2">ชะลอความหิว</p>
              <p className="text-sm text-muted-foreground">เหลืออีก {slowdownRemaining} วินาที</p>
            </div>
          </div>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-3 mb-4 bg-green-100 p-4 rounded-2xl border-4 border-green-400 shadow-lg">
          {/* Level */}
          <div className="bg-gradient-to-br from-primary/10 to-primary/5 rounded-2xl p-3 border border-primary/20">
            <div className="flex items-center gap-2 text-primary text-sm mb-1">
              <TrendingUp className="w-4 h-4" />
              <span className="font-medium">ระดับ</span>
            </div>
            <p className="text-2xl font-bold text-foreground">{chicken.level}/3</p>
            {chicken.level < 3 && (
              <Progress value={chicken.growthProgress} className="h-2 mt-2 [&>div]:bg-primary" />
            )}
          </div>

          {/* Hunger */}
          <div className={cn(
            'rounded-2xl p-3 border',
            isCritical 
              ? 'bg-gradient-to-br from-destructive/20 to-destructive/10 border-destructive/30' 
              : isLowHunger 
              ? 'bg-gradient-to-br from-chart-5/20 to-chart-5/10 border-chart-5/30'
              : 'bg-gradient-to-br from-chart-2/10 to-chart-2/5 border-chart-2/20'
          )}>
            <div className={cn(
              'flex items-center gap-2 text-sm mb-1',
              isCritical ? 'text-destructive' : isLowHunger ? 'text-chart-5' : 'text-chart-2'
            )}>
              <Heart className="w-4 h-4" />
              <span className="font-medium">ความหิว</span>
            </div>
            <p className={cn(
              'text-2xl font-bold',
              isCritical ? 'text-destructive' : isLowHunger ? 'text-chart-5' : 'text-foreground'
            )}>
              {Math.round(chicken.hunger)}%
            </p>
            <Progress 
              value={chicken.hunger} 
              className={cn(
                'h-2 mt-2',
                isCritical ? '[&>div]:bg-destructive' : isLowHunger ? '[&>div]:bg-chart-5' : '[&>div]:bg-chart-2'
              )}
            />
          </div>

          {/* Quality */}
          <div className="bg-gradient-to-br from-chart-4/10 to-chart-4/5 rounded-2xl p-3 border border-chart-4/20">
            <div className="flex items-center gap-2 text-chart-4 text-sm mb-1">
              <Star className="w-4 h-4" />
              <span className="font-medium">คุณภาพไข่</span>
            </div>
            <p className="text-2xl font-bold text-chart-4">{chicken.eggQuality.toFixed(2)}x</p>
            <p className="text-xs text-muted-foreground mt-1">~{estimatedEggPrice} บาท/ฟอง</p>
          </div>

          {/* Egg Progress or Breed Info */}
          {chicken.level === 3 ? (
            <div className="bg-gradient-to-br from-chart-4/10 to-chart-4/5 rounded-2xl p-3 border border-chart-4/20">
              <div className="flex items-center gap-2 text-chart-4 text-sm mb-1">
                <Egg className="w-4 h-4" />
                <span className="font-medium">ความคืบหน้าไข่</span>
              </div>
              <p className="text-2xl font-bold text-foreground">{Math.round(chicken.eggProgress)}%</p>
              <Progress value={chicken.eggProgress} className="h-2 mt-2 [&>div]:bg-chart-4" />
            </div>
          ) : (
            <div className="bg-gradient-to-br from-secondary to-secondary/50 rounded-2xl p-3 border border-border">
              <div className="flex items-center gap-2 text-muted-foreground text-sm mb-1">
                <Zap className="w-4 h-4" />
                <span className="font-medium">ข้อมูลสายพันธุ์</span>
              </div>
              <div className="text-xs space-y-1 mt-2">
                <p>ไข่: <span className="font-bold text-foreground">{chickenData.eggSpeed}x</span></p>
                <p>หิว: <span className="font-bold text-foreground">{chickenData.hungerRate}x</span></p>
              </div>
            </div>
          )}
        </div>

        {/* Collect Egg Button */}
        {chicken.hasEgg && (
          <Button 
            onClick={onCollectEgg}
            size="lg"
            className="w-full mb-4 bg-gradient-to-r from-chart-4 to-chart-5 hover:from-chart-4/90 hover:to-chart-5/90 text-foreground h-16 text-lg font-bold shadow-lg"
          >
            <Egg className="w-7 h-7 mr-3" />
            เก็บไข่! (ขายได้ ~{estimatedEggPrice} บาท)
            <Sparkles className="w-5 h-5 ml-2 animate-pulse" />
          </Button>
        )}

        {/* Food Options */}
        <div className="space-y-3">
          <p className="text-sm font-bold text-foreground flex items-center gap-2">
            <Utensils className="w-4 h-4 text-primary" />
            เลือกอาหาร ({availableFoods.length} รายการ)
          </p>
          
          {availableFoods.length === 0 ? (
            <div className="text-center text-muted-foreground py-8 bg-secondary/30 rounded-2xl border-2 border-dashed border-border">
              <span className="text-5xl block mb-3">📦</span>
              <p className="font-bold">ไม่มีอาหารในกระเป๋า</p>
              <p className="text-sm">ไปซื้อที่ร้านค้ากันเถอะ!</p>
            </div>
          ) : (
            <div className="space-y-2 max-h-[250px] overflow-y-auto pr-1">
              {availableFoods.map((food) => {
                const isDisabled = 
                  (food.type === 'egg-potion' && chicken.level !== 3) ||
                  (food.type === 'growth-potion' && chicken.level >= 3)

                return (
                  <div
                    key={food.id}
                    className={cn(
                      'flex items-center gap-3 p-3 rounded-2xl transition-all border-2',
                      isDisabled 
                        ? 'bg-muted/30 opacity-60 border-transparent' 
                        : 'bg-secondary/50 hover:bg-secondary border-transparent hover:border-primary/30'
                    )}
                  >
                    <div className="w-12 h-12 rounded-xl bg-background flex items-center justify-center shrink-0 shadow-sm">
                      <span className="text-2xl">
                        {food.type === 'food' ? '🍗' : food.type === 'growth-potion' ? '⚗️' : '💉'}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-bold text-foreground">{food.name}</p>
                        <button
                          onClick={() => setSelectedFood(food)}
                          className="p-1.5 rounded-full bg-background hover:bg-primary/10 text-muted-foreground hover:text-primary shrink-0 transition-colors"
                        >
                          <Info className="w-4 h-4" />
                        </button>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {food.type === 'food' 
                          ? `+${food.hungerBoost}% หิว | ชะลอ ${food.hungerSlowdown}วิ`
                          : food.type === 'growth-potion'
                          ? '+1 ระดับทันที'
                          : '+50% ไข่'}
                      </p>
                    </div>
                    <span className="text-sm bg-primary/20 text-primary px-3 py-1.5 rounded-full font-bold shrink-0">
                      x{inventory[food.id]}
                    </span>
                    <Button
                      onClick={() => !isDisabled && onFeed(food.id)}
                      disabled={isDisabled}
                      size="sm"
                      className="h-11 px-5 shrink-0 font-bold"
                    >
                      ให้กิน
                    </Button>
                  </div>
                )
              })}
            </div>
          )}

          {/* Food Detail Overlay */}
          {selectedFood && (
            <div 
              className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-[60] animate-in fade-in duration-200"
              onClick={() => setSelectedFood(null)}
            >
              <div 
                className="bg-card rounded-3xl p-6 max-w-md w-full shadow-2xl animate-in zoom-in-95 duration-200 border-2 border-chart-2/20"
                onClick={e => e.stopPropagation()}
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-bold text-foreground flex items-center gap-3">
                    <span className="text-3xl">
                      {selectedFood.type === 'food' ? '🍗' : selectedFood.type === 'growth-potion' ? '⚗️' : '💉'}
                    </span>
                    {selectedFood.name}
                  </h3>
                  <button
                    onClick={() => setSelectedFood(null)}
                    className="p-2 rounded-xl hover:bg-secondary transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <div className="text-center mb-4">
                  <span className="text-7xl">
                    {selectedFood.type === 'food' ? '🍗' : selectedFood.type === 'growth-potion' ? '⚗️' : '💉'}
                  </span>
                </div>
                <div className="bg-secondary/50 rounded-2xl p-4 space-y-3">
                  {selectedFood.type === 'food' && (
                    <>
                      <div className="flex justify-between items-center py-2 border-b border-border">
                        <span className="text-muted-foreground flex items-center gap-2">
                          <Heart className="w-4 h-4" /> เติมความหิว
                        </span>
                        <span className="font-bold text-chart-2 text-lg">+{selectedFood.hungerBoost}%</span>
                      </div>
                      <div className="flex justify-between items-center py-2 border-b border-border">
                        <span className="text-muted-foreground flex items-center gap-2">
                          <Shield className="w-4 h-4" /> ชะลอความหิว
                        </span>
                        <span className="font-bold text-primary text-lg">{selectedFood.hungerSlowdown} วินาที</span>
                      </div>
                      <div className="flex justify-between items-center py-2 border-b border-border">
                        <span className="text-muted-foreground flex items-center gap-2">
                          <Star className="w-4 h-4" /> เพิ่มคุณภาพไข่
                        </span>
                        <span className="font-bold text-chart-4 text-lg">+{selectedFood.qualityBoost}x</span>
                      </div>
                      {selectedFood.growthBoost > 0 && (
                        <div className="flex justify-between items-center py-2">
                          <span className="text-muted-foreground flex items-center gap-2">
                            <TrendingUp className="w-4 h-4" /> เร่งการเติบโต
                          </span>
                          <span className="font-bold text-primary text-lg">+{selectedFood.growthBoost}%</span>
                        </div>
                      )}
                    </>
                  )}
                  {selectedFood.type === 'growth-potion' && (
                    <>
                      <div className="flex justify-between items-center py-2 border-b border-border">
                        <span className="text-muted-foreground">เพิ่มระดับ</span>
                        <span className="font-bold text-primary text-lg">+1 ระดับทันที</span>
                      </div>
                      <div className="flex justify-between items-center py-2">
                        <span className="text-muted-foreground">ผลต่อคุณภาพ</span>
                        <span className="font-bold text-destructive text-lg">{selectedFood.qualityBoost}x</span>
                      </div>
                      <p className="text-sm text-muted-foreground pt-2 border-t border-border text-center">
                        ใช้ได้กับไก่ระดับ 1-2 เท่านั้น
                      </p>
                    </>
                  )}
                  {selectedFood.type === 'egg-potion' && (
                    <>
                      <div className="flex justify-between items-center py-2 border-b border-border">
                        <span className="text-muted-foreground">เร่งการออกไข่</span>
                        <span className="font-bold text-chart-4 text-lg">+50%</span>
                      </div>
                      <div className="flex justify-between items-center py-2">
                        <span className="text-muted-foreground">ผลต่อคุณภาพ</span>
                        <span className="font-bold text-destructive text-lg">{selectedFood.qualityBoost}x</span>
                      </div>
                      <p className="text-sm text-muted-foreground pt-2 border-t border-border text-center">
                        ใช้ได้กับไก่ระดับ 3 ที่ยังไม่มีไข่เท่านั้น
                      </p>
                    </>
                  )}
                </div>
                <Button
                  onClick={() => setSelectedFood(null)}
                  className="w-full h-12 text-lg mt-4 font-bold"
                >
                  ปิด
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export function Farm() {
  const { state, feedChicken, collectEgg, playSound } = useGame()
  const [selectedChicken, setSelectedChicken] = useState<Chicken | null>(null)

  const aliveChickens = state.chickens.filter(c => !c.isDead)
  const deadChickens = state.chickens.filter(c => c.isDead)
  const chickensWithEgg = aliveChickens.filter(c => c.hasEgg).length
  const hungryChickens = aliveChickens.filter(c => c.hunger < 30).length
  const criticalChickens = aliveChickens.filter(c => c.hunger < 15).length

  const remainingEggsValue = state.eggs.reduce(
    (sum, egg) => sum + egg.quality, // หรือ getEggPrice(egg.quality)
    0
  )

  const finalMoney = state.money + remainingEggsValue

  // 📊 กำไร / ขาดทุน
  const profit = finalMoney - STARTING_MONEY
  const isProfit = profit >= 0   // 👈 ต้องมีบรรทัดนี้
  
  const handleFeed = (foodId: string) => {
    if (selectedChicken) {
      playSound('click')
      feedChicken(selectedChicken.id, foodId)
      // Update selected chicken reference
      setTimeout(() => {
        const updated = state.chickens.find(c => c.id === selectedChicken.id)
        if (updated) setSelectedChicken(updated)
      }, 50)
    }
  }

  const handleCollectEgg = () => {
    if (selectedChicken) {
      playSound('egg')
      collectEgg(selectedChicken.id)
      setSelectedChicken(null)
    }
  }

  // Sync selected chicken with state
  const currentSelectedChicken = selectedChicken 
    ? state.chickens.find(c => c.id === selectedChicken.id) || null
    : null

  return (
    <div className="p-3 sm:p-4">
      {/* Farm Header */}
      <div className="bg-gradient-to-r from-chart-2/20 via-primary/10 to-chart-4/20 rounded-3xl p-4 mb-4 border-2 border-chart-2/30">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-chart-2/20 rounded-2xl flex items-center justify-center">
              <span className="text-3xl">🏠</span>
            </div>
            <div>
              <h2 className="text-xl font-bold text-foreground">ฟาร์มของฉัน</h2>
              <span className={`px-3 py-1 rounded-full text-sm font-bold ${isProfit ? 'bg-green-500/20 text-green-600' : 'bg-red-500/20 text-red-600'}`}> {isProfit ? 'กำไร' : 'ขาดทุน'} {profit.toLocaleString()} บาท </span>
              <p className="text-sm text-muted-foreground">
                {aliveChickens.length} ตัว | {deadChickens.length > 0 && `${deadChickens.length} ตาย`}
              </p>
            </div>
          </div>
       

          {/* Status indicators */}
          <div className="flex flex-wrap gap-2">
            {chickensWithEgg > 0 && (
              <div className="flex items-center gap-1.5 bg-chart-4/20 text-chart-4 px-3 py-1.5 rounded-full animate-pulse">
                <Egg className="w-4 h-4" />
                <span className="font-bold">{chickensWithEgg} ไข่!</span>
              </div>
            )}
            {criticalChickens > 0 && (
              <div className="flex items-center gap-1.5 bg-destructive/20 text-destructive px-3 py-1.5 rounded-full animate-pulse">
                <Heart className="w-4 h-4" />
                <span className="font-bold">{criticalChickens} วิกฤต!</span>
              </div>
            )}
            {hungryChickens > 0 && criticalChickens === 0 && (
              <div className="flex items-center gap-1.5 bg-chart-5/20 text-chart-5 px-3 py-1.5 rounded-full">
                <Heart className="w-4 h-4" />
                <span className="font-bold">{hungryChickens} หิว</span>
              </div>
            )}
          </div>
                      
        </div>
      </div>

      {/* Chickens Grid */}
      {state.chickens.length === 0 ? (
        <div className="text-center py-16 bg-secondary/30 rounded-3xl border-2 border-dashed border-border">
          <span className="text-7xl block mb-4">🐣</span>
          <h3 className="text-xl font-bold text-foreground mb-2">ยังไม่มีไก่ในฟาร์ม</h3>
          <p className="text-muted-foreground">ไปซื้อไก่ที่ร้านค้ากันเถอะ!</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
          {state.chickens.map((chicken) => (
            <ChickenCard
              key={chicken.id}
              chicken={chicken}
              timeRemaining={state.timeRemaining}
              onSelect={() => {
                if (!chicken.isDead) {
                  playSound('click')
                  setSelectedChicken(chicken)
                }
              }}
            />
          ))}
        </div>
      )}

      {/* Chicken Detail Modal */}
      {currentSelectedChicken && (
        <ChickenDetailModal
          chicken={currentSelectedChicken}
          onClose={() => setSelectedChicken(null)}
          onFeed={handleFeed}
          onCollectEgg={handleCollectEgg}
          inventory={state.inventory}
          timeRemaining={state.timeRemaining}
        />
      )}
    </div>
  )
}
