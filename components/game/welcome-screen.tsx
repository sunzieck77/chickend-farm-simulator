'use client'

import { useState } from 'react'
import { useGame } from '@/lib/game-context'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Volume2, VolumeX, X } from 'lucide-react'
import { CHICKEN_DATA, FOOD_ITEMS, ChickenBreed, getChickenImage } from '@/lib/game-types'

const chickenImages: Record<ChickenBreed, string> = {
  meat: 'https://i.ibb.co/sdq6dkpn/C1.png',
  egg: 'https://i.ibb.co/N2FmTHL7/C2.png',
  bantam: 'https://i.ibb.co/GvWRybyk/C3.png',
  fighting: 'https://i.ibb.co/QqJBywn/C4.png',
}

export function WelcomeScreen() {
  const { state, setPlayerName, startGame, toggleSound, playSound } = useGame()
  const [name, setName] = useState('')
  const [showGuide, setShowGuide] = useState(false)

  const handleStart = () => {
    if (name.trim()) {
      playSound('click')
      setPlayerName(name.trim())
      startGame()
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      {/* BG */}
      <div 
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: 'url(https://mir-s3-cdn-cf.behance.net/project_modules/max_1200_webp/b952dc19204877.562d67ed78485.jpg)' }}
      />
      <div className="absolute inset-0 bg-black/40" />

      {/* Sound */}
      <button
        onClick={() => {
          playSound('click')
          toggleSound()
        }}
        className="absolute top-4 right-4 z-20 bg-card/90 p-3 rounded-full"
      >
        {state.soundEnabled ? <Volume2 /> : <VolumeX />}
      </button>

      {/* CARD */}
      <div className="relative z-10 bg-card/95 rounded-3xl p-8 max-w-md w-full text-center shadow-2xl">
        <img src="https://i.ibb.co/6RGn4ZRF/C0.png" className="w-24 mx-auto animate-bounce" />

        <h1 className="text-3xl font-bold text-primary mt-2">ฟาร์มไก่จำลอง</h1>
        <p className="text-muted-foreground mb-4">เลี้ยงไก่ เก็บไข่ สร้างกำไร!</p>

        {/* GUIDE BUTTON */}
        <Button
          variant="secondary"
          onClick={() => setShowGuide(true)}
          className="w-full mb-3"
        >
          📖 วิธีการเล่น
        </Button>

        <Input
          placeholder="กรอกชื่อ..."
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="text-center mb-3"
        />

        <Button onClick={handleStart} disabled={!name.trim()} className="w-full text-lg py-5">
          🎮 เริ่มเล่นเกม
        </Button>

        <p className="text-xs mt-3 text-muted-foreground">
          เวลาเล่น 10 นาที | เงินเริ่มต้น 1,000 บาท
        </p>
      </div>

      {/* GUIDE MODAL */}
      {showGuide && (
        <div className="fixed inset-0 bg-black/70 z-50 flex justify-center items-center p-4">
          <div className="bg-card max-w-4xl w-full max-h-[90vh] overflow-y-auto rounded-3xl p-6 relative">
            <button
              onClick={() => setShowGuide(false)}
              className="absolute top-4 right-4"
            >
              <X />
            </button>

            <h2 className="text-2xl font-bold mb-4 text-center">📘 วิธีการเล่น</h2>

            {/* LEVEL */}
            <h3 className="font-bold mb-2">ระดับไก่</h3>
            <div className="grid grid-cols-3 gap-3 mb-6">
              <div className="bg-secondary p-3 rounded-xl text-center">
                <img src="https://i.ibb.co/6RGn4ZRF/C0.png" className="mx-auto w-16" />
                <p>Level 1<br/>ลูกไก่</p>
              </div>
              <div className="bg-secondary p-3 rounded-xl text-center">
                <img src="https://i.ibb.co/sdq6dkpn/C1.png" className="mx-auto w-16" />
                <p>Level 2<br/>วัยรุ่น</p>
              </div>
              <div className="bg-secondary p-3 rounded-xl text-center">
                <img src="https://i.ibb.co/N2FmTHL7/C2.png" className="mx-auto w-16" />
                <p>Level 3<br/>พร้อมออกไข่</p>
              </div>
            </div>

            {/* CHICKENS */}
            <h3 className="font-bold mb-2">สายพันธุ์ไก่</h3>
            <div className="grid grid-cols-2 gap-4 mb-6">
              {Object.entries(CHICKEN_DATA).map(([key, data]) => (
                <div key={key} className="bg-secondary p-3 rounded-xl text-center">
                  <img src={chickenImages[key as ChickenBreed]} className="mx-auto w-20 mb-1" />
                  <p className="font-bold">{data.name}</p>

                  <div className="text-sm">
                    ความเร็วไข่: {data.eggSpeed * 50}%  
                    <div className="h-2 bg-muted rounded">
                      <div className="h-2 bg-chart-2 rounded" style={{ width: `${data.eggSpeed * 50}%` }} />
                    </div>

                    หิวเร็ว: {data.hungerRate * 50}%
                    <div className="h-2 bg-muted rounded">
                      <div className="h-2 bg-destructive rounded" style={{ width: `${data.hungerRate * 50}%` }} />
                    </div>

                    คุณภาพไข่: {data.baseQuality * 20}%
                    <div className="h-2 bg-muted rounded">
                      <div className="h-2 bg-chart-4 rounded" style={{ width: `${data.baseQuality * 20}%` }} />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* FOOD */}
            <h3 className="font-bold mb-2">อาหาร</h3>
            <div className="space-y-2">
              {FOOD_ITEMS.map(food => (
                <div key={food.id} className="bg-secondary p-3 rounded-xl flex gap-3">
                  <div className="text-2xl">
                    {food.type === 'food' ? '🍗' : food.type === 'growth-potion' ? '🧪' : '💉'}
                  </div>
                  <div className="flex-1">
                    <p className="font-bold">{food.name}</p>
                    <p className="text-xs text-muted-foreground">
                      +ความอิ่ม {food.hungerBoost}% | +คุณภาพ {food.qualityBoost * 100}% | +โต {food.growthBoost}%
                    </p>
                    {food.type === 'growth-potion' && (
                      <p className="text-xs text-destructive">
                        เร่งโต 1 ระดับ แต่ลดคุณภาพไข่
                      </p>
                    )}
                    {food.type === 'egg-potion' && (
                      <p className="text-xs text-primary">
                        ใช้ได้เฉพาะไก่เลเวล 3 เร่งการออกไข่ทันที
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>

          </div>
        </div>
      )}
    </div>
  )
}
