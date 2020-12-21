<template>
    <head>
        <link
            rel="icon"
            href="../assets/images/logo.png"
            sizes="16x16 32x32"
            type="image/png"
        />
    </head>
    <div class="home">
        <img class="logo" alt="Z-S Logo" src="../assets/images/logo.png" />
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
.logo {
    height: 256px;
    width: 256px;
}
</style>