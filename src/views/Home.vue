<template>
    <div class="home">
        <img alt="Z-S Logo" src="../assets/logo.png" />
        <HelloWorld msg="Z-S Overview Customizer" />
    </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import HelloWorld from "@/components/HelloWorld.vue"; // @ is an alias to /src

export default defineComponent({
    name: "Home",
    components: {
        HelloWorld,
    },
});
</script>

<style scoped lang="scss">
img {
    height: 256px;
    width: 256px;
}
</style>