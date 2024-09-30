'use client'

import { useState, useEffect } from 'react'
import { onValue, ref, set, push, remove } from 'firebase/database'
import { database } from './firebase'
import LobbyComponent from './components/LobbyComponent'
import DrawingComponent from './components/DrawingComponent'
import VotingComponent from './components/VotingComponent'
import ResultsComponent from './components/ResultsComponent'
import ResetGameComponent from './components/ResetGameComponent'
import ScoreboardComponent from './components/ScoreboardComponent'

type GameState = 'lobby' | 'drawing' | 'voting' | 'results'

export default function Home() {
  const [gameState, setGameState] = useState<GameState>('lobby')
  const [players, setPlayers] = useState<string[]>([])
  const [currentPlayer, setCurrentPlayer] = useState<string | null>(null)
  const [currentArtist, setCurrentArtist] = useState<string | null>(null)
  const [drawing, setDrawing] = useState<string | null>(null)
  const [drawingType, setDrawingType] = useState<'poop' | 'cloud' | null>(null)
  const [votes, setVotes] = useState<Record<string, 'poop' | 'cloud'>>({})
  const [scores, setScores] = useState<Record<string, number>>({})

  useEffect(() => {
    const gameStateRef = ref(database, 'gameState')
    const playersRef = ref(database, 'players')
    const currentArtistRef = ref(database, 'currentArtist')
    const drawingRef = ref(database, 'drawing')
    const drawingTypeRef = ref(database, 'drawingType')
    const votesRef = ref(database, 'votes')
    const scoresRef = ref(database, 'scores')

    const unsubscribeGameState = onValue(gameStateRef, (snapshot) => {
      setGameState(snapshot.val() || 'lobby')
    })

    const unsubscribePlayers = onValue(playersRef, (snapshot) => {
      setPlayers(snapshot.val() ? Object.values(snapshot.val()) : [])
    })

    const unsubscribeCurrentArtist = onValue(currentArtistRef, (snapshot) => {
      setCurrentArtist(snapshot.val())
    })

    const unsubscribeDrawing = onValue(drawingRef, (snapshot) => {
      setDrawing(snapshot.val())
    })

    const unsubscribeDrawingType = onValue(drawingTypeRef, (snapshot) => {
      setDrawingType(snapshot.val())
    })

    const unsubscribeVotes = onValue(votesRef, (snapshot) => {
      setVotes(snapshot.val() || {})
    })

    const unsubscribeScores = onValue(scoresRef, (snapshot) => {
      setScores(snapshot.val() || {})
    })

    // Load player name from local storage
    const storedPlayerName = localStorage.getItem('playerName')
    if (storedPlayerName) {
      setCurrentPlayer(storedPlayerName)
      handleJoin(storedPlayerName)
    }

    return () => {
      unsubscribeGameState()
      unsubscribePlayers()
      unsubscribeCurrentArtist()
      unsubscribeDrawing()
      unsubscribeDrawingType()
      unsubscribeVotes()
      unsubscribeScores()
    }
  }, [])

  const handleJoin = (name: string) => {
    setCurrentPlayer(name)
    // Store player name in local storage
    localStorage.setItem('playerName', name)
    const playerRef = push(ref(database, 'players'))
    set(playerRef, name)
  }

  const handleStartGame = () => {
    const randomArtist = players[Math.floor(Math.random() * players.length)]
    set(ref(database, 'currentArtist'), randomArtist)
    set(ref(database, 'gameState'), 'drawing')
    set(ref(database, 'votes'), {})
    set(ref(database, 'drawing'), null)
    set(ref(database, 'drawingType'), null)
  }

  const handleSubmitDrawing = (drawingData: string, type: 'poop' | 'cloud') => {
    set(ref(database, 'drawing'), drawingData)
    set(ref(database, 'drawingType'), type)
    set(ref(database, 'gameState'), 'voting')
  }

  const handleVote = (player: string, vote: 'poop' | 'cloud') => {
    set(ref(database, `votes/${player}`), vote)
    if (Object.keys(votes).length + 1 === players.length - 1) {
      set(ref(database, 'gameState'), 'results')
      updateScores()
    }
  }

  const updateScores = () => {
    const newScores = { ...scores }
    let correctVotes = 0
    Object.values(votes).forEach((vote) => {
      if (vote === drawingType) {
        correctVotes++
      }
    })
    if (currentArtist) {
      newScores[currentArtist] = (newScores[currentArtist] || 0) + correctVotes
    }
    set(ref(database, 'scores'), newScores)
  }

  const handleNextRound = () => {
    const currentIndex = players.indexOf(currentArtist!)
    const nextArtist = players[(currentIndex + 1) % players.length]
    set(ref(database, 'currentArtist'), nextArtist)
    set(ref(database, 'gameState'), 'drawing')
    set(ref(database, 'votes'), {})
    set(ref(database, 'drawing'), null)
    set(ref(database, 'drawingType'), null)
  }

  const handleResetGame = () => {
    set(ref(database, 'gameState'), 'lobby')
    set(ref(database, 'players'), null)
    set(ref(database, 'currentArtist'), null)
    set(ref(database, 'drawing'), null)
    set(ref(database, 'drawingType'), null)
    set(ref(database, 'votes'), null)
    set(ref(database, 'scores'), null)
    setCurrentPlayer(null)
    // Clear player name from local storage
    localStorage.removeItem('playerName')
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <h1 className="text-4xl font-bold mb-8">Poop or Cloud?</h1>
      {gameState === 'lobby' && (
        <LobbyComponent
          players={players}
          onJoin={handleJoin}
          onStart={handleStartGame}
          currentPlayer={currentPlayer}
        />
      )}
      {gameState === 'drawing' && (
        <DrawingComponent
          artist={currentArtist!}
          onSubmit={handleSubmitDrawing}
          isCurrentPlayer={currentPlayer === currentArtist}
        />
      )}
      {gameState === 'voting' && (
        <VotingComponent
          drawing={drawing!}
          players={players}
          currentArtist={currentArtist!}
          onVote={handleVote}
          currentPlayer={currentPlayer!}
        />
      )}
      {gameState === 'results' && (
        <ResultsComponent
          drawing={drawing!}
          drawingType={drawingType!}
          votes={votes}
          onNextRound={handleNextRound}
        />
      )}
      <ScoreboardComponent scores={scores} />
      <ResetGameComponent onReset={handleResetGame} />
    </main>
  )
}