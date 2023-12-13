<script>
  import * as Cesium from 'cesium';
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
        is2D: true, // Start with 2D terrain
        kmlLayers: [
          { name: 'LBL Hunt Areas', url: 'lbl-hunt-areas.kml', visible: true },
          { name: 'Elk Hunt Units', url: 'elk-hunt-units.kml', visible: true }
        ]
      }
    },

    mounted() {
      this.viewer = new Cesium.Viewer(this.$refs.cesiumContainer, {
        terrainProvider: new Cesium.EllipsoidTerrainProvider(),
        // terrain: new Cesium.Terrain.fromWorldTerrain(),
      });
      this.viewer.camera.flyTo({
        destination: Cesium.Cartesian3.fromDegrees(-85.68, 37.05, 603560),
        orientation: {
          heading: Cesium.Math.toRadians(0.0),
          pitch: Cesium.Math.toRadians(-90),
        }
      });

      this.kmlLayers.forEach(layer => {
        console.log(layer);
        Cesium.KmlDataSource.load(layer.url)
          .then(dataSource => {
            this.viewer.dataSources.add(dataSource);
            dataSource.show = layer.visible;
            
            console.log(dataSource.entities.values);
            if (dataSource.entities.values.length > 0) {
              const entities = dataSource.entities.values;
              this.viewer.zoomTo(entities);

              entities.forEach(entity => {
                 // Access the properties
      // const properties = entity.properties;
      // console.log(entity)
      // Extract your SimpleData fields
      // const areaName = properties.AreaName.getValue();
      // const unitNumb = properties.UnitNumb.getValue();
      // const acres = properties.ACRES.getValue();
      // console.log(areaName);
      // console.log(unitNumb);
      // console.log(acres);

                if (entity.polygon) {
                  entity.polygon.material = Cesium.Color.TRANSPARENT.withAlpha(0.5);
                
                  const positions = entity.polygon.hierarchy.getValue().positions;
                  const boundingSphere = Cesium.BoundingSphere.fromPoints(positions);
                  const center = boundingSphere.center;
                  const centerCartographic = Cesium.Ellipsoid.WGS84.cartesianToCartographic(center);
                
                  this.viewer.entities.add({
                    position: Cesium.Cartesian3.fromRadians(centerCartographic.longitude, centerCartographic.latitude, centerCartographic.height),
                    label: {
                      text: entity.name || 'Unnamed',
                      font: '14pt monospace',
                      fillColor: Cesium.Color.WHITE,
                      outlineColor: Cesium.Color.BLACK,
                      outlineWidth: 2,
                      style: Cesium.LabelStyle.FILL_AND_OUTLINE,
                      verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
                      pixelOffset: new Cesium.Cartesian2(0, -15),
                      
                    }
                  });
                  console.log(entity);
                }
              });
            } else {
              console.warn('No entities found in the KMZ file');
            }
          })
          .catch(error => console.error('Error loading KML file:', error));
      });

      this.viewer.screenSpaceEventHandler.setInputAction(movement => {
        const pickedObject = this.viewer.scene.pick(movement.endPosition);
        if (Cesium.defined(pickedObject) && pickedObject.id) {
          this.selectedEntityInfo = pickedObject.id.name || 'No name';
          this.updateInfoBoxPosition(movement.endPosition);
        } else {
          this.selectedEntityInfo = null;
        }
      }, Cesium.ScreenSpaceEventType.MOUSE_MOVE);

      this.viewer.camera.moveEnd.addEventListener(() => {
        this.updateCameraCoordinates();
      });
    },

    methods: {
      toggleTerrain() {
      if (this.is2D) {
        // Switch to 3D terrain
        this.viewer.terrainProvider = new Cesium.CesiumTerrainProvider({
          url: 'https://assets.agi.com/stk-terrain/world', // Example terrain URL
        });
      } else {
        // Switch back to 2D (flat) terrain
        this.viewer.terrainProvider = new Cesium.EllipsoidTerrainProvider();
      }
      this.is2D = !this.is2D; // Toggle the state
    },
      createGroundClampedPolyline(coordinates, color) {
        const groundPolyline = new Cesium.GroundPolylineGeometry({
          positions: Cesium.Cartesian3.fromDegreesArray(coordinates),
          width: 2.0
        });

        const groundPolylinePrimitive = new Cesium.GroundPolylinePrimitive({
          geometryInstances: new Cesium.GeometryInstance({
            geometry: groundPolyline,
            attributes: {
              color: Cesium.ColorGeometryInstanceAttribute.fromColor(color)
            }
          }),
          appearance: new Cesium.PolylineColorAppearance({
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
        this.coordinates.latitude = Cesium.Math.toDegrees(position.latitude);
        this.coordinates.longitude = Cesium.Math.toDegrees(position.longitude);
        this.coordinates.height = position.height;
      },

      getEntityInfo(entity) {
        return entity.name || 'No name';
      },

      recenterMap() {
        if (this.viewer && this.viewer.camera) {
          this.viewer.camera.flyTo({
            destination: this.viewer.camera.position,
            orientation: {
              heading: 0,
              pitch: Cesium.Math.toRadians(-90),
              roll: 0
            },
            duration: 1.5
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
