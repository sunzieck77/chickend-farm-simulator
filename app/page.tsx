'use client'

import { GameProvider, useGame } from '@/lib/game-context'
import { WelcomeScreen } from '@/components/game/welcome-screen'
import { GameLayout } from '@/components/game/game-layout'
import { Summary } from '@/components/game/summary'

function GameContent() {
  const { state } = useGame()

  if (!state.gameStarted) {
    return <WelcomeScreen />
  }

  if (state.gameEnded) {
    return <Summary />
  }

  return <GameLayout />
}

export default function Home() {
  return (
    <GameProvider>
      <GameContent />
    </GameProvider>
  )
}
