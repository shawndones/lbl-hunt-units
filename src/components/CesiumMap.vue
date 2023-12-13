<script>
  import { Cartesian3, Math as CesiumMath, Terrain, Viewer, KmlDataSource, defined, ScreenSpaceEventType, Color, LabelStyle, VerticalOrigin, Cartographic, GroundPolylinePrimitive, ColorGeometryInstanceAttribute, GroundPolylineGeometry, GeometryInstance, PolylineColorAppearance } from 'cesium';
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
        },
        kmlLayers: [
          { name: 'LBL Hunt Areas', url: 'lbl-hunt-areas.kml', visible: true },
          { name: 'Elk Hunt Units', url: 'elk-hunt-units.kml', visible: true }
        ]
      }
    },

    mounted() {
      this.viewer = new Viewer(this.$refs.cesiumContainer, {
        terrain: Terrain.fromWorldTerrain(),
      });
      this.viewer.camera.flyTo({
        destination: Cartesian3.fromDegrees(-85.68, 37.05, 603560),
        orientation: {
          heading: CesiumMath.toRadians(0.0),
          pitch: CesiumMath.toRadians(-90),
        }
      });




     // Load multiple KML files
this.kmlLayers.forEach(layer => {
  KmlDataSource.load(layer.url)
    .then(dataSource => {
      this.viewer.dataSources.add(dataSource);
      dataSource.show = layer.visible;

      if (dataSource.entities.values.length > 0) {
        const entities = dataSource.entities.values;
        this.viewer.zoomTo(entities);

        entities.forEach(entity => {
          // Check if the entity is a polygon
          if (entity.polygon) {
            // Extract the coordinates of the polygon
            const polygonHierarchy = entity.polygon.hierarchy.getValue();
            const coordinates = [];

            polygonHierarchy.positions.forEach(position => {
              const cartographic = Cartographic.fromCartesian(position);
              coordinates.push(CesiumMath.toDegrees(cartographic.longitude));
              coordinates.push(CesiumMath.toDegrees(cartographic.latitude));
            });

            // Create and add ground clamped polyline
            const groundPolylinePrimitive = this.createGroundClampedPolyline(coordinates, Color.WHITE);
            this.viewer.scene.primitives.add(groundPolylinePrimitive);

            // Optionally, hide the original polygon
            entity.show = false;
          }


              // Calculate the center of the entity
              const boundingSphere = entity.boundingSphere;


              if (boundingSphere) {

                const center = Cartesian3.fromRadians(boundingSphere.center.longitude, boundingSphere.center.latitude, boundingSphere.center.height);

                // Add a label to the entity
                this.viewer.entities.add({
                  position: center,
                  label: {
                    text: entity.name || 'Unnamed',
                    font: '14pt monospace',
                    fillColor: Color.WHITE,
                    outlineColor: Color.BLACK,
                    outlineWidth: 2,
                    style: LabelStyle.FILL_AND_OUTLINE,
                    verticalOrigin: VerticalOrigin.BOTTOM,
                    pixelOffset: new Cartesian3(0, -15),
                  }
                });

              }

            });


            } else {
            console.warn('No entities found in the KMZ file');
            }
        })
        .catch(error => console.error('Error loading KML file:', error));
    });


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
      createGroundClampedPolyline(coordinates, color) {
        const groundPolyline = new GroundPolylineGeometry({
          positions: Cartesian3.fromDegreesArray(coordinates),
          width: 2.0 // Set the desired width
        });

        const groundPolylinePrimitive = new GroundPolylinePrimitive({
          geometryInstances: new GeometryInstance({
            geometry: groundPolyline,
            attributes: {
              color: ColorGeometryInstanceAttribute.fromColor(color)
            }
          }),
          appearance: new PolylineColorAppearance({
            translucent: false
          })
        });

        return groundPolylinePrimitive;
      },
      toggleKmlLayer(layer) {
        const dataSource = this.viewer.dataSources.getByName(layer.name)[0];
        if (dataSource) {
          dataSource.show = !dataSource.show;
          layer.visible = dataSource.show;
        }
      },
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
      recenterMap() {
        if (this.viewer && this.viewer.camera) {
          this.viewer.camera.flyTo({
            destination: this.viewer.camera.position, // Keeps the current location
            orientation: {
              heading: 0, // North
              pitch: CesiumMath.toRadians(-90), // Looking straight down
              roll: 0 // No roll
            },
            duration: 1.5 // Duration in seconds
          });
        }
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
  <div ref="entityInfo" v-if="selectedEntityInfo" class="entity-info">
    {{ selectedEntityInfo }}
  </div>
  
  <div class="toolbar">
    <button class="button-left-center" @click="recenterMap">Recenter Map</button>
    <h3>Data Layers</h3>
    <ul>
      <li v-for="layer in kmlLayers" :key="layer.name">
        <input type="checkbox" :id="layer.name" v-model="layer.visible" @change="toggleKmlLayer(layer)">
        <label :for="layer.name">{{ layer.name }}</label>
      </li>
    </ul>
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

.toolbar {
  position: fixed;
  right: 0;
  top: 52%;
  transform: translateY(-50%);
  background: white;
  padding: 10px;
  z-index: 1000;
}
</style>
