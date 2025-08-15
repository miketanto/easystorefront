"use client";
import { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';

export interface CartItem { id: string; name: string; price: number; quantity: number; }
interface State { items: CartItem[]; }

type Action =
  | { type: 'ADD'; item: { id: string; name: string; price: number } }
  | { type: 'REMOVE'; id: string }
  | { type: 'INC'; id: string }
  | { type: 'DEC'; id: string }
  | { type: 'CLEAR' };

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'ADD': {
      const existing = state.items.find(i => i.id === action.item.id);
      if (existing) {
        return { items: state.items.map(i => i.id === existing.id ? { ...i, quantity: i.quantity + 1 } : i) };
      }
      return { items: [...state.items, { ...action.item, quantity: 1 }] };
    }
    case 'REMOVE': return { items: state.items.filter(i => i.id !== action.id) };
    case 'INC': return { items: state.items.map(i => i.id === action.id ? { ...i, quantity: i.quantity + 1 } : i) };
    case 'DEC': return { items: state.items.flatMap(i => i.id === action.id ? (i.quantity > 1 ? [{ ...i, quantity: i.quantity - 1 }] : []) : [i]) };
    case 'CLEAR': return { items: [] };
    default: return state;
  }
}

const CartContext = createContext<{
  items: CartItem[];
  add: (item: { id: string; name: string; price: number }) => void;
  inc: (id: string) => void;
  dec: (id: string) => void;
  remove: (id: string) => void;
  clear: () => void;
  total: number;
}>({ items: [], add: () => {}, inc: () => {}, dec: () => {}, remove: () => {}, clear: () => {}, total: 0 });

const LS_KEY = 'cart:v1';

export function CartProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, { items: [] });

  // load
  useEffect(() => {
    try {
      const raw = localStorage.getItem(LS_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as State;
        if (Array.isArray(parsed.items)) {
          dispatch({ type: 'CLEAR' });
          parsed.items.forEach(it => {
            for (let c = 0; c < it.quantity; c++) dispatch({ type: 'ADD', item: { id: it.id, name: it.name, price: it.price } });
          });
        }
      }
    } catch {}
  }, []);

  // persist
  useEffect(() => {
    localStorage.setItem(LS_KEY, JSON.stringify(state));
  }, [state]);

  const value = {
    items: state.items,
    add: (item: { id: string; name: string; price: number }) => dispatch({ type: 'ADD', item }),
    inc: (id: string) => dispatch({ type: 'INC', id }),
    dec: (id: string) => dispatch({ type: 'DEC', id }),
    remove: (id: string) => dispatch({ type: 'REMOVE', id }),
    clear: () => dispatch({ type: 'CLEAR' }),
    total: state.items.reduce((s,i)=>s + i.price * i.quantity,0)
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() { return useContext(CartContext); }
