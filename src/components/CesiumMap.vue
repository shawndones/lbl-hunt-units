<script>
  import { Cartesian3, Math as CesiumMath, Terrain, Viewer, KmlDataSource } from 'cesium';
  import 'cesium/Build/Cesium/Widgets/widgets.css';

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
        destination: Cartesian3.fromDegrees(-88.1265, 36.84, 81398),
        orientation: {
          heading: CesiumMath.toRadians(0.0),
          pitch: CesiumMath.toRadians(-90),
        }
      });

      // Load and add the KMZ file to the viewer
      KmlDataSource.load('lbl-hunt-areas.kml')  // Change this to the actual path of your KMZ file
        .then(dataSource => {
          this.viewer.dataSources.add(dataSource);

          // Ensure there are entities in the dataSource before attempting to zoom
          if (dataSource.entities.values.length > 0) {
            const entities = dataSource.entities.values;
            this.viewer.zoomTo(entities); // Zoom to all the entities
          } else {
            console.warn('No entities found in the KMZ file');
          }
        })
        .catch(error => {
          console.error('Error loading KMZ file:', error);
        });


      // Update coordinates when the camera moves
      this.viewer.camera.moveEnd.addEventListener(() => {
        this.updateCameraCoordinates();
      });

    },

    methods: {
  
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
