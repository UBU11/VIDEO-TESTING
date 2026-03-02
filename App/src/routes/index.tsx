import { createFileRoute } from '@tanstack/react-router'
import { Link } from '@tanstack/react-router'


export const Route = createFileRoute('/')({ component: App })

function App() {

 return(<>
  <h1 className='text-3xl font-bold underline'>welcome to bunno</h1>
  <Link to="/connection">Start Video Call</Link>
 </>
 )
}
