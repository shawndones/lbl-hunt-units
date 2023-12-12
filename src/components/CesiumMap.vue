<script>
  import { Cartesian3, Ion, Math as CesiumMath, Terrain, Viewer, KmlDataSource } from 'cesium';
  import 'cesium/Build/Cesium/Widgets/widgets.css';

  // The URL on your server where CesiumJS's static files are hosted.
  window.CESIUM_BASE_URL = '/';
  Ion.defaultAccessToken = '';



  export default {
    name: 'CesiumMap',

    data() {
      return {
        viewer: null,
        coordinates: {
          latitude: 0,
          longitude: 0,
          height: 0
        }
      }
    },

    mounted() {
      this.viewer = new Viewer(this.$refs.cesiumContainer, {
        terrain: Terrain.fromWorldTerrain(),
      });

      this.viewer.camera.flyTo({
        destination: Cartesian3.fromDegrees(-100.31, 47.47, 50000),
        orientation: {
          heading: CesiumMath.toRadians(0.0),
          pitch: CesiumMath.toRadians(-90),
        }
      });


      // Update coordinates when the camera moves
      this.viewer.camera.moveEnd.addEventListener(() => {
        this.updateCameraCoordinates();
      });

      // Call the method correctly
      this.getCameraCoordinates();
    },

    methods: {
      getCameraCoordinates() {
        const camera = this.viewer.camera;
        const position = camera.positionCartographic;

        // Convert radians to degrees for latitude and longitude
        const latitude = CesiumMath.toDegrees(position.latitude);
        const longitude = CesiumMath.toDegrees(position.longitude);
        const height = position.height; // Height in meters

        console.log(`Latitude: ${latitude}, Longitude: ${longitude}, Height: ${height}`);
      },
      updateCameraCoordinates() {
        const camera = this.viewer.camera;
        const position = camera.positionCartographic;

        this.coordinates.latitude = CesiumMath.toDegrees(position.latitude);
        this.coordinates.longitude = CesiumMath.toDegrees(position.longitude);
        this.coordinates.height = position.height;
      }
    }
  }







</script>








<template>
  <div ref="cesiumContainer" style="height: 100%;"></div>
  <div class="sd-display-coordinates">
    <p>Latitude: {{ coordinates.latitude }}</p>
    <p>Longitude: {{ coordinates.longitude }}</p>
    <p>Height: {{ coordinates.height }} meters</p>
  </div>
</template>








<style>
.sd-display-coordinates {
  position: fixed;
  top: 0;
  left: 0;
  color: white;
  z-index: 10;
}
  /* .cesium-viewer-toolbar, .cesium-viewer-selectionIndicatorContainer, .cesium-viewer-infoBoxContainer, .cesium-viewer-timelineContainer, .cesium-viewer-bottom, .cesium-viewer-animationContainer {
    display: none;
    visibility: hidden;
  }

  .cesium-viewer, .cesium-viewer-cesiumWidgetContainer, .cesium-widget {
    height: 100vh;
    width: 100vh;
  } */
</style>
