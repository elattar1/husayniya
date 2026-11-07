import { useState, useEffect, useRef } from "react";
import { 
  MapPin, 
  Navigation, 
  Crosshair, 
  Search, 
  Check, 
  Sparkles, 
  Loader2, 
  X,
  Compass,
  Map as MapIcon
} from "lucide-react";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  DEFAULT_HUSAYNIYA_CENTER, 
  HUSAYNIYA_LANDMARKS, 
  extractCoordinates, 
  formatAddressWithCoordinates, 
  cleanDisplayAddress,
  type Coordinates 
} from "@/lib/map-utils";

interface MapLocationPickerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialAddress?: string;
  onConfirm: (fullAddress: string, coords: Coordinates) => void;
}

declare global {
  interface Window {
    L?: any;
  }
}

export function MapLocationPicker({
  open,
  onOpenChange,
  initialAddress = "",
  onConfirm,
}: MapLocationPickerProps) {
  const existingCoords = extractCoordinates(initialAddress);
  const [selectedCoords, setSelectedCoords] = useState<Coordinates>(
    existingCoords || DEFAULT_HUSAYNIYA_CENTER
  );
  const [addressDetails, setAddressDetails] = useState<string>(
    cleanDisplayAddress(initialAddress)
  );
  const [isLocating, setIsLocating] = useState(false);
  const [mapLoaded, setMapLoaded] = useState(false);

  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markerInstanceRef = useRef<any>(null);

  // Sync state if initialAddress changes when opened
  useEffect(() => {
    if (open) {
      const coords = extractCoordinates(initialAddress);
      const initial = coords || DEFAULT_HUSAYNIYA_CENTER;
      setSelectedCoords(initial);
      setAddressDetails(cleanDisplayAddress(initialAddress));
    }
  }, [open, initialAddress]);

  // Load Leaflet dynamically from CDN when dialog opens
  useEffect(() => {
    if (!open) return;

    let isMounted = true;

    async function loadLeaflet() {
      if (window.L) {
        if (isMounted) setMapLoaded(true);
        return;
      }

      // Check if stylesheet is already attached
      if (!document.getElementById("leaflet-css")) {
        const link = document.createElement("link");
        link.id = "leaflet-css";
        link.rel = "stylesheet";
        link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
        document.head.appendChild(link);
      }

      // Check if script is already attached
      if (!document.getElementById("leaflet-js")) {
        const script = document.createElement("script");
        script.id = "leaflet-js";
        script.src = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";
        script.async = true;
        script.onload = () => {
          if (isMounted) setMapLoaded(true);
        };
        script.onerror = () => {
          console.warn("Failed to load Leaflet script, using fallback");
        };
        document.head.appendChild(script);
      } else {
        const checkInterval = setInterval(() => {
          if (window.L) {
            clearInterval(checkInterval);
            if (isMounted) setMapLoaded(true);
          }
        }, 100);
      }
    }

    loadLeaflet();

    return () => {
      isMounted = false;
    };
  }, [open]);

  // Initialize or update Leaflet map once loaded and container is available
  useEffect(() => {
    if (!open || !mapLoaded || !mapContainerRef.current || !window.L) return;

    const L = window.L;

    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        center: [selectedCoords.lat, selectedCoords.lng],
        zoom: 16,
        zoomControl: false,
      });

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '&copy; OpenStreetMap',
        maxZoom: 19,
      }).addTo(map);

      // Add zoom control in a friendly corner
      L.control.zoom({ position: "bottomright" }).addTo(map);

      // Custom marker icon
      const customIcon = L.divIcon({
        className: "custom-leaflet-marker",
        html: `
          <div style="position: relative; width: 36px; height: 36px; transform: translate(-50%, -100%);">
            <div style="width: 36px; height: 36px; background: #dc2626; border-radius: 50% 50% 50% 0; transform: rotate(-45deg); display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 12px rgba(0,0,0,0.3); border: 2.5px solid white;">
              <div style="width: 10px; height: 10px; background: white; border-radius: 50%; transform: rotate(45deg);"></div>
            </div>
            <div style="width: 14px; height: 6px; background: rgba(0,0,0,0.25); border-radius: 50%; margin: 2px auto 0; filter: blur(1px);"></div>
          </div>
        `,
        iconSize: [36, 36],
        iconAnchor: [18, 36],
      });

      const marker = L.marker([selectedCoords.lat, selectedCoords.lng], {
        icon: customIcon,
        draggable: true,
      }).addTo(map);

      marker.on("dragend", () => {
        const pos = marker.getLatLng();
        setSelectedCoords({ lat: pos.lat, lng: pos.lng });
      });

      map.on("click", (e: any) => {
        const { lat, lng } = e.latlng;
        marker.setLatLng([lat, lng]);
        setSelectedCoords({ lat, lng });
      });

      mapInstanceRef.current = map;
      markerInstanceRef.current = marker;

      // Ensure proper sizing in dialog
      setTimeout(() => {
        map.invalidateSize();
      }, 250);
    } else {
      mapInstanceRef.current.setView([selectedCoords.lat, selectedCoords.lng]);
      if (markerInstanceRef.current) {
        markerInstanceRef.current.setLatLng([selectedCoords.lat, selectedCoords.lng]);
      }
      setTimeout(() => {
        mapInstanceRef.current?.invalidateSize();
      }, 100);
    }

    return () => {
      // Clean up on unmount or close
      if (!open && mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
        markerInstanceRef.current = null;
      }
    };
  }, [open, mapLoaded]);

  // Handle GPS detection
  function handleLocateMe() {
    if (!navigator.geolocation) {
      toast.error("متصفحك لا يدعم تحديد الموقع الجغرافي");
      return;
    }

    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setIsLocating(false);
        const coords = {
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        };
        setSelectedCoords(coords);

        if (mapInstanceRef.current) {
          mapInstanceRef.current.flyTo([coords.lat, coords.lng], 17, { duration: 1.2 });
        }
        if (markerInstanceRef.current) {
          markerInstanceRef.current.setLatLng([coords.lat, coords.lng]);
        }
        toast.success("تم تحديد موقعك بدقة عبر الـ GPS 🎯");
      },
      (err) => {
        setIsLocating(false);
        let msg = "تعذر الحصول على موقعك الحالي";
        if (err.code === err.PERMISSION_DENIED) {
          msg = "يرجى السماح بصلاحية الموقع من إعدادات المتصفح";
        }
        toast.error(msg);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  }

  // Handle Landmark Selection
  function selectLandmark(landmark: typeof HUSAYNIYA_LANDMARKS[number]) {
    const coords = { lat: landmark.lat, lng: landmark.lng };
    setSelectedCoords(coords);
    if (mapInstanceRef.current) {
      mapInstanceRef.current.flyTo([coords.lat, coords.lng], 17, { duration: 0.8 });
    }
    if (markerInstanceRef.current) {
      markerInstanceRef.current.setLatLng([coords.lat, coords.lng]);
    }
    if (!addressDetails) {
      setAddressDetails(`بالقرب من ${landmark.name}`);
    }
  }

  // Confirm selection
  function handleConfirm() {
    const base = addressDetails.trim() || "الحسينية";
    const fullAddress = formatAddressWithCoordinates(base, selectedCoords);
    onConfirm(fullAddress, selectedCoords);
    onOpenChange(false);
    toast.success("تم تثبيت عنوانك وموقعك على الخريطة بنجاح 📍");
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg w-full p-0 gap-0 overflow-hidden rounded-2xl flex flex-col h-[90vh] sm:h-[650px]">
        {/* Header */}
        <DialogHeader className="p-4 border-b bg-card shrink-0 text-right space-y-1">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-base font-bold flex items-center gap-2">
              <MapPin className="size-5 text-primary" />
              تحديد موقع التوصيل على الخريطة
            </DialogTitle>
          </div>
          <DialogDescription className="text-xs text-muted-foreground">
            انقر على الخريطة أو حرك المؤشر لتحديد موقع منزلك بدقة لمساعدة كابتن التوصيل
          </DialogDescription>
        </DialogHeader>

        {/* Quick Landmarks */}
        <div className="border-b bg-muted/40 px-3 py-2 shrink-0 flex items-center gap-1.5 overflow-x-auto no-scrollbar">
          <Sparkles className="size-3.5 text-primary shrink-0 ml-1" />
          <span className="text-[11px] font-semibold text-muted-foreground shrink-0">معالم سريعة:</span>
          {HUSAYNIYA_LANDMARKS.map((item, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => selectLandmark(item)}
              className="text-xs whitespace-nowrap bg-card hover:bg-primary/10 hover:text-primary text-foreground px-2.5 py-1 rounded-full transition-colors font-medium border border-border/60 shrink-0"
            >
              {item.name}
            </button>
          ))}
        </div>

        {/* Map Container */}
        <div className="relative flex-1 bg-muted/30 overflow-hidden">
          <div ref={mapContainerRef} className="w-full h-full" style={{ minHeight: "280px" }} />

          {/* Floating GPS Button */}
          <Button
            type="button"
            variant="default"
            size="sm"
            onClick={handleLocateMe}
            disabled={isLocating}
            className="absolute top-3 right-3 z-[1000] shadow-md bg-card hover:bg-card/90 text-foreground border border-border font-bold text-xs gap-1.5 rounded-xl h-9"
          >
            {isLocating ? (
              <Loader2 className="size-4 animate-spin text-primary" />
            ) : (
              <Crosshair className="size-4 text-primary" />
            )}
            موقعي الحالي (GPS)
          </Button>

          {/* Fallback notification if leaflet script is still loading */}
          {!mapLoaded && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-card/80 backdrop-blur-xs gap-2 z-[999]">
              <Loader2 className="size-6 animate-spin text-primary" />
              <p className="text-xs text-muted-foreground">جاري تحميل خريطة الحسينية...</p>
            </div>
          )}

          {/* Floating Coordinate Pill */}
          <div className="absolute bottom-3 right-3 z-[1000] bg-card/90 backdrop-blur-xs border px-2.5 py-1 rounded-lg text-[10px] font-mono text-muted-foreground shadow-xs pointer-events-none">
            📍 {selectedCoords.lat.toFixed(5)}, {selectedCoords.lng.toFixed(5)}
          </div>
        </div>

        {/* Footer with Detailed Address and Confirmation */}
        <div className="p-4 border-t bg-card shrink-0 space-y-3">
          <div>
            <label className="block text-xs font-semibold mb-1 text-foreground">
              تفاصيل العنوان (الشارع، رقم العمارة، علامة مميزة):
            </label>
            <Input
              value={addressDetails}
              onChange={(e) => setAddressDetails(e.target.value)}
              placeholder="مثال: شارع المدارس، عمارة 5، الدور الثالث بجوار صيدلية..."
              className="text-sm h-10 bg-muted/20"
            />
          </div>

          <div className="flex items-center gap-2">
            <Button
              type="button"
              className="flex-1 font-bold gap-2 bg-primary text-primary-foreground h-11 shadow-sm"
              onClick={handleConfirm}
            >
              <Check className="size-4" />
              تأكيد هذا العنوان والموقع
            </Button>
            <Button
              type="button"
              variant="outline"
              className="h-11 px-4"
              onClick={() => onOpenChange(false)}
            >
              إلغاء
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
