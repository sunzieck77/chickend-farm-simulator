'use client'

import { useGame } from '@/lib/game-context'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { STARTING_MONEY, getEggPrice, CHICKEN_PRICE } from '@/lib/game-types'
import { Trophy, TrendingUp, TrendingDown, Egg, ShoppingCart, Utensils, RotateCcw } from 'lucide-react'

export function Summary() {
  const { state, resetGame } = useGame()

  // 🥚 มูลค่าไข่ที่ยังเหลืออยู่
  const remainingEggsValue = state.eggs.reduce(
    (sum, egg) => sum + getEggPrice(egg.quality),
    0
  )
  const finalMoney = state.money + remainingEggsValue

  // 💵 รายได้จากไข่ทั้งหมด (ขายแล้ว + ที่ยังไม่ขาย)
  const eggIncome = state.totalEggsSoldValue + remainingEggsValue

  // 🐔 ค่าไก่ทั้งหมด
  const chickenCost = state.totalChickensBought * CHICKEN_PRICE

  // 🍗 ค่าอาหารทั้งหมด
  const foodCost = state.totalFoodSpent

  // 📊 กำไร / ขาดทุนจริง
  const profit = eggIncome - (chickenCost + foodCost)
  const isProfit = profit >= 0
  const totalRevenue = eggIncome

  const aliveChickens = state.chickens.filter(c => !c.isDead).length
  const deadChickens = state.chickens.filter(c => c.isDead).length

  const handlePlayAgain = () => {
    resetGame()
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: 'url(https://mir-s3-cdn-cf.behance.net/project_modules/max_1200_webp/b952dc19204877.562d67ed78485.jpg)',
        }}
      />
      <div className="absolute inset-0 bg-black/50" />

      {/* Summary Card */}
      <div className="relative z-10 bg-card/95 backdrop-blur-sm rounded-3xl p-4 shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in duration-500 " >
        {/* Trophy */}
        <div className="text-center mb-6">
          <div className={`inline-flex p-4 rounded-full ${isProfit ? 'bg-chart-2/20' : 'bg-destructive/20'} mb-4`}>
            <Trophy className={`w-12 h-12 ${isProfit ? 'text-chart-2' : 'text-destructive'}`} />
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-2">
            จบเกม!
          </h1>
          <p className="text-muted-foreground">
            ผลงานของ {state.playerName}
          </p>
        </div>

        {/* Profit/Loss */}
        <Card className={`mb-6 border-2 ${isProfit ? 'border-chart-2/30 bg-chart-2/10' : 'border-destructive/30 bg-destructive/10'}`}>
          <CardContent className="p-4 text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              {isProfit ? (
                <TrendingUp className="w-6 h-6 text-chart-2" />
              ) : (
                <TrendingDown className="w-6 h-6 text-destructive" />
              )}
              <span className={`text-lg font-bold ${isProfit ? 'text-chart-2' : 'text-destructive'}`}>
                {isProfit ? 'กำไร' : 'ขาดทุน'}
              </span>
            </div>
            <p className={`text-4xl font-bold ${isProfit ? 'text-chart-2' : 'text-destructive'}`}>
              {isProfit ? '+' : ''}{profit.toLocaleString()} บาท
            </p>
            <p className="text-sm text-muted-foreground mt-2">
              เงินรวมทั้งสิ้น {totalRevenue.toLocaleString()} บาท
            </p>
          </CardContent>
        </Card>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          <div className="bg-secondary/50 rounded-xl p-4 text-center">
            <div className="text-2xl mb-1">💰</div>
            <p className="text-xs text-muted-foreground">ทุนเริ่มต้น</p>
            <p className="font-bold text-foreground">{STARTING_MONEY.toLocaleString()} บาท</p>
          </div>
          
          <div className="bg-secondary/50 rounded-xl p-4 text-center">
            <div className="text-2xl mb-1">🏦</div>
            <p className="text-xs text-muted-foreground">เงินสุดท้าย</p>
            <p className="font-bold text-foreground">{finalMoney.toLocaleString()} บาท</p>
          </div>

          <div className="bg-secondary/50 rounded-xl p-4 text-center">
            <ShoppingCart className="w-6 h-6 mx-auto mb-1 text-primary" />
            <p className="text-xs text-muted-foreground">ซื้อไก่</p>
            <p className="font-bold text-foreground">{state.totalChickensBought} ตัว</p>
          </div>

          <div className="bg-secondary/50 rounded-xl p-4 text-center">
            <Egg className="w-6 h-6 mx-auto mb-1 text-chart-4" />
            <p className="text-xs text-muted-foreground">ไข่ที่ผลิต</p>
            <p className="font-bold text-foreground">{state.totalEggsProduced} ฟอง</p>
          </div>

          <div className="bg-secondary/50 rounded-xl p-4 text-center">
            <div className="text-2xl mb-1">🐔</div>
            <p className="text-xs text-muted-foreground">ไก่รอดชีวิต</p>
            <p className="font-bold text-chart-2">{aliveChickens} ตัว</p>
          </div>

          <div className="bg-secondary/50 rounded-xl p-4 text-center">
            <div className="text-2xl mb-1">💀</div>
            <p className="text-xs text-muted-foreground">ไก่ตาย</p>
            <p className="font-bold text-destructive">{deadChickens} ตัว</p>
          </div>

          <div className="bg-secondary/50 rounded-xl p-4 text-center">
            <div className="text-2xl mb-1">💵</div>
          <p className="text-xs text-muted-foreground">ขายไข่ได้</p>
          <p className="font-bold text-foreground">
          {state.totalEggsSoldValue.toLocaleString()} บาท
          </p>
          </div>

          <div className="bg-secondary/50 rounded-xl p-4 text-center">
            <Utensils className="w-6 h-6 mx-auto mb-1 text-chart-5" />
            <p className="text-xs text-muted-foreground">ค่าอาหาร</p>
            <p className="font-bold text-foreground">{state.totalFoodSpent.toLocaleString()} บาท</p>
          </div>
        </div>

        {/* Remaining Eggs Notice */}
        {state.eggs.length > 0 && (
          <div className="bg-chart-4/20 rounded-xl p-3 mb-4 text-center">
            <p className="text-sm text-chart-4">
              ไข่คงเหลือ {state.eggs.length} ฟอง (มูลค่า {remainingEggsValue.toLocaleString()} บาท) รวมในผลลัพธ์แล้ว
            </p>
          </div>
        )}

        {/* Play Again Button */}
        <Button
          onClick={handlePlayAgain}
          className="w-full text-lg py-6 rounded-xl font-bold"
          size="lg"
        >
          <RotateCcw className="w-5 h-5 mr-2" />
          เล่นอีกครั้ง
        </Button>
      </div>
    </div>
  )
}
