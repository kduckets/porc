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
import { DrawingEntry } from './types'

type GameState = 'lobby' | 'drawing' | 'voting'

export default function Home() {
  const [gameState, setGameState] = useState<GameState>('lobby')
  const [players, setPlayers] = useState<string[]>([])
  const [currentPlayer, setCurrentPlayer] = useState<string | null>(null)
  const [currentArtist, setCurrentArtist] = useState<string | null>(null)
  const [drawing, setDrawing] = useState<string | null>(null)
  const [drawingType, setDrawingType] = useState<'poop' | 'cloud' | null>(null)
  const [drawingTitle, setDrawingTitle] = useState<string | null>(null)
  const [votes, setVotes] = useState<Record<string, { vote: 'poop' | 'cloud', comment: string }>>({})
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

  const handleVote = async (player: string, vote: 'poop' | 'cloud', comment: string) => {
    if (!players.includes(player)) return // Ensure only joined players can vote

    await set(ref(database, `votes/${player}`), { vote, comment })
  }

  const updateScores = async () => {
    const newScores = { ...scores }
  
    Object.entries(votes).forEach(([player, { vote }]) => {
      if (vote === drawingType) {
        // Player voted correctly
        newScores[player] = (newScores[player] || 0) + 1
        
        // Artist gets a point for each correct vote
        if (currentArtist) {
          newScores[currentArtist] = (newScores[currentArtist] || 0) + 1
        }
      }
    })
  
    await set(ref(database, 'scores'), newScores)
  }

  const handleNextRound = async (nextArtist: string) => {
    await updateScores()

    // Save the drawing to the art gallery with votes and comments
    if (drawing && drawingType && drawingTitle && currentArtist) {
      const galleryRef = ref(database, 'gallery')
      const validComments: Record<string, { vote: 'poop' | 'cloud', comment: string }> = {}

      // Filter out any undefined or invalid comments
      Object.entries(votes).forEach(([player, voteData]) => {
        if (voteData && voteData.vote && voteData.comment !== undefined) {
          validComments[player] = {
            vote: voteData.vote,
            comment: voteData.comment
          }
        }
      })

      await push(galleryRef, {
        drawing,
        type: drawingType,
        title: drawingTitle,
        artist: currentArtist,
        comments: validComments
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

  const handleAddComment = async (drawingId: string, comment: string) => {
    if (!currentPlayer) return

    const drawingRef = ref(database, `gallery/${drawingId}/comments/${currentPlayer}`)
    await set(drawingRef, { vote: 'comment', comment })
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4 sm:p-6 md:p-8 lg:p-24">
      <div className="w-full max-w-4xl mx-auto bg-white bg-opacity-90 p-6 rounded-lg shadow-lg">
        <h1 className="text-3xl sm:text-4xl font-bold mb-4 sm:mb-8 text-center">Poop or Cloud?</h1>
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
        <GalleryComponent 
          gallery={gallery} 
          currentPlayer={currentPlayer}
          onAddComment={handleAddComment}
        />
        <ScoreboardComponent scores={scores} />
        {/* <ResetGameComponent onReset={handleResetGame} /> */}
      </div>
    </main>
  )
}