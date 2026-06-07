// Kakao Maps SDK 최소 타입 선언 — 이 프로젝트에서 실제로 사용하는 API만 정의
export {};

declare global {
  interface Window {
    kakao: typeof kakao;
  }

  namespace kakao {
    namespace maps {
      function load(callback: () => void): void;

      class LatLng {
        constructor(lat: number, lng: number);
        getLat(): number;
        getLng(): number;
      }

      interface MapOptions {
        center: LatLng;
        level?: number;
      }

      class Map {
        constructor(container: HTMLElement, options: MapOptions);
        setCenter(latlng: LatLng): void;
        getCenter(): LatLng;
        setLevel(level: number): void;
        getLevel(): number;
        panTo(latlng: LatLng): void;
      }

      class Size {
        constructor(width: number, height: number);
      }

      class Point {
        constructor(x: number, y: number);
      }

      interface MarkerImageOptions {
        offset?: Point;
      }

      class MarkerImage {
        constructor(src: string, size: Size, options?: MarkerImageOptions);
      }

      interface MarkerOptions {
        position: LatLng;
        map?: Map | null;
        title?: string;
        image?: MarkerImage;
        zIndex?: number;
      }

      class Marker {
        constructor(options: MarkerOptions);
        setMap(map: Map | null): void;
        setPosition(latlng: LatLng): void;
        getPosition(): LatLng;
      }

      interface CircleOptions {
        center: LatLng;
        radius: number;
        strokeWeight?: number;
        strokeColor?: string;
        strokeOpacity?: number;
        strokeStyle?: string;
        fillColor?: string;
        fillOpacity?: number;
        map?: Map | null;
        zIndex?: number;
      }

      class Circle {
        constructor(options: CircleOptions);
        setMap(map: Map | null): void;
        setOptions(options: Partial<CircleOptions>): void;
        getPosition(): LatLng;
      }

      interface CustomOverlayOptions {
        position: LatLng;
        content: string | HTMLElement;
        map?: Map | null;
        xAnchor?: number;
        yAnchor?: number;
        zIndex?: number;
      }

      class CustomOverlay {
        constructor(options: CustomOverlayOptions);
        setMap(map: Map | null): void;
        setPosition(latlng: LatLng): void;
        getPosition(): LatLng;
      }

      interface MapMouseEvent {
        latLng: LatLng;
      }

      namespace event {
        function addListener(target: Map, type: "idle", handler: () => void): void;
        function removeListener(target: Map, type: "idle", handler: () => void): void;
        function addListener(
          target: Circle | Marker | CustomOverlay,
          type: "click",
          handler: (event: MapMouseEvent) => void,
        ): void;
        function removeListener(
          target: Circle | Marker | CustomOverlay,
          type: "click",
          handler: (event: MapMouseEvent) => void,
        ): void;
      }
    }
  }
}
