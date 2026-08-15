import { useState } from 'react'
import Header from './components/Header'
import BrowsePage from './features/browse/BrowsePage'
import CartPage from './features/cart/CartPage'
import { CartProvider } from './lib/CartContext'
import { SavedProductsProvider } from './lib/SavedProductsContext'

// Browse is the landing page — Home.jsx was removed. 'browse' is both the
// initial state and what the logo/"Research" nav item return to.
function App() {
  const [activePage, setActivePage] = useState('browse')

  return (
    <CartProvider>
      <SavedProductsProvider>
        <Header activePage={activePage} onNavigate={setActivePage} />
        {activePage === 'cart' ? <CartPage onNavigate={setActivePage} /> : <BrowsePage />}
      </SavedProductsProvider>
    </CartProvider>
  )
}

export default App
