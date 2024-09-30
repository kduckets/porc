'use client'

import { useState, useEffect } from 'react'
import { onValue, ref, set, get, push } from 'firebase/database'
import { database } from './firebase'
import LobbyComponent from './components/LobbyComponent'
import DrawingComponent from './components/DrawingComponent'
import VotingComponent from './components/VotingComponent'
import ResetGameComponent from './components/ResetGameComponent'
import ScoreboardComponent from './components/ScoreboardComponent'
import GalleryComponent from './components/GalleryComponent'

type GameState = 'lobby' | 'drawing' | 'voting'

interface DrawingEntry {
  id: string
  drawing: string
  type: 'poop' | 'cloud'
  title: string
  artist: string
}

export default function Home() {
  const [gameState, setGameState] = useState<GameState>('lobby')
  const [players, setPlayers] = useState<string[]>([])
  const [currentPlayer, setCurrentPlayer] = useState<string | null>(null)
  const [currentArtist, setCurrentArtist] = useState<string | null>(null)
  const [drawing, setDrawing] = useState<string | null>(null)
  const [drawingType, setDrawingType] = useState<'poop' | 'cloud' | null>(null)
  const [drawingTitle, setDrawingTitle] = useState<string | null>(null)
  const [votes, setVotes] = useState<Record<string, 'poop' | 'cloud'>>({})
  const [scores, setScores] = useState<Record<string, number>>({})
  const [gallery, setGallery] = useState<DrawingEntry[]>([])

  useEffect(() => {
    const gameStateRef = ref(database, 'gameState')
    const playersRef = ref(database, 'players')
    const currentArtistRef = ref(database, 'currentArtist')
    const drawingRef = ref(database, 'drawing')
    const drawingTypeRef = ref(database, 'drawingType')
    const drawingTitleRef = ref(database, 'drawingTitle')
    const votesRef = ref(database, 'votes')
    const scoresRef = ref(database, 'scores')
    const galleryRef = ref(database, 'gallery')

    const unsubscribeGameState = onValue(gameStateRef, (snapshot) => {
      setGameState(snapshot.val() || 'lobby')
    })

    const unsubscribePlayers = onValue(playersRef, (snapshot) => {
      const playersData = snapshot.val()
      setPlayers(playersData ? Object.values(playersData) : [])
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

    const unsubscribeDrawingTitle = onValue(drawingTitleRef, (snapshot) => {
      setDrawingTitle(snapshot.val())
    })

    const unsubscribeVotes = onValue(votesRef, (snapshot) => {
      setVotes(snapshot.val() || {})
    })

    const unsubscribeScores = onValue(scoresRef, (snapshot) => {
      setScores(snapshot.val() || {})
    })

    const unsubscribeGallery = onValue(galleryRef, (snapshot) => {
      const galleryData = snapshot.val()
      if (galleryData) {
        const galleryArray = Object.entries(galleryData).map(([id, data]) => ({
          id,
          ...data as DrawingEntry
        }))
        setGallery(galleryArray)
      } else {
        setGallery([])
      }
    })

    // Load player name from local storage and join the game
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
      unsubscribeDrawingTitle()
      unsubscribeVotes()
      unsubscribeScores()
      unsubscribeGallery()
    }
  }, [])

  const handleJoin = async (name: string) => {
    const playersRef = ref(database, 'players')
    const playersSnapshot = await get(playersRef)
    const playersData = playersSnapshot.val()

    if (!playersData || !Object.values(playersData).includes(name)) {
      await set(ref(database, `players/${name}`), name)
    }

    setCurrentPlayer(name)
    localStorage.setItem('playerName', name)

    // Initialize or update score for the player
    const scoresRef = ref(database, `scores/${name}`)
    const scoreSnapshot = await get(scoresRef)
    if (!scoreSnapshot.exists()) {
      await set(scoresRef, 0)
    }
  }

  const handleStartGame = async () => {
    const playersSnapshot = await get(ref(database, 'players'))
    const playersData = playersSnapshot.val()
    const playersList = playersData ? Object.values(playersData) : []
    const randomArtist = playersList[Math.floor(Math.random() * playersList.length)]
    
    await set(ref(database, 'currentArtist'), randomArtist)
    await set(ref(database, 'gameState'), 'drawing')
    await set(ref(database, 'votes'), {})
    await set(ref(database, 'drawing'), null)
    await set(ref(database, 'drawingType'), null)
    await set(ref(database, 'drawingTitle'), null)
  }

  const handleSubmitDrawing = async (drawingData: string, type: 'poop' | 'cloud', title: string) => {
    await set(ref(database, 'drawing'), drawingData)
    await set(ref(database, 'drawingType'), type)
    await set(ref(database, 'drawingTitle'), title)
    await set(ref(database, 'gameState'), 'voting')
  }

  const handleVote = async (player: string, vote: 'poop' | 'cloud') => {
    if (!players.includes(player)) return // Ensure only joined players can vote

    await set(ref(database, `votes/${player}`), vote)
    const votesSnapshot = await get(ref(database, 'votes'))
    const votesData = votesSnapshot.val() || {}
    if (Object.keys(votesData).length === players.length - 1) {
      updateScores()
    }
  }

  const updateScores = async () => {
    const newScores = { ...scores }
    let correctVotes = 0
    const totalVotes = Object.keys(votes).length

    Object.entries(votes).forEach(([player, vote]) => {
      if (vote === drawingType) {
        correctVotes++
        newScores[player] = (newScores[player] || 0) + 1
      }
    })

    // Award 1 point to the artist if the majority guessed correctly
    if (currentArtist && correctVotes > totalVotes / 2) {
      newScores[currentArtist] = (newScores[currentArtist] || 0) + 1
    }

    await set(ref(database, 'scores'), newScores)
  }

  const handleNextRound = async (nextArtist: string) => {
    await updateScores()

    // Save the current drawing to the gallery
    if (drawing && drawingType && drawingTitle && currentArtist) {
      const galleryRef = ref(database, 'gallery')
      await push(galleryRef, {
        drawing,
        type: drawingType,
        title: drawingTitle,
        artist: currentArtist
      })
    }

    await set(ref(database, 'currentArtist'), nextArtist)
    await set(ref(database, 'gameState'), 'drawing')
    await set(ref(database, 'votes'), {})
    await set(ref(database, 'drawing'), null)
    await set(ref(database, 'drawingType'), null)
    await set(ref(database, 'drawingTitle'), null)
  }

  const handleResetGame = async () => {
    await set(ref(database, 'gameState'), 'lobby')
    await set(ref(database, 'players'), {})
    await set(ref(database, 'currentArtist'), null)
    await set(ref(database, 'drawing'), null)
    await set(ref(database, 'drawingType'), null)
    await set(ref(database, 'drawingTitle'), null)
    await set(ref(database, 'votes'), {})
    await set(ref(database, 'scores'), {})
    setCurrentPlayer(null)
    localStorage.removeItem('playerName')
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4 sm:p-8 md:p-24">
      <h1 className="text-4xl font-bold mb-8">Poop or Cloud?</h1>
      {gameState === 'lobby' && (
        <LobbyComponent
          players={players}
          onStart={handleStartGame}
          currentPlayer={currentPlayer}
          onJoin={handleJoin}
        />
      )}
      {gameState === 'drawing' && (
        <DrawingComponent
          artist={currentArtist!}
          onSubmit={handleSubmitDrawing}
          isCurrentPlayer={currentPlayer === currentArtist}
          onJoin={handleJoin}
          currentPlayer={currentPlayer}
        />
      )}
      {gameState === 'voting' && (
        <VotingComponent
          drawing={drawing!}
          players={players}
          currentArtist={currentArtist!}
          onVote={handleVote}
          currentPlayer={currentPlayer}
          votes={votes}
          onJoin={handleJoin}
          onNextRound={handleNextRound}
        />
      )}
      <GalleryComponent gallery={gallery} />
      <ScoreboardComponent scores={scores} />
      <ResetGameComponent onReset={handleResetGame} />
    </main>
  )
}