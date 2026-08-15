import { useState } from 'react'
import Header from './components/Header'
import Home from './pages/Home'
import BrowsePage from './features/browse/BrowsePage'
import CartPage from './features/cart/CartPage'
import { CartProvider } from './lib/CartContext'

function App() {
  const [activePage, setActivePage] = useState('home')

  return (
    <CartProvider>
      <Header activePage={activePage} onNavigate={setActivePage} />
      {activePage === 'browse' && <BrowsePage />}
      {activePage === 'cart' && <CartPage onNavigate={setActivePage} />}
      {activePage !== 'browse' && activePage !== 'cart' && <Home />}
    </CartProvider>
  )
}

export default App
