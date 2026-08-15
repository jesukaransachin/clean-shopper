import { useState } from 'react'
import Header from './components/Header'
import Home from './pages/Home'
import BrowsePage from './features/browse/BrowsePage'
import CartPage from './features/cart/CartPage'
import { CartProvider } from './lib/CartContext'
import { SavedProductsProvider } from './lib/SavedProductsContext'

function App() {
  const [activePage, setActivePage] = useState('home')

  return (
    <CartProvider>
      <SavedProductsProvider>
        <Header activePage={activePage} onNavigate={setActivePage} />
        {activePage === 'browse' && <BrowsePage />}
        {activePage === 'cart' && <CartPage onNavigate={setActivePage} />}
        {activePage !== 'browse' && activePage !== 'cart' && <Home />}
      </SavedProductsProvider>
    </CartProvider>
  )
}

export default App
