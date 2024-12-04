import  { useState, useEffect, useRef} from 'react';
import { Button } from "@/components/ui/button"
import { Generate } from '@google/generative-ai';

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"

import {
Card,
CardContent,
CardDescription,
CardFooter,
CardHeader,
CardTitle,
} from "@/components/ui/card"

import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer"



const opciones = [
  {
    nombre: "Inicio",
    componente: () => <Componente1/>,
  },
  {
    nombre: "Catálogo",
    componente: () => <h2>Página de catálogo</h2>,
  },
  {
    nombre: "Acerca de nosotros",
    componente: () => <h3>Página Acerca de nosotros</h3>,
  },
];

 


const Componente1=() => {
const [antologias, setAntologias] = useState([]);   


  
  useEffect(() => {
    const fetchAntologias = async () => {
      try {
        const response = await fetch('http://localhost:3000/antologia');
        const data = await response.json();
        setAntologias(data);
      } catch (error) {
        console.error('Error al obtener las antologías:', error);
      }
    };

    fetchAntologias();
  }, []);
    return (
      <>
      <div>
     {/* <div className="mx-auto max-w-7xl py-6 sm:px-6 lg:px-8">*/}
        
        
       <div className="flex flex-wrap justify-center">
       
      {antologias.map((antologia) => (
        <div key={antologia.id} className="w-full sm:max-w-md p-2">
          
          <Card className="bg-yellow-50 hover:bg-lime-100 transition-colors duration-300 w-[400px] m-2">
          <img
  src={antologia.Autor.urlfoto}
  alt="Imagen del autor"
  className="w-full h-48 object-cover rounded-lg"
/>
          <CardHeader>
        
          <CardTitle>
           
  <p className="flex items-center">
  <div className="flex justify-center">
  
</div>
  {antologia.Autor.nombre}
  
</p>
          </CardTitle>
          <div className="flex items-center justify-between">
  <CardDescription>
    <p><b>{antologia.titulo}</b></p>
    {antologia.tituloObra}
  </CardDescription>

  <div className="relative">
    <button
      className="text-gray-500 hover:text-red-500 focus:outline-none"
      aria-label="Like"
    >
      <svg
        className="h-6 w-6"
        fill="currentColor"
        viewBox="0 0 20 20"
      >
        <path
          fillRule="evenodd"
          d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z"
          clipRule="evenodd"
        />
      </svg>
    </button>
  </div>
</div> 
          </CardHeader>  
          <CardContent>
          <pre>
    {antologia.contenido.split('\n').slice(0, 7).join('\n')}
    {/* las primeras 7 líneas de antologia.contenido */}
    ...
  </pre>
          </CardContent>
          
          
         {/*  <CardDescription className="p-4 text-justify">ddd</CardDescription>*/}
          <CardFooter>
          <Drawer>
  <DrawerTrigger>
  <Button>Ver antología</Button>
  </DrawerTrigger>
  <DrawerContent className="flex flex-col h-full">
    <DrawerHeader>
      <DrawerTitle>Antología</DrawerTitle>
      <DrawerDescription>{antologia.titulo}</DrawerDescription>
    </DrawerHeader>
    <div className="flex-1 overflow-y-auto p-4">
      <pre>{antologia.contenido}</pre>
      
      {/* Contenido adicional aquí */}
      <Accordion type="single" collapsible>
  <AccordionItem value="item-1">
    <AccordionTrigger>Biblliografía</AccordionTrigger>
    <AccordionContent>
      <div className='p-5'>
    <img
  src={antologia.Autor.urlfoto}
  alt="Imagen del autor"
  className="w-48 h-48 object-cover rounded-lg"
/>
    </div>
    <pre className="p-5 mt-5 mb-5 mx-0 w-full whitespace-pre-wrap text-justify typing">{antologia.Autor.biografia}</pre>
      
    </AccordionContent>
  </AccordionItem>
  <AccordionItem value="item-2">
    <AccordionTrigger>IA Generativa</AccordionTrigger>
    <AccordionContent>
     {/* <div className='p-5'>
      
      <h1>Aplicación de chat de IA con la API de Gemini</h1>
      <input type="text" value={prompt} onChange={(e) => setPrompt(e.target.value)} />
      <button onClick={handleSubmit}>Generar texto</button>
      <div>{response}</div>
    
      </div>*/}
    
      
    </AccordionContent>
  </AccordionItem>
</Accordion>

    </div>
    <DrawerFooter className="mt-auto">
      
      <DrawerClose>
        <Button variant="outline">Cerrar</Button>
      </DrawerClose>
    </DrawerFooter>
  </DrawerContent>
</Drawer>
          </CardFooter>
          </Card>
        </div>
      ))}
    </div>
       </div>
      
      </>
    );
  
}

