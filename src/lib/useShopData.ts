import { useCallback, useEffect, useState } from "react";
import { store } from "./store";
import type { Barber, Booking, Service } from "./types";

type ShopData = {
  services: Service[];
  barbers: Barber[];
  bookings: Booking[];
};

/** Loads services, barbers and bookings, and lets a screen reload them after a change. */
export function useShopData() {
  const [data, setData] = useState<ShopData>({ services: [], barbers: [], bookings: [] });
  const [loading, setLoading] = useState(true);

  const reload = useCallback(async () => {
    const [services, barbers, bookings] = await Promise.all([
      store.listServices(),
      store.listBarbers(),
      store.listBookings(),
    ]);
    setData({ services: [...services], barbers: [...barbers], bookings: [...bookings] });
    setLoading(false);
  }, []);

  useEffect(() => {
    reload();
  }, [reload]);

  return { ...data, loading, reload };
}
