import { CharacterLabel, EnsembleLabel } from './labels'
import { scene, character} from './types'

export default function SceneCard({scene, ensemble}: {scene:scene, ensemble?:boolean}){
    
    const n = scene.name?scene.name:'Unnamed scene'
    let stCol:string
    switch (scene.status){
      case 'unrehearsed':
        stCol = 'text-red-700'
        break
      case 'rehearsed':
        stCol = 'text-orange-500'
        break
      case 'ready':
        stCol = 'text-green-500'
        break
      default:
        stCol = 'text-gray-500'
        break
    }

    return(
      <div className='size-min-48 grow p-1 border rounded-lg shadow-xl bg-gray-100'>
        <h3 className="text-sm font-bold">{n}</h3>
        {scene.pages?<p className='text-xs'><span className=''>Pages</span> <span className='text-gray-500'>{scene.pages}</span></p>:''}
        <p className={`text-xs font-semibold ${stCol}`}>{scene.status}</p>
        <p className="text-xs font-semibold">Characters</p>
        <ul className='text-xs'>
          {scene.characters.map((char:character, i:number) => <li key={i}><CharacterLabel character={char} /></li>)}
        </ul>
          {scene.ensemble?<p key='ensemble' className='text-xs font-semibold'><EnsembleLabel ensemble={scene.ensemble} /></p>:''}
      </div>
    )
  }