function App() {
  const [opcionSeleccionada, setOpcionSeleccionada] = useState(opciones[0]);

  const handleClickOpcion = (opcion) => {
    setOpcionSeleccionada(opcion);
  };

  return (
    <>

<div className="min-h-full">
    <nav className="bg-lime-600">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
            <div className="flex items-center">
            <div className="flex">
                <img className="object-contain h-10"  src="https://www.ucol.mx/cms/beta2/img/logos/UdeC_2L%20izq_Negro%2080_.png" alt="Your Company"/>
            </div>
            <div className="hidden md:block">
                <div className="ml-10 flex items-baseline space-x-4">
                
                <a href="#" className="bg-oliven-900 text-white rounded-md px-3 py-2 text-sm font-medium" aria-current="page">Antologías</a>
                <button className="text-lime-300 hover:bg-lime-700 hover:text-white rounded-md px-3 py-2 text-sm font-medium"
                 onClick={() => handleClickOpcion(opciones[0])}
                 >Inicio</button>
                
                <button className="text-lime-300 hover:bg-lime-700 hover:text-white rounded-md px-3 py-2 text-sm font-medium"
                onClick={() => handleClickOpcion(opciones[1])}
                >Catalogo</button>
                <a href="#" className="text-lime-300 hover:bg-lime-700 hover:text-white rounded-md px-3 py-2 text-sm font-medium">Calendar</a>
                <a href="#" className="text-lime-300 hover:bg-lime-700 hover:text-white rounded-md px-3 py-2 text-sm font-medium">Reports</a>
                </div>
            </div>
            </div>
            <div className="hidden md:block">
            <div className="ml-4 flex items-center md:ml-6">
                <button type="button" className="relative rounded-full bg-lime-600 p-1 text-lime-400 hover:text-white focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-lime-600">
                <span className="absolute -inset-1.5"></span>
                <span className="sr-only">View notifications</span>
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
                </svg>
                </button>

            
                <div className="relative ml-3">
                <div>
                    <button type="button" className="relative flex max-w-xs items-center rounded-full bg-lime-600 text-sm focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-lime-600" id="user-menu-button" aria-expanded="false" aria-haspopup="true">
                    <span className="absolute -inset-1.5"></span>
                    <span className="sr-only">Open user menu</span>
                    <img className="h-8 w-8 rounded-full" src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80" alt=""/>
                    </button>
                </div>

                
                <div className="absolute right-0 z-10 mt-2 w-48 origin-top-right rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none" role="menu" aria-orientation="vertical" aria-labelledby="user-menu-button" tabIndex="-1">
                
                    <a href="#" className="block px-4 py-2 text-sm text-lime-700" role="menuitem" tabIndex="-1" id="user-menu-item-0">Tu perfil</a>
                    <a href="#" className="block px-4 py-2 text-sm text-lime-700" role="menuitem" tabIndex="-1" id="user-menu-item-1">Configuración</a>
                    <a href="#" className="block px-4 py-2 text-sm text-lime-700" role="menuitem" tabIndex="-1" id="user-menu-item-2">Salir</a>
                </div>
                </div>
            </div>
            </div>
            <div className="-mr-2 flex md:hidden">
            
            <button type="button" className="relative inline-flex items-center justify-center rounded-md bg-lime-600 p-2 text-lime-400 hover:bg-lime-700 hover:text-white focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-lime-600" aria-controls="mobile-menu" aria-expanded="false">
                <span className="absolute -inset-0.5"></span>
                <span className="sr-only">Open main menu</span>
                
                <svg className="block h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
                </svg>
                
                <svg className="hidden h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
            </button>
            </div>
        </div>
        </div>

        <div className="md:hidden" id="mobile-menu">
        <div className="space-y-1 px-2 pb-3 pt-2 sm:px-3">
        
            <a href="#" className="bg-lime-900 text-white block rounded-md px-3 py-2 text-base font-medium" aria-current="page">Antologías</a>
            <button className="text-lime-300 hover:bg-lime-700 hover:text-white block rounded-md px-3 py-2 text-base font-medium"
            onClick={() => handleClickOpcion(opciones[0])}
            >Inicio</button>
            <button className="text-lime-300 hover:bg-lime-700 hover:text-white block rounded-md px-3 py-2 text-base font-medium"
            onClick={() => handleClickOpcion(opciones[1])}
            >Catalogo</button>
            
            <a href="#" className="text-lime-300 hover:bg-lime-700 hover:text-white block rounded-md px-3 py-2 text-base font-medium">Calendar</a>
            <a href="#" className="text-lime-300 hover:bg-lime-700 hover:text-white block rounded-md px-3 py-2 text-base font-medium">Reports</a>
        </div>
        <div className="border-t border-lime-700 pb-3 pt-4">
            <div className="flex items-center px-5">
            <div className="flex-shrink-0">
                <img className="h-10 w-10 rounded-full" src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80" alt=""/>
            </div>
            <div className="ml-3">
                <div className="text-base font-medium leading-none text-white">Juan Perez</div>
                <div className="text-sm font-medium leading-none text-lime-400">juan@ucol.mx</div>
            </div>
            <button type="button" className="relative ml-auto flex-shrink-0 rounded-full bg-lime-600 p-1 text-lime-400 hover:text-white focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-lime-600">
                <span className="absolute -inset-1.5"></span>
                <span className="sr-only">View notifications</span>
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
                </svg>
            </button>
            </div>
            <div className="mt-3 space-y-1 px-2">
            <a href="#" className="block rounded-md px-3 py-2 text-base font-medium text-lime-400 hover:bg-lime-700 hover:text-white">Tu perfil</a>
            <a href="#" className="block rounded-md px-3 py-2 text-base font-medium text-lime-400 hover:bg-lime-700 hover:text-white">Configuración</a>
            <a href="#" className="block rounded-md px-3 py-2 text-base font-medium text-lime-400 hover:bg-lime-700 hover:text-white">Salirt</a>
            </div>
        </div>
        </div>
    </nav>

    <header className="bg-white shadow">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold tracking-tight text-lime-900">Colima en su poesía</h1>
        <h1 className="text-2xl font-bold tracking-tight text-lime-900">Antología interactiva con apoyo de inteligencia artificial</h1>
        </div>
    </header>
      <main>
        {opcionSeleccionada.componente()}
      </main>
      </div>
    </>
  );
}

export default App;
