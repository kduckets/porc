'use client'

import { useState, useEffect } from 'react'
import { initializeApp, FirebaseApp } from 'firebase/app'
import { getDatabase, ref, onValue, set, push, get, Database, DataSnapshot } from 'firebase/database'
import LobbyComponent from './components/LobbyComponent'
import DrawingComponent from './components/DrawingComponent'
import VotingComponent from './components/VotingComponent'
import ResultsComponent from './components/ResultsComponent'
import ResetGameComponent from './components/ResetGameComponent'

// Initialize Firebase (replace with your own config)
const firebaseConfig = {
  // Your Firebase configuration here
  apiKey: "AIzaSyD_BK9yTbkNZXnJAoPfoV9uhbwm66YJDbQ",
  authDomain: "porc-1faa5.firebaseapp.com",
  projectId: "porc-1faa5",
  storageBucket: "porc-1faa5.appspot.com",
  messagingSenderId: "976470360542",
  appId: "1:976470360542:web:f64a89a066bba6e6f31d4f"
}

const app: FirebaseApp = initializeApp(firebaseConfig)
const database: Database = getDatabase(app)

type GameState = 'lobby' | 'drawing' | 'voting' | 'results'
type Player = string
type Vote = 'poop' | 'cloud'

interface GameData {
  state: GameState
  players: Player[]
  currentArtist: Player | null
  drawing: string | null
  drawingType: Vote | null
  votes: Record<Player, Vote>
  result: Vote | null
}

