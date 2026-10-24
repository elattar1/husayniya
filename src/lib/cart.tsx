import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

export type CartItem = { product_id: string; name: string; price: number; qty: number };
type Cart = { store_id: string | null; store_name: string; items: CartItem[] };
type CartCtx = Cart & {
  add: (store: { id: string; name: string }, item: Omit<CartItem, "qty">) => boolean;
  setQty: (product_id: string, qty: number) => void;
  clear: () => void;
  count: number;
  subtotal: number;
};

const empty: Cart = { store_id: null, store_name: "", items: [] };
const Ctx = createContext<CartCtx | null>(null);
const KEY = "husseiniya-cart";

export function CartProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<Cart>(empty);
  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) setCart(JSON.parse(raw));
    } catch {}
  }, []);
  const save = (c: Cart) => {
    setCart(c);
    localStorage.setItem(KEY, JSON.stringify(c));
  };

  const add: CartCtx["add"] = (store, item) => {
    if (cart.store_id && cart.store_id !== store.id && cart.items.length) {
      if (!confirm(`سلتك فيها منتجات من "${cart.store_name}". هل تريد تفريغها والبدء من جديد؟`)) return false;
      save({ store_id: store.id, store_name: store.name, items: [{ ...item, qty: 1 }] });
      return true;
    }
    const existing = cart.items.find((i) => i.product_id === item.product_id);
    const items = existing
      ? cart.items.map((i) => (i.product_id === item.product_id ? { ...i, qty: i.qty + 1 } : i))
      : [...cart.items, { ...item, qty: 1 }];
    save({ store_id: store.id, store_name: store.name, items });
    return true;
  };
  const setQty = (product_id: string, qty: number) => {
    const items = cart.items
      .map((i) => (i.product_id === product_id ? { ...i, qty } : i))
      .filter((i) => i.qty > 0);
    save(items.length ? { ...cart, items } : empty);
  };

  return (
    <Ctx.Provider
      value={{
        ...cart,
        add,
        setQty,
        clear: () => save(empty),
        count: cart.items.reduce((s, i) => s + i.qty, 0),
        subtotal: cart.items.reduce((s, i) => s + i.qty * i.price, 0),
      }}
    >
      {children}
    </Ctx.Provider>
  );
}

export const useCart = () => {
  const c = useContext(Ctx);
  if (!c) throw new Error("CartProvider missing");
  return c;
};
