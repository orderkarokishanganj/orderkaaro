import { useEffect } from 'react';

export function usePageTitle(title: string | null) {
  useEffect(() => {
    document.title = title ? `${title} | Order Kaaro` : 'Order Kaaro | Groceries in Kishanganj on WhatsApp';
  }, [title]);
}
