import { useEffect, useState } from 'preact/hooks'

export const Pokemon = ({ pokemon }: { pokemon: string }) => {
  const [pokemonData, setPokemonData] = useState<null | any>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!pokemon) return

    setLoading(true)
    fetch(`https://pokeapi.co/api/v2/pokemon/${pokemon}`)
      .then((d) => d.json())
      .then((d) => {
        setLoading(false)
        setPokemonData(d)
        setError('')
      })
      .catch((e) => setError(e.message || 'Something went wrong!'))
  }, [pokemon])

  if (error) {
    return <div className="pokemon__container">{error}</div>
  }

  if (loading) {
    return <div className="pokemon__container">Loading...</div>
  }

  if (!pokemonData) {
    return (
      <div className="pokemon__container">Select a pokemon to see info</div>
    )
  }

  return (
    <div className="pokemon__container">
      <img
        className="pokemon__image"
        src={pokemonData.sprites.front_default}
        alt={pokemonData.name}
      />
      <p className="pokemon__info">
        <b>Name:</b> {pokemonData.name}
      </p>
      <p className="pokemon__info">
        <b>Number:</b> {pokemonData.id}
      </p>
    </div>
  )
}
