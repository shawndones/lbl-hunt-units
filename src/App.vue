<script>
import CesiumMap from './components/CesiumMap.vue';





export default {
  name: 'App',
  components: {
    CesiumMap
  }
}



</script>






<template>
  <CesiumMap/>
</template>



<style>
body {
  height: 100vh;
  margin: 0;
}
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  height: 100%;
}
</style>