export default function Game() {
  const [gameState, setGameState] = useState<GameState>('lobby')
  const [players, setPlayers] = useState<Player[]>([])
  const [currentArtist, setCurrentArtist] = useState<Player | null>(null)
  const [drawing, setDrawing] = useState<string | null>(null)
  const [drawingType, setDrawingType] = useState<Vote | null>(null)
  const [votes, setVotes] = useState<Record<Player, Vote>>({})
  const [result, setResult] = useState<Vote | null>(null)
  const [currentPlayer, setCurrentPlayer] = useState<Player | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const gameRef = ref(database, 'game')
    const unsubscribe = onValue(gameRef, (snapshot: DataSnapshot) => {
      try {
        const data = snapshot.val() as GameData | null
        console.log('Firebase data updated:', data)
        if (data) {
          setGameState(data.state)
          setPlayers(Array.isArray(data.players) ? data.players : [])
          setCurrentArtist(data.currentArtist)
          setDrawing(data.drawing)
          setDrawingType(data.drawingType)
          setVotes(data.votes || {})
          setResult(data.result)
        }
      } catch (error) {
        console.error('Error processing game data:', error)
        setError('An error occurred while processing game data. Please try refreshing the page.')
      }
    }, (error) => {
      console.error('Firebase onValue error:', error)
      setError('An error occurred while connecting to the game. Please try again later.')
    })

    return () => unsubscribe()
  }, [])

  const joinGame = (playerName: Player) => {
    console.log('Joining game with name:', playerName)
    const gameRef = ref(database, 'game')
    get(gameRef).then((snapshot: DataSnapshot) => {
      const currentData = snapshot.val() as GameData | null
      const updatedPlayers = currentData && Array.isArray(currentData.players) 
        ? [...currentData.players, playerName] 
        : [playerName]
      set(gameRef, {
        ...currentData,
        players: updatedPlayers,
      })
      setCurrentPlayer(playerName)
    }).catch((error) => {
      console.error('Error joining game:', error)
      setError('An error occurred while joining the game. Please try again.')
    })
  }

  const startGame = () => {
    console.log('Starting game')
    if (players.length < 2) {
      setError('At least 2 players are required to start the game.')
      return
    }
    const randomArtist = players[Math.floor(Math.random() * players.length)]
    set(ref(database, 'game'), {
      state: 'drawing',
      currentArtist: randomArtist,
      players,
      drawing: null,
      drawingType: null,
      votes: {},
      result: null,
    }).catch((error) => {
      console.error('Error starting game:', error)
      setError('An error occurred while starting the game. Please try again.')
    })
  }

  const submitDrawing = (drawingData: string, drawingType: Vote) => {
    console.log('Submitting drawing')
    set(ref(database, 'game'), {
      state: 'voting',
      currentArtist,
      players,
      drawing: drawingData,
      drawingType,
      votes: {},
      result: null,
    }).catch((error) => {
      console.error('Error submitting drawing:', error)
      setError('An error occurred while submitting the drawing. Please try again.')
    })
  }

  const submitVote = (player: Player, vote: Vote) => {
    console.log('Submitting vote:', player, vote)
    const votesRef = ref(database, `game/votes/${player}`)
    set(votesRef, vote).then(() => {
      checkVotingComplete()
    }).catch((error) => {
      console.error('Error submitting vote:', error)
      setError('An error occurred while submitting your vote. Please try again.')
    })
  }

  const checkVotingComplete = () => {
    const votesRef = ref(database, 'game/votes')
    get(votesRef).then((snapshot: DataSnapshot) => {
      const votes = snapshot.val() as Record<Player, Vote> | null
      if (votes && Object.keys(votes).length === players.length - 1) {
        const voteCount = Object.values(votes).reduce((acc, vote) => {
          acc[vote] = (acc[vote] || 0) + 1
          return acc
        }, {} as Record<Vote, number>)
        const result: Vote = voteCount['poop'] > voteCount['cloud'] ? 'poop' : 'cloud'
        set(ref(database, 'game'), {
          state: 'results',
          currentArtist,
          players,
          drawing,
          drawingType,
          votes,
          result,
        })
      }
    }).catch((error) => {
      console.error('Error checking voting completion:', error)
      setError('An error occurred while processing votes. Please try refreshing the page.')
    })
  }

  const resetGame = () => {
    console.log('Resetting game and clearing players')
    set(ref(database, 'game'), {
      state: 'lobby',
      players: [],
      currentArtist: null,
      drawing: null,
      drawingType: null,
      votes: {},
      result: null,
    }).then(() => {
      setCurrentPlayer(null)
    }).catch((error) => {
      console.error('Error resetting game:', error)
      setError('An error occurred while resetting the game. Please try again.')
    })
  }

  console.log('Current game state:', gameState)
  console.log('Current players:', players)

  if (error) {
    return (
      <div className="container mx-auto p-4">
        <h1 className="text-3xl font-bold mb-4">Error</h1>
        <p className="text-red-500">{error}</p>
        <button 
          className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          onClick={() => setError(null)}
        >
          Dismiss
        </button>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-4">Poop or Cloud?</h1>
      {!currentPlayer && (
        <LobbyComponent 
          players={players} 
          onJoin={joinGame} 
          onStart={startGame} 
          currentPlayer={currentPlayer}
          gameInProgress={gameState !== 'lobby'}
        />
      )}
      {currentPlayer && gameState === 'lobby' && (
        <LobbyComponent 
          players={players} 
          onJoin={joinGame} 
          onStart={startGame} 
          currentPlayer={currentPlayer}
          gameInProgress={false}
        />
      )}
      {gameState === 'drawing' && currentArtist && (
        <DrawingComponent 
          artist={currentArtist} 
          onSubmit={submitDrawing} 
          isCurrentPlayer={currentPlayer === currentArtist}
        />
      )}
      {gameState === 'voting' && (
        <VotingComponent
          drawing={drawing}
          players={players}
          currentArtist={currentArtist}
          onVote={submitVote}
          currentPlayer={currentPlayer}
        />
      )}
      {gameState === 'results' && (
        <ResultsComponent
          result={result}
          votes={votes}
          drawing={drawing}
          drawingType={drawingType}
          onReset={() => startGame()}
        />
      )}
      <ResetGameComponent onReset={resetGame} />
    </div>
  )
}