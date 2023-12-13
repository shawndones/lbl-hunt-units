<script>
  import { Cartesian3, Math as CesiumMath, Terrain, Viewer, KmlDataSource, defined, ScreenSpaceEventType, ColorMaterialProperty, Color, LabelGraphics, LabelStyle, VerticalOrigin } from 'cesium';
  import 'cesium/Build/Cesium/Widgets/widgets.css';

  export default {
    name: 'CesiumMap',

    data() {
      return {
        viewer: null,
        selectedEntityInfo: null,
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
            
            // Set each entity as pickable
            dataSource.entities.values.forEach(entity => {
              
              entity.pickable = true;
              if (entity.polygon) {
                // Set polygon material
                entity.polygon.material = new ColorMaterialProperty(Color.WHITE.withAlpha(0.01));
              }
              console.log(entity.label);
     
              // Add a label to the entity
              entity.label = new LabelGraphics({
                text: entity.name || 'Unnamed',
                font: '14pt monospace',
                fillColor: Color.WHITE,
                outlineColor: Color.BLACK,
                outlineWidth: 2,
                style: LabelStyle.FILL_AND_OUTLINE,
                verticalOrigin: VerticalOrigin.BOTTOM,
                pixelOffset: new Cartesian3(0, -15)  // Adjust as needed
              });
            });

      //  // Add a test entity with a label
      //  this.viewer.entities.add({
      //     position: Cartesian3.fromDegrees(-88.1265, 36.84, 155),
      //     label: {
      //       text: 'Test Label',
      //       font: '14pt monospace',
      //       fillColor: Color.WHITE,
      //       outlineColor: Color.BLACK,
      //       outlineWidth: 2,
      //       style: LabelStyle.FILL_AND_OUTLINE,
      //       verticalOrigin: VerticalOrigin.BOTTOM,
      //       pixelOffset: new Cartesian3(0, -15)
      //     }
      //   });
          } else {
            console.warn('No entities found in the KMZ file');
          }
        })
        .catch(error => {
          console.error('Error loading KMZ file:', error);
        });

        // Add a click event listener to the viewer
        // this.viewer.screenSpaceEventHandler.setInputAction(click => {
        //   const pickedObject = this.viewer.scene.pick(click.position);
        //   if (defined(pickedObject) && pickedObject.id) {
        //     this.selectedEntityInfo = pickedObject.id.name || 'No name';
        //     console.log('Selected Entity Info:', this.selectedEntityInfo); // Debugging
        //   }
        // }, ScreenSpaceEventType.LEFT_CLICK);
// Add a hover event listener to the viewer
this.viewer.screenSpaceEventHandler.setInputAction(movement => {
    const pickedObject = this.viewer.scene.pick(movement.endPosition);
    if (defined(pickedObject) && pickedObject.id) {
      this.selectedEntityInfo = pickedObject.id.name || 'No name';
      this.updateInfoBoxPosition(movement.endPosition);
    } else {
      this.selectedEntityInfo = null;
    }
  }, ScreenSpaceEventType.MOUSE_MOVE);

      // Update coordinates when the camera moves
      this.viewer.camera.moveEnd.addEventListener(() => {
        this.updateCameraCoordinates();
      });

    },

    methods: {
      updateInfoBoxPosition(screenPosition) {
    const infoBox = this.$refs.entityInfo;
    if (infoBox) {
      infoBox.style.left = `${screenPosition.x + 10}px`;
      infoBox.style.top = `${screenPosition.y + 10}px`;
    }
  },
      updateCameraCoordinates() {
        const camera = this.viewer.camera;
        const position = camera.positionCartographic;

        this.coordinates.latitude = CesiumMath.toDegrees(position.latitude);
        this.coordinates.longitude = CesiumMath.toDegrees(position.longitude);
        this.coordinates.height = position.height;
      },
      getEntityInfo(entity) {
        // Retrieve and return information from the entity
        // For example, you can return entity.name or any other property
        return entity.name || 'No name';
      },
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
  <div ref="entityInfo" v-if="selectedEntityInfo" class="entity-info">
  {{ selectedEntityInfo }}
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
.entity-info {
  position: absolute;
  background: white;
  padding: 10px;
}
</style>
